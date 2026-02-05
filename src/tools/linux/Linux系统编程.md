# Linux系统编程

> 参考：
>
> [黑马程序员-Linux系统编程](https://www.bilibili.com/video/BV1KE411q7ee?vd_source=5940e85c0b18a907a0fdea51914b4f65&spm_id_from=333.788.videopod.episodes&p=58)

## 系统调用

系统调用指的是操作系统提供给用户调用的一组特殊接口（也就是内核提供的函数，操作系统本质是个程序，内核就是操作系统程序的核心部分。）

如何查看系统调用的定义：`man 2 write`查看write函数。![image-20260122115337916](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260122115337916.png)

判断一个函数是系统函数还是库函数的依据：

* 是否访问内核数据结构
* 是否访问外部硬件资源

满足其中一个就是系统函数。

**系统资源**：CPU、内存、总线等操作系统运行需要用到的一系列东西的总称。 

### 预读入缓输出机制  

### open、read和write函数



 ## 文件描述符（File Descriptor）

PCB进程控制块是一个结构体，里面有个成员是一个指向文件描述符表的指针。

一个进程可以打开1024个文件。

一个文件描述符指向一个成功打开的文件结构体，结构体中包含文件的各种信息。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260121115629650.png" alt="image-20260121115629650" style="zoom: 33%;" />

## 阻塞和非阻塞

产生阻塞的场景：读设备文件、读网络文件。读常规文件没有阻塞概念。阻塞和非阻塞是文件的属性。

现在明确一下阻塞（Block）这个概念。==阻塞是否可以理解成等待？==当进程调用一个阻塞的系统函数时，该进程被置于睡眠（Sleep）状态，这时内核调度其它进程运行，直到该进程等待的事件发生了（比如网络上接收到数据包，或者调用sleep指定的睡眠时间到了）它才有可能继续运行。

与睡眠状态相对的是运行（Running）状态，在Linux内核中，处于运行状态的进程分为两种情况：

* 正在被调度执行。CPU处于该进程的上下文环境中，程序计数器（eip）里保存着该进程的指令地址，通用寄存器保存着该进程运算过程的中间结果，正在执行该进程的指令正在读写该进程的地址空间。
* 就绪状态。该进程不需要等待什么事件发生，随时都可以执行，但CPU暂时还在执行
  另一个进程，所以该进程在一个就绪队列中等待被内核调度。系统中可能同时有多个就绪的进程，那么该调度谁执行呢？内核的调度算法是基于优先级和时间片的，而且会根据每个进程的运行情况动态调整它的优先级和时间片，让每个进程都能比较公平地得到机会执行，同时要兼顾用户体验，不能让和用户交互的进程响应太慢

## 传入传出参数

传入参数：

* 指针作为函数参数
* 有const修饰指针
* 指针指向有效区域、在函数内部做读操作。

传出参数：

* 指针作为函数参数
* 在函数调用前，指针指向的空间可以没有意义
* 在函数内部做写操作
* 函数调用结束后，充当函数返回值

传入传出参数：

* 指针作为函数参数
* 在函数调用前，指针指向的空间有实际意义
* 在函数内部先做读操作、再做写操作
* 函数调用结束后，可以充当函数返回值的功能。

## 环境变量

比如 PATH SHELL TERM（终端）HOME（用户主目录）

name=value键值对

`PATH`：指定可执行文件的搜索路径。ls命令也是一个程序，执行它不需要提供完整的路径名/bin/ls，然而通常我们执行当前目录下的程序a.out却需要提供完整的路径名./a.out，这是因为PATH 环境变量的值里面包含了Is命令所在的目录/bin，却不包含a.out所在的目录。PATH环境变量的值可以包含多个目录，用:号隔开。在Shell中用echo命令可以查看这个环境变量的值：
`echo $PATH`

`env` 查看所有环境变量

环境变量、main函数的命令行参数放在stack的上面。

## 进程

### 进程地址空间

虚拟内存就是在你电脑的物理内存不够用时把一部分硬盘空间作为内存来使用，这部分硬盘空间就叫作虚拟内存。

Linux 的虚拟地址空间范围为 0～4G，Linux 内核将这 4G 字节的空间分为两部分，将最高的 1G 字节（从虚拟地址 0xC0000000 到 0xFFFFFFFF）供内核使用，称为 `内核空间`。而将较低的 3G 字节（从虚拟地址 0x00000000 到 0xBFFFFFFF）供各个进程使用，称为 `用户空间`。

可以通过系统调用从用户空间进入内核空间。

一个页大小是4k。

虚拟地址到物理地址转换过程有操作系统和 CPU 共同完成（操作系统为 CPU 设置好页表，CPU 通过 MMU（内存管理单元） 单元进行地址转换）。

![image-20260121211359115](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260121211359115.png)



不同进程的虚拟内核空间会映射到同一个物理内存。

![image-20260121211501207](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260121211501207.png)

MMU（内存管理单元）的作用：

* 虚拟内存与物理内存的映射
* 设置内存访问级别
* page 4k

内存访问级别：0 3  0级供内核使用，3级供用户程序使用，

### PCB进程控制块

本质是结构体。存储进程的相关信息。                  

相关信息主要有：

进程id 文件描述符表 进程工作目录位置 信号相关信息 用户id和组id 进程状态（初始、就绪、运行、挂起、停止）

### fork函数

头文件：`#include <unistd.h>`

函数原型：`pid_t fork(void)` 

* `pid_t`表示进程ID，但是为了表示-1，他是有符号整型。0不是有效进程ID，init最小，为1。
* 失败返回-1；子进程返回0，父进程返回子进程的PID。
* 子进程只执行fork后的语句。
* 注意fork之后父进程先执行还是子进程先执行是不确定的，取决于内核使用的调度算法。

![image-20260122103238163](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260122103238163.png)

### getpid和getppidd

函数原型：

`pid_t getpid(void)` `pid_t getppid(void)`

循环创建n个子进程：用break消除子进程产生的子进程。

![image-20260122104659145](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260122104659145.png)

```c

```

### 进程共享

父子进程相同的地方：（大前提是刚fork完）全局变量、data、text、堆、栈、环境变量、宿主目录位置、进程工作目录位置、信号处理方式。

父子进程不同的地方：进程id、fork返回值、各自的父进程、进程创建时间、闹钟、未决信号集。

父子进程共享：文件描述符 mmap建立的映射区

原则：读时共享、写时复制。

父子进程不共享全局变量。父进程改了全局变量，子进程看不到变化。



### exec函数族

fork创建子进程后执行的是和父进程相同的程序，子进程往往会调用一种exec函数用来执行另一个程序。调用exec函数时，该进程的用户空间代码和数据完全被新程序替换，但是进程id不变，不会创建新进程。

#### execlp函数

p代表的是PATH环境变量。

`int execlp(const char *file, const char *arg, ...)`

* 返回-1 说明出错。
* 不出错，则没有返回值。 

#### execl函数

`int execl(cosnt char *path, const char *arg, ...)`

exec函数调用成功不返回，只有失败才返回。所以通常直接在exec函数调用后直接调用perror()和exit()。

只有execve是真正的系统调用。其他函数都是库函数，对execve函数进行了封装。![image-20260122121504823](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260122121504823.png)

练习：将进程信息打印到文件中。



### 孤儿进程和僵尸进程

僵尸进程：子进程终止，父进程还没有回收子进程残留在内核中的资源（PCB），称为该进程为僵尸进程。

对于僵尸进程，kill命令无效。

孤儿进程：父进程比子进程更早终止，系统会自动给孤儿进程一个PPID，子进程的父进程成为init进程。

### 守护进程

Linux的后台服务进程。

### 回收子进程

#### wait函数

头文件：<sys/wait.h>

函数功能：

* ==阻塞==等待子进程退出
* 回收子进程残留资源
* 获取子进程结束状态

`pid_t wait(int *status)`

成功返回子进程PID，失败返回-1。

  

宏函数：（看子进程如何死的）

* `WIFEXITED（status）`为1说明子进程正常终止

  `WEXITSTATUS（status）`返回子进程的退出值

* `WIFSIGNALED(status)`为1说明子进程是被信号终止

  `WTERMSIG（status）`可以取得使进程终止的那个信号的编号。

`wpid = wait(NULL)` 不关心子进程结束原因



#### waitpid函数

`pid_t waitpid(pid_t pid, int *status, int options);`

* pid指定要回收的子进程pid。>0回收指定ID的子进程，-1回收任意子进程。0：同组的子进程
* option和status可以为NULL
* option为0表示阻塞回收

返回值：返回成功回收的子进程Pid，返回值为0表明参数3指定了options为WNOHANG（非阻塞 也就是说调用该函数时子进程没有结束，函数会直接返回0，不会阻塞等待。），并且子进程没有结束。失败返回-1

一次wait/waitpid函数调用，只能回收一个子进程。

waitpid(-1,$status,0)==wait(&status)

![image-20260123140601165](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260123140601165.png)

回收多个子进程（使用循环）

![image-20260123141537047](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260123141537047.png)





### 进程间通信（IPC）

进程间通信的本质：内核空间的一块缓冲区（buffer），大小一般是4096个字节。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260125184137684.png" alt="image-20260125184137684" style="zoom:33%;" />

IPC的方式：管道（简单）、信号（开销小）、共享映射区（非血缘关系进程间）、本地套接字（稳定）

管道：内核借助环形队列机制，使用内核缓冲区实现的。有两个文件描述符引用，一个表示读一个表示写

特质：管道是伪文件，不占用磁盘空间；数据在管道中只能单向流动；数据从管道的写端流入管道，读端流出。（这里的读写是在程序的角度看的）

局限性：1. 数据不可以反复读 2. 采用半双工通信 3. 血缘关系进程间可用 4. 数据不能进程自己写自己读

pipe函数创建并打开匿名管道。`int pipe(int pipfd[2])`

fd[0]读端 fd[1]写端

成功返回0，失败返回-1。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260125204130042.png" alt="image-20260125204130042" style="zoom:33%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260125204323055.png" alt="image-20260125204323055" style="zoom:33%;" />

父子间通过管道进行通信的代码：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260125204421123.png" alt="image-20260125204421123" style="zoom:50%;" />



管道的读写行为：

读端：

* 管道有数据，read直接返回实际读到的字节数
* 管道无数据，无写端，read返回0；有写端，read阻塞等待，让出CPU。

写端：

* 管道无读端，进程异常终止（SIGPIPE导致的）。
* 有读端，若管道满了，write阻塞；若管道没满，write返回写入的字节数

![image-20260126090826850](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260126090826850.png)

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260125222841237.png" alt="image-20260125222841237" style="zoom:50%;" />

> 程序输出结果：![image-20260125222922230](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260125222922230.png)
>
> 父进程先执行完了，bash抢占终端，所以会看到先出现$提示符，再出现子进程结果。
>
> 加sleep也没有用，因为当子进程读管道的时候没有读到数据，就会阻塞到那里，直到父进程写入了数据。也就是说父进程一定比子进程先执行。
>
> 如何解决：只需让子进程写入、父进程读出，这样子进程永远会先结束。
>
> <img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260126090357407.png" alt="image-20260126090357407" style="zoom:50%;" />

练习：使用管道实现兄弟进程间通信，兄:ls 弟：wc-l 父：等待回收子进程

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260126091907946.png" alt="image-20260126091907946" style="zoom:50%;" />



允许一个管道只有一个写端、多个读端。一个读端、多个写端，需要加sleep控制写入的顺序。

`ulimit -a` 可以查看管道缓冲区的大小





FIFO（命名管道）通过FIFO，不相关的进程也能进行数据交换。

创建方式：

* `mkfifo 管道名`
* `int mkfifo(const char *pathname, mode_t mode);` 成功返回0，失败返回-1。 需要添加头文件：`<sys/stat.h>`

FIFO本质就是一个文件，两个进程一个进行写，一个进行读，从而实现通信。



存储映射





## 信号

### 基本概念

### 信号产生

### 信号集操作函数

### 信号捕捉

### SIGCHLD信号 

## 线程

### 基本概念

`ps -Lf 进程ID   `可以得到线程号（LWP）

### 线程控制原语

### 线程同步 

### 锁

#### 互斥锁（互斥量）

本质是个结构体

#### 死锁

#### 自旋锁

#### 读写锁

#### 乐观锁和悲观锁

### 条件变量

本身不是锁通常结合互斥锁进行使用。

### 信号量

相当于初始化值为N的互斥量。







 

