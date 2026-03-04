# Linux系统编程

> 参考：
>
> * [黑马程序员-Linux系统编程](https://www.bilibili.com/video/BV1KE411q7ee?vd_source=5940e85c0b18a907a0fdea51914b4f65&spm_id_from=333.788.videopod.episodes&p=58)
> * 码农论坛Linux环境高级编程
>
> * 《unix环境高级编程》



## 系统调用

系统调用指的是操作系统提供给用户调用的一组特殊接口（也就是内核提供的函数，操作系统本质是个程序，内核就是操作系统程序的核心部分。）

如何查看系统调用的定义：`man 2 write`查看write函数。2是查看系统调用 3是查看库函数![image-20260122115337916](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260122115337916.png)

判断一个函数是系统函数还是库函数的依据：

* 是否访问内核数据结构
* 是否访问外部硬件资源

满足其中一个就是系统函数。

**系统资源**：CPU、内存、总线等操作系统运行需要用到的一系列东西的总称。 

### 时间操作

UNIX操作系统根据计算机产生的年代把1970年1月1日作为UNIX的纪元时间，1970年1月1日是时间的中间点，将从1970年1月1日起经过的秒数用一个整数存放。

`time_t`：用于表示时间类型，它是一个long类型的别名，在<time.h>文件中定义，表示从1970年1月1日0时0分0秒到现在的秒数。

`time()库函数`：用于获取操作系统的当前时间。包含头文件：<time.h>

声明：`time_t time(time_t *tloc);`

```C
//有两种调用方法：

time_t now=time(0);   // 将空地址传递给time()函数，并将time()返回值赋给变量now。

//或

time_t now; time(&now);  // 将变量now的地址作为参数传递给time()函数。
```

`tm结构体`：

time_t是一个长整数，不符合人类的使用习惯，需要转换成tm结构体，tm结构体在<time.h>中声明，

```c
struct tm
{
  int tm_year;	// 年份：其值等于实际年份减去1900
  int tm_mon;	// 月份：取值区间为[0,11]，其中0代表一月，11代表12月
  int tm_mday;	// 日期：一个月中的日期，取值区间为[1,31]
  int tm_hour; 	// 时：取值区间为[0,23]
  int tm_min;	// 分：取值区间为[0,59]
  int tm_sec;     	// 秒：取值区间为[0,59]
  int tm_wday;	// 星期：取值区间为[0,6]，其中0代表星期天，6代表星期六
  int tm_yday;	// 从每年的1月1日开始算起的天数：取值区间为[0,365] 
  int tm_isdst;   // 夏令时标识符，该字段意义不大
};
```

`localtime()库函数`：用于把time_t表示的时间转换为tm结构体表示的时间。localtime()函数不是线程安全的，localtime_r()是线程安全的。包含头文件：<time.h>

```c
//函数声明
struct tm *localtime(const time_t *timep);
struct tm *localtime_r(const time_t *timep, struct tm *result);
```

示例：

```cpp
#include <iostream>
#include <time.h>      // 时间操作的头文件。
using namespace std;

int main()
{
  time_t now=time(0);             // 获取当前时间，存放在now中。

  cout << "now=" << now << endl;  // 显示当前时间，1970年1月1日到现在的秒数。

  tm tmnow;
  localtime_r(&now,&tmnow);       // 把整数的时间转换成tm结构体。

  // 根据tm结构体拼接成中国人习惯的字符串格式。
  string stime = to_string(tmnow.tm_year+1900)+"-"
               + to_string(tmnow.tm_mon+1)+"-"
               + to_string(tmnow.tm_mday)+" "
               + to_string(tmnow.tm_hour)+":"
               + to_string(tmnow.tm_min)+":"
               + to_string(tmnow.tm_sec);

  cout << "stime=" << stime << endl;
}
```

`mktime()库函数`：用于把tm结构体时间转换为time_t时间。包含头文件：<time.h>

函数声明：`time_t mktime(struct tm *tm);`

该函数主要用于时间的运算，例如：把2022-03-01 00:00:25加30分钟。

思路：1）解析字符串格式的时间，转换成tm结构体；2）用mktime()函数把tm结构体转换成time_t时间；3）把time_t时间加30*60秒；4）用localtime_r()函数把time_t时间转换成tm结构体；5）把tm结构体转换成字符串。

没有示例代码，以后会学到一个封装好上述操作的库。

`gettimeofday()函数`：用于获取1970年1月1日到现在的秒和当前秒中已逝去的微秒数，可以用于程序的计时。包含头文件：<sys/time.h>

函数声明：

```c
int gettimeofday(struct timeval *tv, struct timezone *tz);//第2个参数代表时区，传0即可。

struct timeval {
  time_t      tv_sec;    	/* 1970-1-1到现在的秒数 */
  suseconds_t tv_usec;   	/* 当前秒中，已逝去的微秒数 */
}; 

struct timezone {         /* 在实际开发中，派不上用场 */
  int tz_minuteswest;   	/* minutes west of Greenwich */ 
  int tz_dsttime;         	/* type of DST correction */
}; 
```

示例：

```cpp
#include <iostream>
#include <sys/time.h>  // gettimeofday()需要的头文件。
using namespace std;

int main()
{
  timeval start,end;

  gettimeofday(&start, 0 ); // 计时开始。

  for (int ii=0;ii<1000000000;ii++)
    ;

  gettimeofday(&end, 0 );   // 计时结束。

  // 计算消耗的时长。
  timeval tv;
  tv.tv_usec=end.tv_usec-start.tv_usec;
  tv.tv_sec=end.tv_sec-start.tv_sec;
  if (tv.tv_usec<0)//微秒相减结果是负数，意思就是结束时间的微秒部分比开始时间小。
  {
    tv.tv_usec=1000000+tv.tv_usec;
    tv.tv_sec--;//向秒数借一位
  }

  cout << "耗时：" << tv.tv_sec << "秒和" << tv.tv_usec << "微秒。\n";
}
```

`sleep和usleep()库函数`：把程序挂起一段时间。包含头文件：<unistd.h>

函数声明：

```cpp
unsigned int sleep(unsigned int seconds);
int usleep(useconds_t usec);
```

### 目录操作

* 获取当前的工作目录：

```c
//头文件是unistd
char *getcwd(char *buf, size_t size); 
char *get_current_dir_name(void);
```

示例：

```cpp
#include <iostream>
#include <unistd.h>
using namespace std;

int main()
{
  char path1[256];   // linux系统目录的最大长度是255。
  getcwd(path1,256);
  cout << "path1=" << path1 << endl;

  char *path2=get_current_dir_name();
  cout << "path2=" << path2 << endl;
  free(path2);   // 注意释放内存。malloc() new delete
}

```

* 切换工作目录：包含头文件：<unistd.h>

`int chdir(const char *path);`

返回值：0-成功；其它-失败（目录不存在或没有权限）。

* 创建目录：包含头文件：<sys/stat.h>

`int mkdir(const char *pathname, mode_t mode);`

* `pathname`-目录名

* `mode`-访问权限，如0755，不要省略前置的0

返回值：0-成功；其它-失败（上级目录不存在或没权限）。 比如要创建/tmp/aaa/bb，必须先有 /tmp/aaa。

* 删除目录：包含头文件： <unistd.h>

`int rmdir(const char *path);`

* `path`-目录名

返回值：0-成功；其它-失败（目录不存在或没有权限）

* 获取目录中的文件列表：文件存放在目录中，在处理文件之前，必须先知道目录中有哪些文件，所以要获取目录中文件的列表。

头文件：`#include <dirent.h>`

步骤：

```c
//步骤一：用opendir()函数打开目录。
DIR *opendir(const char *pathname);
//成功-返回目录的地址，失败-返回空地址。
//步骤二：用readdir()函数循环的读取目录。
struct dirent *readdir(DIR *dirp);
//成功-返回struct dirent结构体的地址，失败-返回空地址。
//步骤三：用closedir()关闭目录。
int closedir(DIR *dirp);
```

目录指针：`DIR *目录指针变量名`;

每次调用`readdir()`，函数返回`struct dirent`的地址，存放了本次读取到的内容

```c
struct dirent
{
  long d_ino;                 // inode number 索引节点号。
  off_t d_off;                 // offset to this dirent 在目录文件中的偏移。
  unsigned short d_reclen;       // length of this d_name 文件名长度。
  unsigned char d_type;         // the type of d_name 文件类型。
  char d_name [NAME_MAX+1];  // file name文件名，最长255字符。
};
```

重点关注结构体的`d_name`和`d_type`成员。

* `d_name`-文件名或目录名。

* `d_type`-文件的类型，有多种取值，最重要的是8和4，8-常规文件（A regular file）；4-子目录（A directory），其它的暂时不关心。注意，``d_name`的数据类型是字符，不可直接显示。

示例：

```CPP
#include <iostream>
#include <dirent.h>
using namespace std;

int main(int argc,char *argv[])
{
  if (argc != 2) { cout << "Using ./demo 目录名\n"; return -1; }

  DIR *dir;   // 定义目录指针。

  // 打开目录。
  if ( (dir=opendir(argv[1])) == nullptr ) return -1;

  // 用于存放从目录中读取到的内容。
  struct dirent *stdinfo=nullptr;

  while (1)
  {
    // 读取一项内容并显示出来。
    if ((stdinfo=readdir(dir)) == nullptr) break;

    cout << "文件名=" << stdinfo->d_name << "，文件类型=" << (int)stdinfo->d_type << endl;
  }

  closedir(dir);   // 关闭目录指针。
}	
```

注意：readdir **只在当前层级**工作。比如读取某个目录，里面有一个文件夹，用readdir只会读取到该文件夹，不会读取到文件夹里面的内容。

* `access()库函数`：用于判断当前用户对目录或文件的存取权限。包含头文件：#include <unistd.h>

函数声明：`int access(const char *pathname, int mode);`

* pathname 目录或文件名。

* mode 需要判断的存取权限。在头文件<unistd.h>中的预定义如下：

\#define R_OK  4  // 判断是否有读权限。

\#define W_OK 2  // 判断是否有写权限。

\#define X_OK  1  // 判断是否有执行权限。

\#define F_OK  0  // 判断是否存在。

* 返回值：当pathname满足mode权限返回0，不满足返回-1，errno被设置。

在实际开发中，access()函数主要用于判断目录或文件是否存在。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260220175340702.png" alt="image-20260220175340702" style="zoom: 67%;" /><img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260220175616321.png" alt="image-20260220175616321" style="zoom: 67%;" />

> 为什么命令行中demo不需要加引号变成字符串。![image-20260220175728077](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260220175728077.png)

* `stat()库函数`：包含头文件：#include <sys/stat.h>

函数声明：

`int stat(const char *path, struct stat *buf);`

* stat()函数获取path参数指定目录或文件的详细信息，保存到buf结构体中。

* 返回值：0-成功，-1-失败，errno被设置。
* stat结构体

```cpp
//struct stat结构体用于存放目录或文件的详细信息，如下：
struct stat
{
  dev_t st_dev;   	// 文件的设备编号。
  ino_t st_ino;   		// 文件的i-node。
  mode_t st_mode; 	// 文件的类型和存取的权限。
  nlink_t st_nlink;   	// 连到该文件的硬连接数目，刚建立的文件值为1。
  uid_t st_uid;   		// 文件所有者的用户识别码。
  gid_t st_gid;   		// 文件所有者的组识别码。
  dev_t st_rdev;  	// 若此文件为设备文件，则为其设备编号。
  off_t st_size;  		// 文件的大小，以字节计算。
  size_t st_blksize;	// I/O 文件系统的I/O 缓冲区大小。
  size_t st_blocks;  	// 占用文件区块的个数。
  time_t st_atime;  	// 文件最近一次被存取或被执行的时间，
 					// 在用mknod、 utime、read、write 与tructate 时改变。
  time_t st_mtime;  	// 文件最后一次被修改的时间，
					// 在用mknod、 utime 和write 时才会改变。
  time_t st_ctime;  	// 最近一次被更改的时间，在文件所有者、组、 权限被更改时更新。
};
//struct stat结构体的成员变量比较多，重点关注st_mode、st_size和st_mtime成员。注意：st_mtime是一个整数表示的时间，需要程序员自己写代码转换格式。
//st_mode成员的取值很多，用以下两个宏来判断：
S_ISREG(st_mode)  // 是否为普通文件，如果是，返回真。 
S_ISDIR(st_mode)  // 是否为目录，如果是，返回真。
```

示例：

```cpp
#include <stdio.h>
#include <iostream>
#include <cstdio>
#include <sys/stat.h>
#include <unistd.h>
using namespace std;

int main(int argc,char *argv[])
{
  if (argc != 2)  { cout << "Using:./demo 文件或目录名\n"; return -1; }

  struct stat st;  // 存放目录或文件详细信息的结构体。

  // 获取目录或文件的详细信息
  if (stat(argv[1],&st) != 0)
  {
    cout << "stat(" << argv[1] << "):" << strerror(errno) << endl; return -1;
  }

  if (S_ISREG(st.st_mode))
    cout << argv[1] << "是一个文件(" << "mtime=" << st.st_mtime << ",size=" << st.st_size << ")\n";
  if (S_ISDIR(st.st_mode))
	cout << argv[1] << "是一个目录(" << "mtime=" << st.st_mtime << ",size=" << st.st_size << ")\n";
```

* `utime()库函数`：用于修改目录或文件的时间。包含头文件：#include <sys/types.h>   #include <utime.h>

函数声明：

`int utime(const char *filename, const struct utimbuf *times);`

* 结构utimbuf 声明如下：

```cpp
struct utimbuf
{
 time_t actime;
 time_t modtime;
};
```

* utime()函数用来修改参数filename的st_atime和st_mtime。如果参数times为空地址，则设置为当前时间。

返回值：0-成功，-1-失败，errno被设置

这个函数以后还会进行二次封装，因此没有示例。

* `rename()库函数`：用于重命名目录或文件，相当于操作系统的mv命令。包含头文件：#include <stdio.h>

  函数声明：

  `int rename(const char *oldpath, const char *newpath);`

  参数说明：

  * oldpath  原目录或文件名。

  * newpath 目标目录或文件名。

  返回值：0-成功，-1-失败，errno被设置。

* `remove()库函数`：用于删除目录或文件，相当于操作系统的rm命令。包含头文件：#include <stdio.h>

  函数声明：

  `int remove(const char *pathname);`

  参数说明：

  * pathname 待删除的目录或文件名。

  返回值：0-成功，-1-失败，errno被设置。

   



### 系统错误

在C++程序中，如果调用了库函数，可以通过函数的返回值判断调用是否成功。其实，还有一个整型的全局变量errno，存放了函数调用过程中产生的错误代码。

如果调用库函数失败，可以通过errno的值来查找原因，这也是调试程序的一个重要方法。

errno在<errno.h>中声明。

配合 strerror()和perror()两个库函数，可以查看出错的详细信息。

`strerror()库函数`：在<string.h>中声明，用于获取错误代码对应的详细信息。

```c
//函数声明
char *strerror(int errnum);                       	// 非线程安全
int strerror_r(int errnum, char *buf, size_t buflen);	//线程安全	
```

示例：

```cpp
#include <iostream>
#include <cstring>
#include <cerrno>
#include <sys/stat.h>
using namespace std;

int main()
{
  int iret=mkdir("/tmp/aaa",0755);
  cout << "iret=" << iret << endl;
  cout << errno << ":" << strerror(errno) << endl;
}
```

`perror()库函数`：在<stdio.h>中声明，用于在控制台显示最近一次系统错误的详细信息，在实际开发中，服务程序在后台运行，通过控制台显示错误信息意义不大。（对调试程序略有帮助）

`void perror(const char *s);` 这里的参数是自定义的错误信息提示。

注意：

* 并不是全部的库函数在调用失败时都会设置errno的值，以man手册为准（一般来说，不属于系统调用的函数不会设置errno，属于系统调用的函数才会设置errno）。

* errno的值只有在库函数调用发生错误时才会被设置，当库函数调用成功时，errno的值不会被修改，不会主动的置为 0。在实际开发中，判断函数执行是否成功还得靠函数的返回值，只有在返回值是失败的情况下，才需要关注errno的值。

  示例：

  ```cpp
  #include <iostream>
  #include <cstring>    // strerror()函数需要的头文件。
  #include <cerrno>     // errno全局变量的头文件。
  #include <sys/stat.h> // mkdir()函数需要的头文件。
  using namespace std;
  
  int main()
  {
    int iret=mkdir("/tmp/aaa/bb/cc/dd",0755);
    if (iret!=0)
    {
      cout << "iret=" << iret << endl;
      cout << errno << ":" << strerror(errno) << endl;
      perror("调用mkdir(/tmp/aaa/bb/cc/dd)失败");
    }
  
    iret=mkdir("/tmp/dd",0755);
    if (ireet!=0)
    {
      cout << "iret=" << iret << endl;
      cout << errno << ":" << strerror(errno) << endl;
      perror("调用mkdir(/tmp/dd)失败");
    }
  }
  
  //错误代码示例：
  #include <iostream>
  #include <cstring>    // strerror()函数需要的头文件。
  #include <cerrno>     // errno全局变量的头文件。
  #include <sys/stat.h> // mkdir()函数需要的头文件。
  using namespace std;
  
  int main()
  {
    int iret=mkdir("/tmp/aaa/bb/cc/dd",0755);
      cout << "iret=" << iret << endl;
      cout << errno << ":" << strerror(errno) << endl;
      perror("调用mkdir(/tmp/aaa/bb/cc/dd)失败");
  
  
    iret=mkdir("/tmp/dd",0755);
      cout << "iret=" << iret << endl;
      cout << errno << ":" << strerror(errno) << endl;
      perror("调用mkdir(/tmp/dd)失败");
  }
  //当第一次创建文件夹失败，第二次创建文件夹成功，第二次的errno不会被置为0.
  
  ```

  

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

#### 





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

### 012号进程

整个linux系统全部的进程是一个树形结构。

* 0号进程（系统进程）是所有进程的祖先，它创建了1号和2号进程。

* 1号进程（systemd）负责执行内核的初始化工作和进行系统配置。

* 2号进程（kthreadd）负责所有内核线程的调度和管理。

用pstree命令可以查看进程树（yum -y install psmisc）。

pstree -p 进程编号

### 进程终止

有8种方式可以中止进程，其中5种为正常终止，它们是：

1）在main()函数用return返回；

2）在任意函数中调用exit()函数；

3）在任意函数中调用_exit()或_Exit()函数；

4）最后一个线程从其启动例程（线程主函数）用return返回；

5）在最后一个线程中调用pthread_exit()返回；

异常终止有3种方式，它们是：

6）调用abort()函数中止；

7）接收到一个信号；

8）最后一个线程对取消请求做出响应。

进程终止状态：

在main()函数中，return的返回值即终止状态，如果没有return语句或调用exit()，那么该进程的终止状态是0。

在Shell中，查看最近一个进程终止的状态：echo $?

正常终止进程的3个函数（exit()和_Exit()是由ISO C说明的，_exit()是由POSIX说明的）。

`void exit(int status);`

`void _exit(int status);`

`void _Exit(int status);`

status是进程终止的状态。

如果进程被异常终止，终止状态为非0。  终止状态常用于服务程序的调度、日志和监控。

> 资源释放的问题：
>
> retun表示函数返回，会调用局部对象的析构函数，main()函数中的return还会调用全局对象的析构函数。
>
> **exit()**表示终止进程，不会调用局部对象的**析构函数**，只调用全局对象的析构函数。
>
> exit()会执行清理工作（调用全局对象的析构函数），然后退出，_exit()和_Exit()直接退出，不会执行任何清理工作。

进程可以用``atexit()``函数登记终止函数（最多32个），这些函数将由`exit()`自动调用。

`int atexit(void (*function)(void));`

exit()调用终止函数的顺序与登记时相反。 进程退出前的收尾工作

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260220184450107.png" alt="image-20260220184450107" style="zoom: 67%;" />

### fork函数

头文件：`#include <unistd.h>`

函数原型：`pid_t fork(void)` 

* `pid_t`表示进程ID，但是为了表示-1，他是有符号整型。0不是有效进程ID，init最小，为1。
* 失败返回-1；子进程返回0，父进程返回子进程的PID。
* 子进程只执行fork后的语句。
* 注意fork之后父进程先执行还是子进程先执行是不确定的，取决于内核使用的调度算法。
* 子进程获得了父进程数据空间、堆和栈的副本（**注意：子进程拥有的是副本，不是和父进程共享**）。
* 我们在shell中每输入一个命令，shell会调用fork函数，让子进程去执行命令。

![image-20260122103238163](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260122103238163.png)

fork的两种用法：

1）父进程复制自己，然后，父进程和子进程分别执行不同的代码。这种用法在网络服务程序中很常见，父进程等待客户端的连接请求，当请求到达时，父进程调用fork()，让子进程处理些请求，而父进程则继续等待下一个连接请求。

2）进程要执行另一个程序。这种用法在Shell中很常见，子进程从fork()返回后立即调用exec。

示例：

```cpp
#include <iostream>
#include <unistd.h>
using namespace std;

int main()
{
  if (fork()>0)
  { // 父进程将执行这段代码。
    while (true)
    {
      sleep(1);
      cout << "父进程运行中...\n";
    }
  }
  else
  { // 子进程将执行这段代码。
    sleep(10);
    cout << "子进程开始执行任务...\n";
    execl("/bin/ls","/bin/ls","-lt","/tmp",0);
    cout << "子进程执行任务结束，退出。\n";
  }
}
```

fork()的一个特性是在父进程中打开的文件描述符都会被复制到子进程中，父进程和子进程共享同一个文件偏移量。

如果父进程和子进程写同一描述符指向的文件，但又没有任何形式的同步，那么它们的输出可能会相互混合。

`vfork()函数`

vfork()函数的调用和返回值与fork()相同，但两者的语义不同。

vfork()函数用于创建一个新进程，而该新进程的目的是exec一个新程序，它不复制父进程的地址空间，因为子进程会立即调用exec，于是也就不会使用父进程的地址空间。如果子进程使用了父进程的地址空间，可能会带来未知的结果。

vfork()和fork()的另一个区别是：vfork()保证子进程先运行，在子进程调用exec或exit()之后父进程才恢复运行。

### getpid和getppid

每个进程都有一个非负整数表示的唯一的进程ID。虽然是唯一的，但是进程ID可以复用。当一个进程终止后，其进程ID就成了复用的候选者。Linux采用延迟复用算法，让新建进程的ID不同于最近终止的进程所使用的ID。这样防止了新进程被误认为是使用了同一ID的某个已终止的进程。

函数原型：

`pid_t getpid(void)` `pid_t getppid(void)`获取父进程ID

循环创建n个子进程：用break消除子进程产生的子进程。

![image-20260122104659145](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260122104659145.png)

### 进程共享

父子进程相同的地方：（大前提是刚fork完）全局变量、data、text、堆、栈、环境变量、宿主目录位置、进程工作目录位置、信号处理方式。

父子进程不同的地方：进程id、fork返回值、各自的父进程、进程创建时间、闹钟、未决信号集。

父子进程共享：文件描述符 mmap建立的映射区

原则：读时共享、写时复制。

![image-20260220201114291](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260220201114291.png)

父子进程不共享全局变量。父进程改了全局变量，子进程看不到变化。

### 调用可执行程序

Linux提供了``system()``函数和`exec`函数族，在C++程序中，可以在进程中执行其它的程序（二进制文件、操作系统命令或Shell脚本）。

#### exec函数族

fork创建子进程后执行的是和父进程相同的程序，子进程往往会调用一种exec函数用来执行另一个程序。调用exec函数时，该进程的用户空间代码和数据完全被新程序替换，但是进程id不变，不会创建新进程。

```cpp
int execl(const char *path, const char *arg, ...);
int execlp(const char *file, const char *arg, ...);
int execle(const char *path, const char *arg,...,char * const envp[]);
int execv(const char *path, char *const argv[]);
int execvp(const char *file, char *const argv[]);
int execvpe(const char *file, char *const argv[],char *const envp[]);
```

在实际开发中，最常用的是execl()和execv()，其它的极少使用。

示例：

```cpp
#include <iostream>
#include <string.h>
#include <unistd.h>
using namespace std;

int main(int argc,char *argv[])
{
  int ret=execl("/bin/ls","/bin/ls","-lt","/tmp",0);  // 最后一个参数0不能省略。
  cout << "ret=" << ret << endl;
  perror("execl");

  /*
  char *args[10];
  args[0]="/bin/ls";
  args[1]="-lt";
  args[2]="/tmp";
  args[3]=0;     // 这行代码不能省略。

  int ret=execv("/bin/ls",args);
  cout << "ret=" << ret << endl;
  perror("execv");
  */
}
```



##### execlp函数

p代表的是PATH环境变量。

`int execlp(const char *file, const char *arg, ...)`

* 返回-1 说明出错。
* 不出错，则没有返回值。 

##### execl函数

`int execl(cosnt char *path, const char *arg, ...)`

exec函数调用成功不返回，只有失败才返回。所以通常直接在exec函数调用后直接调用perror()和exit()。

只有execve是真正的系统调用。其他函数都是库函数，对execve函数进行了封装。

![image-20260122121504823](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260122121504823.png)

练习：将进程信息打印到文件中。

##### system函数

system()函数提供了一种简单的执行程序的方法，把需要执行的程序和参数用一个字符串传给system()函数就行了。头文件用<stdlib.h>

函数的声明：

`int system(const char * string);`

system()函数的返回值比较麻烦。

1）如果执行的程序不存在，system()函数返回非0；

2）如果执行程序成功，并且被执行的程序终止状态是0（return 0 或者exit(0) ），system()函数返回0；

3）如果执行程序成功，并且被执行的程序终止状态不是0，system()函数返回非0。

> 程序正常运行起来，中途被异常终止了，这叫执行程序失败。

示例：

![image-20260221113027130](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260221113027130.png)

### 孤儿进程和僵尸进程

孤儿进程：父进程比子进程更早终止，系统会自动给孤儿进程一个PPID，子进程的父进程成为init进程。如果父进程比子进程先退出，子进程变成孤儿进程，将被1号进程托管。

僵尸进程：子进程终止，父进程还没有回收子进程残留在内核中的资源（PCB），称为该进程为僵尸进程。

僵尸进程有什么危害？内核为每个子进程保留了一个数据结构，包括进程编号、终止状态、使用CPU时间等。父进程如果处理了子进程退出的信息，内核就会释放这个数据结构，父进程如果没有处理子进程退出的信息，内核就不会释放这个数据结构，子进程的进程编号将一直被占用。系统可用的进程编号是有限的，如果产生了大量的僵尸进程，将因为没有可用的进程编号而导致系统不能产生新的进程。

如何查看僵尸进程：僵尸进程在系统中通常标记为 **Z** (Zombie) 或者显示为[defunct]。

使用top命令，可以看到系统的僵尸进程总数。

对于僵尸进程，kill命令无效。

如何避免僵尸进程：

1）子进程退出的时候，内核会向父进程发头SIGCHLD信号，如果父进程用signal(SIGCHLD,SIG_IGN)通知内核，表示自己对子进程的退出不感兴趣，那么子进程退出后会立即释放数据结构。

2）父进程通过wait()/waitpid()等函数等待子进程结束，在子进程退出之前，父进程将被阻塞

```cpp
pid_t wait(int *status);

pid_t waitpid(pid_t pid, int *status, int options);

pid_t wait3(int *status, int options, struct rusage *rusage);

pid_t wait4(pid_t pid, int *status, int options, struct rusage *rusage);
//返回值是子进程的编号
```

3）如果父进程很忙，可以捕获SIGCHLD信号，在信号处理函数中调用wait()/waitpid()。

#### wait函数

头文件：<sys/wait.h>

函数功能：

* ==阻塞==等待子进程退出
* 回收子进程残留资源
* 获取子进程结束状态

`pid_t wait(int *status)`

成功返回子进程PID，失败返回-1。

把得到的int类型的status传递给宏函数，可以得到子进程退出的信息：

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

`waitpid(-1,$status,0)==wait(&status)`

![image-20260123140601165](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260123140601165.png)

回收多个子进程（使用循环）![image-20260123141537047](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260123141537047.png)

### 多进程和信号

在多进程的服务程序中，如果子进程收到退出信号，子进程自行退出，如果父进程收到退出信号，则应该先向全部的子进程发送退出信号，然后自己再退出。

示例：

```cpp
#include <iostream>
#include <unistd.h>
#include <signal.h>
using  namespace std;

void FathEXIT(int sig);  // 父进程的信号处理函数。
void ChldEXIT(int sig);  // 子进程的信号处理函数。

int main()
{
  // 忽略全部的信号，不希望被打扰。
  for (int ii=1;ii<=64;ii++) signal(ii,SIG_IGN);

  // 设置信号,在shell状态下可用 "kill 进程号" 或 "Ctrl+c" 正常终止些进程
  // 但请不要用 "kill -9 +进程号" 强行终止。原因：kill -9 (SIGKILL) 是无法被捕获或忽略的，它会在操作系统内核层面直接杀死进程，会导致资源无法清理。
  signal(SIGTERM,FathEXIT); signal(SIGINT,FathEXIT);  // SIGTERM代表编号为15的信号，也就是kill进程号这个操作； SIGINT代表编号为2的信号，也就是Ctrl+c这个操作。

  while (true)
  {
    if (fork()>0) // 父进程的流程
    {
      sleep(5); continue;
    }
    else          // 子进程的流程
    {
      // 子进程会继承父进程的信号处理方式，因此子进程需要重新设置信号
      signal(SIGTERM,ChldEXIT);   // 子进程的退出函数与父进程不一样。
      signal(SIGINT ,SIG_IGN);    // 子进程不需要捕获SIGINT信号。当在终端按 Ctrl+c 时，信号会发给当前“前台进程组”的所有进程（父进程和所有子进程）。如果不忽略，用户按一次 Ctrl+c，父进程会想退出，所有子进程也会同时触发退出逻辑。

      while (true)
      {
        cout << "子进程" << getpid() << "正在运行中。\n"; sleep(3); continue;
      }
    }
  }
}

// 父进程的信号处理函数
void FathEXIT(int sig)
{
  // 以下代码是为了防止信号处理函数在执行的过程中再次被信号中断。
  signal(SIGINT,SIG_IGN); signal(SIGTERM,SIG_IGN);

  cout << "父进程退出，sig=" << sig << endl;

  kill(0,SIGTERM);     // 第一个参数是0，代表向调用进程同组的所有进程发送信号。第二个参数代表发送哪种信号。

  // 在这里增加释放资源的代码（全局的资源）。

  exit(0);
}

// 子进程的信号处理函数。
void ChldEXIT(int sig)
{
  // 以下代码是为了防止信号处理函数在执行的过程中再次被信号中断。
  signal(SIGINT,SIG_IGN); signal(SIGTERM,SIG_IGN);

  cout << "子进程" << getpid() << "退出，sig=" << sig << endl;

  // 在这里增加释放资源的代码（只释放子进程的资源）。

  exit(0);
}
```

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260220212546050.png" alt="image-20260220212546050"  />

### 守护进程

Linux的后台服务进程。

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





FIFO（命名管道）通过FIFO，不相关的进程也能进行数据交换。利用内核空间创建缓冲区，通过缓冲区进行通信。

创建方式：

* `mkfifo 管道名`
* `int mkfifo(const char *pathname, mode_t mode);` 成功返回0，失败返回-1。 需要添加头文件：`<sys/stat.h>` 参数pathname是管道名 mode是八进制权限（比如0644）这个权限不是真正的权限，需要和umask掩码与一下。

![image-20260303090934811](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303090934811.png)

FIFO本质就是一个文件，两个进程一个进行写，一个进行读，从而实现通信。

![image-20260303091724816](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303091724816.png)

先看左侧的open函数，第一个参数是文件路径；第二个参数就是打开方式。返回文件描述符。

再看左图的read函数，第一个参数是要读取的文件描述符，第二个参数buf是用来存放读出来数据的容器，第三个参数代表buf的容量，能从文件fd中读取的最大字节数。也就是4096个字节。返回值len是实际读到的字节数。

再看write函数，第一个参数是写到哪个文件，STDOUT_FILENO代表标准输出设备也就是屏幕。第二个参数是把什么写到屏幕上去，第三个参数是读了多少字节，我就写多少字节。所以用的len。

再看右侧的write函数，把buf里面的数据写到fd这 个文件中， strlen() 来计算**这个字符串实际的长度**（遇到 \0 停止计算）。注意sprintf会在字符串后面添加\0。





文件实现进程间通信

![image-20260303095753809](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303095753809.png)

![image-20260303100417227](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303100417227.png)

父子进程共享文件描述符，那么fd1和fd2是同一个文件描述符吗？

fd1和fd2不是同一个文件描述符。父子进程只共享在 `fork()` 之前`open`的文件描述符。上面的程序open函数是在fork之后进行的，操作系统内核会为这两个 `open` 操作分别创建独立的文件表项。

![image-20260303102941802](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303102941802.png)

![image-20260303102929413](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303102929413.png)

思考题程序：

![image-20260303100119627](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303100119627.png)









存储映射I/O

存储映射I/O(Memory-mapped I/O)使一个磁盘文件与内存空间中的一个缓冲区相映射。于是当从缓冲区中取数据，就相当于读文件中的相应字节。于此类似，将数据存入缓冲区，则相应的字节就自动写入文件。这样，就可在不适用read和write函数的情况下，使用地址（指针）完成I/O操作。

使用这种方法，首先应通知内核，将一个指定文件映射到存储区域中。这个映射工作可以通过mmap函数来实现。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303102306850.png" alt="image-20260303102306850" style="zoom:50%;" />



mmap函数原型：头文件`sys/mman.h`

`void* mmap(void* addr, size_t length,int prot, int flags, int fd, off_t offset)`

参数说明：

* addr 指定映射区的首地址，通常是NULL，表示让系统自动分配
* length 指定共享内存映射区的大小，要小于等于文件的实际大小。length不能是0
* prot 共享内存区的读写属性 PROT_READ PROT_WRITE 
* flags 标注共享内存区的共享属性 MAP_SHARED MAP_PRIVATE(不能被同步到磁盘)
* fd 用于创建共享内存区的那个文件的文件描述符
* offset 偏移位置 默认0 表示映射文件全部  需要是4k的整数倍

* 返回值：因为不知道共享内存里面要存放什么数据， 所以用泛型指针。成功返回映射区的首地址；失败返回一个宏MAP_FAILED

munmap函数 释放内存映射区

`int munmap(void* addr, size_t length)` 成功返回0 失败返回 -1

![image-20260303105100306](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303105100306.png)

`lseek(fd, 10, SEEK_END)`：将文件的读写指针向后移动 10 个字节 第二个参数：偏移量，想让读写指针相当于基准点（第三个参数）移动多少个字节

第三个参数：基准点 执行成功后，lseek会**返回当前指针距离文件开头的字节数**。

`write(fd, "\0", 1)`：在空洞的末尾写入一个空字符。此时文件大小变成了 11 字节。

`ftruncate(fd, 11)`：直接将文件大小截断/扩展为 11 个字节。



**mmap注意事项：**

创建映射区，mmap需要read权限 当访问权限指定为共享时，mmap的权限要小于等于创建映射区的那个文件的权限。

文件描述符fd在mmap创建映射区完成后即可关闭。

offset必须是4096的整数倍，（因为MMU映射的最小单位就是4k）

1.创建映射区的过程中，隐含着一次对映射文件的读操作。

2.当MAP_SHARED时，要求：映射区的权限应<=文件打开的权限(出于对映射区的保护)。而MAP_PRIVATE则无所谓，因为mmap中的权限是对内存的限制。

3.映射区的释放与文件关闭无关。只要映射建立成功，文件可以立即关闭。

4.特别注意，当映射文件大小为0时，不能创建映射区。所以：用于映射的文件必须要有实际大小！！mmap使用时常常会出现总线错误，通常是由于共享文件存储空间大小引起的。如，400字节大小的文件，在建立映射区时ofset 4096字节，则会报出总线错。

5.munmap传入的地址一定是mmap的返回地址。坚决杜绝指针++操作。

6.如果文件偏移量必须为4K的整数倍

7.mmap创建映射区出错概率非常高，一定要检查返回值，确保映射区建立成功再进行后续操作。



**mmap父子进程通信**

先mmap再fork。mmap访问权限设置为共享

![image-20260303113729171](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303113729171.png)

![image-20260303113747035](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303113747035.png)



**mmap无血缘关系进程间通信**

实质上mmap是内核借助文件帮我们创建了一个映射区，多个进程之间利用该映射区完成数据传递。由于内核空间多进程共享，因此无血缘关系的进程间也可以使用mmap来完成通信。只要设置相应的标志位参数flags即可。若想实现共享，当然应该使用MAP_SHARED了。

逻辑：两个进程打开同一个文件，创建映射区。flags为MAP_SHARED 一个进程写 一个进程读。

![image-20260303115914670](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303115914670.png)

![image-20260303115902510](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303115902510.png)

读端：

![image-20260303120100495](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303120100495.png)

 

注意：mmap：数据可以反复读取

​	     fifo：数据只能读一次，不能重复读 因为fifo是管道，管道是消息队列机制，数据读走就没了

而mmap是文件缓冲区的机制，数据可以反复读。





**匿名映射区**

没有血缘关系的进程不能用匿名映射区实现通信。

![image-20260303121206986](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303121206986.png)

> 当你 `open` 后立马 `unlink`，`unlink` 的作用是把这个文件名从操作系统的目录树里抹掉（解除硬链接）,这个文件在当前目录里就看不到了（别人无法再打开它），但因为你的进程还拿着 `fd`（拿着钥匙），操作系统会在底层悄悄为你保留这个文件的实体。等你用完，调用 `close` 退出时，操作系统发现这文件既没名字，又没人用了，就会干脆利落地把它从磁盘上连根拔起，做到真正的“阅后即焚”，不留痕迹。

通过标志位参数flags指定匿名映射区，用宏MAP_ANONYMOUS 另外参数fd设置为-1。

![image-20260303121745878](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303121745878.png)

![image-20260303123221954](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303123221954.png)



**共享内存**：

多线程共享进程的地址空间，如果多个线程需要访问同一块内存，用全局变量就可以了。

在多进程中，每个进程的地址空间是独立的，不共享的，如果多个进程需要访问同一块内存，不能用全局变量，只能用共享内存。

共享内存（Shared Memory）允许多个进程（不要求进程之间有血缘关系）访问同一块内存空间，是多个进程之间共享和传递数据最高效的方式。进程可以将共享内存连接到它们自己的地址空间中，如果某个进程修改了共享内存中的数据，其它的进程读到的数据也会改变。

共享内存没有提供锁机制，也就是说，在某一个进程对共享内存进行读/写的时候，不会阻止其它进程对它的读/写。如果要对共享内存的读/写加锁，可以使用信号量。（线程用互斥锁和条件变量实现线程同步 进程用信号量实现进程同步）

* 创建或获取共享内存 `int shmget(key_t key, size_t size, int shmflg);`

`key`-共享内存的键值，是一个整数（typedef unsigned int key_t），一般采用十六进制，例如0x5005，不同共享内存的key不能相同。

`size`-共享内存的大小，以字节为单位。

`shmflg`-共享内存的访问权限，与文件的权限一样，例如0666|IPC_CREAT，`0666`表示全部用户对它可读写，`IPC_CREAT`表示如果共享内存不存在，就创建它。

返回值：成功返回共享内存的`id`（一个非负的整数），失败返回-1（系统内存不足、没有权限）

> 用ipcs -m可以查看系统的共享内存，包括：键值（key），共享内存id（shmid），拥有者（owner），权限（perms），大小（bytes）。
> ![image-20260221085108077](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260221085108077.png)
> 用ipcrm -m 共享内存id 可以手工删除共享内存，如下：
> ![image-20260221085113131](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260221085113131.png)

* 把共享内存链接到当前进程的地址空间 `void *shmat(int shmid, const void *shmaddr, int shmflg);`

`shmid`-由shmget()函数返回的共享内存标识。

`shmaddr`-指定共享内存连接到当前进程中的地址位置，通常填0，表示让系统来选择共享内存的地址。

`shmflg`-标志位，通常填0。

调用成功时返回共享内存起始地址，失败返回`(void*)-1`。

* 将共享内存从当前进程分离 `int shmdt(const void *shmaddr);`

`shmaddr`-shmat()函数返回的地址。

调用成功时返回0，失败时返回-1。

* 操作共享内存 `int shmctl(int shmid, int command, struct shmid_ds *buf);`

`shmid`-shmget()函数返回的共享内存id。

`command`-操作共享内存的指令，如果要删除共享内存，填IPC_RMID。

`buf`-操作共享内存的数据结构的地址，如果要删除共享内存，填0。

调用成功时返回0，失败时返回-1。

示例：

```cpp
#include <iostream>
#include <cstdio>
#include <cstdlib>//atoi函数的头文件
#include <cstring>//strcpy的头文件
#include <unistd.h>
#include <sys/ipc.h>
#include <sys/shm.h>
using  namespace std;

struct stgirl     // 超女结构体。
{
  int  no;        // 编号。
  char name[51];  // 姓名，注意，不能用C++STL中的数据类型比如string。STL容器会动态的在堆区分配内存。 
};

int main(int argc,char *argv[])
{
  if (argc!=3) { cout << "Using:./demo no name\n"; return -1; }

  // 第1步：创建/获取共享内存，键值key为0x5005，也可以用其它的值。
  int shmid=shmget(0x5005, sizeof(stgirl), 0640|IPC_CREAT);
  if ( shmid ==-1 )
  {
    cout << "shmget(0x5005) failed.\n"; return -1;
  }

  cout << "shmid=" << shmid << endl;

  // 第2步：把共享内存连接到当前进程的地址空间。
  stgirl *ptr=(stgirl *)shmat(shmid,0,0);
  if (ptr==(void *)-1 )
  {
    cout << "shmat() failed\n"; return -1;
  }

  // 第3步：使用共享内存，对共享内存进行读/写。
  cout << "原值：no=" << ptr->no << ",name=" << ptr->name << endl;  // 显示共享内存中的原值。
  ptr->no=atoi(argv[1]);        // 对超女结构体的no成员赋值。 atoi把字符串转换成int
  strcpy(ptr->name,argv[2]);    // 对超女结构体的name成员赋值。
  //ptr->name=argv[2];
  cout << "新值：no=" << ptr->no << ",name=" << ptr->name << endl;  // 显示共享内存中的当前值。

  // 第4步：把共享内存从当前进程中分离。
  shmdt(ptr);

  // 第5步：删除共享内存。
  //if (shmctl(shmid,IPC_RMID,0)==-1)
  //{
   // cout << "shmctl failed\n"; return -1;
  //}
}
```



#### 循环队列

元素出队，头指针向后移动；元素入队，尾指针向后移动。尾部入队，头部出队。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260221095903765.png" alt="image-20260221095903765" style="zoom:67%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260221095757178.png" alt="image-20260221095757178" style="zoom:67%;" />

### 多进程的生产消费者模型

```cpp
//生产者程序
#include "_public.h"

int main()
{
  struct stgirl  // 循环队列的数据元素是超女结构体。
  {
    int no;
    char name[51];
  };

  using ElemType=stgirl;

  // 初始化共享内存。
  int shmid=shmget(0x5005, sizeof(squeue<ElemType,5>), 0640|IPC_CREAT);
  if ( shmid ==-1 )
  {
    cout << "shmget(0x5005) failed.\n"; return -1;
  }

  // 把共享内存连接到当前进程的地址空间。
  squeue<ElemType,5> *QQ=(squeue<ElemType,5> *)shmat(shmid,0,0);
  if ( QQ==(void *)-1 )
  {
    cout << "shmat() failed\n"; return -1;
  }

  QQ->init();       // 初始化循环队列。

  ElemType ee;      // 创建一个数据元素。

  csemp mutex; mutex.init(0x5001);     // 用于给共享内存加锁。
  csemp cond;  cond.init(0x5002,0,0);  // 信号量的值用于表示队列中数据元素的个数。

  mutex.wait();  // 加锁。
  // 生产3个数据。
  ee.no=3; strcpy(ee.name,"西施"); QQ->push(ee);
  ee.no=7; strcpy(ee.name,"冰冰"); QQ->push(ee);
  ee.no=8; strcpy(ee.name,"幂幂"); QQ->push(ee);
  mutex.post();  // 解锁。
  cond.post(3);  // 实参是3，表示生产了3个数据。

  shmdt(QQ);  // 把共享内存从当前进程中分离。
}
```

```cpp
// 消费者程序
#include "_public.h"

int main()
{
  struct stgirl  // 循环队列的数据元素是超女结构体。
  {
    int no;
    char name[51];
  };

  using ElemType=stgirl;

  // 初始化共享内存。
  int shmid=shmget(0x5005, sizeof(squeue<ElemType,5>), 0640|IPC_CREAT);
  if ( shmid ==-1 )
  {
    cout << "shmget(0x5005) failed.\n"; return -1;
  }

  // 把共享内存连接到当前进程的地址空间。
  squeue<ElemType,5> *QQ=(squeue<ElemType,5> *)shmat(shmid,0,0);
  if ( QQ==(void *)-1 )
  {
    cout << "shmat() failed\n"; return -1;
  }

  QQ->init();       // 初始化循环队列。

  ElemType ee;      // 创建一个数据元素。

  csemp mutex; mutex.init(0x5001);     // 用于给共享内存加锁。
  csemp cond;  cond.init(0x5002,0,0);  // 信号量的值用于表示队列中数据元素的个数。

  while (true)
  {
    mutex.wait();  // 加锁。

    while (QQ->empty())    // 如果队列空，进入循环，否则直接处理数据。必须用循环，不能用if
    {
      mutex.post();   // 解锁。
      cond.wait();    // 等待生产者的唤醒信号。
      mutex.wait();   // 加锁。
    }

    // 数据元素出队。
    ee = QQ->front();  QQ->pop();
    mutex.post(); // 解锁。

    // 处理出队的数据（把数据消费掉）。
    cout << "no=" << ee.no << ",name=" << ee.name << endl;
    usleep(100);    // 假设处理数据需要时间，方便演示。
  }

  shmdt(QQ);
}
```

```cpp
//_public.cpp
#include "_public.h"

// 如果信号量已存在，获取信号量；如果信号量不存在，则创建它并初始化为value。
// 如果用于互斥锁，value填1，sem_flg填SEM_UNDO。
// 如果用于生产消费者模型，value填0，sem_flg填0。
bool csemp::init(key_t key,unsigned short value,short sem_flg)
{
  if (m_semid!=-1) return false; // 如果已经初始化了，不必再次初始化。

  m_sem_flg=sem_flg;

  // 信号量的初始化不能直接用semget(key,1,0666|IPC_CREAT)
  // 因为信号量创建后，初始值是0，如果用于互斥锁，需要把它的初始值设置为1，
  // 而获取信号量则不需要设置初始值，所以，创建信号量和获取信号量的流程不同。

  // 信号量的初始化分三个步骤：
  // 1）获取信号量，如果成功，函数返回。
  // 2）如果失败，则创建信号量。
  // 3) 设置信号量的初始值。

  // 获取信号量。
  if ( (m_semid=semget(key,1,0666)) == -1)
  {
    // 如果信号量不存在，创建它。
    if (errno==ENOENT)
    {
      // 用IPC_EXCL标志确保只有一个进程创建并初始化信号量，其它进程只能获取。
      if ( (m_semid=semget(key,1,0666|IPC_CREAT|IPC_EXCL)) == -1)
      {
        if (errno==EEXIST) // 如果错误代码是信号量已存在，则再次获取信号量。
        {
          if ( (m_semid=semget(key,1,0666)) == -1)
          { 
            perror("init 1 semget()"); return false; 
          }
          return true;
        }
        else  // 如果是其它错误，返回失败。
        {
          perror("init 2 semget()"); return false;
        }
      }

      // 信号量创建成功后，还需要把它初始化成value。
      union semun sem_union;
      sem_union.val = value;   // 设置信号量的初始值。
      if (semctl(m_semid,0,SETVAL,sem_union) <  0) 
      { 
        perror("init semctl()"); return false; 
      }
    }
    else
    { perror("init 3 semget()"); return false; }
  }

  return true;
}

// 信号量的P操作（把信号量的值减value），如果信号量的值是0，将阻塞等待，直到信号量的值大于0。
bool csemp::wait(short value)
{
  if (m_semid==-1) return false;

  struct sembuf sem_b;
  sem_b.sem_num = 0;      // 信号量编号，0代表第一个信号量。
  sem_b.sem_op = value;   // P操作的value必须小于0。
  sem_b.sem_flg = m_sem_flg;
  if (semop(m_semid,&sem_b,1) == -1) { perror("p semop()"); return false; }

  return true;
}

// 信号量的V操作（把信号量的值减value）。
bool csemp::post(short value)
{
  if (m_semid==-1) return false;

  struct sembuf sem_b;
  sem_b.sem_num = 0;     // 信号量编号，0代表第一个信号量。
  sem_b.sem_op = value;  // V操作的value必须大于0。
  sem_b.sem_flg = m_sem_flg;
  if (semop(m_semid,&sem_b,1) == -1) { perror("V semop()"); return false; }

  return true;
}

// 获取信号量的值，成功返回信号量的值，失败返回-1。
int csemp::getvalue()
{
  return semctl(m_semid,0,GETVAL);
}

// 销毁信号量。
bool csemp::destroy()
{
  if (m_semid==-1) return false;

  if (semctl(m_semid,0,IPC_RMID) == -1) { perror("destroy semctl()"); return false; }

  return true;
}

csemp::~csemp()
{
}
```

```cpp
#ifndef __PUBLIC_HH
#define __PUBLIC_HH 1

#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <unistd.h>
#include <sys/ipc.h> 
#include <sys/shm.h>
#include <sys/types.h>
#include <sys/sem.h>
using namespace std;

// 循环队列。
template <class TT, int MaxLength>
class squeue
{
private:
  bool m_inited;              // 队列被初始化标志，true-已初始化；false-未初始化。
  TT   m_data[MaxLength];     // 用数组存储循环队列中的元素。
  int  m_head;                // 队列的头指针。
  int  m_tail;                // 队列的尾指针，指向队尾元素。
  int  m_length;              // 队列的实际长度。    
  squeue(const squeue &) = delete;             // 禁用拷贝构造函数。
  squeue &operator=(const squeue &) = delete;  // 禁用赋值函数。
public:

  squeue() { init(); }  // 构造函数。

  // 循环队列的初始化操作。
  // 注意：如果用于共享内存的队列，不会调用构造函数，必须调用此函数初始化。
  void init()  
  { 
    if (m_inited!=true)      // 循环队列的初始化只能执行一次。
    { 
      m_head=0;              // 头指针。
      m_tail=MaxLength-1;    // 为了方便写代码，初始化时，尾指针指向队列的最后一个位置。
      m_length=0;            // 队列的实际长度。
      memset(m_data,0,sizeof(m_data));  // 数组元素清零。
      m_inited=true; 
    }
  }

  // 元素入队，返回值：false-失败；true-成功。
  bool push(const TT &ee)
  {
    if (full() == true)
    {
      cout << "循环队列已满，入队失败。\n"; return false;
    }

    // 先移动队尾指针，然后再拷贝数据。
    m_tail=(m_tail+1)%MaxLength;  // 队尾指针后移。
    m_data[m_tail]=ee;
    m_length++;    

    return true;
  }

  // 求循环队列的长度，返回值：>=0-队列中元素的个数。
  int  size()                   
  {
    return m_length;    
  }

  // 判断循环队列是否为空，返回值：true-空，false-非空。
  bool empty()                    
  {
    if (m_length == 0) return true;    

    return false;
  }

  // 判断循环队列是否已满，返回值：true-已满，false-未满。
  bool full()
  {
    if (m_length == MaxLength) return true;    

    return false;
  }

  // 查看队头元素的值，元素不出队。
  TT& front()
  {
    return m_data[m_head];
  }

  // 元素出队，返回值：false-失败；true-成功。
  bool pop()
  {
    if (empty() == true) return false;

    m_head=(m_head+1)%MaxLength;  // 队列头指针后移。
    m_length--;    

    return true;
  }

  // 显示循环队列中全部的元素。
  // 这是一个临时的用于调试的函数，队列中元素的数据类型支持cout输出才可用。
  void printqueue()                    
  {
    for (int ii = 0; ii < size(); ii++)
    {
      cout << "m_data[" << (m_head+ii)%MaxLength << "],value=" \
           << m_data[(m_head+ii)%MaxLength] << endl;
    }
  }
};

// 信号量。
class csemp
{
private:
  union semun  // 用于信号量操作的共同体。
  {
    int val;
    struct semid_ds *buf;
    unsigned short  *arry;
  };

  int   m_semid;         // 信号量id（描述符）。

  // 如果把sem_flg设置为SEM_UNDO，操作系统将跟踪进程对信号量的修改情况，
  // 在全部修改过信号量的进程（正常或异常）终止后，操作系统将把信号量恢复为初始值。
  // 如果信号量用于互斥锁，设置为SEM_UNDO。
  // 如果信号量用于生产消费者模型，设置为0。
  short m_sem_flg;

  csemp(const csemp &) = delete;             // 禁用拷贝构造函数。
  csemp &operator=(const csemp &) = delete;  // 禁用赋值函数。
public:
  csemp():m_semid(-1){}
  // 如果信号量已存在，获取信号量；如果信号量不存在，则创建它并初始化为value。
  // 如果用于互斥锁，value填1，sem_flg填SEM_UNDO。
  // 如果用于生产消费者模型，value填0，sem_flg填0。
  bool init(key_t key,unsigned short value=1,short sem_flg=SEM_UNDO);
  bool wait(short value=-1);// 信号量的P操作，如果信号量的值是0，将阻塞等待，直到信号量的值大于0。
  bool post(short value=1); // 信号量的V操作。
  int  getvalue();           // 获取信号量的值，成功返回信号量的值，失败返回-1。
  bool destroy();            // 销毁信号量。
 ~csemp();
};

#endif
```



## 信号

### 基本概念

信号（signal）是软件中断，是进程之间相互传递消息的一种方法，用于通知进程发生了事件，但是，不能给进程传递任何数据。

给B发送信号，B收到信号之前执行自己的代码，收到信号后，不管执行到程序的什么位置，都要暂停运行，去处理信号，处理完毕再继续执行。与硬件中断类似——异步模式。但信号是软件层面上实现的中断.所有信号的产生和处理都是由【内核】完成的。

产生信号的几种方式：

1.按键产生，如：Ctrl+c、Ctrl+z、Ctrl+\

2.系统调用产生，如：kill、raise、abort

3.软件条件产生，如：定时器alarm

4.硬件异常产生，如：非法访问内存(段错误)、除0(浮点数例外)、内存对齐出错(总线错误)

5.命令产生，如：kill命令

> 两个概念：递达：递送并且到达进程
>
> 未决：还没有到达进程 主要是由于阻塞导致该状态

Linux内核的进程控制块PCB是一个结构体，task_struct,除了包含进程id，状态，工作目录，用户id，组id，文件描述符表，还包含了信号相关的信息，主要指阻塞信号集和未决信号集。

阻塞信号集(信号屏蔽字)： 本质就是位图，用来记录信号的屏蔽状态。将某些信号加入集合，对他们设置屏蔽，当屏蔽x信号后，收到该信号时该信号的处理将推后。

未决信号集:1.信号产生，未决信号集中描述该信号的位立刻翻转为1，表信号处于未决状态。当信号被处理对应位翻转回为0。这一时刻往往非常短暂。2.信号产生后由于某些原因(主要是阻塞)不能抵达进程。这类信号的集合称之为未决信号集。在屏蔽解除前，信号一直处于未决状态。

信号是由内核产生的，然后发送给进程，到达进程后就被内核处理掉。从产生到到达进程这个阶段叫做未决。从cpu级别来看信号都会经历未决状态，信号被阻塞了就会一直处在未决状态。

### 发送信号

可以采用`kill`或`killall`命令向进程发送信号。

两者的区别：``kill -信号的类型 进程编号``  `killall -信号的类型 进程名`。

在程序中也可以采用`kill()`函数向其他进程发送信号。

函数声明：

`int kill(pid_t pid, int sig);`

`kill()`函数将参数sig指定的信号给参数pid指定的进程。

* 参数`pid`有几种情况：

1）pid>0 将信号传给进程号为pid 的进程。

2）pid=0 将信号传给和当前进程相同进程组的所有进程，常用于父进程给子进程发送信号，注意，发送信号者进程也会收到自己发出的信号。

进程组：每个进程都属于一个进程组，进程组是一个或多个进程集合，他们相互关联，共同完成一个实体任务，每个进程组都有一个进程组长，默认进程组ID与进程组长ID相同。父进程和子进程在同一个进程组。

3）pid=-1 将信号广播传送给系统内所有的进程，例如系统关机时，会向所有的登录窗口广播关机信息。

* `sig`：准备发送的信号代码，假如其值为0则没有任何信号送出，但是系统会执行错误检查，通常会利用`sig`值为零来检验某个进程是否仍在运行。

返回值说明： 成功执行时，返回0；失败返回-1，errno被设置。

**alarm函数**

设置定时器(闹钟)。在指定seconds后，内核会给当前进程发送14号SIGALRM信号。进程收到该信号，默认动作终止。采用自然计时法。

**每个进程有且只有唯一一个定时器**。

`unsigned int alarm(unsigned int seconds);` 返回0或剩余的秒数，无失败。

常用：alarm(0)取消定时器，返回旧闹钟余下秒数。

例：alarm(5)→3sec→alarm(4)→5sec→alarm(5)→alarm(0)

> 解释下上面的流程：先定时器5秒 过了三秒之后又重新设置定时器4s，第一次的alarm返回2秒，过了五秒，重新设置定时器5s，第二次的alarm返回0秒。立马取消定时器，第三次的alarm返回5s。

练习：编写程序，测试你使用的计算机1秒钟能数多少个数。

使用time命令可以查看程序执行的时间。程序运行的瓶颈在于IO，优化程序，首选优化IO。

实际执行时间 = 用户时间 + 等待时间（比如等设备 等内存） + 系统时间

![image-20260303173606844](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303173606844.png)

**setitimer函数** 

设置定时器(闹钟)。可代替alarm函数。精度微秒us，可以实现周期定时。

`int setitimer(int which, const struct itimerval *new_value, struct itimerval *old_value);`

成功：0；失败：-1，

设置errno参数：

which：指定定时方式

①自然定时：ITIMER_REAL→14）SIGLARM计算自然时间

②虚拟空间计时(用户空间)：ITIMER_VIRTUAL→26）SIGVTALRM 只计算进程占用cpu的时间

③运行时计时(用户+内核)：ITIMER_PROF→27）SIGPROF 计算占用cpu及执行系统调用的时间

`new_value` 定时秒数 

![image-20260303174439832](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303174439832.png)

`old_value` 传出参数 上次定时剩余时间

练习:使用setitimer函数实现alarm函数，重复计算机1秒数数程序。

拓展练习，结合man page编写程序，测试it_interval、it_value这两个参数的作用。

提示：**it_interval：用来设定两次定时任务之间间隔的时间。it_value：定时的时长** 两个参数都设置为0，即清0操作。

![image-20260303180809649](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303180809649.png)

![image-20260303182408496](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303182408496.png)





### 信号类型

**信号四要素：编号、名称、信号对应的事件、默认处理动作**

| 信号名      | 信号值 | 默认处理动作 | 发出信号的原因                                         |
| ----------- | ------ | ------------ | ------------------------------------------------------ |
| SIGHUP      | 1      | A            | 终端挂起或者控制进程终止                               |
| **SIGINT**  | **2**  | **A**        | **键盘中断Ctrl+c**                                     |
| SIGQUIT     | 3      | C            | 键盘的退出键被按下                                     |
| SIGILL      | 4      | C            | 非法指令                                               |
| SIGABRT     | 6      | C            | 由abort(3)发出的退出指令                               |
| SIGFPE      | 8      | C            | 浮点异常                                               |
| **SIGKILL** | **9**  | **AEF**      | **采用kill  -9 进程编号 强制杀死程序。**               |
| **SIGSEGV** | **11** | **CEF**      | **无效的内存引用（数组越界、操作空指针和野指针等）。** |
| SIGPIPE     | 13     | A            | 管道破裂，写一个没有读端口的管道。                     |
| **SIGALRM** | **14** | **A**        | **由闹钟alarm()函数发出的信号。**                      |
| **SIGTERM** | **15** | **A**        | **采用“kill  进程编号”或“killall 程序名”通知程序。**   |
| SIGUSR1     | 10     | A            | 用户自定义信号1                                        |
| SIGUSR2     | 12     | A            | 用户自定义信号2                                        |
| **SIGCHLD** | **17** | **B**        | 子进程状态发生变化，父进程会收到这个信号               |
| SIGCONT     | 18     |              | 进程继续（曾被停止的进程）                             |
| SIGSTOP     | 19     | DEF          | 终止进程                                               |
| SIGTSTP     | 20     | D            | 控制终端（tty）上按下停止键                            |
| SIGTTIN     | 21     | D            | 后台进程企图从控制终端读                               |
| SIGTTOU     | 22     | D            | 后台进程企图从控制终端写                               |
| 其它        | <=64   | A            | 自定义信号                                             |

处理动作一项中的字母含义如下：

A 缺省的动作是终止进程。

*B* 缺省的动作是忽略此信号，将该信号丢弃，不做处理。

*C* 缺省的动作是终止进程并进行内核映像转储（core dump）

D 缺省的动作是停止进程，进入停止状态的程序还能重新继续，一般是在调试的过程中。

E 信号不能被捕获。

F 信号不能被忽略。

### 信号处理

进程对信号的处理方法有三种：

1）对该信号的处理采用系统的默认操作，大部分的信号的默认操作是终止进程。

2）设置信号的处理函数（捕捉函数），收到信号后，由该函数来处理。

3）忽略某个信号，对该信号不做任何处理，就像未发生过一样。

`signal()`函数可以设置程序对信号的处理方式。（signal用来注册信号捕捉函数）

函数声明：

`typedef void(*sighandler_t)(int)` 定义了一个类型叫sighandler_t  是一个函数指针，指向返回值为void 参数为int的函数。

`sighandler_t signal(int signum, sighandler_t handler);`

* 参数`signum`表示信号的编号（信号的值）。

* 参数`handler`表示信号的处理方式，有三种情况：

1）SIG_DFL：恢复参数signum信号的处理方法为默认行为。 

2）一个自定义的处理信号的函数（**捕获信号**），函数的形参是信号的编号。

3）SIG_IGN：忽略参数signum所指的信号。

示例：

服务程序运行在后台，如果想让中止它，杀掉不是个好办法，因为进程被杀的时候，是突然死亡，没有安排善后工作。

如果向服务程序发送一个信号，服务程序收到信号后，调用一个函数，在函数中编写善后的代码，程序就可以有计划的退出。

```cpp
#include <iostream>
#include <unistd.h>
#include <signal.h>
using namespace std;

void EXIT(int sig)//注册回调函数exit，程序收到信号后，回调exit函数，回调exit函数时会把信号的编号传给exit函数。
{
  cout << "收到了信号：" << sig << endl;
  cout << "正在释放资源，程序将退出......\n";

  // 以下是释放资源的代码。

  cout << "程序退出。\n";
  exit(0);  // 进程退出。
}

int main(int argc,char *argv[])
{
  // 忽略全部的信号，防止程序被信号异常中止。
  for (int ii=1;ii<=64;ii++) signal(ii,SIG_IGN);

  // 如果收到2和15的信号（Ctrl+c和kill、killall），本程序将主动退出。
  signal(2,EXIT);  signal(15,EXIT);

  while (true)
  {
    cout << "执行了一次任务。\n";
    sleep(1);
  }
}
```

![image-20260220185751632](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260220185751632.png)

也就是说不需要把signal函数放在while循环里面。

如果向服务程序发送0的信号，可以检测程序是否存活。

sigaction函数（也可以用来注册信号捕捉函数）

`int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);`

成功：0；失败：-1，设置errno

参数：

* act 新的处理方式
* oldact 旧的处理方式

```cpp
// struct sigaction结构体

struct sigaction {
void (*sa_handler)(int); //函数指针 指向信号处理函数
void (*sa_sigaction)(int, siginfo_t *, void *);//很少用
sigset_t sa_mask; //屏蔽信号集 只在信号处理函数被调用期间生效
int sa_flags;// 通常设置为0 代表本信号使用默认属性 默认属性一般都是默认屏蔽。
void (*sa_restorer)(void);//弃用
};
```

![image-20260304091603875](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260304091603875.png)

**信号捕捉特性**：

* 捕捉函数执行期间，信号屏蔽字由sa_mask说了算，而不是mask。函数执行完毕，恢复为mask。（捕捉函数指的是sig_catch函数） 上面的程序中sa_mask都设置为了0，flag设置为0，代表本信号被阻塞，因此其实sa_mask中的SIGINT被设置成了1。
* XXX信号捕捉函数执行期间，XXX信号自动被屏蔽。（flag需要设置为0）
* 阻塞的常规信号不支持排队，产生多次只记录一次。（后32个实时信号支持排队）

**内核实现信号捕捉过程：**

  当信号捕捉函数执行完成后，还需要返回给调用者。调用者就是kernal内核，因此还需要进入内核态，通过系统调用`sys_sigreturn`进入内核。

![image-20260304094709077](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260304094709077.png)

第二步：内核会去检查当前进程的 PCB中的**未决信号集（pending）和阻塞信号集（block）**。如果发现有**未被阻塞**的信号正等着处理，就会进入下一步。

### 信号集操作函数

![image-20260303183057319](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303183057319.png)



`sigset_t set`; 自定义信号集 实际是个位图，每一位默认为0 

sigset_t类型的本质是位图。但不应该直接使用位操作，而应该使用下面的函数操作sigset_t，保证跨系统操作有效。

头文件`<signal.h>`

`sigemptyset(sigset_t *set)` 清空信号集 全部置0

`sigefillset(sigset_t *set)` 全部置1

`sigaddset(sigset_t *set, int signum)` 将一个信号添加到集合中 signum对应的那一位设置为1

`sigdelset(sigset_t *set, int signum)` 将一个信号从集合中移除

`sigismember(const sigset_t *set, int signum) ` 判断一个信号是否在集合，在返回1，不在返回0

设置信号屏蔽字（阻塞信号集）和解除屏蔽

`int sigprocmask(int how, const sigset_t *set, sigset_t *oldset);`

成功：0；失败：-1，设置errno

set：传入参数，是一个位图，set中哪位置1，就表示当前进程屏蔽哪个信号，即自定义信号集set。

oldset：传出参数，保存旧的信号屏蔽集mask。

how参数取值：假设当前的信号屏蔽字为mask

1.SIG_BLOCK:当how设置为此值，set表示需要屏蔽的信号。相当于mask = mask|set

2.SIG_UNBLOCK:当how设置为此，set表示需要解除屏蔽的信号。相当于mask = mask & ~set

3.SIG_SETMASK:当how设置为此，set表示用于替代原始屏蔽及的新屏蔽集。相当于mask = set若，调用sigprocmask解除了对当前若干个信号的阻塞，则在sigprocmask返回前，至少将其中一个信号递达。

读取当前进程的未决信号集的函数：

`int sigpending(sigset_t *set);` set传出参数,代表未决信号集。返回值：成功：0；失败：-1，设置errno

**代码示例：**

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303220118120.png" alt="image-20260303220118120" style="zoom:50%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260303220131705.png" style="zoom:50%;" />

### SIGCHLD信号

（signal child）

以下情况，子进程会向父进程发送信号：

* 子进程终止时

* 子进程接收到SIGSTOP信号停止时

* 子进程处在停止态，接受到SIGCONT后唤醒时

==父进程利用信号回收多个子进程程序：==

![image-20260304101849335](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260304101849335.png)

![image-20260304101939550](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260304101939550.png)

现象：会出现僵尸态（僵尸态就是子进程已经死亡，但是父进程还没有回收）

原因：信号捕捉函数执行期间，可能会有多个子进程同时死亡，同时向父进程发送信号，但是会被阻塞。当捕捉函数执行完成后，由于不排队，虽然发送了多个信号，但是父进程只会处理其中一个信号，因此其他的子进程就变成了僵尸态。

解决方法：信号捕捉函数内部设置循环，用一次捕捉回收多个子进程。

![image-20260304102506659](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260304102506659.png)

bug：可能会出现父进程还没有注册好信号回调函数，子进程就已经死亡了。（如果子进程执行得极快，在父进程还没来得及调用 `sigaction` 注册好回调函数时就已经 `exit` 了，那么内核发给父进程的 `SIGCHLD` 信号就会按默认动作处理（即忽略），导致子进程变成僵尸进程。）

解决方法：把子进程死亡时发过来的信号设置为阻塞，捕捉函数注册完，再改成非阻塞。

```cpp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/wait.h>

void catch_child(int signo) //信号捕捉函数
{
    pid_t wpid;
//此处有bug 使用 wait(NULL) 会导致如果还有一个子进程没死，父进程就会永远卡死在这个信号处理函数里出不去！
    //while((wpid = wait(NULL)) != -1) { 
    while((wpid = waitpid(-1, NULL, WNOHANG)) > 0) { //WNOHANG (非阻塞) WNOHANG 的意思是“非阻塞”——如果有死掉的子进程就回收；如果没有死掉的，就立刻返回 0
        printf("----------------catch child id %d\n", wpid);
    }

    return ;
}

int main(int argc, char *argv[])
{
    pid_t pid;
    int i;
   // 1. 设置阻塞集，在 fork 之前阻塞 SIGCHLD
    sigset_t set;
    sigemptyset(&set);
    sigaddset(&set, SIGCHLD);
    
    // 把 SIGCHLD 加入当前进程的信号屏蔽字中
    sigprocmask(SIG_BLOCK, &set, NULL);
    
    for (i = 0; i < 5; i++) //循环创建多个子进程
        if ((pid = fork()) == 0)
            break;

    if (5 == i) { //父进程代码
        struct sigaction act;

        act.sa_handler = catch_child;
        sigemptyset(&act.sa_mask);
        act.sa_flags = 0;

        sigaction(SIGCHLD, &act, NULL); //注册信号捕捉函数
		//解除阻塞
        sigprocmask(SIG_UNBLOCK, &set, NULL);
        printf("I'm parent, pid = %d\n", getpid());

        while (1); //回收完子进程，继续执行剩余工作
        
    } else { //子进程代码
        printf("I'm child pid = %d\n", getpid());
    }
    
    return 0;
}
```

可能还有bug：

比如在注册捕捉函数前，有多个子进程死亡，会给父进程发送多个信号，这些信号都被阻塞了，由于信号不支持排队，那么解除阻塞后到达父进程的只有一个信号。

实际上这个隐藏的bug已经被捕捉函数中的waitpid循环化解了。

总结一下：父进程利用信号回收多个子进程：

![image-20260304111756069](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260304111756069.png)





**SIGCHLD信号注意问题**

1. 子进程继承父进程的信号屏蔽字和信号处理动作，但子进程没有继承未决信号集spending。
2. 注意注册信号捕捉函数的位置。
3. 应该在fork之前，阻塞SIGCHLD信号。注册完捕捉函数后解除阻塞。



> 拓展：慢速系统调用
>
> 系统调用可分为两类：慢速系统调用和其他系统调用。
>
> 慢速系统调用：可能会使进程永远阻塞的一类。如果在阻塞期间收到一个信号，该系统调用就被中断,不再继续执行(早期)；也可以设定系统调用是否重启。如，read、write、pause、wait...
>
> 其他系统调用：getpid、getppid、fork...
>
> 慢速系统调用被信号中断后比如read函数正在阻塞等待数据，突然来了一个ctrl+c信号，read函数被终止，处理完该信号，read函数应该被恢复，这才是合理的。
>
> 我们可以修改sa_flags参数来设置被信号中断后系统调用是否重启。SA_INTERRURT不重启。SA_RESTART重启。































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

本身不是锁，通常结合互斥锁进行使用。

条件变量是一种线程同步机制。当条件不满足时，相关线程被一直阻塞，直到某种条件出现，这些线程才会被唤醒。

### 信号量

相当于初始化值为N的互斥量。

* 信号量本质上是一个非负数的计数器，用于给共享资源建立一个标志，表示该共享资源被占用的情况。

* 信号量的两种操作：
  <img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260221100222629.png" alt="image-20260221100222629" style="zoom:67%;" />

* 信号量的应用场景：
  <img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260221100314735.png" alt="image-20260221100314735" style="zoom:67%;" />

`ipcs -s`：查看信号量

`ipcrm sem semid`：删除信号量

示例：

```cpp
// demo3.cpp，本程序演示用信号量给共享内存加锁。
#include "_public.h"

struct stgirl     // 超女结构体。
{
  int  no;        // 编号。
  char name[51];  // 姓名，注意，不能用string。
};

int main(int argc,char *argv[])
{
  if (argc!=3) { cout << "Using:./demo no name\n"; return -1; }

  // 第1步：创建/获取共享内存，键值key为0x5005，也可以用其它的值。
  int shmid=shmget(0x5005, sizeof(stgirl), 0640|IPC_CREAT);
  if ( shmid ==-1 )
  { 
    cout << "shmget(0x5005) failed.\n"; return -1; 
  }

  cout << "shmid=" << shmid << endl;

  // 第2步：把共享内存连接到当前进程的地址空间。
  stgirl *ptr=(stgirl *)shmat(shmid,0,0);
  if ( ptr==(void *)-1 )
  { 
    cout << "shmat() failed\n"; return -1; 
  }

  // 创建、初始化二元信号量。
  csemp mutex;
  if (mutex.init(0x5005)==false)
  {
    cout << "mutex.init(0x5005) failed.\n"; return -1;
  }

  cout << "申请加锁...\n";
  mutex.wait(); // 申请加锁。
  cout << "申请加锁成功。\n";

  // 第3步：使用共享内存，对共享内存进行读/写。
  cout << "原值：no=" << ptr->no << ",name=" << ptr->name << endl;  // 显示共享内存中的原值。
  ptr->no=atoi(argv[1]);        // 对超女结构体的no成员赋值。
  strcpy(ptr->name,argv[2]);    // 对超女结构体的name成员赋值。
  cout << "新值：no=" << ptr->no << ",name=" << ptr->name << endl;  // 显示共享内存中的当前值。
  sleep(10);

  mutex.post(); // 解锁。
  cout << "解锁。\n";

  // 查看信号量  ：ipcs -s    // 删除信号量  ：ipcrm sem 信号量id
  // 查看共享内存：ipcs -m    // 删除共享内存：ipcrm -m  共享内存id

  // 第4步：把共享内存从当前进程中分离。
  shmdt(ptr);

  // 第5步：删除共享内存。
  //if (shmctl(shmid,IPC_RMID,0)==-1)
  //{ 
   // cout << "shmctl failed\n"; return -1; 
  //}
}
```

```cpp
//_public.h头文件
#ifndef __PUBLIC_HH
#define __PUBLIC_HH 1

#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <unistd.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/types.h>
#include <sys/sem.h>
using namespace std;

// 循环队列。
template <class TT, int MaxLength>
class squeue
{
private:
  bool m_inited;              // 队列被初始化标志，true-已初始化；false-未初始化。
  TT   m_data[MaxLength];     // 用数组存储循环队列中的元素。
  int  m_head;                // 队列的头指针。
  int  m_tail;                // 队列的尾指针，指向队尾元素。
  int  m_length;              // 队列的实际长度。    
  squeue(const squeue &) = delete;             // 禁用拷贝构造函数。
  squeue &operator=(const squeue &) = delete;  // 禁用赋值函数。
public:

  squeue() { init(); }  // 构造函数。

  // 循环队列的初始化操作。
  // 注意：如果用于共享内存的队列，不会调用构造函数，必须调用此函数初始化。
  void init()  
  { 
    if (m_inited!=true)      // 循环队列的初始化只能执行一次。
    { 
      m_head=0;              // 头指针。
      m_tail=MaxLength-1;    // 为了方便写代码，初始化时，尾指针指向队列的最后一个位置。
      m_length=0;            // 队列的实际长度。
      memset(m_data,0,sizeof(m_data));  // 数组元素清零。
      m_inited=true; 
    }
  }

  // 元素入队，返回值：false-失败；true-成功。
  bool push(const TT &ee)
  {
    if (full() == true)
    {
      cout << "循环队列已满，入队失败。\n"; return false;
    }

    // 先移动队尾指针，然后再拷贝数据。
    m_tail=(m_tail+1)%MaxLength;  // 队尾指针后移。
    m_data[m_tail]=ee;
    m_length++;    

    return true;
  }

  // 求循环队列的长度，返回值：>=0-队列中元素的个数。
  int  size()                   
  {
    return m_length;    
  }

  // 判断循环队列是否为空，返回值：true-空，false-非空。
  bool empty()                    
  {
    if (m_length == 0) return true;    

    return false;
  }

  // 判断循环队列是否已满，返回值：true-已满，false-未满。
  bool full()
  {
    if (m_length == MaxLength) return true;    

    return false;
  }

  // 查看队头元素的值，元素不出队。
  TT& front()
  {
    return m_data[m_head];
  }

  // 元素出队，返回值：false-失败；true-成功。
  bool pop()
  {
    if (empty() == true) return false;

    m_head=(m_head+1)%MaxLength;  // 队列头指针后移。
    m_length--;    

    return true;
  }

  // 显示循环队列中全部的元素。
  // 这是一个临时的用于调试的函数，队列中元素的数据类型支持cout输出才可用。
  void printqueue()                    
  {
    for (int ii = 0; ii < size(); ii++)
    {
      cout << "m_data[" << (m_head+ii)%MaxLength << "],value=" \
           << m_data[(m_head+ii)%MaxLength] << endl;
    }
  }
};

// 信号量。
class csemp
{
private:
  union semun  // 用于信号量操作的共同体。
  {
    int val;
    struct semid_ds *buf;
    unsigned short  *arry;
  };

  int   m_semid;         // 信号量id（描述符）。

  // 如果把sem_flg设置为SEM_UNDO，操作系统将跟踪进程对信号量的修改情况，
  // 在全部修改过信号量的进程（正常或异常）终止后，操作系统将把信号量恢复为初始值。
  // 如果信号量用于互斥锁，设置为SEM_UNDO。
  // 如果信号量用于生产消费者模型，设置为0。
  short m_sem_flg;//用于互斥锁，该参数设置为SEM_UNDO，因为信号量的初始值为1，表示解锁。如果全部进程都终止了，这把锁应该是解锁状态， 让操作系统跟踪信号量，如果全部进程都终止了，把信号量设置为1。可以防止进程还没来得及解锁就异常终止了。

  csemp(const csemp &) = delete;             // 禁用拷贝构造函数。
  csemp &operator=(const csemp &) = delete;  // 禁用赋值函数。
public:
  csemp():m_semid(-1){}
  // 如果信号量已存在，获取信号量；如果信号量不存在，则创建它并初始化为value。
  // 如果用于互斥锁，value填1，sem_flg填SEM_UNDO。
  // 如果用于生产消费者模型，value填0，sem_flg填0。
  bool init(key_t key,unsigned short value=1,short sem_flg=SEM_UNDO);
  bool wait(short value=-1);// 信号量的P操作，如果信号量的值是0，将阻塞等待，直到信号量的值大于0。
  bool post(short value=1); // 信号量的V操作。
  int  getvalue();           // 获取信号量的值，成功返回信号量的值，失败返回-1。
  bool destroy();            // 销毁信号量。
 ~csemp();
};

#endif
```

```cpp
#include "_public.h"

// 如果信号量已存在，获取信号量；如果信号量不存在，则创建它并初始化为value。
// 如果用于互斥锁，value填1，sem_flg填SEM_UNDO。
// 如果用于生产消费者模型，value填0，sem_flg填0。
bool csemp::init(key_t key,unsigned short value,short sem_flg)
{
  if (m_semid!=-1) return false; // 如果已经初始化了，不必再次初始化。

  m_sem_flg=sem_flg;

  // 信号量的初始化不能直接用semget(key,1,0666|IPC_CREAT)
  // 因为信号量创建后，初始值是0，如果用于互斥锁，需要把它的初始值设置为1，
  // 而获取信号量则不需要设置初始值，所以，创建信号量和获取信号量的流程不同。

  // 信号量的初始化分三个步骤：
  // 1）获取信号量，如果成功，函数返回。
  // 2）如果失败，则创建信号量。
  // 3) 设置信号量的初始值。

  // 获取信号量。
  if ( (m_semid=semget(key,1,0666)) == -1)
  {
    // 如果信号量不存在，创建它。
    if (errno==ENOENT)
    {
      // 用IPC_EXCL标志确保只有一个进程创建并初始化信号量，其它进程只能获取。
      if ( (m_semid=semget(key,1,0666|IPC_CREAT|IPC_EXCL)) == -1)
      {
        if (errno==EEXIST) // 如果错误代码是信号量已存在，则再次获取信号量。
        {
          if ( (m_semid=semget(key,1,0666)) == -1)
          { 
            perror("init 1 semget()"); return false; 
          }
          return true;
        }
        else  // 如果是其它错误，返回失败。
        {
          perror("init 2 semget()"); return false;
        }
      }

      // 信号量创建成功后，还需要把它初始化成value。
      union semun sem_union;
      sem_union.val = value;   // 设置信号量的初始值。
      if (semctl(m_semid,0,SETVAL,sem_union) <  0) 
      { 
        perror("init semctl()"); return false; 
      }
    }
    else
    { perror("init 3 semget()"); return false; }
  }

  return true;
}

// 信号量的P操作（把信号量的值减value），如果信号量的值是0，将阻塞等待，直到信号量的值大于0。
bool csemp::wait(short value)
{
  if (m_semid==-1) return false;

  struct sembuf sem_b;
  sem_b.sem_num = 0;      // 信号量编号，0代表第一个信号量。
  sem_b.sem_op = value;   // P操作的value必须小于0。
  sem_b.sem_flg = m_sem_flg;
  if (semop(m_semid,&sem_b,1) == -1) { perror("p semop()"); return false; }

  return true;
}

// 信号量的V操作（把信号量的值减value）。
bool csemp::post(short value)
{
  if (m_semid==-1) return false;

  struct sembuf sem_b;
  sem_b.sem_num = 0;     // 信号量编号，0代表第一个信号量。
  sem_b.sem_op = value;  // V操作的value必须大于0。
  sem_b.sem_flg = m_sem_flg;
  if (semop(m_semid,&sem_b,1) == -1) { perror("V semop()"); return false; }

  return true;
}

// 获取信号量的值，成功返回信号量的值，失败返回-1。
int csemp::getvalue()
{
  return semctl(m_semid,0,GETVAL);
}

// 销毁信号量。
bool csemp::destroy()
{
  if (m_semid==-1) return false;

  if (semctl(m_semid,0,IPC_RMID) == -1) { perror("destroy semctl()"); return false; }

  return true;
}

csemp::~csemp()
{
}
```



