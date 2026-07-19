一般我们会把分配器用于容器中，不会自己手动使用分配器分配内存。比如：

```cpp
std::allocator<std::string> alloc;
std::string* p = alloc.allocate(3); //分配3个string大小的内存
alloc.deallocate(p, 3);//释放内存
```

用户在释放内存的时候需要手动输入释放的内存大小，这样很麻烦，用户需要牢记自己当初申请了多大的内存。

而使用容器，不需要手动调用allocate和deallcoate。容器内部会自动帮你调用，你只需要指定使用哪种容器即可，当然也不需要牢记申请的内存大小。

## GNU C++对allocator的描述

![image-20260719110020810](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719110020810.png)

![image-20260719110032994](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719110032994.png)

![image-20260719110348888](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719110348888.png)

![image-20260719113822510](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719113822510.png)

![image-20260719113830581](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719113830581.png)

array_allocator描述里面大小固定的容器指的是刚开始我就知道这个容器需要的内存大小，不会发生变化。这样子的话一开始就把内存分配好，不要再一个元素分配一次了。 std:array是一个容器，内部是一个C++数组。

GNU C++描述的allocator有好几种，我们重点关注bitmap_allocator和pool_allocator。pool_allocator已经在第二讲就谈过了。

![image-20260719115744826](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719115744826.png)

VS2013底下的标准allocator没有做额外的事情，只是调用全局的operator new/delete。

![image-20260719120050150](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719120050150.png)

G4.9标准分配器是std::allocator，它的父类是_gnu_cxx::new_allocator。这个分配器也只是简单调用全局的opreator new/delete。

![image-20260719120254470](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719120254470.png)

_gnu_cxx::malloc_allocator分配器只是简单调用malloc和free。

![image-20260719120859701](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719120859701.png)

std::array本质是静态数组，静态数组没有释放的概念，因为是在栈上创建的，操作系统来管理，不需要我们管理。所以deallocate接口只是个摆设，内部没有做任何事情。

我们来看一个具体的例子：创建了一个array_allocator对象myalloc，构造函数传入的参数是my数组的地址。那么将来用allocate分配内存的时候就会从这个数组中取。比如myalloc.allocate(1)代表分配一个int，就会返回my数组第一个元素的首地址。接着allocate(3)代表分配3个int，就会返回my数组第二个元素的首地址。

![image-20260719121530419](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719121530419.png)

下面这个用的是动态分配获得的数组，上面那张图是静态数组（不能说是静态分配得到的，只有全局或static修饰的数组是静态分配得到的）。

![image-20260719121501546](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719121501546.png)

debug_allocator就是一个包装，把真正的分配器_M_allocator包装起来。让分配的内存还多带一个`_M_extra`个元素大小的空间，用来记录整个内存的大小。这个没什么用，这个多的东西和cookie是一样的作用，我们一直想要去除cookie，这个分配器反而增加cookie。

![image-20260719122919572](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719122919572.png)

alloc分配器：内存池的设计

![image-20260719124418439](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719124418439.png)

![image-20260719124451653](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719124451653.png)

![image-20260719124459147](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719124459147.png)

bitmap allocator，每次只要一个元素大小的内存，会调用`_M_allocate_single_object`，如果多于一个元素大小，就调用全局的operator new。

![image-20260719132034366](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719132034366.png)

bitmap分配器中的一些概念：

* blocks 一个block就是用户要的一个元素大小的内存。当然如果是list容器，block是两个指针+元素大小。

  * bitmap用来记录64个blocks的状态。bitmap每个元素是unsigned int，4个字节，也就是32位bit，所以需要bitmap[0] bitmap[1]来记录64个blocks的状态。

* Super-blocks size指的是去掉红色块以外的大小。

* 还会有两个指针用来管理super-blocks。叫做一个单元。

* 用自定义的_mini_vector容器来管理指针。里面有三个东西，start指向头、finish指向最后一个元素的下一个位置、endofstorage指向容量的尾巴。（可能有点抽象）

  ![image-20260719133723715](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719133723715.png)

![image-20260719132458052](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719132458052.png)

内存分配的行为模式：

![image-20260719134018842](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719134018842.png)

![image-20260719134041859](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719134041859.png)

![image-20260719134049801](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719134049801.png)

![image-20260719134058477](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719134058477.png)

第一个super block用完后，会再分配另一个super block。区块的数量会从64增长到128，所以需要用bitmap数组的四个元素来表示block的状态。vector数组会再多一个元素，也就是两个指针，用来管理这个super block。

![image-20260719135630083](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719135630083.png)

再创建第3个super block。vector还需要再创建一个元素，元素个数是3个。但是容量是两倍增长的，从2->4。endofstorage指向容量的尾。

![image-20260719135938802](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719135938802.png)

> vector的机制：vector有一个元素，现在再添加一个元素，vector就会扩容，按2倍的速度增长。还会发生复制，把原先的元素拷贝到另一块内存中，在另一块内存中进行增长。

entries代表的就是两个指针组成的单元，用户创建了很多容器，存储的是不同类型的元素，就算元素大小一样，也需要不同的entries来管理。

回收动作：

![image-20260719143650612](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719143650612.png)

第一个super block回收后，下一次再分配super block的时候，block数量会变成128个，而不是512个。

上张ppt还有两个QA。读一下很好理解。 

什么时候会把全回收状态的super block释放给操作系统呢。当mini_vector的大小超过64时，会比较新加入的全回收super block和mini_vector最大的元素的大小，如果大于，就直接调用operator delete。如果小于，就把最大的super block释放掉。

![image-20260719144650633](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719144650633.png)

![image-20260719145101271](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719145101271.png)

示例：

![image-20260719145432195](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719145432195.png)

![image-20260719145441231](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260719145441231.png)