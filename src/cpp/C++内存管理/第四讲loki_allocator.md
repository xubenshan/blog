## 三个class结构

嵌套的数据结构设计：最底层是chunk，chunk有三个成员，firstAvailableblock代表下次可以用的第一个区块索引；blocks available代表可用区块的数量。依次往上，最高层是smallobjallocator。用户看到的是smallobjallocator。

![image-20260717082911722](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717082911722.png)

chunk类中有一些函数：重点来看reset中有一个流水号索引设置。i的类型是unsigned int，代表一个字节大小的无符号整数。用int的话，4个字节，会增加开销。空闲block第一个字节用于保存下一个 block 的编号，和嵌入式指针有些像。

> FixedAllocator是个类，类里面又定义了一个类，叫chunk。chunk中有init函数、release函数、allocate函数、deallocate函数。所以下图函数定义的时候名字写的很长。

![image-20260717084038166](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717084038166.png)

allocator动作结合代码和图片不难理解，主要就是理清firstAvailableBlock、blocksAvailable的含义。

![image-20260717084810590](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717084810590.png)

首先要确定回收的p是落在哪个chunk里面的。每个chunk管理的内存的起点和块个数是知道的，所以可以确定p是在哪个chunk中。之后再进入deallocate函数。（p-首地址）/块大小，就能得到这个块应该放在chunk的哪个位置。

![image-20260717085610575](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717085610575.png)

第二个类FixedAllocator的allocate和deallocate函数。

来看下代码的细节：

allocChunk指向上一次满足分配的chunk，下一次再分配内存的时候就让这个chunk分配（从这个chunk中取区块）。

deallocChunk指向上一次内存回收到的那个chunk。下一次回收的时候，可以先看看p是否属于该chunk。

Chunks_是一个容器，容器每个元素都是chunk对象。类似这种：

```cpp
typedef std::vector<Chunk> Chunks;
Chunks chunks_;

chunks_
┌─────────┬─────────┬─────────┬─────────┐
│ Chunk 0 │ Chunk 1 │ Chunk 2 │ Chunk 3 │
└─────────┴─────────┴─────────┴─────────┘
    ↑                                   ↑
 begin()                              end()
                                    末尾之后
```

#20行 &*i很特殊的形式。对i解引用得到的是chunk对象，再取地址，得到容器某个chunk元素的地址。

![image-20260717091208652](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717091208652.png)

当所有chunk对象都没有可用的区块时，只能再push_back一个新的chunk。`chunks_.push_back(Chunk())` Chunk()就是创建一个Chunk临时对象，然后拷贝到容器中，然后临时对象生命结束。`

`deallocChunk_ = &chunks_.front()`为什么要这么设值，因为push_back可能会发生隐藏的拷贝：如果原来的容量不足，`vector` 会重新分配更大的连续空间，把原来的 Chunk 搬到新空间，原本内存上的对象就会被销毁了。那么需要重新对deallocChunk_设值，要不然会变成悬空指针。将其重新指向 `chunks_.front()`，是为了建立一个有效的释放搜索起点，而不是规定将内存释放到第一个 Chunk。 

好，接下来我们再来研究下Deallocate方法。

先VicinityFind，找到p指针所属的chunk，然后用deallocChunk_标记一下。下一次回收内存的时候，就先去看p指针是不是属于`deallocChunk_`标记的chunk。

下面是vicinityFind的源代码：

![image-20260717115953436](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717115953436.png)

如果p当初并不是从这个系统中获取的（比如直接malloc获取的），那将p传入该函数，就会卡在for循环。所以上述代码应该先检查下p是不是从该系统获取的。

查找到p所在的chunk之后，接下来该调用DoDeallocate函数：

第6行if描述的是某个chunk全回收（全回收状态就是chunk里面没有正在使用的块了）后，需要延缓归还给os，这个延缓动作在第三讲free也出现过。但这段代码有bug，可能会导致不归还chunk给os。

三种情况：

* 当前全回收 Chunk 就是最后一个 Chunk，此时检查倒数第二个 Chunk，如果也是全回收状态，说明现在有两个chunk，把最后一个chunk归还给os。
* 当前全回收Chunk不是最后一个Chunk，但最后一个也是全回收状态。把最后一块归还给os。再让当前全回收Chunk作为下一次分配使用的Chunk。
* 其它情况：把当前全回收Chunk和最后一个Chunk交换内容，再让当前全回收Chunk作为下一次分配使用的Chunk。

![image-20260717122951967](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717122951967.png)

> 代码整体隐含了一个重要假设：如果存在一个保留的全回收 Chunk，它应当位于 `chunks_` 的末尾。
>
> 初始有五个 Chunk：
>
> ```
> [A 使用] [B 使用] [C 使用] [D 使用] [E 空闲]
> ```
>
> 第一次：B 完全释放
>
> 此时：
>
> ```
> deallocChunk_ = B
> lastChunk     = E
> ```
>
> 因为 `E` 也是空闲的，代码释放 `E`：
>
> ```
> [A 使用] [B 空闲] [C 使用] [D 使用]
> ```
>
> 现在唯一的空 Chunk `B` 留在了中间，而不是尾部。
>
> 第二次：D 完全释放
>
> 现在变成：
>
> ```
> [A 使用] [B 空闲] [C 使用] [D 刚变空]
> ```
>
> `D` 是最后一个 Chunk，因此代码进入：
>
> ```
> if (&lastChunk == deallocChunk_)
> ```
>
> 然后它只检查前一个 Chunk：
>
> ```
> deallocChunk_[-1]  // 即 C
> ```
>
> 但 `C` 正在使用，因此代码认为只有一个空 Chunk，直接返回。
>
> 最终状态：
>
> ```
> [A 使用] [B 空闲] [C 使用] [D 空闲]
> ```
>
> 现在已经存在两个完全空闲的 Chunk，但代码没有释放其中任何一个。
>
> 如何修改该bug：
>
> 第二个分支：释放旧尾部 Chunk 后，把当前新产生的空 Chunk 移到**新的尾部**。然后第一个分支也不需要检查倒数第二个Chunk是不是全回收状态了。
>
> ```cpp
> if (lastChunk.blocksAvailable_ == numBlocks_)
> {
>     // 旧尾部 Chunk 已经是空的，释放它管理的内存
>     lastChunk.Release();
>     chunks_.pop_back();
> 
>     // pop_back 后重新取得新的尾部，不能继续使用原 lastChunk 引用
>     Chunk* newLastChunk = &chunks_.back();
> 
>     // 把当前新产生的空 Chunk 移到 vector 尾部
>     if (deallocChunk_ != newLastChunk)
>     {
>         std::swap(*deallocChunk_, *newLastChunk);
>     }
> 
>     // 空 Chunk 现在位于尾部
>     allocChunk_ = newLastChunk;
>     deallocChunk_ = newLastChunk;
> }
> ```
>
> 旧代码为什么要检查倒数第二个：因为旧代码的其他分支可能制造这种错误状态：
>
> ```
> [使用] [空闲] [使用]
> ```
>
> 随后最后一个 Chunk 也变空，就变成：
>
> ```
> [使用] [空闲] [空闲]
> ```
>
> 如果状态是
>
> ```text
> [使用] [空闲][使用] [空闲] 
> ```
>
> 只检查倒数第二个是没有用的，按理说应该释放一个空闲Chunk，但此时系统认为只有一个空闲Chunk。不会释放给操作系统。

## loki allocator检讨

![image-20260717124000893](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717124000893.png)

回答下最后一个问题：loki分配器中使用了vector，这个vector用的是标准库的分配器。等loki分配器生成后，容器就可以指定使用loki分配器了。所以不存在蛋生鸡鸡生蛋的问题。