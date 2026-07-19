## VC6内存分配 ##

通过VC6调用main函数之前的初始化行为来分析VC6的内存管理。

下图是函数调用栈，在调用main函数之前还会调用很多函数。重点看_heap_alloc_base函数，这个函数内部判断了size的大小，当size小于1016的时候调用`_sbh_alloc_block`函数。大于时调用windows操作系统提供的HeapAlloc函数。也就是说VC6和第二章的分配器一样，都是为小区块服务的。大区块就直接交给操作系统进行处理。

在vc10底下，仍然有_heap_alloc_base函数，但函数内部不管size多大，都会调用HeapAlloc函数。也就是说vc10没有提供专门处理小区块的机制，但是操作系统HeapAlloc函数中提供了。

![](https://i.imgur.com/GSff1Jp.png)

![](https://i.imgur.com/EZG35WQ.png)

来看heap_init函数，内部通过HeapCreate向操作系统要一块堆内存，大小是4096，这块内存名字叫_crtheap。然后`_sbh_heap_init`函数内部调用HeapAlloc函数，从上面拿到的`_crtheap`堆内存中要16个HEADER大小的内存，得到指针。这就是heap_init的内容。

![image-20260716194106392](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716194106392.png)

下图就是HEADER的结构：

![image-20260716194910680](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716194910680.png)

接下来看ioinit函数，函数内部调用了malloc_crt，（这是第一次内存分配）在debug模式下，就是调用malloc_dbg。和malloc区别就是多了些参数。

分配了32个ioinfo大小的内存，ioinfo有三个成员，大小是6个字节，内存对齐到8个字节。总共256个字节，16进制就是100。

![image-20260716195435588](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716195435588.png)

在malloc_dbg中调用`_nh_malloc_dbg`，在该函数内部又会调用heap_alloc_dbg函数，传入的参数是nSize。就是上面的256个字节。函数内部会把256字节进行扩充，添加进去debug header，变成blockSize大小，然后再把blocksize传进heap_alloc_base函数。

![image-20260716195928524](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716195928524.png)

下图有两个指针指向第一块和最后一块。最后面的代码表明在block中会memset填入一些值。

![image-20260716201145944](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716201146114.png)

为什么会出现1016这个奇怪的数字？因为在heap_alloc_base的时候block还没有加入cookie，加入cookie后不能超过1024，才叫做小区块，才为它提供服务，那不加cookie之前门限就是1016了。

![image-20260716202204853](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716202204853.png)

![image-20260716202655593](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716202655593.png)

cookie的内容是131h，这个在之前我们说过原因了，虽然块大小最终是130，但是16倍数，最后四位肯定是0，那就拿最后一位表示该块有没有被分配出去，因为这个块马上就要分配出去了，所以最后一位为1。当回收给SBH的时候，就会设置为0，cookie的内容就是130h了。

接下来看new_region函数：这个时候才真正的要分配内存了，前面都是在调整大小。一个header会去申请真正的内存，为了对这块内存做管理，header会有一个指针指向region，region里面有group，group里面有64组指针（每组指针管理一条独立的链表，为什么要用两个指针来管理一个链表呢，为了实现双向链表。设置个哨兵节点，节点Next指向链表头、Prev指向链表尾。）。还有bitvGroupHi、 bitvGroupLo。Hi和Lo会拼接在一起，元素是unsigned int，也就是4个字节，拼在一起8个字节，64bit，共32个组。这个region大概16KB。

> group中有64组指针，64是怎么算出来的？
>
> VC6 SBH 以 **16 字节**作为一个最小尺寸单位，源码称为一个 `paragraph`：
>
> ```
> #define BYTES_PER_PARA 16
> ```
>
> SBH 能处理的最大用户数据尺寸是：
>
> ```
> #define MAX_ALLOC_DATA_SIZE 0x3f8  // 1016 字节
> ```
>
> 每个 block 还需要前、后两个 4 字节大小 cookie，共 8 字节：
>
> ```
> #define MAX_ALLOC_ENTRY_SIZE \
>     (MAX_ALLOC_DATA_SIZE + 0x8)
> ```
>
> 因此最大 SBH block 总长度为：
>
> ```
> 0x3f8 + 0x8 = 0x400
> 1016  + 8   = 1024 字节
> ```
>
> 将 1024 字节按照每档 16 字节分类：
>
> 1024÷16=64
>
> 所以需要 64 个尺寸等级。

![image-20260716203351718](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716203351718.png)

现在SBH手上有了1MB的内存，如何进行管理呢？看下面的图，虚拟地址空间的大小是1MB，会将这个空间划分为32组，每组的大小是32KB。每个 Group 管理 32 KB，又可看成 8 个 4 KB 的 page。page之间通过指针串起来，把这8个page挂到最后一个链表上。

前面说的1MB是虚拟地址空间，SBH真正向操作系统要内存的时候，要的并不是1MB，而是8个page。这8个page在虚拟内存中是连续的。但是在物理内存中不一定连续。在操作系统中学过页式内存管理，连续的虚拟页会映射到离散的物理页框。

![image-20260716211347015](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716211347015.png)

接下来把图片放大，再详细看下这个page。page里面的4080指的是两个黄色块之间的大小（block的大小）。整个page是4kB，也就是4096B，黄色大小是2*4B，剩下是4088B。但是会被调整为16的倍数，这就是图上保留块的意义。黄色夹的块大小调整为4080，保留块大小是8个字节。每个block上下都会带cookie，4080包含cookie的8个字节。

每个 Page 两端有：0xffffffff。这个值会被当作“已占用的边界标记”，这个值在后面free的时候会有作用。

group中有64组指针，也就是128个指针，指针指向Entry结构体，这个结构体里面有三个东西，其中两个指针，指向的是结构体本身。可以仔细看下图中蓝色线的指向，体会一下。

![image-20260716215313387](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716215313387.png)

block中有64组指针，每组指针管理一个链表。链表区块大小是多少？第一个链表是16，第二个是32，依次类推，第64个就是1024。但是从上图我们看到最后一组指针管理的区块大小明明是4080，接近4K。这是为什么？这就是VC6底下的独特的设计，最后一个链表管理大于1k的区块。

下面这个图是对block做切分（把 page 中原来一个 **4080 字节的大空闲 block**，重新划分成“剩余空闲块”和“本次已分配块”两个相邻 block。）。Io_init申请256个字节，也就是100h。加上cookie和debug header，再调到16的边界最后是130h。4080对应的是ff0，相减剩下的是ec0。alloc_new_group返回红色的地址，函数一层层返回，最后io_init返回的是绿色内存的地址。也就是实际100h内存所在的地址。



![image-20260716223131315](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716223131315.png)

## SBH行为分析

### 首次分配

这张图描述的是CRT 已完成 SBH 基础初始化后，第一次出现符合 SBH 条件的小块申请时，SBH 创建首个 Region、提交首个 Group、初始化 8 个 Page，并从其中一个空闲块切分出申请块的过程。

HeapAlloc(_crtheap, 16 * sizeof(HEADER)) 申请了可容纳 16 个 `HEADER` 的管理数组，这属于SBH初始化。

![image-20260716225732094](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716225732094.png)

把region单独拿出来，里面有64个bits，每位代表每组指针的状态，是否挂着free_list。开始的时候只有最后一组指针挂着free_list，所以只有最后一位是0。灰色的块是64个chars，最后一位也设置为1。

![image-20260716230151945](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716230151945.png)

### N次分配

接下来看第二次分配（CRT中的getenvironmentstrings函数发出的请求），请求的内存再加上debug header，cookies，再调整到16的边界，最后是240h。首先要判断240h需要第几号链表提供服务，（转换成10进制，除以16，再减1）由于通过看64bits，只有最后一位是1，表明此时只有最后一组指针挂着free_list，所以只能对最后一个链表的page做切分，过程和第一次分配是一样的。

group中的int整数cntEntries，记录当前 Group 中尚未释放的“已分配 block”数量。当该数为0时，代表整个 32 KB Group 内已经没有任何用户正在使用的 block。就可以回收给操作系统了。

![image-20260716231226598](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716231226598.png)

前面讲的都是malloc，接下来讲free。cntEntries-1。释放的是第二次malloc的内存。大小是240h，应该被第35组指针管理，所以就将第35组next指针指向该block。该block也会有两个指针（同样是嵌入式指针），指向next和prev。由于#35中free_list只有这一个块，所以：

```cpp
listHead[35].pEntryNext = block;
listHead[35].pEntryPrev = block;

block->pEntryNext = &listHead[35];
block->pEntryPrev = &listHead[35];
```



![image-20260716232948327](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716232948327.png)

接下来进行分配，大小是b0。理应由第B0/10h-1条链表提供服务，但该链表是空的，所以只能由第35条链表来提供服务。第35条链表有一个区块，大小是240h，做切分，切分出b0，剩余190h。190h这个区块需要被调整到第24条链表。

![image-20260716234120557](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716234120557.png)

为什么用第二组group了？因为第一组group不能满足这次的需求了，为啥呢，从02000014中看出哪些链表上面是有区块的，这些区块太小了不能满足本次需求，所以需要用第二组group了。 

![image-20260716235523073](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260716235523073.png)

### 区块合并

释放的区块是可以被合并的。合并之后再去判断应该把合并后的block挂到哪条链表下。如果没有下cookie这个设计，就没办法往上合并。这就解释了为什么每个block上下都要有cookie。

先找到当前 block 的上 cookie：

```
pEntry
↓
┌──────────────────┐
│ sizeFront        │ 4 字节，上 cookie
├──────────────────┤
│ pvAlloc          │ ← SBH 返回的地址    │
│ ...              │
├──────────────────┤
│ sizeBack         │ 4 字节，下 cookie
└──────────────────┘
```

释放的时候只需要拿到 `pvAlloc` 后向前移动 4 字节，就找到了当前 block 的上 cookie，用上 cookie 找到当前 block 的下 cookie，也就找到了下一个block的上cookie，进而得出下一个block是否空闲。 `pvAlloc` 后向上移动 8字节，就能找到上一个block的下cookie。

![image-20260717001504899](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717001504899.png)

以 `malloc(0x100)` 为例，梳理下malloc的流程：

```text
低地址
┌──────────────────────────┐
│ SBH sizeFront            │ ← pEntry，SBH 上 cookie
├──────────────────────────┤
│ _CrtMemBlockHeader       │ ← pHead / SBH 返回给上层的地址
│   next、prev             │
│   文件名、行号           │
│   用户数据大小           │
│   block 类型、序号       │
│   前保护区 0xFDFDFDFD    │
├──────────────────────────┤
│ 用户真正可用的数据       │ ← pUserData，malloc 最终返回值
│                          │
├──────────────────────────┤
│ 后保护区 0xFDFDFDFD      │
├──────────────────────────┤
│ SBH 对齐产生的剩余空间   │
├──────────────────────────┤
│ SBH sizeBack             │ ← SBH 下 cookie
└──────────────────────────┘
高地址
```

Debug Heap 向基础堆申请：

```
用户数据                  0x100
Debug 信息和前后保护区    0x024
--------------------------------
基础堆申请大小            0x124
```

SBH 再加上自己的两个 cookie：

```
基础堆所需区域            0x124
SBH 上 cookie             0x004
SBH 下 cookie             0x004
--------------------------------
                          0x12C
按 16 字节对齐          → 0x130
```

所以 SBH 管理的是一个 `0x130` 的 block，但其中真正由应用程序使用的只有 `0x100`：

```
0x130 SBH block
├─ 8 字节 SBH cookie
├─ 0x24 字节 Debug 开销
├─ 0x100 字节用户数据
└─ 4 字节对齐余量
```

释放时也要分两层回退

应用程序调用：

```
free(pUserData);
```

首先由 Debug Heap 根据 `pUserData` 向前找到：

```
pHead = pHdr(pUserData);
```

检查 Debug Header 和前后 `0xFD` 保护区后，再把 `pHead` 交给基础堆。SBH 收到 `pHead` 后，才继续向前减 4 字节寻找自己的上 cookie：

```
pEntry = (char *)pHead - sizeof(int);
```

### VC6 free

如何找到p在哪个header？sbh_pHeaderList指向header数组，很容易找到每个header指向（header中有个指针，指向虚拟地址空间）的虚拟地址空间，进而确定p落在哪个header中。如何找到落在哪个group中？p减去虚拟地址空间首地址，然后除以32，就得到了group。如果找到free_list？通过p找到block的上cookie，就得到了block的大小，除以16-1，就得到了需要回收到第几号链表。

![image-20260717012756153](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717012756153.png)

### 总结

vc6内存管理总结：

分段管理。把1MB的内存划分为32块，一个group管理一块。再把每块继续细分成8个page。每个group管理8个page。

分段管理的好处：



全回收指的是把group对应的8个page归还给操作系统。如何判断能否全回收？前面也提到过就是判断cntEntries == 0。

![image-20260717014347897](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717014347897.png)

==全回收状态就是初始状态。== 当cntEntries == 0，SBH不会着急把内存还给操作系统，会等下一次又出现全回收，才会把上一次的内存还给操作系统。

> 全回收状态为什么就是初始状态。因为 SBH 的释放操作会不断把**地址相邻的空闲 block 合并**。当一个 Group 中所有已分配 block 都被释放后，每个 Page 内最终只可能剩下一个最大的空闲 block，于是逻辑布局重新回到刚初始化时的样子。
>
> 比如某个快照中page的状态：`[剩余空闲][已分配 A][空闲 B][已分配 C]`，当释放A后，会变成`[空闲][已分配 C]`，释放C后，`[空闲]`
>
> 为什么8个page不会合并成一整块，因为黄色块0xffffffff会被当作“已占用的边界标记”，合并到page边缘就停止了。所以一个 Group 全部释放后，不会形成一个 32 KB 的大空闲块，而是恢复成：8 个 Page✖️4KB。

![image-20260717020422989](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717020422989.png)

延缓全回收动作：

![image-20260717020236173](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717020236173.png)

## 大局观整理

![image-20260717021537067](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717021537067.png)

![image-20260717030142648](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260717030142648.png)
