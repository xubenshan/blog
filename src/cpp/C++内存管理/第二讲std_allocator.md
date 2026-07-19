## std::allocator ##

### 一、malloc()内部原理 ###

#### 1、VC6.0 malloc ####

![](https://i.imgur.com/gQUae6j.png)

从上图可见，VC6中的malloc()函数分配的内存里面除了我们需要申请的内存空间外还有cookie，debug信息和pad，其中cookie是我们不需要的，如果大量调用malloc的话cookie总和会增多，这会造成较大的浪费。

不同的编译器所附带的标准库里头的分配器做法可能不一样。

![](https://i.imgur.com/cmEOkpQ.png)

从上面可以看出，VC6.0的allocate()函数只是对malloc的二次封装，并没有做什么很特殊的操作，它是以类型字节长度为单位分配内存的，上图就分配了512个int类型空间。如果类型是double，那allocate第一个参数填512，代表分配512个double类型空间。

补充：右下角那两行代码是干啥的。

```cpp
//如果我们在自己的程序里，想跳过 vector、list 等容器，直接赤裸裸地调用 VC6 的这个 allocator 来分配内存，该怎么写。
int* p = allocator<int>().allocate(512, (int*)0);//512个int大小的空间
allocator<int>().deallocate(p, 512);
```



#### 2、BC5 malloc ####

![](https://i.imgur.com/ob9hMFD.png)

BC5的allocate()函数和VC6.0本质一样。

我们的目标是要去除cookie。去除cookie的一个先决条件就是内存块大小要一样，如果有大有小，就必须用cookie来记录区块大小了，就不能去掉了。

#### 3、G2.9 malloc ####

![](https://i.imgur.com/e2MZ9ZG.png)

GCC 2.9版本的allocator如上图所示，但是在实际中该部分却没有被包含使用，从下图容器使用的Alloc可以看到，实际的分配器是使用了一个叫alloc的类，该类分配内存是以字节为单位的，而不是以对象为单位。下图右边灰色部分分配的是512字节，而不是512个对象。

![](https://i.imgur.com/FVlBA20.png)

#### 4、\_\_pool_alloc ###

在GCC 4.9版本，2.9版本的allocate不属于正式使用的那个版本，而是变成了__pool_alloc：

![](https://i.imgur.com/K7XxqvN.png)

![](https://i.imgur.com/6MTLUB7.png)

从上面两张图可以对比看出，2.9版本的allocate和4.9版本的__pool_alloc做的事是一样的，只是修改了变量名和一些细小操作而已。

下图是标准分配器的实现，标准分配器说的是allocator。

```cpp
父类/基类：__gnu_cxx::new_allocator<T>
                    ↑
子类/派生类：std::allocator<T>
```

G4.9标准分配器只是类的关系变复杂了，除此之外，也没有特殊的设计。

![](https://i.imgur.com/AHgQElz.png)

cookie_test第一个实参是`_pool_alloc<double>()`，(加括号是表示创建临时对象)，表示分配器的类型是``_pool_alloc<double>`。第二个实参是1，传入cookie_test后，alloc.allocate(1)。表示分配一个double类型的空间，也就是八个字节。

分配了三次，打印出地址，会发现相距8个字节。可以看出用alloc分配器分配的内存没有了cookie。

![](https://i.imgur.com/BVIH5XG.png)

测试的代码如所示：

	#include <iostream>
	#include <vector> 
	#include <ext\pool_allocator.h>
	
	using namespace std;
	
	template<typename Alloc> 
	void cookie_test(Alloc alloc, size_t n)                                                                                
	{
	    typename Alloc::value_type *p1, *p2, *p3;		//需有 typename 
	  	p1 = alloc.allocate(n); 		//allocate() and deallocate() 是 non-static, 需以 object 呼叫之. 
	  	p2 = alloc.allocate(n);   	
	  	p3 = alloc.allocate(n);  
	
	  	cout << "p1= " << p1 << '\t' << "p2= " << p2 << '\t' << "p3= " << p3 << '\n';
		  	
	  	alloc.deallocate(p1,sizeof(typename Alloc::value_type)); 	//需有 typename 
	  	alloc.deallocate(p2,sizeof(typename Alloc::value_type));  	//有些 allocator 對於 2nd argument 的值無所謂  	
	  	alloc.deallocate(p3,sizeof(typename Alloc::value_type)); 	
	}
	
	int main(void)
	{
		cout << sizeof(__gnu_cxx::__pool_alloc<double>) << endl;
		vector<int, __gnu_cxx::__pool_alloc<double> > vecPool;
		cookie_test(__gnu_cxx::__pool_alloc<double>(), 1);
		
		cout << "----------------------" << endl;
		
		cout << sizeof(std::allocator<double>) << endl;
		vector<int, std::allocator<double> > vecPool2;
		cookie_test(std::allocator<double>(), 1);
		
		return 0;
	}

测试环境是Dev C++5.1.1版本，GCC 4.9，测试结果如下：

![](https://i.imgur.com/n7pUFXm.png)

从上面的测试结果可以看出，如果使用了__pool_alloc的话，连续两块内存之间的距离是8，而一个double类型变量的大小也是8个字节，说明这连续几块内存之间是不带cookie的（即使这几块内存在物理上也是不连续的）。如果使用std的allocator，那么相邻两块内存之间距离为18个字节，每块内存带有一个4字节的头和4字节的尾。

### 二、std::alloc ###

#### 1、std:alloc运作模式 ####

![](https://i.imgur.com/lzcpFvY.png)

std::alloc使用一个16个元素的数组来管理内存链表，而我们上一章只是用了一条链表。数组不同的元素管理不同的区块，例如#1号元素负责管理块大小为8个字节；依次类推，#3号元素负责管理32bytes为一小块的链表。

假设现在用户需要32字节（如果用户需要30个字节，分配器也会给他分配32个字节。总之不管用户要多少，分配器都会分配8的倍数）的内存，std::allloc先申请一块区间，为`32*20*2`大小，用一条链表管理，然后让数组的#3元素管理这条链表。接着将该以32为一个单元的链表的一个单元（32字节）分给用户。为什么是`32*20*2`？
前`32*20`空间是分配给用户的，但是后面的`32*20`空间是预留的，称为战备池。如果这时用户需要一个64字节的空间，那么剩下的`32*20`空间将变成64*10，然后将其中64字节分配给用户，而不用再一次地申请空间和构建链表。

但是也有上限。如果该链表组维护的链表最大的一个小块为128byte，但是用户申请内存块超过了128byte，那么std::alloc将调用malloc给用户分配空间，然后该块将带上cookie头和尾。

![](https://i.imgur.com/8MNTpki.png)

在真正的商业级的内存分配器中，一般都会使用嵌入式指针，将每一个小块的前四个字节用作指针连接下一块可用的内存块。

#### 2、std::alloc运行一瞥 ####

![](https://i.imgur.com/lGNyqvP.png)

用户一般不要直接去用分配器，因为你需要记住想要的内存大小，将来还给分配器的时候需要传入内存的大小。而容器元素大小是一样的，所以我们需要通过容器来索要内存。申请32个字节，指的是容器想要32个字节。

roundup是追加量，pool指的是战备池大小。

![](https://i.imgur.com/G4h5VE1.png)

![](https://i.imgur.com/oEh5eUL.png)

再申请96字节，战备池已经没有多余的内存了，只能通过malloc向操作系统申请内存，大小为96×20×2+roundup。这个roundup怎么算呢？累计申请量>>4也就是除以16，再调到8的倍数。申请的内存大小总共3920字节。申请96个字节，所以空闲链表的大小应该是96×20=1920字节，剩余2000字节，作为战备池。

![](https://i.imgur.com/gjy2DCM.png)

![](https://i.imgur.com/Ik5j4AB.png)

某个容器连续发出三次请求，可以直接从#10对应的自由链表中拿三个空闲块。

![](https://i.imgur.com/0EbenSF.png)

![](https://i.imgur.com/KiVVXm0.png)

下面这页是经典的碎片处理。由于战备池大小是80，但是容器申请104字节，战备池不够分配，如何处理这80个字节。把80交给#9。因为#9管理的就是80个字节大小的内存块。

![](https://i.imgur.com/KzfwDdr.png)

![](https://i.imgur.com/Vb9WrUI.png)

![](https://i.imgur.com/iYdhtkB.png)

走到山重水尽之后，该怎么办？

![](https://i.imgur.com/NTqyfwF.png)

![](https://i.imgur.com/kGj86gM.png)

![](https://i.imgur.com/2udQslV.png)

![](https://i.imgur.com/jfBEG5f.png)

#### 3、std::alloc源码剖析 ####

侯杰老师的ppt上总结的很好，在看这部分内容时需要结合老师的ppt，为了方便分析，这里结合老师的课程，使用“倒叙”的方式，先介绍中间的几张ppt，然后跳回前面，顺序和原版ppt不一样。

原版ppt的1-3张介绍的是GCC 2.9的std::alloc的第一级分配器，这里先从第二级开始分析，然后再到第一级。

![](https://i.imgur.com/SCvJ2A6.png)

该分配器为__default_alloc_template，一开始默认使用的分配器，在该类中定义了ROUND_UP函数，用来将申请内存数量做16字节对齐。定义了union free_list_link，在后面会介绍它的作用，在上一章中我们构建的一个小的分配器中也定义了该联合体，作用类似，该联合体可以使用struct代替。free_list是一个有16个``obj*``元素的数组（`obj* free_list[]` free_list是一个指针数组，也就是一个数组，每个元素是指针。），在前面讲过，GCC 2.9的分配器用一个16字节数组管理16条链表，free_list便是该管理数组。refill和chunk_alloc（chunk表示一大块、block表示一个个小块）在后面再介绍。start_free和end_free分别指向战备池的头和尾。

![](https://i.imgur.com/ofe7YUv.png)

首先看allocate函数，在函数的一开始便定义了:

	obj* volatile *my_free_list;

结合上图右侧的链表图和上上一张图片内容，my_free_list指向的是free_list中16个元素中的任何一个，*my_free_list则取出free_list某元素中的值，该值是个地址，指向一条分配内存的链表。所以my_free_list要定义为二级指针。

result则保存分配给用户的一块内存的地址。

首先：

    if (n > (size_t)__MAX_BYTES) {
        return(malloc_alloc::allocate(n));
    }

检查用户申请内存块大小，如果大于__MAX_BYTES（128）那么将调用malloc_alloc::allocate()，这便是第一级分配器，这在后面分析。现在假设用户申请内存小于128字节，那么将根据用户申请内存大小分配对应的内存，由于内存池使用free_list链表管理的，每个free_list链表元素管理不同的内存块大小，这在前面介绍过了。于是有：

	my_free_list = free_list + FREELIST_INDEX(n);//free_list指向#0，存储#0的地址。
	//这里的加法相当于&free_list[FREELIST_INDEX(n)]。

定位到该内存块的位置，这时my_free_list指向的是管理该内存块的空间的地址，使用*my_free_list便可以取到该内存块的地址：

	result = *my_free_list;

然后判断result是否为空：

    if (result == 0) {
        void* r = refill(ROUND_UP(n));
        return r;
    }

如果为空，说明系统内存不够用了，将使用refill()函数分配内存，这部分在后面会介绍。

如果情况正常，那么将该链表中下一个可以使用的空间设置为当前分配给用户空间指向的下一个、在逻辑上连续的空间，最后将result返回给用户：

    *my_free_list = result->free_list_link;
    return (result);

下面的这张图很形象地演示了内存分配的过程：

![](https://i.imgur.com/zXMf35J.png)

接下来分析释放内存。

	  static void deallocate(void *p, size_t n)  //p may not be 0
	  {
	    obj* q = (obj*)p;
	    obj* volatile *my_free_list;   //obj** my_free_list;
	
	    if (n > (size_t) __MAX_BYTES) {
	        malloc_alloc::deallocate(p, n);
	        return;
	    }
	    my_free_list = free_list + FREELIST_INDEX(n);
	    q->free_list_link = *my_free_list;
	    *my_free_list = q;
	  }

释放内存的代码也不难理解，找到需要释放内存的那块空间的地址，然后将当前可分配给用户的空间地址设置为需要释放的该内存空间，一开始指向的可分配的内存空间地址赋值给需要释放空间地址的逻辑连续的下一个内存地址。感觉十分拗口，图和代码更能体现这一过程：

![](https://i.imgur.com/ubYKWxM.png)

我们可以看出两个问题：

* deallocate并没有调用free，也就是没有把释放的内存交给操作系统，而是留在了自己设计的自由链表中。
* deallocate第一个参数p，并没有检查是不是当时allocate的时候分配的。

接下来再来看一下refill函数。当result为0的时候，说明#number没有挂自由链表。需要通过调用chunk_alloc得到一大块内存，再把这一大块内存做切割，切成符合要求的一个个小块。

nobjs传的是引用，初始传进去是20，但战备池可能提供不了20，所以在战备池内部nobjs会被修改成最多能拿的个数，当然不能超过20。

![](https://i.imgur.com/j26x3xi.png)

```cpp
result = (obj*)chunk; //第一块直接给用户。
*my_free_list = next_obj = (obj*)(chunk + n);//找到第二块的起始地址，作为自由链表头。
```

```cpp
//循环把剩余块串起来
//i也可以从0开始，不过终止条件就要换成i == nobjs - 2。为了语义更明显，i最好从1开始，代表第0个内存块直接用来分配给用户，不需要进行切割。
```

接下来分析最难的一个函数：chunk_alloc函数。用来分配一大块内存。战备池有空间就从战备池拿，没空间就从操作系统拿。

![](https://i.imgur.com/ICXnj4c.png)

![](https://i.imgur.com/p9EfgAj.png)

该函数声明如下：

	template <bool threads, int inst>
	char*
	__default_alloc_template<threads, inst>::
	chunk_alloc(size_t size, int& nobjs)

函数一开始计算了一些需要的值：

	char* result;
	size_t total_bytes = size * nobjs;
	size_t bytes_left = end_free - start_free;

result指向分配给用户的内存，total_bytes为需要分配的内存块的大小，bytes_left则是当前内存池中剩余的空间大小。

然后：

	if (bytes_left >= total_bytes) {
	  result = start_free;
	  start_free += total_bytes;
	  return(result);
	}

判断如果内存池剩余的内存大小多余需要分配的内存块大小，那么将内存池的首地址start_free直接赋值给result，然后将start_free指针下移total_bytes距离，将当下的result~start_free之间的空间返回给用户。

当然，如果bytes_left比total_bytes小，但是却比size大：

	else if (bytes_left >= size) {
	      nobjs = bytes_left / size;
	      total_bytes = size * nobjs;
	      result = start_free;
	      start_free += total_bytes;
	      return(result);
	  }

这意味着不能直接分配size * nobjs大小内存给用户，那么可以先看看内存池当下的空间能分配多少个size大小的块给用户，然后将该块分配给用户，start_free指针移动total_bytes长度。


	  size_t bytes_to_get =
	             2 * total_bytes + ROUND_UP(heap_size >> 4);
	  // Try to make use of the left-over piece.
	  if (bytes_left > 0) {
	      obj* volatile *my_free_list =
	             free_list + FREELIST_INDEX(bytes_left);
	
	      ((obj*)start_free)->free_list_link = *my_free_list;
	      *my_free_list = (obj*)start_free;
	  }

这部分查看内存池里面还有没有多余的内存，如果有，就充分利用。然后就是不断地获取内存块，将这些内存块不断切割用链表连接起来，递归这些过程：

      start_free = (char*)malloc(bytes_to_get);
      if (0 == start_free) {
          int i;
          obj* volatile *my_free_list, *p;
    
          //Try to make do with what we have. That can't
          //hurt. We do not try smaller requests, since that tends
          //to result in disaster on multi-process machines.
          for (i = size; i <= __MAX_BYTES; i += __ALIGN) {
              my_free_list = free_list + FREELIST_INDEX(i);
              p = *my_free_list;
              if (0 != p) {
                  *my_free_list = p -> free_list_link;
                  start_free = (char*)p;
                  end_free = start_free + i;
                  return(chunk_alloc(size, nobjs));
                  //Any leftover piece will eventually make it to the
                  //right free list.
              }
          }
          end_free = 0;       //In case of exception.
          start_free = (char*)malloc_alloc::allocate(bytes_to_get);
          //This should either throw an exception or
          //remedy the situation. Thus we assume it
          //succeeded.
      }
      heap_size += bytes_to_get;
      end_free = start_free + bytes_to_get;
      return(chunk_alloc(size, nobjs));

![](https://i.imgur.com/t4Gz1D7.png)

接下来看alloc观念大整理：先来看第一种没有new的，Foo(1)会在栈上创建一个临时对象，把对象push_back进去。list容器会向分配器要内存，这块内存大小包含Foo大小，还需要两根指针。这是list维护容器所需要的。内存分配好后，会把Foo(1)拷贝到该内存。然后Foo(1)临时对象就消失了。

![](https://i.imgur.com/QhuRqGz.png)

![](https://i.imgur.com/eL1hcds.png)

deallocate没有把释放的内存回归给操作系统，因为设计上的先天缺陷：比如当初战备池不够了，调用malloc分配了一大块内存， `p` 存储首地址，把p对应的那小块分配给用户，就算记录了信息，将来该块回收到空闲链表，如果调用free的话，会有问题，因为有些块可能正在被使用。

之所以在4.9环境下观察，因为2.9alloc分配器向操作系统申请内存直接用的malloc，malloc是不能被重载的，所以我们没办法写代码观察分配的次数和大小。但是4.9环境下使用的是operator new向操作系统要内存，是可以被重载的。

countNew是malloc要的内存总量。timesNew是调用malloc的次数，每调用一次malloc获得的内存都会带上下cookie，共8字节。调用1000次malloc，cookie就占8000字节。

![](https://i.imgur.com/cUVMnHp.png)

右图`std::list<double>` 默认使用标准分配器std::allocator，而标准分配器通常最终调用全局 `::operator new` 申请原始内存。list每个对象是double类型，但list是双向链表，所以需要维护两个指针，因此每个块大小是16字节。push_back(i)的时候就向分配器要16个字节。

![](https://i.imgur.com/VcXK94y.png)

![](https://i.imgur.com/zvx7Zmx.png)













上面说到，不论是分配内存还是释放内存，则有：

    if (n > (size_t)__MAX_BYTES) {
        return(malloc_alloc::allocate(n));
    }

和：

    if (n > (size_t) __MAX_BYTES) {
        malloc_alloc::deallocate(p, n);
        return;
    }

也就是将内存分配与释放操作放到第一级allocator中：

![](https://i.imgur.com/Mf5qVqE.png)

从上图中可以看到，第一级分配器叫做：

	class __malloc_alloc_template

其实有：

	typedef __malloc_alloc_template<0>  malloc_alloc;

这在后面会介绍。

分配器的allocate函数如下：

	  static void* allocate(size_t n)
	  {
	    void *result = malloc(n);   //直接使用 malloc()
	    if (0 == result) result = oom_malloc(n);
	    return result;
	  }

直接调用malloc函数分配内存，如果分配失败则调用oom_malloc函数。

同样地，reallocate也是如此：

	  static void* reallocate(void *p, size_t /* old_sz */, size_t new_sz)
	  {
	    void * result = realloc(p, new_sz); //直接使用 realloc()
	    if (0 == result) result = oom_realloc(p, new_sz);
	    return result;
	  }

如果重新要求内存失败，则调用oom_realloc函数，这两个函数在后续会介绍。

deallocate操作则直接释放内存：

	static void deallocate(void *p, size_t /* n */)
	{
		free(p);                    //直接使用 free()
	}

set_malloc_handler是个函数指针，里面传入一个void (*f)()类型函数：

	  static void (*set_malloc_handler(void (*f)()))()
	  { //類似 C++ 的 set_new_handler().
	    void (*old)() = __malloc_alloc_oom_handler;
	    __malloc_alloc_oom_handler = f;
	    return(old);
	  }

该函数设置的是内存分配不够情况下的错误处理函数，这个需要交给用户来管理，首先保存先前的处理函数，然后再将新的处理函数f赋值给__malloc_alloc_oom_handler，然后返回旧的错误处理函数，这也在下一张图片中会介绍：

![](https://i.imgur.com/tWjkErU.png)

可以看到oom_malloc函数内部做的事：

	template <int inst>
	void* __malloc_alloc_template<inst>::oom_malloc(size_t n)
	{
	  void (*my_malloc_handler)();
	  void* result;
	
	  for (;;) {    //不斷嘗試釋放、配置、再釋放、再配置…
	    my_malloc_handler = __malloc_alloc_oom_handler;
	    if (0 == my_malloc_handler) { __THROW_BAD_ALLOC; }
	    (*my_malloc_handler)();    //呼叫處理常式，企圖釋放記憶體
	    result = malloc(n);        //再次嘗試配置記憶體
	    if (result) return(result);
	  }
	}

该函数不断调用__malloc_alloc_oom_handler和malloc函数，直到内存分配成功才返回。oom_realloc也是如此：

	template <int inst>
	void * __malloc_alloc_template<inst>::oom_realloc(void *p, size_t n)
	{
	  void (*my_malloc_handler)();
	  void* result;
	
	  for (;;) {    //不斷嘗試釋放、配置、再釋放、再配置…
	    my_malloc_handler = __malloc_alloc_oom_handler;
	    if (0 == my_malloc_handler) { __THROW_BAD_ALLOC; }
	    (*my_malloc_handler)();    //呼叫處理常式，企圖釋放記憶體。
	    result = realloc(p, n);    //再次嘗試配置記憶體。
	    if (result) return(result);
	  }
	}

![](https://i.imgur.com/hK3r07F.png)

到这里，分配器只剩下refill函数没有分析了，下面将重点讨论该函数。不过在讨论refill函数之前有必要分析chunk_alloc函数：





