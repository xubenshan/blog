Linux网络编程

> 参考资料： 
>
> [B站【TCP/IP 网络编程从零开始】 ](https://www.bilibili.com/video/BV1pu411G7P6/?p=4&share_source=copy_web&vd_source=27f42b63247f23de392dffcd83fd59f)
>
> [C++网络编程，从Socket基础到Epoll](https://www.bilibili.com/video/BV1Ce411b7so?spm_id_from=333.788.videopod.episodes&vd_source=5940e85c0b18a907a0fdea51914b4f65&p=19)
>
> [套接字](https://subingwen.cn/linux/socket/)
>
> [黑马Linux网络编程](https://www.bilibili.com/video/BV1iJ411S7UA/?share_source=copy_web&vd_source=2c7f42b63247f23de392dffcd83fd59f)
>
> 《TCP/IP网络编程》
>
> Socket 的本质是对 **TCP/IP 协议栈** 的编程接口封装。
>
> cpp没有标准网络库，用C++进行网络编程时要么采用第三方库，要么用操作系统提供的底层网络接口 比如linux的socket API。这个笔记记录的就是Linux系统提供的网络接口。

## 前置知识

### TCP/IP模型

![image-20251213144405086](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251213144405086.png)

### 并发服务器

所谓的并发服务器是指服务器能够**同时**处理多个客户端的请求（这里的同时是宏观上的）

多个请求同时到达或被处理

并发是宏观并行、微观串行。

> 根据我的理解，并发有广义并发和狭义并发。狭义并发就是指多个任务交替执行，因为cpu运转速度很快，所以宏观上来看这些任务就是同时进行。广义并发是指多个任务在同一时间段内执行，不在乎是交替执行还是并行。因此并行也属于并发。

多进程并发服务器：`accept`函数循环阻塞等待客户端的连接请求，当接收到客户端请求时，跟客户端建立连接之后`fork`一个子进程，与该客户端进行通信。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251219174323543.png" alt="image-20251219174323543" style="zoom: 25%;" />



多线程并发服务器：当服务器与客户端 TCP 完成连接后，通过 pthread_create() 函数创建线程，然后将「已连接 Socket」的文件描述符传递给线程函数，接着在线程里和客户端进行通信，从而达到并发处理的目的。

如何理解多线程：

> 不要认为多线程就代表着并行。在单核CPU中同一时刻只能有一个线程在执行。之所以要用多线程是因为，当某个线程阻塞的时候，可以切换到另一个线程干活，提高效率。由于CPU可以在极短的时间内轮流切换线程（上下文切换），所以看起来这些线程是并行的。现在的电脑CPU基本都是多核了，多个线程可以同时执行。而超过核数的线程数也只能实现并发。多进程也可以提高效率，区别在于线程的创建和上下文切换更快；线程间交换数据不需要特别的技术。进程间交换数据需要IPC技术。可以把线程看成轻量级进程。一个进程至少会有一个线程，这个线程被称为主线程。主线程对应main函数。其他线程都是由主线程`pthread_create`创建出来的，称为主线程的子线程。

### C/S架构

还有一个架构叫B/S架构。webserver（网络服务器）应该就属于B/S架构。

### 网络字节序

大端：**数据的低位保存在内存的高地址中，而数据的高位保存在内存的低地址中**.

小端：**数据的低位保存在内存的低地址中，而数据的高位保存在内存的高地址中**。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251219220320796.png" alt="image-20251219220320796" style="zoom:50%;" />

或者看下面这张图：

![image-20260309125736226](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309125736226.png)

两台字节序不一致的电脑在相互传递数据时会出现问题。比如下面这张图：大端序系统给小端序系统传输0x1234。0x12保存在低位地址，0x34保存在高位地址。从保存在低位地址的数据开始传输，小端序系统认为数据低位保存在低位地址，所以会解析为0x3412。

![image-20260309125951746](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309125951746.png)

为了解决不同字节序的计算机之间传输数据的问题，统一规定**网络数据流采用大端字节序**，要进行网络字节序和主机字节序的转换。

```cpp
# 所需函数
htonl(usigned long) 本地转网络（IP） IP一般四个字节，long类型就是4字节；port一般两个字节，short就是2字节。
htons(usigned short) 本地转网络（端口）
ntohl  网络转本地（IP）
ntohs 网络转本地（端口）
点分十进制->string->atoi函数（字符串转整数）->int->htonl函数->网络字节序
  
```

什么时候才考虑字节序问题？

![image-20260309130538721](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309130538721.png)

inet_pton函数可以把点分十进制IP地址转化成网络字节序二进制形式：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205142759702.png" alt="image-20251205142759702" style="zoom:50%;" />

> 还有一个函数inet_aton也可以把点分十进制IP地址转化成网络字节序的二进制形式（inet_ntoa正好反过来，把网络字节序二进制形式转化成点分十进制IP地址）。但是只支持IPV4协议，安全性也不高，所以现在基本不用了，只用pton函数。
>
> `char* inet_ntoa(struct in_addr in);` 传入的参数是in_addr结构体。
>
> ![image-20260309131453212](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309131453212.png)
>
> 还有一个函数inet_addr也可以用来将点分十进制IP地址转换成一个无符号长整型的网络字节序二进制。



获取客户端IP的时候需要用到ntop函数

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205155314049.png" alt="image-20251205155314049" style="zoom:50%;" />

在计算机系统中，我们是以**字节为单位**的，**每个地址单元都对应着一个字节，一个字节为8bit**。对于位数大于8位的处理器，例如16位或者32位的处理器，由于寄存器宽度大于一个字节，那么必然存在着一个如果将多个字节安排的问题。

![image-20251204194846366](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204194846366.png)

127.0.0.1是本地回环地址。

**面试题：**127.0.0.1和localhost的区别

## Socket

套接字，两个进程之间进行通信的接口，描述IP地址和端口。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251213144459428.png" alt="image-20251213144459428" style="zoom:50%;" />

应用程序通常通过"套接字"向网络发出请求或者应答网络请求，使主机间或者一台计算机上的进程间可以通讯。

socket是一种"打开—读/写—关闭"模式的实现，服务器和客户端各自维护一个"文件"，在建立连接打开后，可以向自己文件写入内容供对方读取或者读取对方内容，通讯结束时关闭文件。

>  并发：多个任务在时间片段内交替进行
>
> 并行：多个任务在多个处理器上同时执行

客户端和服务端通信的流程：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204192908892.png" alt="image-20251204192908892" style="zoom: 33%;" />



使用TCP协议的socket交互流程： 

当客户端调用connect()函数时进行TCP三次握手，当服务器accept()函数返回时，TCP连接建立。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205114055065.png" alt="image-20251205114055065" style="zoom:50%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203174529382.png" alt="image-20251203174529382" style="zoom:50%;" />

> 问题：为什么服务端需要绑定IP地址和端口号，而客户端就不需要绑定IP地址和端口号。
>
> 客户端的IP地址和端口号会自动分配（隐式绑定）。【何时：调用connect函数时。何地：操作系统，更准确地说是在内核中。如何：IP用计算机（主机）的IP，端口则随机。】服务器的IP地址可能有多个，我们要为服务端的程序手动绑定固定的IP地址和端口。不能让系统自己分配。
>
> 服务器端如何知道客户端的IP地址和端口号：通过底层网络数据包，会携带IP头和TCP头。
>
> 客户端如何知道服务器端的IP地址和端口号：通过DNS解析出IP地址，端口号是用的默认端口。或者直接手动给客户端传服务端的IP和端口号。

客户端需要提前知道服务端的IP和端口；而服务端不用提前知道客户端的IP和端口。

### 服务端：

* socket函数：创建一个socket。

  `int socket(int domain, int type, int protocol)`
  成功返回fd，失败返回-1。设置errno。

  * domain：socket使用的协议族

  ![image-20260310212035826](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260310212035826.png)

  * type：套接字的数据传输方式：SOCK_STREAM(面向连接的套接字）、SOCK_DGRAM（面向消息的套接字）
  * protocol：通信中使用的协议（一般设置成0就行）如果同一协议族中存在多个数据传输方式相同的协议，那么就需要指定第三个参数。在IPv4网络协议家族中，数据传输方式为SOCK_STREAM的协议只有IPPROTO_TCP，数据传输方式为SOCK_DGRAM的协议只有IPPROTO_UDP。所以不需要指定第三个参数，设置为0即可。
  * 成功返回fd，失败返回-1，设置errno。单个进程中创建的socket数量受系统参数open files的限制。（ulimit -a可以查看最大open files个数 打开的文件个数➕socket个数不能超过这个限制。 ）

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144601009.png" alt="image-20251205144601009" style="zoom:50%;" />

* bind函数：为socket绑定IP和端口  

`int bind(int sockfd, const struct sockaddr* addr, socklen_t addrlen)`

下面介绍下sockaddr这个结构体，这个结构体存储了socket要绑定的IP地址和端口号：

```cpp
struct sockaddr
{
	sa_family_t sin_family; //地址族 与socket函数第一个参数相同
    char sa_data[14]；// 地址信息
}
```

这是一个通用的结构体，下面介绍IPV4专用的结构体`sockaddr_in`：

```cpp
struct sockaddr_in
{
	sa_family_t sin_family; //地址族
    unit16_t    sin_port; //16位TCP/UDP端口号
    struct      in_addr sin_addr;//32位IP地址（IPV4）
    char        sin_zero[8];//弃用 
} //最后三个成员总共14字节，和sockaddr第二个成员大小是一样的。

struct in_addr
{
   in_addr_t s_addr; //32位IPv4地址
}
```

* sin_family

  ![image-20260309133524266](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309133524266.png)

* sin_port 16位端口号，以网络字节序的方式保存。
* sin_addr 32位IP地址，也以网络字节序的方式保存。
* 这个结构体中有很多操作系统定义的数据类型，参考下图：![image-20260309133739055](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309133739055.png)

> 拓展：IPV4专用结构体中为什么还要有地址族？![image-20260309133358134](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309133358134.png)

bind函数的第二个参数是sockaddr结构体类型，只需要对sockaddr_in结构体进行强制类型转换即可。第三个参数是结构体的大小。

初始化sockaddr_in结构体的方法：![image-20260309135701719](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309135701719.png)

如何将字符串类型的IP地址转化成网络字节序格式？

1. C语言提供了几个库函数，用于字符串格式的IP和大端序IP的互相转换，用于网络通讯的服务端程序中。

```cpp
typedef unsigned int in_addr_t;    // 32位大端序的IP地址。

// 把字符串格式的IP转换成大端序的IP，转换后的IP赋给sockaddr_in.in_addr.s_addr。
in_addr_t inet_addr(const char *cp);

// 把字符串格式的IP转换成大端序的IP，转换后的IP将填充到sockaddr_in.in_addr成员。
int inet_aton(const char *cp, struct in_addr *inp);

// 把大端序IP转换成字符串格式的IP，用于在服务端程序中解析客户端的IP地址。
char *inet_ntoa(struct in_addr in);
```

2. gethostbyname函数。根据域名/主机名/字符串IP获取大端序IP，用于网络通讯的客户端程序中。

```cpp
struct hostent *gethostbyname(const char *name);
struct hostent {
  char *h_name;     	// 主机名。
  char **h_aliases;    	// 主机所有别名构成的字符串数组，同一IP可绑定多个域名。
  short h_addrtype; 	// 主机IP地址的类型，例如IPV4（AF_INET）还是IPV6。
  short h_length;     	// 主机IP地址长度，IPV4地址为4，IPV6地址则为16。
  char **h_addr_list; 	// 主机的ip地址，以网络字节序存储。
};
#define h_addr h_addr_list[0] 	// for backward compatibility.
```

转换后，用以下代码把大端序的地址复制到sockaddr_in结构体的sin_addr成员中。

```cpp
memcpy(&servaddr.sin_addr,h->h_addr,h->h_length);
```

具体写法：

```cpp
 struct hostent* h;                         // 用于存放服务端IP地址(大端序)的结构体的指针。
  if ( (h = gethostbyname(argv[1])) == nullptr )  // 把域名/主机名/字符串格式的IP转换成结构体。
  {
    cout << "gethostbyname failed.\n" << endl; close(sockfd); return -1;
  }
  memcpy(&servaddr.sin_addr,h->h_addr,h->h_length); // ③指定服务端的IP(大端序)。

  //servaddr.sin_addr.s_addr=inet_addr(argv[1]); // ③指定服务端的IP，只能用IP，不能用域名和主机名。
```

客户端程序将IP地址转换为大端序也可以用inet_addr函数，但是参数类型就不能传域名、主机名了。

3. IP地址初始化也可以采用：

```cpp
int dst;
inet_pton(AF_INET, "192.157.22.45", (void*)&dst);
addr.sin_addr.s_addr=dst;
```

可以利用常数INADDR_ANY让 Socket**监听这台机器上的所有有效 IP 地址**，不管客户端发送数据的目的IP是服务器的哪个IP，只要端口是8888，就传给这个socket。（服务器通常有很多网卡，也就有很多IP地址。）数据类型是in_addr_t，也就是一个uint32_t类型。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144623529.png" alt="image-20251205144623529" style="zoom:50%;" />

![image-20260309140136603](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309140136603.png)



* listen函数：设置监听上限（服务器能同时和多少个客户端建立TCP连接）

`int listen(int sockfd, int backlog)`

* backlog：连接请求等待队列的长度，上限值是128。比如长度为5说明最多使5个连接请求进入队列。（同时与服务器建立连接的上限数，也就是同时进行3次握手的客户端数量）

更新：`listen()` 的第二个参数 `backlog` 控制的是全连接队列（已经完成三次握手，但是还没有被accept的客户端）。backlog设置成5，实际全连接队列能装6个。上限值新版内核默认4096。全连接队列满了后，再来的客户端连接内核会如何处理呢，见TCP相关知识。

* 成功返回0，失败返回-1，设置errno。

![image-20260309141548886](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309141548886.png)

* accept函数：阻塞监听客户端连接 返回一个新的与客户端成功连接的socket文件描述符（fd）

  所以客户端和服务端通信的过程会建立两个fd，一 个用于监听（lfd）一个用于通信（cfd）
  
  `int accept(int sockfd, struct sockaddr* addr, socklen_t* addrlen)`
  
  * 成功返回cfd，失败返回-1，设置errno。
  
  * addr是传出参数，保存发起连接请求的客户端地址信息
  
  ​     addrlen是传入传出参数，addr的大小，函数调用完成后会填入客户端addr实际大小。
  
  * ![image-20260309143032920](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309143032920.png)
  
  * 若等待队列为空，accept不会返回，直到队列中出现新的客户端连接。
  

![image-20251205145702289](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205145702289.png)

accept函数第二、三个参数可以填0，表示不关心客户端的地址信息。

如果传入了参数，调用accept函数后，可以调用inet_ntoa(addr.sin_addr)将客户端大端序IP转换成点分十进制字符串IP。

### 客户端：

connect函数：向服务器发送连接请求

`int connect(int sockfd, struct sockaddr* servaddr, socklen_t addrlen)`

* sockfd:客户端套接字fd
* servaddr：目标服务器的地址信息
* addrlen：地址信息的大小
* 成功返回0，失败返回-1，设置errno
* 函数返回的时机：服务器接收连接请求（加入等待队列）；发生断网等异常情况而中断连接请求。

### socket通信整体流程：

![image-20260309151903895](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309151903895.png)

服务器端创建套接字后连续调用bind、listen函数进入等待状态，客户端通过调用connect函数发起连接请求。客户端只能等到服务器端调用listen函数后才能调connect函数。需要注意：客户端调用connect函数前，服务器端可能率先调用accept函数，此时accept函数处于阻塞状态，直到客户端调用connect函数为止。

假如服务器端调用了listen函数，当客户端调用connect函数发起连接请求时，服务器端会调用accept函数处理连接请求。如果多个客户端连接请求同时到达，就会被放入等待队列，依次处理连接请求。

假如服务器端调用了accept函数，客户端还没有调用connect函数，accept函数就会阻塞等待。如果调用了connect函数，accept函数就会处理连接请求。假如服务端正在和一个客户端进行通信，其它客户端的连接请求就会被放入等待队列。

> 为什么服务器端会率先调用accept函数？
>
> 如果服务端不提前等在 `accept` 处，而是等发现有连接了再去调 `accept`，响应速度会变慢。
>
> ![image-20260309153135410](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309153135410.png)

### 回声服务器端/客户端

回声：将客户端发过来的数据原封不动的传回客户端。

 服务端代码：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define BUF_SIZE 1024
void error_handling(char * message); //错误处理函数

int main(int argc, char * argv[])
{
	int serv_sock, clnt_sock;
	char message[BUF_SIZE];
	int str_len, i;
	
	struct sockaddr_in serv_adr, clnt_adr; //地址信息结构体（IP+端口）
	socklen_t clnt_adr_sz;

	if(argc != 2){
		printf("Usage : %s <port>\n", argv[0]);
		exit(1);
	}

	serv_sock = socket(PF_INET, SOCK_STREAM, 0);//创建套接字
	if(serv_sock == -1)
		error_handling("socket() error");
	
	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("bind() error");

	if(listen(serv_sock, 5) == -1) //等待队列最大是5
		error_handling("listen() error");

	clnt_adr_sz = sizeof(clnt_adr);
	
	for(i = 0; i < 5; i++)	//为处理5个客户端连接而添加的循环语句。共调用5次accept函数，依次向5个客户端提供服务。
	{
		clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &clnt_adr_sz); //通信套接字
		if(clnt_sock == -1)
			error_handling("accept() error");
		else
			printf("Connected client %d \n", i + 1);
	
		while((str_len = read(clnt_sock, message, BUF_SIZE)) != 0)// 读客户端发来的数据
			write(clnt_sock, message, str_len);// 把数据原封不动的写到客户端

		close(clnt_sock);// 这对套接字调用close函数，向连接的相应套接字发送EOF。
	}
	close(serv_sock);// 向5个客户端提供服务后关闭服务器端监听套接字并终止程序。
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	putc('\n', stderr);
	exit(1);
}
```

客户端代码：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<sys/socket.h>
#include<arpa/inet.h>

#define BUF_SIZE 1024
void error_handling(char * message);

int main(int argc, char * argv[])
{
       	int sock; 
		char message[BUF_SIZE];
       	int str_len;
       	struct sockaddr_in serv_adr; //服务器端套接字的地址信息

	if(argc != 3){
		printf("Usage : %s <IP> <port>\n", argv[0]);
		exit(1);
	}

	sock = socket(PF_INET, SOCK_STREAM, 0);
	if(sock == -1)
		error_handling("socket() error");	

	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_adr.sin_port = htons(atoi(argv[2]));

	if(connect(sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
        //调用Connect函数。若调用该函数引起的连接请求
	    //被注册到服务器端等待队列，则connect函数将完成
		//正常调用。因此，即使输出了连接提示字符串"Connect....."
	    //，但如果服务器尚未调用accept函数，也不会真正建立服务关系
		error_handling("connect() error");
	else
		puts("Connected........");

	while(1)
	{
		fputs("Input message(Q to quit):", stdout);
        //函数原型：int fputs(const char* str, FILE* stream)
        //第一个参数代表写入的数据，第二个参数代表写到哪里去
        //它会把 str 里面直到 \0 之前的所有字符，原封不动地写进文件里。
		fgets(message, BUF_SIZE, stdin);
        //函数原型：char* fgets(char* str, int n, FILE* stream)
        //第一个参数代表把数据读到哪里去，第二个参数代表最多读多少个字节，第三个参数代表从哪读。
        //fgets 会一直往后读，直到遇到以下三种情况之一才会停下来，并在末尾自动帮你加上 \0：
        //读满了 n-1 个字符：留下最后一个位置给 \0，非常安全，绝对不会缓冲区溢出。
		//遇到了换行符 \n：说明读完了一整行。【大坑注意】它会把这个 \n 也原封不动地存进你的数组里！
		//遇到了文件末尾（EOF）：文件读完了。

		if(!strcmp(message, "q\n") || !strcmp(message, "Q\n")) //strcmp返回0代表完全相等
			break;

		write(sock, message, strlen(message));//发送数据给服务器
		str_len = read(sock, message, BUF_SIZE - 1);//接收服务器的数据
		message[str_len] = 0;	//给字符串添加结束符'\0' printf如果找不到\0，会往后读message数组残留的垃圾值。
		printf("Message from server: %s", message);
	}
	close(sock);	//调用close函数向相应套接字发送EOF（EOF意味着中断连接）
	return 0;
}

void error_handling(char *message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

回声客户端存在的问题：

以上代码有个错误假设：

客户端发送一次数据，就一定能用一次read完整接收回来。

上述客户端是基于TCP的，TCP不存在数据边界，因此，多次调用write函数传递的字符串有可能一次性传递到服务器端。这时存在问题：客户端有可能从服务器端收到多个字符串，这不是我们希望看到的结果。

还需要考虑服务器端的如下情况：

> “字符串太长，需要分2个数据包发送！”

服务器端希望通过调用1次write函数传输数据，但如果数据太大，操作系统就有可能把数据分成多个数据包发送到客户端。另外，在此过程中，客户端有可能在尚未收到全部数据包时就调用read函数。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309173904660.png" alt="image-20260309173904660" style="zoom:50%;" />



解决方法：由于回声客户端可以提前知道接收的数据长度，若之前传输了20字节的数据，则在接收时循环调用read函数读取20字节即可。

```cpp
while(1)
{
    
str_len = write(sock, message, strlen(message));
recv_len = 0;
while(recv_len != str_len)//revc_len<str_len
{
    recv_cnt = read(sock, &message[recv_len], BUF_SIZE-1);
    if(recv_cnt == -1) error_handling("read() error!");
    recv_len+=recv_cnt;
}
massage[recv_len] = '\0';
printf("Message from server: %s",message);
    
}
```

### 简单的C/S通信案例

案例一：码农论坛(实现文件传输功能 客户端发送文本文件或二进制文件给服务器)

```cpp
 /*
 * 程序名：demo11.cpp，此程序用于演示文件传输的客户端。
*/
#include <iostream>
#include <fstream>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <unistd.h>
#include <netdb.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
using namespace std;

class ctcpclient         // TCP通讯的客户端类。
{
private:
  int m_clientfd;        // 客户端的socket，-1表示未连接或连接已断开；>=0表示有效的socket。
  string m_ip;           // 服务端的IP/域名。
  unsigned short m_port; // 通讯端口。
public:
  ctcpclient():m_clientfd(-1) {}

  // 向服务端发起连接请求，成功返回true，失败返回false。
  bool connect(const string &in_ip,const unsigned short in_port)
  {
    if (m_clientfd!=-1) return false; // 如果socket已连接，直接返回失败。

    m_ip=in_ip; m_port=in_port;       // 把服务端的IP和端口保存到成员变量中。

    // 第1步：创建客户端的socket。
    if ( (m_clientfd = socket(AF_INET,SOCK_STREAM,0))==-1) return false;

    // 第2步：向服务器发起连接请求。
    struct sockaddr_in servaddr;               // 用于存放协议、端口和IP地址的结构体。
    memset(&servaddr,0,sizeof(servaddr));
    servaddr.sin_family = AF_INET;             // ①协议族，固定填AF_INET。
    servaddr.sin_port = htons(m_port);         // ②指定服务端的通信端口。

    struct hostent* h;                         // 用于存放服务端IP地址(大端序)的结构体的指针。
    if ((h=gethostbyname(m_ip.c_str()))==nullptr ) // 把域名/主机名/字符串格式的IP转换成结构体。
    {
      ::close(m_clientfd); m_clientfd=-1; return false;
    }
    memcpy(&servaddr.sin_addr,h->h_addr,h->h_length); // ③指定服务端的IP(大端序)。

    // 向服务端发起连接清求。
    if (::connect(m_clientfd,(struct sockaddr *)&servaddr,sizeof(servaddr))==-1)
    {
      ::close(m_clientfd); m_clientfd=-1; return false;
    }

    return true;
  }

  // 向服务端发送报文（字符串），成功返回true，失败返回false。
  bool send(const string &buffer)   // buffer不要用const char *
  {
    if (m_clientfd==-1) return false; // 如果socket的状态是未连接，直接返回失败。

    if ((::send(m_clientfd,buffer.data(),buffer.size(),0))<=0) return false;

    return true;
  }

  // 向服务端发送报文（二进制数据），成功返回true，失败返回false。
  bool send(void *buffer,const size_t size)
  {
    if (m_clientfd==-1) return false; // 如果socket的状态是未连接，直接返回失败。

    if ((::send(m_clientfd,buffer,size,0))<=0) return false;

    return true;
  }

  // 接收服务端的报文，成功返回true，失败返回false。
  // buffer-存放接收到的报文的内容，maxlen-本次接收报文的最大长度。
  bool recv(string &buffer,const size_t maxlen)
  { // 如果直接操作string对象的内存，必须保证：1)不能越界；2）操作后手动设置数据的大小。
    buffer.clear();         // 清空容器。
    buffer.resize(maxlen);  // 设置容器的大小为maxlen。
    int readn=::recv(m_clientfd,&buffer[0],buffer.size(),0);  // 直接操作buffer的内存。
    if (readn<=0) { buffer.clear(); return false; }
    buffer.resize(readn);   // 重置buffer的实际大小。

    return true;
  }

  // 断开与服务端的连接。
  bool close()
  {
    if (m_clientfd==-1) return false; // 如果socket的状态是未连接，直接返回失败。

    ::close(m_clientfd);
    m_clientfd=-1;
    return true;
  }

  // 向服务端发送文件内容。
  bool sendfile(const string &filename,const size_t filesize)
  {
    // 以二进制的方式打开文件。
    ifstream fin(filename,ios::binary);
    if (fin.is_open() == false) { cout << "打开文件" << filename << "失败。\n";  return false; }

    int  onread=0;        // 每次调用fin.read()时打算读取的字节数。  每次应搬砖头数。
    int  totalbytes=0;    // 从文件中已读取的字节总数。 已搬砖头数。
    char buffer[4096];       // 存放读取数据的buffer。     每次搬七块砖头。

    while (true)
    {
      memset(buffer,0,sizeof(buffer));

      // 计算本次应该读取的字节数，如果剩余的数据超过4096字节，就读4096字节。
      if (filesize-totalbytes>4096) onread=4096;
      else onread=filesize-totalbytes;

      // 从文件中读取数据。
      fin.read(buffer,onread);

      // 把读取到的数据发送给对端。
      if (send(buffer,onread)==false) return false;

      // 计算文件已读取的字节总数，如果文件已读完，跳出循环。
      totalbytes=totalbytes+onread;

      if (totalbytes==filesize) break;
    }

    return true;
  }

 ~ctcpclient(){ close(); }
};

int main(int argc,char *argv[])
{
  if (argc!=5)
  {
    cout << "Using:./demo11 服务端的IP 服务端的端口 文件名 文件大小\n";
    cout << "Example:./demo11 192.168.101.138 5005 aaa.txt 2424\n\n";
    return -1;
  }

  ctcpclient tcpclient;
  if (tcpclient.connect(argv[1],atoi(argv[2]))==false)  // 向服务端发起连接请求。
  {
    perror("connect()"); return -1;
  }

  // 以下是发送文件的流程。
  // 1）把待传输文件名和文件的大小告诉服务端。
  // 定义文件信息的结构体。
  struct st_fileinfo{
    char filename[256];  // 文件名。
    int  filesize;       // 文件大小。
  }fileinfo;
  memset(&fileinfo,0,sizeof(fileinfo));
  strcpy(fileinfo.filename,argv[3]);     // 文件名。
  fileinfo.filesize=atoi(argv[4]);       // 文件大小。
  // 把文件信息的结构体发送给服务端。
  if (tcpclient.send(&fileinfo,sizeof(fileinfo))==false) { perror("send"); return -1; }
  cout << "发送文件信息的结构体" << fileinfo.filename << "(" << fileinfo.filesize <<")。"<< endl;

  // 2）等待服务端的确认报文（文件名和文件的大小的确认）。
  string buffer;
  if (tcpclient.recv(buffer,2)==false) { perror("recv()"); return -1; }
  if (buffer!="ok") { cout << "服务端没有回复ok。\n"; return -1; }

  // 3）发送文件内容。
  if (tcpclient.sendfile(fileinfo.filename,fileinfo.filesize)==false)
  {
    perror("sendfile()"); return -1;
  }

  // 4）等待服务端的确认报文（服务端已接收完文件）。
  if (tcpclient.recv(buffer,2)==false) { perror("recv()"); return -1; }
  if (buffer!="ok") { cout << "发送文件内容失败。\n"; return -1; }

  cout << "发送文件内容成功。\n";
}
```

```cpp
/*
 * 程序名：demo12.cpp，此程序用于演示文件传输的服务端。
*/
#include <iostream>
#include <fstream>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <unistd.h>
#include <netdb.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
using namespace std;

class ctcpserver         // TCP通讯的服务端类。
{
private:
  int    m_listenfd;        // 监听的socket，-1表示未初始化。
  int    m_clientfd;        // 客户端连上来的socket，-1表示客户端未连接。
  string m_clientip;        // 客户端字符串格式的IP。
  unsigned short m_port;    // 服务端用于通讯的端口。
public:
  ctcpserver():m_listenfd(-1),m_clientfd(-1) {}

  // 初始化服务端用于监听的socket。
  bool initserver(const unsigned short in_port)
  {
    // 第1步：创建服务端的socket。
    if ( (m_listenfd=socket(AF_INET,SOCK_STREAM,0))==-1) return false;

    m_port=in_port;

    // 第2步：把服务端用于通信的IP和端口绑定到socket上。
    struct sockaddr_in servaddr;                // 用于存放协议、端口和IP地址的结构体。
    memset(&servaddr,0,sizeof(servaddr));
    servaddr.sin_family=AF_INET;                // ①协议族，固定填AF_INET。
    servaddr.sin_port=htons(m_port);            // ②指定服务端的通信端口。
    servaddr.sin_addr.s_addr=htonl(INADDR_ANY); // ③如果操作系统有多个IP，全部的IP都可以用于通讯。

    // 绑定服务端的IP和端口（为socket分配IP和端口）。
    if (bind(m_listenfd,(struct sockaddr *)&servaddr,sizeof(servaddr))==-1)
    {
      close(m_listenfd); m_listenfd=-1; return false;
    }

    // 第3步：把socket设置为可连接（监听）的状态。
    if (listen(m_listenfd,5) == -1 )
    {
      close(m_listenfd); m_listenfd=-1; return false;
    }

    return true;
  }

  // 受理客户端的连接（从已连接的客户端中取出一个客户端），
  // 如果没有已连接的客户端，accept()函数将阻塞等待。
  bool accept()
  {
    struct sockaddr_in caddr;        // 客户端的地址信息。
    socklen_t addrlen=sizeof(caddr); // struct sockaddr_in的大小。
    if ((m_clientfd=::accept(m_listenfd,(struct sockaddr *)&caddr,&addrlen))==-1) return false;

    m_clientip=inet_ntoa(caddr.sin_addr);  // 把客户端的地址从大端序转换成字符串。

    return true;
  }

  // 获取客户端的IP(字符串格式)。
  const string & clientip() const
  {
    return m_clientip;
  }

  // 向对端发送报文，成功返回true，失败返回false。
  bool send(const string &buffer)
  {
    if (m_clientfd==-1) return false;

    if ( (::send(m_clientfd,buffer.data(),buffer.size(),0))<=0) return false;

    return true;
  }

  // 接收对端的报文（字符串），成功返回true，失败返回false。
  // buffer-存放接收到的报文的内容，maxlen-本次接收报文的最大长度。
  bool recv(string &buffer,const size_t maxlen)
  {
    buffer.clear();         // 清空容器。
    buffer.resize(maxlen);  // 设置容器的大小为maxlen。
    int readn=::recv(m_clientfd,&buffer[0],buffer.size(),0);  // 直接操作buffer的内存。
    if (readn<=0) { buffer.clear(); return false; }
    buffer.resize(readn);   // 重置buffer的实际大小。

    return true;
  }

  // 接收客户端的报文（二进制数据），成功返回true，失败返回false。
  // buffer-存放接收到的报文的内容，size-本次接收报文的最大长度。
  bool recv(void *buffer,const size_t size)
  {
    if (::recv(m_clientfd,buffer,size,0)<=0) return false;

    return true;
  }

  // 关闭监听的socket。
  bool closelisten()
  {
    if (m_listenfd==-1) return false;

    ::close(m_listenfd);
    m_listenfd=-1;
    return true;
  }

  // 关闭客户端连上来的socket。
  bool closeclient()
  {
    if (m_clientfd==-1) return false;

    ::close(m_clientfd);
    m_clientfd=-1;
    return true;
  }

  // 接收文件内容。
  bool recvfile(const string &filename,const size_t filesize)
  {
    ofstream fout; //写文件
    fout.open(filename,ios::binary);
    if (fout.is_open() == false) { cout << "打开文件" << filename << "失败。\n";  return false; }

    int  totalbytes=0;        // 已接收文件的总字节数。
    int  onread=0;            // 本次打算接收的字节数。
    char buffer[4096];           // 接收文件内容的缓冲区。

    while (true)
    {
      // 计算本次应该接收的字节数。
      if (filesize-totalbytes>4096) onread=4096;
      else onread=filesize-totalbytes;

      // 接收文件内容。
      if (recv(buffer,onread)==false) return false;

      // 把接收到的内容写入文件。
      fout.write(buffer,onread);

      // 计算已接收文件的总字节数，如果文件接收完，跳出循环。
      totalbytes=totalbytes+onread;

      if (totalbytes==filesize) break;
    }

    return true;
  }

 ~ctcpserver() { closelisten(); closeclient(); }
};

ctcpserver tcpserver;

void FathEXIT(int sig);  // 父进程的信号处理函数。
void ChldEXIT(int sig);  // 子进程的信号处理函数。

int main(int argc,char *argv[])
{
  if (argc!=3)
  {
    cout << "Using:./demo12 通讯端口 文件存放的目录\n";
    cout << "Example:./demo12 5005 /tmp\n\n";
    cout << "注意：运行服务端程序的Linux系统的防火墙必须要开通5005端口。\n";
    cout << "      如果是云服务器，还要开通云平台的访问策略。\n\n";
    return -1;
  }

  // 忽略全部的信号，不希望被打扰。顺便解决了僵尸进程的问题。
  for (int ii=1;ii<=64;ii++) signal(ii,SIG_IGN);

  // 设置信号,在shell状态下可用 "kill 进程号" 或 "Ctrl+c" 正常终止些进程
  // 但请不要用 "kill -9 +进程号" 强行终止
  signal(SIGTERM,FathEXIT); signal(SIGINT,FathEXIT);  // SIGTERM 15 SIGINT 2

  if (tcpserver.initserver(atoi(argv[1]))==false) // 初始化服务端用于监听的socket。
  {
    perror("initserver()"); return -1;
  }

  while (true)
  {
    // 受理客户端的连接（从已连接的客户端中取出一个客户端），
    // 如果没有已连接的客户端，accept()函数将阻塞等待。
    if (tcpserver.accept()==false)
    {
      perror("accept()"); return -1;
    }

    int pid=fork();
    if (pid==-1) { perror("fork()"); return -1; }  // 系统资源不足。
    if (pid>  0)
    { // 父进程。
      tcpserver.closeclient();  // 父进程关闭客户端连接的socket。
      continue;                 // 父进程返回到循环开始的位置，继续受理客户端的连接。
    }

    tcpserver.closelisten();    // 子进程关闭监听的socket。

    // 子进程需要重新设置信号。
    signal(SIGTERM,ChldEXIT);   // 子进程的退出函数与父进程不一样。
    signal(SIGINT ,SIG_IGN);    // 子进程不需要捕获SIGINT信号。

    // 子进程负责与客户端进行通讯。
    cout << "客户端已连接(" << tcpserver.clientip() << ")。\n";

    // 以下是接收文件的流程。
    // 1）接收文件名和文件大小信息。
    // 定义文件信息的结构体。
    struct st_fileinfo{
      char filename[256];  // 文件名。
      int  filesize;       // 文件大小。
    }fileinfo;
    memset(&fileinfo,0,sizeof(fileinfo));
    // 用结构体存放接收报文的内容。
    if (tcpserver.recv(&fileinfo,sizeof(fileinfo))==false) { perror("recv()"); return -1; }
    cout << "文件信息结构体" << fileinfo.filename << "(" << fileinfo.filesize <<")。"<< endl;

    // 2）给客户端回复确认报文，表示客户端可以发送文件了。
    if (tcpserver.send("ok")==false)  { perror("send"); break; }

    // 3）接收文件内容。  string   char * + const char * + char *
    if (tcpserver.recvfile(string(argv[2])+"/"+fileinfo.filename,fileinfo.filesize)==false)
    {
      cout << "接收文件内容失败。\n"; return -1;
    }

    cout << "接收文件内容成功。\n";

    // 4）给客户端回复确认报文，表示文件已接收成功。
    tcpserver.send("ok");

    return 0;  // 子进程一定要退出，否则又会回到accept()函数的位置。
  }
}

// 父进程的信号处理函数。
void FathEXIT(int sig)
{
  // 以下代码是为了防止信号处理函数在执行的过程中再次被信号中断。
  signal(SIGINT,SIG_IGN); signal(SIGTERM,SIG_IGN);

  cout << "父进程退出，sig=" << sig << endl;

  kill(0,SIGTERM);     // 向全部的子进程发送15的信号，通知它们退出。

  // 在这里增加释放资源的代码（全局的资源）。
  tcpserver.closelisten();       // 父进程关闭监听的socket。

  exit(0);
}

// 子进程的信号处理函数。
void ChldEXIT(int sig)
{
  // 以下代码是为了防止信号处理函数在执行的过程中再次被信号中断。
  signal(SIGINT,SIG_IGN); signal(SIGTERM,SIG_IGN);

  cout << "子进程" << getpid() << "退出，sig=" << sig << endl;

  // 在这里增加释放资源的代码（只释放子进程的资源）。
  tcpserver.closeclient();       // 子进程关闭客户端连上来的socket。

  exit(0);
}
```

案例二：

* cpp版本

```cpp
// server
#include <iostream>
#include <cstring>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string>
using std::string;

int main()
{
    // 1. 创建 socket
    int sockfd = ::socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (sockfd < 0)
    {
        printf("create socket error: errno=%d errmsg=%s\n", errno, strerror(errno));
        return 1;
    }
    else 
    {
        printf("create socket success!\n");
    }

    // 2. 绑定 socket
    string ip = "127.0.0.1";
    int port = 8080;

    struct sockaddr_in sockaddr;
    std::memset(&sockaddr, 0, sizeof(sockaddr));
    sockaddr.sin_family = AF_INET;
    sockaddr.sin_addr.s_addr = inet_addr(ip.c_str());
    sockaddr.sin_port = htons(port);
    if (::bind(sockfd, (struct sockaddr *)&sockaddr, sizeof(sockaddr)) < 0)
    {
        printf("socket bind error: errno=%d, errmsg=%s\n", errno, strerror(errno));
        return 1;
    }
    else
    {
        printf("socket bind success: ip=%s port=%d\n", ip.c_str(), port);
    }

    // 3. 监听 socket
    if (::listen(sockfd, 1024) < 0)
    {
        printf("socket listen error: errno=%d errmsg=%s\n", errno, strerror(errno));
        return 1;
    }
    else
    {
        printf("socket listen ...\n");
    }

    while (true)
    {
        // 4. 接收客户端连接
        int connfd = ::accept(sockfd, nullptr, nullptr);
        if (connfd < 0)
        {
            printf("socket accept error: errno=%d errmsg=%s\n", errno, strerror(errno));
            return 1;
        }

        char buf[1024] = {0};

        // 5. 接收客户端的数据
        size_t len = ::recv(connfd, buf, sizeof(buf), 0);
        printf("recv: conn=%d msg=%s\n", connfd, buf);

        // 6. 向客服端发送数据
        ::send(connfd, buf, len, 0);
    }

    // 7. 关闭 socket
    ::close(sockfd);
    return 0;
}
```

```cpp
// client  
#include <iostream>

#include <cstring>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string>
using std::string;

int main()
{
    // 1. 创建 socket
    int sockfd = ::socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (sockfd < 0)
    {
        printf("create socket error: errno=%d errmsg=%s\n", errno, strerror(errno));
        return 1;
    }
    else
    {
        printf("create socket success!\n");
    }

    // 2. 连接服务端
    string ip = "127.0.0.1";
    int port = 8080;

    struct sockaddr_in sockaddr;
    std::memset(&sockaddr, 0, sizeof(sockaddr));
    sockaddr.sin_family = AF_INET;
    sockaddr.sin_addr.s_addr = inet_addr(ip.c_str());
    sockaddr.sin_port = htons(port);
    if (::connect(sockfd, (struct sockaddr *)&sockaddr, sizeof(sockaddr)) < 0)
    {
        printf("socket connect error: errno=%d errmsg=%s\n", errno, strerror(errno));
        return 1;
    }

    // 3. 向服务端发送数据
    string data = "hello world";
    ::send(sockfd, data.c_str(), data.size(), 0);

    // 4. 接收服务端的数据
    char buf[1024] = {0};
    ::recv(sockfd, buf, sizeof(buf), 0);

    printf("recv: %s\n", buf);

    // 5. 关闭 socket
    ::close(sockfd);

    return 0;
}
```



* 黑马版本

```c
// server

#include <stdio.h>
#include <ctype.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <pthread.h>

//端口号
#define SERV_PORT 9527

int main(){
        char buf[BUFSIZ];
        int ret,i;

        int lfd = 0, cfd = 0;

        struct sockaddr_in serv_addr, clit_addr;
        socklen_t clit_addr_len;

        serv_addr.sin_family = AF_INET;
        serv_addr.sin_port = htons(SERV_PORT);
        serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);

        //1. 创建socket
        lfd = socket(AF_INET,SOCK_STREAM,0);
        if(lfd == -1)
        {
                perror("socket error");
                exit(1);
        }
        //2. 绑定ip和端口
        bind(lfd,(struct sockaddr *)&serv_addr,sizeof(serv_addr));
        //3. 设置上限
        listen(lfd,128);
        //4. 阻塞等待客户端连接
        clit_addr_len = sizeof(clit_addr);
        cfd = accept(lfd,(struct sockaddr *)&clit_addr,&clit_addr_len);
        if(cfd==-1)
        {
                perror("accept error");
                exit(1);
        }
        //5. 读写数据
        while(1){
                ret = read(cfd,buf,sizeof(buf));
                write(STDOUT_FILENO,buf,ret);

                for(i=0;i<ret;i++)
                {
                        buf[i] = toupper(buf[i]);
                }

                write(cfd,buf,ret);
        }

        //关闭
        close(lfd);
        close(cfd);

        return 0;
}
```

```c
// client   
#include <stdio.h>
#include <ctype.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <pthread.h>

#define SERV_PORT 9527

int main()
{
int cfd = 0;
char buf[BUFSIZ];
int conter = 11;

struct sockaddr_in serv_addr;
serv_addr.sin_family = AF_INET;
serv_addr.sin_port = htons(SERV_PORT);
inet_pton(AF_INET,"127.0.0.1",&serv_addr.sin_addr.s_addr);

//创建socket
cfd = socket(AF_INET,SOCK_STREAM,0);
if(cfd == -1)
{
perror("socket error");
exit(1);
}

// connect连接
int ret = connect(cfd,(struct sockaddr *)&serv_addr,sizeof(serv_addr));
if(ret == -1)
{
perror("connect error");
exit(1);
}

// 读写数据
while(--conter){
write(cfd,"hello\n",6);
ret = read(cfd,buf,sizeof(buf));
write(STDOUT_FILENO,buf,ret);
sleep(1);
}

close(cfd);

return 0;
}
```

### 封装socket

客户端程序：

```cpp
/*
 * 程序名：demo7.cpp，此程序用于演示封装socket通讯的客户端
*/
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <unistd.h>
#include <netdb.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
using namespace std;

class ctcpclient         // TCP通讯的客户端类。
{
private:
  int m_clientfd;        // 客户端的socket，-1表示未连接或连接已断开；>=0表示有效的socket。
  string m_ip;           // 服务端的IP/域名。
  unsigned short m_port; // 通讯端口。
public:
  ctcpclient():m_clientfd(-1) {}

  // 向服务端发起连接请求，成功返回true，失败返回false。
  bool connect(const string &in_ip,const unsigned short in_port)
  {
    if (m_clientfd!=-1) return false; // 如果socket已连接，直接返回失败。

    m_ip=in_ip; m_port=in_port;       // 把服务端的IP和端口保存到成员变量中。

    // 第1步：创建客户端的socket。
    if ( (m_clientfd = socket(AF_INET,SOCK_STREAM,0))==-1) return false;

    // 第2步：向服务器发起连接请求。
    struct sockaddr_in servaddr;               // 用于存放协议、端口和IP地址的结构体。
    memset(&servaddr,0,sizeof(servaddr));
    servaddr.sin_family = AF_INET;             // ①协议族，固定填AF_INET。
    servaddr.sin_port = htons(m_port);         // ②指定服务端的通信端口。

    struct hostent* h;                         // 用于存放服务端IP地址(大端序)的结构体的指针。
    if ((h=gethostbyname(m_ip.c_str()))==nullptr ) // 把域名/主机名/字符串格式的IP转换成结构体。
    {
      ::close(m_clientfd); m_clientfd=-1; return false;
    }
    memcpy(&servaddr.sin_addr,h->h_addr,h->h_length); // ③指定服务端的IP(大端序)。

    // 向服务端发起连接清求。
    if (::connect(m_clientfd,(struct sockaddr *)&servaddr,sizeof(servaddr))==-1) //防止与类成员函数同名，强制调用全局 Socket API。
    {
      ::close(m_clientfd); m_clientfd=-1; return false;
    }

    return true;
  }

  // 向服务端发送报文，成功返回true，失败返回false。
  bool send(const string &buffer)   // buffer不要用const char *      用string可以传C风格的字符串也能传string。
  {
    if (m_clientfd==-1) return false; // 如果socket的状态是未连接，直接返回失败。

    if ((::send(m_clientfd,buffer.data(),buffer.size(),0))<=0) return false;

    return true;
  }

  // 接收服务端的报文，成功返回true，失败返回false。
  // buffer-存放接收到的报文的内容，maxlen-本次接收报文的最大长度。
  bool recv(string &buffer,const size_t maxlen)
  { // 如果直接操作string对象的内存，必须保证：1)不能越界；2）操作后手动设置数据的大小。
    buffer.clear();         // 清空容器。
    buffer.resize(maxlen);  // 设置容器的大小为maxlen。
    int readn=::recv(m_clientfd,&buffer[0],buffer.size(),0);  // 直接操作buffer的内存。
    if (readn<=0) { buffer.clear(); return false; }
    buffer.resize(readn);   // 重置buffer的实际大小。

    return true;
  }

  // 断开与服务端的连接。
  bool close()
  {
    if (m_clientfd==-1) return false; // 如果socket的状态是未连接，直接返回失败。

    ::close(m_clientfd);
    m_clientfd=-1;
    return true;
  }

 ~ctcpclient(){ close(); }
};

int main(int argc,char *argv[])
{
  if (argc!=3)
  {
    cout << "Using:./demo7 服务端的IP 服务端的端口\nExample:./demo7 192.168.101.138 5005\n\n";
    return -1;
  }

  ctcpclient tcpclient;
  if (tcpclient.connect(argv[1],atoi(argv[2]))==false)  // 向服务端发起连接请求。
  {
    perror("connect()"); return -1;
  }

  // 第3步：与服务端通讯，客户发送一个请求报文后等待服务端的回复，收到回复后，再发下一个请求报文。
  string buffer;
  for (int ii=0;ii<10;ii++)  // 循环3次，将与服务端进行三次通讯。
  {
    buffer="这是第"+to_string(ii+1)+"个超级女生，编号"+to_string(ii+1)+"。";
    // 向服务端发送请求报文。
    if (tcpclient.send(buffer)==false)
    {
      perror("send"); break;
    }
    cout << "发送：" << buffer << endl;

    // 接收服务端的回应报文，如果服务端没有发送回应报文，recv()函数将阻塞等待。
    if (tcpclient.recv(buffer,1024)==false)
    {
      perror("recv()"); break;
    }
    cout << "接收：" << buffer << endl;

    sleep(1);
  }
}
```

服务端：

```cpp
/*
 * 程序名：demo8.cpp，此程序用于演示封装socket通讯的服务端
*/
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <unistd.h>
#include <netdb.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
using namespace std;

class ctcpserver         // TCP通讯的服务端类。
{
private:
  int    m_listenfd;        // 监听的socket，-1表示未初始化。
  int    m_clientfd;        // 客户端连上来的socket，-1表示客户端未连接。
  string m_clientip;        // 客户端字符串格式的IP。
  unsigned short m_port;    // 服务端用于通讯的端口。
public:
  ctcpserver():m_listenfd(-1),m_clientfd(-1) {}

  // 初始化服务端用于监听的socket。
  bool initserver(const unsigned short in_port)
  {
    // 第1步：创建服务端的socket。
    if ( (m_listenfd=socket(AF_INET,SOCK_STREAM,0))==-1) return false;

    m_port=in_port;

    // 第2步：把服务端用于通信的IP和端口绑定到socket上。
    struct sockaddr_in servaddr;                // 用于存放协议、端口和IP地址的结构体。
    memset(&servaddr,0,sizeof(servaddr));
    servaddr.sin_family=AF_INET;                // ①协议族，固定填AF_INET。
    servaddr.sin_port=htons(m_port);            // ②指定服务端的通信端口。
    servaddr.sin_addr.s_addr=htonl(INADDR_ANY); // ③如果操作系统有多个IP，全部的IP都可以用于通讯。

    // 绑定服务端的IP和端口（为socket分配IP和端口）。
    if (bind(m_listenfd,(struct sockaddr *)&servaddr,sizeof(servaddr))==-1)
    {
      close(m_listenfd); m_listenfd=-1; return false;
    }

    // 第3步：把socket设置为可连接（监听）的状态。
    if (listen(m_listenfd,5) == -1 )
    {
      close(m_listenfd); m_listenfd=-1; return false;
    }

    return true;
  }

  // 受理客户端的连接（从已连接的客户端中取出一个客户端），
  // 如果没有已连接的客户端，accept()函数将阻塞等待。
  bool accept()
  {
    struct sockaddr_in caddr;        // 客户端的地址信息。
    socklen_t addrlen=sizeof(caddr); // struct sockaddr_in的大小。
    if ((m_clientfd=::accept(m_listenfd,(struct sockaddr *)&caddr,&addrlen))==-1) return false;

    m_clientip=inet_ntoa(caddr.sin_addr);  // 把客户端的地址从大端序转换成字符串。

    return true;
  }

  // 获取客户端的IP(字符串格式)。
  const string & clientip() const
  {
    return m_clientip;
  }

  // 向对端发送报文，成功返回true，失败返回false。
  bool send(const string &buffer)
  {
    if (m_clientfd==-1) return false;

    if ( (::send(m_clientfd,buffer.data(),buffer.size(),0))<=0) return false;

    return true;
  }

  // 接收对端的报文，成功返回true，失败返回false。
  // buffer-存放接收到的报文的内容，maxlen-本次接收报文的最大长度。
  bool recv(string &buffer,const size_t maxlen)
  {
    buffer.clear();         // 清空容器。
    buffer.resize(maxlen);  // 设置容器的大小为maxlen。
    int readn=::recv(m_clientfd,&buffer[0],buffer.size(),0);  // 直接操作buffer的内存。
    if (readn<=0) { buffer.clear(); return false; }
    buffer.resize(readn);   // 重置buffer的实际大小。

    return true;
  }

  // 关闭监听的socket。
  bool closelisten()
  {
    if (m_listenfd==-1) return false;

    ::close(m_listenfd);
    m_listenfd=-1;
    return true;
  }

  // 关闭客户端连上来的socket。
  bool closeclient()
  {
    if (m_clientfd==-1) return false;

    ::close(m_clientfd);
    m_clientfd=-1;
    return true;
  }

 ~ctcpserver() { closelisten(); closeclient(); }
};

int main(int argc,char *argv[])
{
  if (argc!=2)
  {
    cout << "Using:./demo8 通讯端口\nExample:./demo8 5005\n\n";   // 端口大于1024，不与其它的重复。
    cout << "注意：运行服务端程序的Linux系统的防火墙必须要开通5005端口。\n";
    cout << "      如果是云服务器，还要开通云平台的访问策略。\n\n";
    return -1;
  }

  ctcpserver tcpserver;
  if (tcpserver.initserver(atoi(argv[1]))==false) // 初始化服务端用于监听的socket。
  {
    perror("initserver()"); return -1;
  }

  // 受理客户端的连接（从已连接的客户端中取出一个客户端），
  // 如果没有已连接的客户端，accept()函数将阻塞等待。
  if (tcpserver.accept()==false)
  {
    perror("accept()"); return -1;
  }
  cout << "客户端已连接(" << tcpserver.clientip() << ")。\n";

  string buffer;
  while (true)
  {
    // 接收对端的报文，如果对端没有发送报文，recv()函数将阻塞等待。
    if (tcpserver.recv(buffer,1024)==false)
    {
      perror("recv()"); break;
    }
    cout << "接收：" << buffer << endl;

    buffer="ok";
    if (tcpserver.send(buffer)==false)  // 向对端发送报文。
    {
      perror("send"); break;
    }
    cout << "发送：" << buffer << endl;
  }
}
```

## TCP相关知识

三次握手：

下面这张图中展示了三次握手过程。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260610121745517.png" alt="image-20260610121745517" style="zoom:50%;" />

SYN是Synchronization的简写，表示收发数据前传输的同步消息。

ACK：表示确认消息

第一步：客户端主动发起connect，SYN J：传输的数据包序号是J。此时connect函数进入阻塞状态，socket进入SYN_SENT状态。

第二步：向客户端传输的数据包序号是K，ACK为J+1，表示对数据包J的确认，告知客户端你需要给我发送序号为J+1的数据包。服务器进入SYN_RECV状态。（服务器调用accept函数，处理连接请求。这句话是错的。）

第三步：客户端传输序号为J+1的数据包，ACK为K+1。客户端接收到该消息并把数据包塞进网卡准备发出去的一瞬间connect函数返回，进入ESTABLISHED状态。服务端接收到该数据包，进入ESTABLISHED状态。

>  当调用了 `listen` 之后，监听 socket 就进入了工作状态。从这一刻起，只要有客户端连过来，**内核会自动替你完成三次握手**，完全不需要你的程序参与。
>
> 内核为此维护了**两个队列**：
>
> 第一个是**半连接队列**（SYN 队列）。客户端发来 SYN，内核回 SYN-ACK，此时这条连接还没握手完，就先放在这个队列里，状态是 `SYN_RECV`。
>
> 第二个是**全连接队列**（也叫 accept 队列）。当客户端发来最后那个 ACK、三次握手彻底完成后，内核就把这条连接从半连接队列**挪到全连接队列**里，状态变成 `ESTABLISHED`。
>
> 到这里，连接已经是完整建立好的了——**而你的程序可能还没调用 `accept()`，甚至还在睡觉。**如果此时客户端向服务端发送数据，数据会被放到内核的接收缓冲区中。
>
> 那 `accept()` 到底干嘛的？它的作用仅仅是：从全连接队列里**取出**一条已经建好的连接，返回一个新的 socket 给你的程序去通讯。如果队列是空的，`accept()` 就阻塞等待。所以 `accept()` 是"取货"，货（已建立的连接）是内核早就备好放在队列里的。

可以测试一下，在服务端accept函数前加一个sleep，然后运行客户端、服务端。用命令`netstat -na`：可以查看socket的状态。会显示ESTABLISHED，表明连接已建立。

命令`netstat -na`的详细信息：

Proto 表示协议类型，Recv-Q 和 Send-Q 表示接收缓冲区和发送缓冲区（对于listen状态的socket，`Recv-Q` 表示的就是全连接队列的个数），Local Address  和 Foreign Address 表示本地和远端的地址信息（IP+端口号），State 表示socket状态。

三次握手的更多细节：

1）客户端的socket也有端口号，对程序员来说，不必关心客户端socket的端口号，所以系统随机分配。（socket通讯中的地址包括ip和端口号，但是，习惯中的地址仅指ip地址）

2）服务端的bind()函数，普通用户只能使用1024以上的端口，root用户可以使用任意端口。

3）listen()函数的第二个参数+1为已连接队列（ESTABLISHED状态，三次握手已完成但是没有被accept()的socket，只存在于服务端）的大小。当已连接队列满了，又有新的客户端发送连接请求，内核会如何处理？

经过实验会发现，如下图所示，socket状态为SYN_RECV。也就是服务端给客户端发送ACK消息后变成的状态。客户端再发来最后的 ACK，正常情况下内核会把这条连接"升级"为 `ESTABLISHED`，并挪进**全连接队列**等着被 accept。但由于队列满了，默认情况下（由内核参数 `tcp_abort_on_overflow = 0` 控制），内核的处理是：**把客户端发来的那个 ACK 直接丢弃，假装没收到，于是这条连接就一直停留在 `SYN_RECV` 状态升不上去。之后内核会启动重传：过一会儿没等到"有效的 ACK"，它就重发 SYN-ACK（重传次数由 `tcp_synack_retries` 控制），如果重发之后客户端再回个 ACK、而那时全连接队列恰好被 accept 腾出空位了，这条连接就能顺利升级。如果重传若干次后队列始终满着，内核最终就放弃，把这条 `SYN_RECV` 连接清掉。**如果把 `tcp_abort_on_overflow` 设成 1，内核遇到这种"队列满、ACK 来了却放不下"的情况，就不会让它卡在 `SYN_RECV` 了，而是直接给客户端回一个 RST，把连接干脆利落地拒掉。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260610125741149.png" alt="image-20260610125741149" style="zoom:50%;" />

4）SYN_RECV状态的连接也称为半连接。

5）CLOSED是假想状态，实际上不存在。

四次挥手：

FIN：表示断开连接。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204124621076.png" alt="image-20251204124621076" style="zoom: 33%;" />

 四次挥手的第二三步为什么不能合并在一块。因为服务器可能还有数据没有传输。所以回应完客户端的断开连接请求后，需要再进行数据传输，数据传输完再给客户端发断开服务端->客户端这一路径的连接请求。

四次挥手细节：

1）主动断开的端在四次挥手后，socket的状态为TIME_WAIT，该状态将持续2MSL（30秒/1分钟/2分钟）。 MSL（Maximum Segment Lifetime）报文在网络上存在的最长时间，超过这个时间报文将被丢弃。

2）如果是服务端主动断开，有两方面的危害：a）socket没有立即释放；b）端口号只能在2MSL后才能重用。（setsocketopt函数可以设置socket的属性，解决服务端2MSL状态下端口无法重用的问题。）

```cpp
//放到bind前。
int opt = 1;
setsockopt(m_listenfd,SOL_SOCKET,SO_REUSEADDR,&opt,sizeof(opt));
```

3）如果是客户端主动断开，TIME_WAIT状态的socket几乎不会造成危害。a）客户端程序的socket很少，服务端程序的socket很多（成千上万）；b）客户端的端口是随机分配的，不存在重用的问题。

TCP 是一种面向连接的、可靠的，基于字节流的传输层通信协议。为两台主机提供高可靠性的数据通信服务。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173103195.png" alt="image-20251203173103195" style="zoom:50%;" /><img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173118950.png" alt="image-20251203173118950" style="zoom: 42%;" />

#### 缓冲区

TCP协议的数据没有数据边界，比如服务端调用了1次write函数传输了40个字节的数据，客户端可能调用了4次read函数，每次读取10个字节。读取10个字节的时候，剩下的30个字节在哪？

答案是输入缓冲区。每个套接字维护了两个缓存：输入缓冲（接收缓冲）、输出缓冲（发送缓冲）。![image-20260310090258374](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260310090258374.png)

* I/O缓冲在每个TCP套接字中单独存在。
* I/O缓冲在创建套接字时自动生成。
* 即使关闭套接字也会继续传递输出缓冲中遗留的数据。
* 关闭套接字将丢失输入缓冲中的数据。

系统为每个socket创建了发送缓冲区和接收缓冲区，应用程序调用send()/write()函数发送数据的时候，内核把数据从应用进程拷贝socket的发送缓冲区中；应用程序调用recv()/read()函数接收数据的时候，内核把数据从socket的接收缓冲区拷贝应用进程中。

发送数据就是把数据放入发送缓冲区；接收数据就是从接收缓冲区中读数据。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260610131158780.png" alt="image-20260610131158780" style="zoom: 25%;" />

> 需要明白一个知识点，调用write函数/send函数并不会把数据直接传输到接收端，而是拷贝到输入缓冲。至于什么时候发给对方，操作系统说了算。调用read函数/recv函数也并不会直接读接收端发过来的数据，而是读取输入缓冲中的数据。

| write函数返回的时间点                                        |
| ------------------------------------------------------------ |
| write函数并不会在完成向对方主机的数据传输时返回，而是在数据移到输出缓冲时。但TCP会保证对输出缓冲数据的传输。 |

那么，下面这种情况会引发什么事情？

> “客户端输入缓冲为50字节，而服务器端传输了100字节。”

结论：

> “不会发生超过输入缓冲大小的数据传输。”

因为TCP会控制数据流。TCP中有滑动窗口协议（Sliding Window）协议，用对话方式呈现如下。

> 套接字A：“你好，最多可以向我传递50字节。”
>
> 套接字B：“OK！”
>
> 套接字A：“我腾出了20字节的空间，最多可以收70字节。”
>
> 套接字B：“OK！”

数据收发也是如此，因此TCP中不回因为缓冲溢出而丢失数据。

补充两个问题：

* send()函数有可能会阻塞吗？

  >  自己的发送缓冲区满了，放不下要发的数据，send就会阻塞。
  >
  > 还有一种情况：当接收缓冲区快满的时候，由于接收窗口机制，发送缓冲区发送的数据不能超过该窗口大小，接收缓冲区变满，窗口变0。此时发送缓冲区的数据不能发送出去了，send就会把发送缓冲区填满，填满之后send就会阻塞。

* 向socket中写入数据后，如果关闭了socket，对端还能接收到数据吗？

  > 比如看这样一个场景，服务端在accpet前加个sleep，客户端和服务端建立三次握手，之后客户端发送数据。然后关闭socket。服务端sleep完之后，accept并且recv，可以收到数据。因为客户端发来的数据被放到了接收缓冲中。recv是从接收缓冲中读取数据。





## 基于UDP的socket

下面通过信件说明UDP的工作原理，这是讲解UDP时使用的传统示例，它与UDP特性完全相符。寄信前应先在信封上填写寄信人和收信人的地址，之后贴上邮票放进邮筒即可。当然，**信件的特点使我们无法确认对方是否收到。**另外，邮寄过程中也可能发生信件丢失的情况。也就是说**信件是一种不可靠的传输方式**。与之类似，UDP提供的同样是不可靠的数据传输服务。

如果只考虑可靠性，TCP的确比UDP好。但UDP的结构上比TCP更简洁。UDP不会发送类似ACK的应答消息，也不会像SEQ那样给数据包分配序号。因此，UDP的性能有时比TCP高出很多。编程中实现UDP也比TCP简单。另外，UDP的可靠性虽比不上TCP，但也不会像想象中那么频繁地发生数据损毁。因此，**在更重视性能而非可靠性的情况下，UDP是一种很好的选择。**

由于UDP在传输数据前不需要建立连接，所以不用调用listen、accept函数。

![image-20260310101458339](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260310101458339.png)

另外在TCP中套接字之间是一对一的关系，要向10个客户端提供服务，除掉需要进行监听的lfd外，服务端需要10个cfd。而在UDP中套接字之间是一对多的关系，向10个客户端提供服务，服务端只需要1个套接字。

TCP建立连接后，传输数据时不需要再添加地址信息。（这是因为建立连接后会为这个socket创建一个TCP控制块，存放了四元组{本地IP, 本地端口, 目标IP, 目标端口}，调用write函数时内核会自动从TCP块中将目的IP和端口填到数据的IP报文和TCP报文头部。）而UDP每次传输数据时都需要手动添加地址信息。

基于UDP的Socket涉及的重要函数：

`ssize_t sendto(int sockfd, void* buff, size_t nbytes, int flags, struct sockaddr* to, socklen_t addrlen)`

* buff:要发送的数据的内存地址
* nbytes:发送的字节数
* flags：设置为0即可
* to：目标对象的地址结构体
* addrlen：结构体的长度
* 成功返回传输的字节数，失败返回-1，设置errno



`ssize_t recvfrom(int sockfd, void* buff, size_t nbytes, int flags, struct sockaddr* from, socklen_t *addrlen)`

* buff：用来存放接收到的数据
* nbytes：buf的最大容量 也就是一次最多能读取多少数据
* flags：设置为0
* from：传出参数，会被填入发送方的地址结构
* addrlen：传入传出参数、
* 成功返回接收的字节数，失败返回-1，设置errno

### UDP案例

> 由于UDP在传输数据前不需要先建立连接，所以从某种意义（发送连接请求的就是客户端）上来说无法区分服务端和客户端。

服务端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char *argv[])
{
	int serv_sock;
	char message[BUF_SIZE];
	int str_len;
	socklen_t clnt_adr_sz;

	struct sockaddr_in serv_adr, clnt_adr;
	if(argc != 2){
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	serv_sock = socket(PF_INET, SOCK_DGRAM, 0);	// 为了创建UDP套接字，第二个参数传递SOCK_DGRAM
	if(serv_sock == -1)
		error_handling("UDP socket creation error");

	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));
	
	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("bind() error");
	
	while(1)
	{
		clnt_adr_sz = sizeof(clnt_adr);
		str_len = recvfrom(serv_sock, message, BUF_SIZE - 1, 0,	//利用33行分配的地址接收数据，不限制数据传输对象。
			       	(struct sockaddr*)&clnt_adr, &clnt_adr_sz);
		sendto(serv_sock, message, str_len, 0,				//通过第39行的函数调用同时获取数据传输端的地址。正是利用该地址将接收的数据逆向重传
				(struct sockaddr*)&clnt_adr, clnt_adr_sz);
	}
	close(serv_sock);	//第36行的while内部从未加入break语句，因此是无限循环。也就是说，close函数不会执行，没有太大意义。
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

客户端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int sock;
	char message[BUF_SIZE];
	int str_len;
	socklen_t adr_sz;

	struct sockaddr_in serv_adr, from_adr;
	if(argc != 3)
	{
		printf("Usage : %s <IP> <port>\n", argv[0]);
		exit(1);
	}

	sock = socket(PF_INET, SOCK_DGRAM, 0);
	if(sock == -1)
		error_handling("socket() error");

	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_adr.sin_port = htons(atoi(argv[2]));

	while(1)
	{
		fputs("Insert messgae(q) to quit): ", stdout);
		fgets(message, sizeof(message), stdin);
		if(!strcmp(message, "q\n") || !strcmp(message, "Q\n"))
			break;

		sendto(sock, message, strlen(message), 0,
				(struct sockaddr*)&serv_adr, sizeof(serv_adr));
		adr_sz = sizeof(from_adr);
		str_len = recvfrom(sock, message, BUF_SIZE - 1, 0,
			       	(struct sockaddr*)&from_adr, &adr_sz);
		message[str_len] = 0;
		printf("Message from server: %s", message);
	}
	close(sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

> 我们知道在TCP中调用connect函数时会给客户端套接字自动分配IP地址和端口。UDP中没有connect函数，那么什么时候会分配IP地址和端口？
>
> 答：在调用sendto函数时。

### UDP存在数据边界

UDP是具有数据边界的协议，传输中调用I/O函数的次数非常重要。因此，输入函数的调用次数应和输出函数的调用次数完全一致，这样才能保证接收全部已发送数据。例如，调用3次输出函数发送的数据必须通过调用3次输入函数才能接收完。下面通过简单示例进行验证。

服务端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int sock;
	char message[BUF_SIZE];
	struct sockaddr_in my_adr, your_adr;
	socklen_t adr_sz;
	int str_len, i;

	if(argc != 2){
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	sock = socket(PF_INET, SOCK_DGRAM, 0);
	if(sock == -1)
		error_handling("socket() error");

	memset(&my_adr, 0, sizeof(my_adr));
	my_adr.sin_family = AF_INET;
	my_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	my_adr.sin_port = htons(atoi(argv[1]));

	if(bind(sock, (struct sockaddr*)&my_adr, sizeof(my_adr)) == -1 )
		error_handling("bind() error");

	for(i = 0; i < 3; i++)
	{
		sleep(5);	//delay 5 sec.
		adr_sz = sizeof(your_adr);
		str_len = recvfrom(sock, message, BUF_SIZE, 0,
				(struct sockaddr*)&your_adr, &adr_sz);

		printf("Message %d: %s \n", i + 1, message);
	}
	close(sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

客户端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int sock;
	char msg1[] = "Hi!";
	char msg2[] = "I'm another UDP host!";
	char msg3[] = "Nice to meet you";

	struct sockaddr_in your_adr;
	socklen_t you_adr_sz;
	if(argc != 3)
	{
		printf("Usage: %s <IP> <port>\n", argv[0]);
		exit(1);
	}

	sock = socket(PF_INET, SOCK_DGRAM, 0);
	if(sock == -1)
		error_handling("sock() error");

	memset(&your_adr, 0, sizeof(your_adr));
	your_adr.sin_family = AF_INET;
	your_adr.sin_addr.s_addr = inet_addr(argv[1]);
	your_adr.sin_port = htons(atoi(argv[2]));

	sendto(sock, msg1, sizeof(msg1), 0, (struct sockaddr*)&your_adr,
			sizeof(your_adr));
	sendto(sock, msg2, sizeof(msg2), 0, (struct sockaddr*)&your_adr,
			sizeof(your_adr));
	sendto(sock, msg3, sizeof(msg3), 0, (struct sockaddr*)&your_adr,
			sizeof(your_adr));
	close(sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

**程序分析：**因为服务端在调用recvfrom之前sleep了五秒，客户端发送的三次数据肯定都到达了服务端，如果是TCP的话只需要调用一次read函数即可读取所有数据；而UDP需要调用三次recvfrom函数。

运行结果：服务端调用了三次recvfrom函数。

![image-20260310105914860](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260310105914860.png)

> 拓展：数据报
>
> ![image-20260310104305278](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260310104305278.png)

### connected UDP套接字和unconnected UDP套接字

sendto函数传输数据的过程分为如下三个阶段：

* 向UDP套接字注册目标IP和端口号

* 传输数据。

* 删除UDP套接字中注册的目标地址信息。

每次调用sendto函数时重复上述过程。每次都要变更目标地址，因此可以重复利用同一UDP套接字向不同目标传输数据。

这种未注册目标信息的套接字称为未连接套接字，反之，注册了目标地址的套接字称为连接connected套接字。显然，UDP套接字默认属于未连接套接字。但UDP套接字在下述情况下显得不太合理：

> 为IP是211.210.147.82的主机82号端口共准备了3个数据，调用3次sendto函数进行传输。

每次传输数据后都需要删除注册的目标地址信息，这样效率太低了。因为我明明是跟同一个主机在传输数据。为了解决这一个问题，我们可以调用connect函数。调用该函数不意味着要和对方的UDP建立连接，这只是向UDP套接字注册目标IP和端口。

```cpp
sock = socket(PF_INET, SOCK_DGRAM, 0);
memset(&adr, 0, sizeof(adr));
adr.sin_family = AF_INET;
adr.sin_addr.s_addr = ......
adr.sin_adr_port = ......
connect(sock, (struct sockaddr*)&adr, sizeof(adr));
```

之后就与TCP套接字一样，每次调用sendto函数时只需传输数据。因为已经指定了收发对象，所以不仅可以使用sendto、recvfrom函数，还可以使用write、read函数进行通信。

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc , char * argv[])
{
	int sock;
	char message[BUF_SIZE];
	int str_len;
	socklen_t adr_sz;

	struct sockaddr_in serv_adr, from_adr;
	if(argc != 3){
		printf("Usage: %s <IP> <port>\n", argv[0]);
		exit(1);
	}
	
	sock = socket(sock, SOCK_DGRAM, 0);
	if(sock == -1)
		error_handling("socket() error");

	memset(&serv_adr, 0, sizeof(serv_adr) );
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_adr.sin_port = htons(atoi(argv[2]));

	connect(sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr));

	while(1)
	{
		fputs("Insert message(q to quit): ", stdout);
		fgets(message, sizeof(message), stdin);
		if(!strcmp(message, "q\n") || !strcmp(message, "Q\n"))
			break;
		/*
		  sendto(sock, message, strlen(message), 0, 
		  	(struct sockaddr*)&serv_adr, sizeof(serv_adr));
		*/

		write(sock, message, strlen(message));
		/*
		 adr_sz = sizeof(from_adr);
		 str_len = recvfrom(sock, message, BUF_SIZE, 0,
		 	(struct sockaddr*)&from_adr, &adr_sz);
		*/
		str_len = read(sock, message, sizeof(message) - 1);
		message[str_len] = 0;
		printf("Message from server: %s",message);
	}
	close(sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

## 半关闭

Linux中的close函数会同时断开这两个流，可能会存在问题。比如客户端发完数据之后断开了连接，之后客户端就无法接收服务端传输的数据。

我们可以引入半关闭的概念，也就是关闭发送但不关闭接收；或者关闭接收，但不关闭发送，只断开两个流中的其中一个。

![image-20260311090156369](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260311090156369.png)

半关闭函数：

`int shutdown(int sockfd, int howto)`

* 成功返回0，失败返回-1。
* howto的取值：SHUT_RD SHUT_WR SHUT_RDWR

若向shutdown的第二个参数传递`SHUT_RD`，则断开输入流，套接字无法接收数据。即使输入缓冲收到的数据也会抹去，而且无法调用输入相关函数。

如果向shutdown函数的第二个参数传递`SHUT_WR`，则中断输出流，也就无法传输数据。但如**果输出缓冲还留有未传输的数据，则将传递至目标主机。**

最后，若传入`SHUT_RDWR`，则同时中断I/O流。这相当于分2次调用shutdown，其中一次以SHUT_RD为参数，另一次以SHUT_WR为参数。

shutdown没有引用计数，close有引用计数。父进程fork子进程后，子进程调用close只会关闭套接字的一个文件描述符，只有父进程也调用close才可以关闭文件描述符。。而调用一次shutdown函数就可以关闭套接字。

### 基于半关闭的文件传输

假设有一个场景：“一旦客户端连接到服务器端，服务器端就将约定的文件传给客户端，客户端收到后发送字符串‘Thank you’给服务器端。”由于客户端不知道要接收数据到什么时候，可能会一直调用read函数，导致程序阻塞。我们可以规定文件传输结束符EOF。服务器端发送完数据后，就传递EOF代表文件传输结束。客户端通过**函数返回值**接收EOF，这样可以避免与文件内容冲突。

断开输出流时会自动向对方主机传输EOF。当然调用close函数也会向对方发送EOF，但这样服务端就无法收到客户端最后的“Thank you”。

> 如何理解加粗的函数返回值：当服务器端发送完数据并调用 close() 或 shutdown() 关闭连接时，底层的 TCP 协议会发送一个 FIN 包。客户端的操作系统收到这个包后，再调用 read() 时，read函数就会返回 0。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260311091622584.png" alt="image-20260311091622584" style="zoom:50%;" />

服务端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int serv_sd, clnt_sd;
	FILE * fp;
	char buf[BUF_SIZE];
	int read_cnt;

	struct sockaddr_in serv_adr, clnt_adr;
	socklen_t clnt_adr_sz;

	if(argc != 2){
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	fp = fopen("file_server.c", "rb");	//打开文件，以向客户端传输文件file_server.c
	serv_sd = socket(PF_INET, SOCK_STREAM, 0);

	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	bind(serv_sd, (struct sockaddr*)&serv_adr, sizeof(serv_adr));
	listen(serv_sd, 5);

	clnt_adr_sz = sizeof(clnt_adr);
	clnt_sd = accept(serv_sd, (struct sockaddr*)&clnt_adr, &clnt_adr_sz);

	while(1)
	{
		read_cnt = fread((void*)buf, 1, BUF_SIZE, fp);	// 每次最多从fp中读取30个字节
		if(read_cnt < BUF_SIZE)	//若不满30字节，说明最后的数据，将由最后一次write传输完成。
		{
			write(clnt_sd, buf, read_cnt);
			break;
		}
		write(clnt_sd, buf, BUF_SIZE);
	}

	shutdown(clnt_sd, SHUT_WR);	//关闭输出流，依然可以通过输入流接收数据。
    int strlen = read(clnt_sd, buf, BUF_SIZE - 1);
    if (strlen > 0) 
    {
		buf[BUF_SIZE] = '\0';
        printf("Message from client: %s \n", buf);
    }
    //memset(buf, 0, BUF_SIZE);//将buf清空
	//read(clnt_sd, buf, BUF_SIZE - 1);
	//printf("Message from client: %s \n", buf); //printf遇到0时才会结束打印。

	fclose(fp);
	close(clnt_sd);
	close(serv_sd);
	return 0;
}

void error_hadnling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

客户端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int sd;
	FILE * fp;

	char buf[BUF_SIZE];
	int read_cnt;
	struct sockaddr_in serv_adr;
	if(argc != 3){
		printf("Usage: %s <IP> <port>\n", argv[0]);
		exit(1);
	}

	fp = fopen("receive.dat", "wb");	//创建新文件以保存服务器端传输的文件数据。
	sd = socket(PF_INET, SOCK_STREAM, 0);

	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_adr.sin_port = htons(atoi(argv[2]));

	connect(sd, (struct sockaddr*)&serv_adr, sizeof(serv_adr));

	while((read_cnt = read(sd, buf, BUF_SIZE )) != 0)	//当遇到文件结束尾，返回值为0，停止read函数调用
		fwrite((void * )buf, 1, read_cnt, fp);

	puts("Received file data");
	write(sd, "Thank you", 10); // 最后向服务端传输数据，此时服务端处于半关闭状态，输出流关闭但输入流打开，仍可接收数据。
	fclose(fp);
	close(sd);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

## 域名

域名转换IP函数：

```cpp
#include<netdb.h>
struct hostent * gethostbyname(const char * hostname);
```

* 成功时返回hostent结构体地址，失败时返回NULL指针。
* IP地址被存放到了hostent结构体中。

```cpp
struct hostent
{
	char * h_name;		//official name
	char ** h_aliases;	//alias list 可以通过多个域名访问同一主页。同一IP可以绑定多个域名，因此，除官方域名外还可指定其他域名（可以看成官方域名的别名）。
	int h_addrtype;		//host address type
	int h_length;		//address length
	char ** h_addr_list; //address list 只需关注这个 一个域名可以绑定多个IP地址，利用服务器的负载均衡。
}
```

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260311102328602.png" alt="image-20260311102328602" style="zoom:50%;" />

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<netdb.h>
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int i;
	struct hostent * host;
	if(argc != 2){
		printf("Usage : %s <addr>\n", argv[0]);
		exit(1);
	}

	host = gethostbyname(argv[1]);
	if(!host)
		error_handling("gethost... error");

	printf("Official name: %s \n", host->h_name);//%s 需要的是一个指针
	for(i = 0; host->h_aliases[i]; i++)//循环体的循环条件为什么可以这样写？因为h_aliases数组最后一个元素是NULL，也就是0。
		printf("Aliases %d: %s \n", i + 1, host->h_aliases[i]);//->的优先级和[]一样，从左往右读。
	printf("Address type: %s \n",
			(host->h_addrtype == AF_INET)?"AF_INET": "AF_INET6");
	for(i = 0; host->h_addr_list[i]; i++)
        //inet_ntoa把网络字节序转化成点分十进制
		printf("IP addr %d: %s\n", i + 1,
				inet_ntoa(*(struct in_addr*)host->h_addr_list[i]));
	return 0;
}

void error_handling(char *message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

注意上述代码有几个细节：

第一个：h_aliases是一个二级指针，指向一个数组，这个数组里面存放的是地址（一级指针）。如何得到这个数组中的元素，用`h_aliases[i]`即可。

第二个：为什么需要`inet_ntoa(*(struct in_addr*)host->h_addr_list[i]));`强制类型转换。看下面这张图即可。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260311104038366.png" alt="image-20260311104038366" style="zoom:50%;" />



IP转换域名函数：

`struct hostent * gesthostbyaddr(const char * addr, socklen_t len, int family) ;`

* 成功时返回hostent结构体变量地址值，失败时返回NULL指针。

* 参数1：`addr`，含有IP地址信息的`in_addr`结构体指针。 为了同时传递IPv4地址之外的其他信息，该变量的类型声明为char指针。

* 参数2：`len`，向第一个参数传递的地址信息的字节数，IPv4时为4，IPv6时为16。

* 参数3：family，传递地址族信息，IPv4时为AF_INET，IPv6时为AF_INET6。

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<netdb.h>
void error_handling(char * message);
// ip转化成域名
int main(int argc, char * argv[])
{
	int i;
	struct hostent * host;
	struct sockaddr_in addr;
	if(argc != 2){
		printf("Usage: %s <IP>\n", argv[0]);
		exit(1);
	}

	memset(&addr, 0, sizeof(addr));	
	addr.sin_addr.s_addr = inet_addr(argv[1]);
       	host = gethostbyaddr((char*)&addr.sin_addr, 4, AF_INET);
	if(!host)
		error_handling("gethost... error");

	printf("Official name: %s \n", host->h_name);
	for(i = 0; host->h_aliases[i]; i++)
		printf("Aliases %d: %s", i + 1, host->h_aliases[i]);
	printf("Address type: %s \n", 
			(host->h_addrtype == AF_INET)? "AF_INET": "AF_INET6");
	for(i = 0; host->h_addr_list[i]; i++)
		printf("IP addr %d: %s\n", i + 1,
				inet_ntoa(*(struct in_addr*)host->h_addr_list[i]));
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

## 套接字特性

套接字可以通过可选项来修改特性。

| 协议层      | 选项名            | 读取 | 设置 |
| ----------- | ----------------- | ---- | ---- |
| SOL_SOCKET  | SO_SNDBUF         | O    | O    |
| SOL_SOCKET  | SO_RCVBUF         | O    | O    |
| SOL_SOCKET  | SO_REUSERADDR     | O    | O    |
| SOL_SOCKET  | SO_KEEPALIVE      | O    | O    |
| SOL_SOCKET  | SO_BROADCAST      | O    | O    |
| SOL_SOCKET  | SO_DONTROUTE      | O    | O    |
| SOL_SOCKET  | SO_OOBINLINE      | O    | O    |
| SOL_SOCKET  | SO_ERROR          | O    | X    |
| SOL_SOCKET  | SO_TYPE           | O    | X    |
| IPPROTO_IP  | IP_TOS            | O    | O    |
| IPPROTO_IP  | IP_TTL            | O    | O    |
| IPPROTO_IP  | IP_MULTICAST_TTL  | O    | O    |
| IPPROTO_IP  | IP_MULTICAST_LOOP | O    | O    |
| IPPROTO_IP  | IP_MULTICAST_IF   | O    | O    |
| IPPROTO_TCP | TCP_KEEPALIVE     | O    | O    |
| IPPROTO_TCP | TCP_NODELAY       | O    | O    |
| IPPROTO_TCP | TCP_MAXSEG        | O    | O    |

### getsockopt和setsockopt函数

我们几乎可以针对上表中的所有可选项进行读取（Get）和设置（Set）（有些可选项只能进行一种操作）。可选项的读取和设置通过如下2个函数完成。(系统底层的东西一般都不会让你直接修改，都是给你封装几个函数来修改。)

`int getsockopt(int sock, int level, int optname, void *optval, socklen_t * optlen);`

* 成功时返回0，失败时返回-1。

* 参数1：`sock`，用于查看可选项的套接字文件描述符。

* 参数2：`level`，要查看的可选项协议层。

* 参数3：`optname`，要查看的可选项名。

* 参数4：`optval`，保存查看结果的缓冲地址值。

* 参数5：`optlen`，向第四个参数optval传递的缓冲大小。调用函数后，该变量中保存通过第四个参数返回的可选项信息的字节数。

`int setsockopt(int sock, int level, int optname, const void * optavl, socklen_t optlen);`

* 成功时返回0，失败时返回-1。

* 参数1：`sock`，用于更改可选项的套接字文件描述符。

* 参数2：`level`，要更改的可选项协议层。

* 参数3：`optname`，要更改的可选项名。

* 参数4：`optval`，保存要更改的选项信息的缓冲地址值。

* 参数5：`optlen`，向第四个参数optval传递的可选项信息的字节数。

### SO_RCVBUF和SO_SNDBUF

创建套接字将同时生成I/O缓冲。

- SO_RCVBUF是输入缓冲大小相关可选项。
- SO_SNDBUF是输出缓冲大小相关可选项。

用这2个可选项既可以读取I/O缓冲大小，也可以进行更改。通过下列示例读取创建套接字默认的I/O缓冲大小。

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<unistd.h>
#include<sys/socket.h>
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int sock;
	int snd_buf, rcv_buf, state;
	socklen_t len;

	sock = socket(PF_INET, SOCK_STREAM, 0);
	len = sizeof(snd_buf);
	state = getsockopt(sock, SOL_SOCKET, SO_SNDBUF,
			(void*)&snd_buf, &len);
	if(state)
		error_handling("getsockopt() error");
	
	len = sizeof(rcv_buf);
	state = getsockopt(sock, SOL_SOCKET, SO_RCVBUF,
		       	(void*)&rcv_buf, &len);
	if(state)
		error_handling("getsockopt() error");

	printf("Input buffer size: %d \n", rcv_buf );
	printf("Output buffer size: %d \n", snd_buf);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

下面将通过setsocketopt来修改I/O缓冲

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<unistd.h>
#include<sys/socket.h>
void error_handling(char *message);

int main(int argc, char * argv[])
{
	int sock;
	int snd_buf = 1024 * 3, rcv_buf = 1024 * 3;
	int state;
	socklen_t len;

	sock = socket(PF_INET, SOCK_STREAM, 0);
	state = setsockopt(sock, SOL_SOCKET, SO_RCVBUF,		//更改输入缓冲为3M字节
		       	(void *)&rcv_buf, sizeof(rcv_buf));
	if(state)
		error_handling("setsockeopt() error!");

	state = setsockopt(sock, SOL_SOCKET, SO_SNDBUF, 	//更改输出缓冲为3M字节
			(void *)&snd_buf, sizeof(snd_buf));
	if(state)
		error_handling("setsockopt() error!");

	len = sizeof(snd_buf);
	state = getsockopt(sock, SOL_SOCKET, SO_SNDBUF,		//为了验证，读取输出缓冲大小
			(void *)&snd_buf, &len);
	if(state)
		error_handling("getsockopt() error!");

	len = sizeof(rcv_buf);
	state = getsockopt(sock, SOL_SOCKET, SO_RCVBUF,		//为了验证，读取输入缓冲大小
			(void*)&rcv_buf, &len);
	
	printf("Input buffer size: %d \n", rcv_buf);	
	printf("Output buffer size: %d \n", snd_buf);
	return 0;
}

void error_handling(char *message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

### SO_REUSEADDR

先来看下面的服务端代码：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define TRUE 1
#define FALSE 0
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int serv_sock, clnt_sock;
	char message[30];
	int option, str_len;
	socklen_t optlen, clnt_adr_sz;
	struct sockaddr_in serv_adr, clnt_adr;
	if(argc != 2){
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	if(serv_sock == -1)
		error_handling("socket() error");

	/*
	  optlen = sizeof(option);
	  option = TRUE;
	  setsockopt(serv_sock, SOL_SOCKET, SO_REUSEADDR,
	  			(void*)&option, optlen);
	*/

	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)))
		error_handling("bind() error");

	if(listen(serv_sock, 5) == -1)
		error_handling("listen() error");
	
	clnt_adr_sz = sizeof(clnt_adr);
	clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &clnt_adr_sz);
	while((str_len = read(clnt_sock, message, sizeof(message))) != 0)
	{
		write(clnt_sock, message, str_len);
		write(1, message, str_len);//第一个参数是1，代表标准输出
	}
	close(clnt_sock);
	close(serv_sock);
	return 0;
}

void error_handling(char *message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

客户端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<sys/socket.h>
#include<arpa/inet.h>

#define BUF_SIZE 1024
void error_handling(char * message);

int main(int argc, char * argv[])
{
    int sock; 
	char message[BUF_SIZE];
    int str_len;
    struct sockaddr_in serv_adr;

	if(argc != 3){
		printf("Usage : %s <IP> <port>\n", argv[0]);
		exit(1);
	}

	sock = socket(PF_INET, SOCK_STREAM, 0);
	if(sock == -1)
		error_handling("socket() error");

	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_adr.sin_port = htons(atoi(argv[2]));

	if(connect(sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("connect() error");
	else
		puts("Connected........");

	while(1)
	{
		fputs("Input message(Q to quit):", stdout);
		fgets(message, BUF_SIZE, stdin);

		if(!strcmp(message, "q\n") || !strcmp(message, "Q\n"))
			break;

		write(sock, message, strlen(message));
		str_len = read(sock, message, BUF_SIZE - 1);
		message[str_len] = 0;
		printf("Message from server: %s", message);
	}
	close(sock);
	return 0;
}

void error_handling(char *message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

通过以下方式终止程序：

> “在客户端控制台输入Q消息，或通过CTRL+C终止程序。”

也就是说，让客户端先通知服务器端终止程序。在客户端控制台输入Q消息时调用close函数，向服务器端发送FIN消息，向服务器端发送FIN消息并经过四次握手过程。当然，输入CTRL+C时会向服务器传递FIN消息。强制终止程序时，由操作系统关闭文件及套接字，此过程相当于调用close函数，也会向服务器端传递FIN消息。

> “但看不到什么特殊现象啊？”

是的，通常都是由客户端先请求断开连接，所以不会发生特别的事情。重新运行服务器端也不成问题，但按照如下方式终止程序时则不同。

> “服务器端和客户端已建立连接的状态下，向服务器端控制台输入CTRL+C，及强制关闭服务器端。”

这主要模拟了服务器端向客户端发送FIN消息的情景。但如果以这种方式终止程序，那服务器端重新运行时将产生问题。如果用同一端口号重新运行服务器端，将输出“bind() error”消息，并且无法再次运行。但在这种情况下，再过大约3分钟即可重新运行服务器端。

上述2中运行方式唯一的区别就是谁先传输FIN消息，但结果却迥然不同，原因何在呢？

四次挥手我们知道先发送断开连接请求的主机最后会进入一段时间的Time-wait状态。假如服务端先发送断开连接请求（FIN消息），最后会进入Time-wait状态，此时服务端的套接字还没有关闭，端口号还在占用。因此用同一端口号重新运行服务器端，将输出“bind() error”消息。

那为什么客户端先发送断开连接请求就没有问题呢，原因就是客户端socket的端口是自动分配的，某个端口被占用了，系统会分配其他的端口。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260312094708094.png" alt="image-20260312094708094" style="zoom:50%;" />

| 到底为什么会有Time-wait状态呢？                              |
| ------------------------------------------------------------ |
| 上图中假设主机A向主机B传输ACK消息（SEQ 5001、ACK 7502）后立即消除套接字 。但最后这条ACK消息在传递途中丢失，未能传给主机B。这时会发生什么？主机B会认为之前自己发送的FIN消息（Seq 7501、ACK 5001）未能抵达主机A，继而试图重传。但此时主机A已是完全终止的状态，因此主机B永远无法收到主机A最后传来的ACK消息。相反，若主机A的套接字处在Time-wait状态，则会向主机B重传最后的ACK消息，主机B也可以正常终止。基于这些考虑，先传输FIN消息的主机应经过Time-wait过程。 |

Time-wait状态也存在着一些缺点。如下图所示，主机A的四次挥手过程中，如果最后的数据丢失，则主机B会认为主机A未能收到自己发送的FIN消息，因此重传。这时，收到FIN消息的主机A将重启Time-wait计时器。因此，如果网络状况不理想，Time-wait状态将持续。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260312095516977.png" alt="image-20260312095516977" style="zoom:50%;" />

解决方案就是在套接字的可选项中更改SO_REUSEADDR的状态。适当调整该参数，可将Time-wait状态下的套接字端口号重新分配给新的套接字。SO_REUSEADDR的默认值为0（假），这就意味着无法分配Time-wait状态下的套接字端口号。因此需要将这个值改成1（真）。

只需把上述服务端程序的这几行注释去掉：

![image-20260312100153150](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260312100153150.png)

### TCP_NODELAY

首先了解下Nagle算法：

- **规则A**：如果发送缓冲区里的数据**足够拼凑成一个最大报文段（MSS，通常是1460字节）**，那么**不用等**，立刻发送！
- **规则B**：如果缓冲区里的数据**不够一个 MSS（是个小包）**，并且网络上还有之前发出的包没有收到确认（ACK），那就**等**。等到前面的 ACK 回来了，或者缓冲区里的数据攒够一个 MSS 了，再发。

![image-20260312101238693](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260312101238693.png)

TCP套接字默认使用Nagle算法交换数据，因此最大限度地进行缓冲，直到收到ACK。为了发送字符串“Nagle”，将其传递到输出缓冲。这时头字符“N”之前没有其他数据（没有需接收的ACK），因此立即传输。之后开始等待字符“N”的ACK消息，等待过程中，剩下的“agle”填入输出缓冲。接下来，收到“N”的ACK消息后，将输出缓冲的“agle”转入一个数据包发送。也就是说，共需传递4个数据包（2SEQ + 2ACK）以传输1个字符串。

假设字符“N”到“e”依序传到输出缓冲。此时的发送过程与ACK接收无关，因此数据到达输出缓冲后立即被发送出去。从图右侧可以看到，发送字符串“Nagle”时共需10个数据包。由此可知，不使用Nagle算法将对网络流量产生负面影响。即使只传输1个字节数据，其头信息都有可能是几十个字节。因此，为了提高网络传输效率，必须使用Nagle算法。

| 上图是极端情况的演示                                         |
| ------------------------------------------------------------ |
| 在程序中将字符串传给输出缓冲时并不是逐字传递的，故发送字符串“Nagle”的实际情况并非如图9-3所示。但如果每隔一段时间再把构成字符串的字符传到输出缓冲（如果存在此类数据传递）的话，则有可能产生类似图9-3的情况。图9-3中就是隔一段时间向输出缓冲传递待发送数据的。（就是多次调用write()） |

| 对Nagle算法的理解：                                          |
| ------------------------------------------------------------ |
| Nagle算法的作用：充分利用缓冲区的空间，来减少网络传输中的数据包，进而在一定情况下可以提高网络传输效率。Nagle算法在网络环境不稳定的条件下，可以考虑使用。如果**传输大文件数据**，则使用Nagle算法和不使用Nagle算法的差别不大，（大文件数据会立刻填满输出缓冲区，根据规则A，不会等待上一个数据的ACK消息，会直接传输。）而禁用Nagle算法也会在填满输出缓冲时传输数据包，而且无需等待ACK的前提下连续传输（比如大文件尾部有个小包，开启Nagle算法小包就会等待上一个传输的大包的ACK消息，传输不连续），因此可以大大提高传输速度。 |

禁用Nagle算法：

```cpp
int opt_val = 1;
setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, (void*)&opt_val, sizeof(opt_val));
```

另外，可以通过TCP_NODELAY值查看Nagle算法的设置状态：

```cpp
int opt_val;
socklen_t opt_len;
opt_len = sizeof(opt_val);
getsockopt(sock, IPPROTO_TCP, TCP_NODELAY, (void*)&opt_val, &opt_len);
```

如果正在使用Nagle算法，opt_val变量中会保存0；如果已禁用Nagle算法，则保存1。

> 补充：
>
> 在TCP协议中，无论发送多少数据，都要在数据前面加上协议头，同时，对方收到数据后，也需要回复ACK表示确认。为了尽可能的利用网络带宽，TCP希望每次都能够以MSS（Maximum Segment Size，最大报文长度）的数据块来发送数据。
>
> Nagle算法就是为了尽可能发送大块的数据，避免网络中充斥着小数据块。
>
> Nagle算法的定义是：任意时刻，最多只能有一个未被确认的小段，小段是指小于MSS的数据块，未被确认是指一个数据块发送出去后，没有收到对端回复的ACK。
>
> 举个例子：发送端调用send()函数将一个int型数据（称之为A数据块）写入到socket中，A数据块会被马上发送到接收端，接着，发送端又调用send()函数写入一个int型数据（称之为B数据块），这时候，A块的ACK没有返回（已经存在了一个未被确认的小段），所以B块不会立即被发送，而是等A块的ACK返回之后（大概40ms）才发送。
>
> TCP协议中不仅仅有Nagle算法，还有一个ACK延迟机制：当接收端收到数据之后，并不会马上向发送端回复ACK，而是延迟40ms后再回复，它希望在40ms内接收端会向发送端回复应答数据，这样ACK就可以和应答数据一起发送，把ACK捎带过去。
>
> 如果TCP连接的一端启用了Nagle算法，另一端启用了ACK延时机制，而发送的数据包又比较小，则可能会出现这样的情况：发送端在等待上一个包的ACK，而接收端正好延迟了此ACK，那么这个正要被发送的包就会延迟40ms。

## send和recv函数

send：是一个系统调用函数，用来发送消息到一个套接字中

`ssize_t send(int sockfd, const void *buf, size_t len, int flags);`

send和write的唯一区别就是最后一个参数：flags的存在，当我们设置flags为0时，send和wirte是同等的。

recv:

`ssize_t recv(int sockfd, void* buf, size_t len, int flags);`

返回值：

* 返回>0 实际接收到的字节数
* 返回0 对端关闭了连接
* 返回-1 调用失败
* ssize_t 有符号整数

| 可选项（option） | 含义                                                         | send | recv |
| ---------------- | ------------------------------------------------------------ | ---- | ---- |
| MSG_OOB          | 用于传输带外数据（Out-of-band data）                         | O    | O    |
| MSG_PEEK         | 验证输入缓冲是否存在接收的数据                               |      | O    |
| MSG_DONTROUTE    | 数据传输过程中不参照路由（Routing）表，在本地（Local）网络中寻找目的地 | O    |      |
| MSG_DONTWAIT     | 调用I/O函数时不阻塞，用于使用非阻塞（Non_blocking）I/O       | O    | O    |
| MSG_WAITALL      | 防止函数返回，直到接收全部请求的字节数                       |      | O    |

### MSG_OOB 

发送紧急消息：

```cpp
#include<stdio.h>
#include<unistd.h>
#include<stdlib.h>
#include<string.h>
#include<sys/socket.h>
#include<arpa/inet.h>

#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char * argv[]) 
{
	int sock;
	struct sockaddr_in recv_adr;
	if(argc != 3){
		printf("Usage: %s <IP><port> \n", argv[0]);
		exit(1);
	}

	sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&recv_adr, 0, sizeof(recv_adr));
	recv_adr.sin_family = AF_INET;
	recv_adr.sin_addr.s_addr = inet_addr(argv[1]);
	recv_adr.sin_port = htons(atoi(argv[2]));

	if(connect(sock, (struct sockaddr*)&recv_adr, sizeof(recv_adr)) == -1)
		error_handling("connect() error");

	write(sock, "123", strlen("123"));	
	send(sock, "4", strlen("4"), MSG_OOB);	// 紧急传输数据。正常顺序应该是123、4、567、890，当紧急传输了4和890，由此可知接受顺序也将改变。
	write(sock, "567", strlen("567"));
	send(sock, "890", strlen("890"), MSG_OOB);
	close(sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

接收紧急消息：

收到MSG_OOB紧急消息时，操作系统将产生SIGURG信号，我们需要注册信号处理函数。

`fcntl(recv_sock, F_SETOWN, getpid());`

含义：将文件描述符recv_sock指向的套接字拥有者（F_SETOWN）改为把getpid函数返回值用作ID的进程。大白话就是让当前进程处理该fd指向的套接字引发的信号。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260319093001984.png" alt="image-20260319093001984" style="zoom:50%;" />

```cpp
#include<stdio.h>
#include<unistd.h>
#include<stdlib.h>
#include<string.h>
#include<signal.h>
#include<sys/socket.h>
#include<netinet/in.h>
#include<fcntl.h>

#define BUF_SIZE 30	
void error_handling(char * message);
void urg_handler(int signo);

int acpt_sock;
int recv_sock;

int main(int argc, char *argv[])
{
	struct sockaddr_in recv_adr, serv_adr;
	int str_len, state;
	socklen_t serv_adr_sz;
	struct sigaction act;
	char buf[BUF_SIZE];
	if(argc != 2){
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	act.sa_handler = urg_handler;
	sigemptyset(&act.sa_mask);
	act.sa_flags = 0;

	acpt_sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&recv_adr, 0, sizeof(recv_adr));
	recv_adr.sin_family = AF_INET;
	recv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	recv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(acpt_sock, (struct sockaddr*)&recv_adr, sizeof(recv_adr)) == -1)
		error_handling("bind() error");
	listen(acpt_sock, 5);

	serv_adr_sz = sizeof(serv_adr);
	recv_sock = accept(acpt_sock, (struct sockaddr*)&serv_adr, &serv_adr_sz);

	fcntl(recv_sock, F_SETOWN, getpid());	// 将单独说明。
	state = sigaction(SIGURG, &act, 0);	//收到MSG_OOB紧急消息时，操作系统将产生SIGURG信号，并调用注册的信号处理函数。

	while((str_len = recv(recv_sock, buf, sizeof(buf), 0)) != 0)
	{
		if(str_len == -1)
			continue;
		buf[str_len] = 0;
		puts(buf);
	}
	close(recv_sock);
	close(acpt_sock);
	return 0;
}

void urg_handler(int signo)	// 信号处理函数内部调用了接收紧急消息recv函数。
{
	int str_len;
	char buf[BUF_SIZE];
	str_len = recv(recv_sock, buf, sizeof(buf) - 1, MSG_OOB);
	buf[str_len] = 0;
	printf("Urgent message: %s \n", buf);
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

通过MSG_OOB可选项传递数据时不会加快数据传输速度，而且通过信号处理函数urg_handler读取数据时也只能读1个字节。剩余数据只能通过未设置MSG_OOB可选项的普通输入函数读取。这是因为TCP不存在真正意义上的“带外数据”。

真正意义上的Out-of-band需要通过单独的通信路径高速传输数据，但TCP不另外提供，只利用TCP的紧急模式（Urgent mode）进行传输。

MSG_OOB的真正的意义在于督促数据接收对象尽快处理数据。这是紧急模式的全部内容，而且TCP“保持传输顺序”的传输特性依然成立。

`send(sock, "890", strlen("890"), MSG_OOB);`

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260319094637097.png" alt="image-20260319094637097" style="zoom:50%;" />

如果将缓冲最左端的位置视为偏移量为0，字符串0保存于偏移量为2的位置。另外，字符0右侧偏移量为3的位置存有紧急指针（Urgent Pointer）。紧急指针指向紧急消息的下一个位置（偏移量加1），同时向对方主机传递如下消息：“紧急指针指向的偏移量为3之前的部分就是紧急消息！”但是无法确认紧急消息是890还是90还是0。

### MSG_PEEK

MSG_PEEK和MSG_DONTWAIT结合，以非阻塞方式验证输入缓冲中有无数据。（如果有数据就会读取，但是不会把数据从缓冲中删除，也就是说继续调用recv还会得到该数据。如果没数据就会返回，不会阻塞等待。）

### readv和writev函数

通过writev函数可以将分散保存在多个缓冲中的数据一并发送，通过readv函数可以由多个缓冲分别接收。因此，适当使用这2个函数可以减少I/O函数的调用次数。

```cpp
#include<sys/uio.h>
ssize_t writev(int filedes, const struct iovec * iov, int invcnt);
```

> 成功时返回发送的字节数，失败时返回-1。
>
> 参数1：filedes，表示数据传输对象的套接字文件描述符。但该函数并不只限于套接字，因此，可以像read函数一样向其传递文件或标准输出描述符。
>
> 参数2：iov，iovec结构体数组的地址值，结构体iovec中包含待发送的数据的位置和大小信息。
>
> 参数3：iovcnt，向第二个参数传递的数组长度。

iovec结构体：

```cpp
struct iovec
{
    void* iov_base;//缓冲地址
    size_t iov_len;//缓冲大小
}
```

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260319114029719.png" alt="image-20260319114029719" style="zoom:33%;" />

上图中writev的第一个参数1是文件描述符，因此向控制台输出数据，ptr是存有待发送数据信息的iovec数组指针。第三个参数为2，因此，从ptr指向的地址开始，共浏览2个iovec结构体变量，发送这些指针指向的缓冲数据。接下来仔细观察图中的iovec结构体数组。ptr[0]（数组第一个元素）的iov_base指向以A开头的字符串，同时iov_len为3，故发送ABC。而ptr[1]（数组的第二个元素）的iov_base指向数字1，同时iov_len为4，故发送1234。

`ssize_t readv(int filedes, const struct iovec* iov, int iovcnt)`

> 成功时返回接收的字节数，失败时返回-1。
>
> 参数1：filedes，传递接收数据的文件（或套接字）描述符
>
> 参数2：包含数据保存位置和大小信息的iovec结构体数组的地址值。
>
> 参数3：iovcnt：第二个参数中数组的长度。

注意：我要把filedes传输的数据存放到iov指向的内存中，第二个参数为什么是const？

==第二个参数设置为const，代表不能通过iov指针来修改iovec结构体，也就是iov_base指向的内存地址、大小不变。不代表内存地址中的数据不可以改变。==

```cpp
#include<stdio.h>
#include<sys/uio.h>
#define BUF_SIZE 100

int main(int argc, char * argv[])
{
	struct iovec vec[2];
	char buf1[BUF_SIZE] = {0, };
	char buf2[BUF_SIZE] = {0, };
	int str_len;

	vec[0].iov_base = buf1;
	vec[0].iov_len = 5;	//设置第一个数据的保存位置和大小。接受数据的大小已指定为5，因此，无论buf1的大小是多少，最多仅能保存5个字节
	vec[1].iov_base = buf2;	// vec[0]中注册的缓冲中保存为5个字节，剩余数据将保存到vec[1]中注册的缓冲。结构体iovec的成员iov_len中应写入接收的最大字节数。
	vec[1].iov_len = BUF_SIZE;

	str_len = readv(0, vec, 2);	// readv函数的第一个参数为0，因此从标准输入接收数据。
	printf("Read bytes: %d \n", str_len);
	printf("First message: %s \n", buf1);
	printf("Second message; %s \n", buf2);
	return 0;
}
```

运行结果：

```cpp
i like TCP/IP socket programming!
Read bytes: 34 
First message: i lik 
Second message; e TCP/IP socket programming!
```

writev和readv的好处：

* 需要传输的数据分别位于不同缓冲（数组）时，需要多次调用write函数。此时可以通过1次writev函数调用替代操作，当然会提高效率。同样，需要将输入缓冲中的数据读入不同位置时，可以不必多次调用read函数，而是利用1次readv函数就能大大提高效率。
* 减少数据包个数。比如服务端不采用Nagle算法，如果待发送的数据存在3个地方，那么需要调三次write，网络中可能会有三个数据包。但是用writev，会把这三个地方的数据合并在一起发送，网络中只会有一个数据包。

## 多播和广播

向用户发送多媒体信息，如果有1000个用户，需要分别向1000个用户发送消息。假如采用TCP，需要建立1000个TCP连接。采用UDP也需要发送1000次数据传输。针对这种向多个客户端发送相同消息的场景，可以采用多播技术。

多播数据传输方式：

- 针对特定的多播组，只发送一次数据。该组内的所有客户端都会接收数据。
- 多播基于UDP完成，数据包格式和UDP数据包相同。不同点是，服务器向网络中传递1个多播数据包时，路由器会复制该数据包并传递到多个主机。因此多播需要通过路由器完成。

多播和广播都可以同时给多个主机发送消息，都是基于UDP。但是多播可以跨网络 广播只能针对某个网络内的所有主机。

广播分为直接广播和本地广播。直接广播的IP地址中除了网络地址外，其余主机地址全部设置为1。例如，希望向网络地址192.12.34中的所有主机传输数据时，可以将目的地址设为192.12.34.255。本地广播IP地址是255.255.255.255。也就是说192.32.24网络中的某个主机向目的地址为255.255.255.255发送数据，数据将传递到192.32.24网络中的所有主机。

多播相关的编程：

为了传递多播数据包，必须设置TTL。TTL是Time to Live的简写，是决定“数据包传递距离”的主要因素。TTL用整数表示，并且每经过1个路由器就减1。TTL变为0时，该数据包无法再被传递，只能销毁。因此TTL的值设置过大将影响网络流量。当然，设置过小也会无法传递到目标。

TTL设置的方法：通过套接字可选项。设置TTL相关的协议层为`IPPROTO_IP`，可选项名为`IP_MULTICAST_TTL`

```cpp
int send_sock;
int time_live = 64;
...
send_sock = socket(PF_INET, SOCK_DGRAM, 0);
setsockopt(send_sock, IPPROTO_IP, IP_MULTICAST_TTL, (void *)&time_live, sizeof(time_live));
```

加入多播组也通过设置套接字选项完成：协议层为``IPPROTO_IP`选项名为`IP_ADD_MEMBERSHIP`。

```cpp
int recv_sock;
struct ip_mreq join_adr;
...
recv_sock = socket(PF_INET, SOCK_DGRAM, 0);
...
join_adr.imr_multiaddr.s_addr = "多播组地址信息";
join_adr.imr_interface.s_addr = "加入多播组的主机地址信息";
setsockopt(recv_sock, IPPROTO_IP, IP_ADD_MEMBERSHIP, (void*)&join_adr, sizeof(join_adr));
```

```cpp
struct ip_mreq
{
	struct in_addr imr_multiaddr;//加入的组IP地址
	struct in_addr imr_interface;//加入该组的套接字所属主机的IP地址，
}
```

多播中用「发送者 Sender」和「接收者 Receiver」替代服务器端和客户端。

* Sender：向AAA组广播（Broadcasting）文件中保存的新闻信息。
* Receiver：接收传递到AAA组的新闻信息。

Sender程序：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define TTL 64
#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char *argv[])
{
	int send_sock;
	struct sockaddr_in mul_adr;
	int time_live = TTL;
	FILE * fp;
	char buf[BUF_SIZE];
	if(argc != 3){
		printf("Usage: %s <GroupIP><PORT>\n", argv[0]);
		exit(1);
	}

	send_sock = socket(PF_INET, SOCK_DGRAM, 0);
	memset(&mul_adr, 0, sizeof(mul_adr));
	mul_adr.sin_family = AF_INET;
	mul_adr.sin_addr.s_addr = inet_addr(argv[1]);
	mul_adr.sin_port = htons(atoi(argv[2]));

	setsockopt(send_sock, IPPROTO_IP,	
		       	IP_MULTICAST_TTL, (void*)&time_live, sizeof(time_live)); // 指定套接字TTL信息，这是Sender中的必要过程。
	if((fp = fopen("news.txt", "r")) == NULL)
		error_handling("fopen() error");

	while(!feof(fp))	/*Broadcasting*/
	{
		fgets(buf, BUF_SIZE, fp);
		sendto(send_sock, buf, strlen(buf),
			       	0, (struct sockaddr*)&mul_adr, sizeof(mul_adr));
		sleep(2);	// sleep主要是为了给传输数据提供一定的时间间隔而添加的，没有其他特殊意义。
	}
	fclose(fp);
	close(send_sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

Receiver程序：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int recv_sock;
	int str_len;
	char buf[BUF_SIZE];
	struct sockaddr_in adr;
	struct ip_mreq join_adr;
	if(argc != 3){
		printf("Usage: %s <GroupIP><PORT>\n", argv[0]);
		exit(1);
	}

	recv_sock = socket(PF_INET, SOCK_DGRAM, 0);
	memset(&adr, 0, sizeof(adr));
	adr.sin_family = AF_INET;
	adr.sin_addr.s_addr = htonl(INADDR_ANY);
	adr.sin_port = htons(atoi(argv[2]));

	if(bind(recv_sock, (struct sockaddr*)&adr, sizeof(adr)) == -1)
		error_handling("bind() error");

	// 初始化结构体ip_mreg变量
	join_adr.imr_multiaddr.s_addr = inet_addr(argv[1]);	//初始化多播地址。
	join_adr.imr_interface.s_addr = htonl(INADDR_ANY);	//初始化待加入主机的IP地址。

	setsockopt(recv_sock, IPPROTO_IP,	//利用套接字选项IP_ADD_MEMBERSHIP加入多播组。
		       	IP_ADD_MEMBERSHIP, (void*)&join_adr, sizeof(join_adr));
	while(1)
	{
		str_len = recvfrom(recv_sock, buf, BUF_SIZE - 1, 0, NULL, 0);//通过调用recvfrom函数接收多播数据。如果不需要知道传输数据的主机地址信息，可以向recvfrom函数的第五个和第六个参数分别传递NULL和0。
		if(str_len < 0)
			break;
		buf[str_len] = 0;
		fputs(buf, stdout);
	}
	close(recv_sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```



<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321110330480.png" alt="image-20260321110330480" style="zoom:50%;" />

==前面的adr不就绑定过IP和端口吗，按理说我只需要将该主机加入这个多播组，过来的多播信号就会自动进入绑定的IP和端口。为什么要多此一举==

**join_adr.imr_interface 的根本作用就是：**
告诉操作系统：“请从**这张具体的网卡**把 IGMP 加入信号发出去，并且以后只让这张网卡去监听这个多播频道的硬件 MAC 地址！”

![image-20260321110544935](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321110544935.png)

bind和imr_interface中设置的IP

广播相关的编程：

```cpp
int send_sock;
int bcast = 1;
...
send_sock = socket(PF_INET, SOCK_DGRAM,0);
...
setsockopt(send_sock, SOL_SOCKET, SO_BROADCAST,(void*)&bcast, sizeof(bcast));
```

调用setsockopt函数，将`SO_BROADCAST`选项设置为bcast变量中的值1。意味着可以进行数据广播。

Sender程序：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define BUF_SIZE 30
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int send_sock;
	struct sockaddr_in broad_adr;
	FILE *fp;
	char buf[BUF_SIZE];
    int so_brd = 1;
    if(argc != 3){
		printf("Usage: %s <Broadcast IP><PORT>\n", argv[0]);
		exit(1);
	}

	send_sock = socket(PF_INET, SOCK_DGRAM, 0);
	memset(&broad_adr, 0, sizeof(broad_adr));
       	broad_adr.sin_family = AF_INET;
       	broad_adr.sin_addr.s_addr = inet_addr(argv[1]);
	broad_adr.sin_port = htons(atoi(argv[2]));

	setsockopt(send_sock, SOL_SOCKET,
		       	SO_BROADCAST, (void*)&so_brd, sizeof(so_brd));
	if((fp = fopen("news.txt", "r")) == NULL)
		error_handling("fopen() error");

	while(!feof(fp))
	{
		fgets(buf, BUF_SIZE, fp);
		sendto(send_sock, buf, strlen(buf),
				0, (struct sockaddr*)&broad_adr, sizeof(broad_adr));
		sleep(2);
	}
	close(send_sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

receiver程序：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#define BUF_SIZE 30
void error_handling(char* message);

int main(int argc, char * argv[])
{
	int recv_sock;
	struct sockaddr_in adr;
	int str_len;
	char buf[BUF_SIZE];
	if(argc != 2){
		printf("Usage: %s <PORT>\n", argv[0]);
		exit(1);
	}

	recv_sock = socket(PF_INET, SOCK_DGRAM, 0);
	memset(&adr, 0, sizeof(adr));
	adr.sin_family = AF_INET;
	adr.sin_addr.s_addr = htonl(INADDR_ANY);
	adr.sin_port = htons(atoi(argv[1]));

	if(bind(recv_sock, (struct sockaddr*)&adr, sizeof(adr)) == -1)
		error_handling("bind() error");

	while(1)
	{
		str_len = recvfrom(recv_sock, buf, BUF_SIZE - 1, 0, NULL, 0);
		if(str_len < 0)
		 	break;
		buf[str_len] = 0;
		fputs(buf, stdout);
	}
	close(recv_sock);
	return 0;
}

void error_handling(char* message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```



## 标准IO函数

标准IO函数指的是C语言的标准IO函数。

先来学习C语言中的文件操作：fopen、feof、fgetc、fputs、fgets

fopen打开文件，成功返回一个FILE类型的指针。

```cpp
FILE *fp = fopen("data.txt", "r");
//第二个参数是打开模式：
//"r"：只读（文件必须存在）。
//"w"：只写（文件存在则清空，不存在则创建）。
//"a"：追加（在文件末尾接着写）。
```

fgetc读取一个字符。从已经打开的文件中，读取**一个字符**。读完之后，文件内部的光标会自动往后移动一格。注意返回值是int，而不是char。

```cpp
int ch = fgetc(fp);
//返回读到的字符（会被转成 int 类型）。如果读到了文件的最末尾，或者读取发生了错误，它会返回一个特殊的宏定义常量：EOF (End Of File，通常它的值是 -1)。
```

fgets读取一个字符串

`char *fgets(char *buf, int n, FILE *stream);` n是buf的最大长度。buf是字符数组。

停止读取的条件：

* 读到换行符。**它会把这个** **\n** **也原封不动地装进你的** **str** **数组里！**
* 读到EOF
* 已经读了n-1个字符。留下的最后 1 个位置，用来放字符串结束标记 \0

**读取成功时，它返回你传入的那个字符数组的指针（地址）；如果读取失败或读到了文件/网络末尾，它返回** **NULL**

fputs把一个字符串写到文件中。

```cpp
char *str = "Hello World!";
fputs(str, fp);
//与 C 语言里的 puts() 函数不同，fputs 不会自动在字符串末尾帮你加换行符 \n
//如果成功，返回一个非负数；如果失败，返回 EOF。
```

feof判断是否到了文件末尾，feof(fp)返回值为非0值则说明到了文件末尾。

错误用法：不要用它来作为 while (!feof(fp)) 的循环判断条件，因为这往往会导致你把最后一个字符多读（多输出）一遍！

demo：

```cpp
#include <stdio.h>
//data.txt 的文件，里面只有三个字母：ABC。
int main() {
    FILE *fp = fopen("data.txt", "r");
    if (fp == NULL) return 1;

    char ch;
    // 错误用法：直接用 feof 作为循环条件
    while (!feof(fp)) {
        fscanf(fp, "%c", &ch); // 尝试读取一个字符放入 ch
        printf("%c", ch);      // 打印这个字符
    }

    fclose(fp);
    return 0;
} 
//输出：ABCC
```

原因：只要上一次读取动作成功拿到了数据，feof就返回0。所以此时虽然指针指向最后一个字符的后面一位，但 `feof()` 依然判定为没到结尾。（feof **只有在你的读取函数（比如 fgetc）试图越过文件末尾去读数据，并且失败之后**，它才会返回真（非 0 值）。）

正确用法：

```cpp
int ch;
// 先尝试读，把读到的结果赋值给 ch，然后马上判断是不是 EOF
while ((ch = fgetc(fp)) != EOF) { 
    putchar(ch); // 正常输出字符
}

// 循环结束后，再用 feof 确认一下是不是真的因为到了文件末尾才退出的循环
if (feof(fp)) {
    printf("\n文件正常读取完毕。\n");
}
```



标准IO函数的两个优点：

* 具有良好的移植性（跨平台）
* 可以利用缓冲提高性能

创建套接字时，操作系统将生成用于I/O的缓冲。此缓冲在执行TCP协议时发挥着非常重要的作用。此时若使用标准I/O函数，将得到额外的另一缓冲的支持。

![image-20260321154149865](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321154149865.png)

标准IO函数缓冲和套接字缓冲的区别：套接字中的缓冲主要是为了实现TCP协议而设立的。例如，TCP传输中丢失数据时将再次传递，而再次发送数据则意味着在某地保存了数据。存在什么地方呢？套接字的输出缓冲。相反，使用标准I/O函数缓冲的主要目的是为了提高性能。

> 为什么可以提高性能，实际上在Linux系统编程那里我们就说过这个问题，也就是所谓的预读入缓输出。
>
> ![image-20260321154816965](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321154816965.png)

如果要把输出缓冲中的数据传到套接字输出缓冲，那么需要调用fflush函数。

标准IO函数的缺点：

* 不容易进行双向通信
* 有可能频繁调用fflush
* 需要以FILE指针的形式返回文件描述符

==如何用标准IO函数进行socket网络通信==：利用fdopen函数将socket的文件描述符转换成FILE指针类型，这样就可以向操作本地文件那样操作socket。

`FILE* fdopen(int fildes, const char* mode)`

* 成功返回FILE指针 失败返回NULL。
* fildes：需要转换的文件描述符
* mode：将要创建的FILE指针的模式。若文件描述符为读模式，则基于该描述符生成的FILE结构体指针需要指定读模式；若文件描述符为写模式，则基于该描述符生成的FILE结构体指针需要指定写模式。

`int fileno(FILE * stream);`

* 成功返回文件描述符，失败返回NULL
* stream：需要转换成fd的FILE指针

标准IO函数进行socket网络通信程序：

服务端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define BUF_SIZE 1024
void error_handling(char * message);

int main(int argc, char * argv[])
{
	int serv_sock, clnt_sock;
	char message[BUF_SIZE];
	int str_len, i;
	FILE * readfp;
	FILE * writefp;
	
	struct sockaddr_in serv_adr, clnt_adr;
	socklen_t clnt_adr_sz;

	if(argc != 2){
		printf("Usage : %s <port>\n", argv[0]);
		exit(1);
	}

	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	if(serv_sock == -1)
		error_handling("socket() error");
	
	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("bind() error");

	if(listen(serv_sock, 5) == -1)
		error_handling("listen() error");

	clnt_adr_sz = sizeof(clnt_adr);
	
	for(i = 0; i < 5; i++)
	{
		clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &clnt_adr_sz);
		if(clnt_sock == -1)
			error_handling("accept() error");
		else
			printf("Connected client %d \n", i + 1);
	
		//while((str_len = read(clnt_sock, message, BUF_SIZE)) != 0)
		//	write(clnt_sock, message, str_len);
		//write(clnt_sock, message, str_len);
		//close(clnt_sock);
		readfp = fdopen(clnt_sock, "r");
		writefp = fdopen(clnt_sock, "w");
		while(!feof(readfp))//注意这里会出现之前提过的bug：最后传输的消息会多发一次
		{
			fgets(message, BUF_SIZE, readfp);
			fputs(message, writefp);
			fflush(writefp);
		}
        //while (fgets(message, BUF_SIZE, readfp) != NULL) 正确写法
		//{
   		//	 fputs(message, writefp);
   		//	 fflush(writefp);
		//}
		fclose(readfp);
		fclose(writefp);
	}
	close(serv_sock);
	return 0;
}

void error_handling(char * message)
{
	fputs(message, stderr);
	putc('\n', stderr);
	exit(1);
}
```

客户端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<sys/socket.h>
#include<arpa/inet.h>

#define BUF_SIZE 1024
void error_handling(char * message);

int main(int argc, char * argv[])
{
    int sock; 
	char message[BUF_SIZE];
    int str_len;
    struct sockaddr_in serv_adr;
	FILE* readfp;
	FILE* writefp;

	if(argc != 3){
		printf("Usage : %s <IP> <port>\n", argv[0]);
		exit(1);
	}

	sock = socket(PF_INET, SOCK_STREAM, 0);
	if(sock == -1)
		error_handling("socket() error");

	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_adr.sin_port = htons(atoi(argv[2]));

	if(connect(sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("connect() error");
	else
		puts("Connected........");

	readfp = fdopen(sock, "r");//读指针
	writefp = fdopen(sock, "w");//写指针

	while(1)
	{
		fputs("Input message(Q to quit):", stdout);
		fgets(message, BUF_SIZE, stdin);

		if(!strcmp(message, "q\n") || !strcmp(message, "Q\n"))
			break;

		//write(sock, message, strlen(message));
		//str_len = read(sock, message, BUF_SIZE - 1);
		//message[str_len] = 0;

		fputs(message, writefp);
		fflush(writefp);
		fgets(message, BUF_SIZE, readfp);
		printf("Message from server: %s", message);
	}
	fclose(writefp);
	fclose(readfp);
	return 0;
}

void error_handling(char *message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

接下来在介绍一个问题：FILE指针分为了读指针和写指针。fclose其中一个指针会直接把文件描述符关掉，进而底层的socket也关闭。关了readfp，那么writefp就没办法用了。如何用FILE指针进行半关闭操作呢？

![image-20260321221427123](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321221427123.png)

如何半关闭：创建FILE指针前先进行文件描述符的复制。

![image-20260321221336313](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321221336313.png)

==假如fclose写指针，那么写指针对应的文件描述符关闭了，只剩下了读模式的文件描述符。是不是实现了半关闭呢？其实没有。读模式的底层文件描述符仍然可以进行同时IO。==如何解决？采用shutdown函数。调用shutdown函数时，不管复制出多少的fd，都会进入半关闭状态，同时传递EOF。

> 注意：调用close是不会传递EOF的，close有引用计数，只有所有复制的文件描述符都关闭，套接字才能关闭，才会向对方发送EOF。

如何实现文件描述符之间的复制呢，可以用dup和dup2函数。dup2和dup的区别就是dup2可以指定复制得到的文件描述符是多少。

FILE指针实现半关闭的程序：

场景：服务器发送完数据了，断开输出流，进入半关闭。通过服务器端的半关闭状态接收客户端最后发送的字符串。

服务端代码：

```cpp
#include<stdio.h>
#include<string.h>
#include<stdlib.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#define BUF_SIZE 1024

void error_handling(char* message);

int main(int argc, char* argv[])
{
	int serv_sock, clnt_sock;
	struct sockaddr_in serv_addr, clnt_addr;
	socklen_t clnt_addr_size;
	char buf[BUF_SIZE] = {0,};
	FILE* readfp;
	FILE* writefp;

	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	if(serv_sock == -1)
		error_handling("socket() error");

	if(argc != 2)
	{
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	memset(&serv_addr, 0, sizeof(serv_addr));
	serv_addr.sin_family = AF_INET;
	serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_addr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) == -1)
		error_handling("bind() error");

	if(listen(serv_sock, 5) == -1)
		error_handling("listen() error");
	clnt_addr_size = sizeof(clnt_addr);
	clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_addr, &clnt_addr_size);
	if(clnt_sock == -1)
		error_handling("accept() error");
	
	readfp = fdopen(clnt_sock, "r");
	writefp = fdopen(dup(clnt_sock), "w");//通过dup函数的返回值生成FILE指针

	fputs("FROM SERVER: Hi~ client? \n", writefp);
	fputs("I love C++\n", writefp);
	fputs("learn hard!\n", writefp);
	fflush(writefp);

	shutdown(fileno(writefp), SHUT_WR);	//shutdown，服务器进入半关闭，并向客户端发送EOF消息。
	fclose(writefp);

	fgets(buf, sizeof(buf), readfp);
	fputs(buf, stdout);
	fclose(readfp);
	return 0;
}
void error_handling(char* message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

客户端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#define BUF_SIZE 1024

int main(int argc, char * argv[])
{
	int sock;
	char buf[BUF_SIZE];
	struct sockaddr_in serv_addr;

	FILE* readfp;
	FILE* writefp;

	sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&serv_addr, 0, sizeof(serv_addr));
	serv_addr.sin_family = AF_INET;
	serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_addr.sin_port = htons(atoi(argv[2]));

	connect(sock, (struct sockaddr*)&serv_addr, sizeof(serv_addr));
	readfp = fdopen(sock, "r");
	writefp = fdopen(sock, "w");

	while(1)
	{
		if(fgets(buf, sizeof(buf), readfp) == NULL)	//收到EOF时，fgets函数将返回NULL指针。因此，添加if语句使收到NULL时退出循环
			break;
		fputs(buf, stdout);
		fflush(stdout);
	}
	fputs("FROM CLIENT: Thank you! \n", writefp);	//通过该语句向服务器端发送最后的字符串
	fflush(writefp);
	fclose(writefp);
	fclose(readfp);
	return 0;
}
```

### 阻塞与非阻塞IO

阻塞：在进/线程中，发起一个调用时，在调用返回之前，进/线程会被阻塞等待，等待中的进/线程让出CPU使用权。

非阻塞：在进/线程中，发起一个调用时，会立即返回。

网络编程中会阻塞的函数：connect accept send recv

在IO复用的模型中，事件循环（while循环）不能被阻塞在任何环节，所以应该采用非阻塞IO。

把socket设置为非阻塞，这四个函数会有什么表现：

* connect 不管是否能连上，都会直接返回失败，错误代码为EINPROGRESS。那如何知道连接是否成功：如果socket状态是可写的，就代表连接成功。
* 如果已连接队列中没有socket  accept直接返回失败，错误代码为EAGAIN。
* 如果没数据可读（接收缓冲区空） recv立即返回失败，错误代码为EAGAIN
* 如果socket不可写，也就是说发送缓冲区满了，send立即返回失败，错误代码为EAGAIN。

```cpp
/*
 * 程序名：tcpepoll1.cpp，此程序用于演示非阻塞IO。
 * 作者：吴从周
*/
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <arpa/inet.h>
#include <sys/fcntl.h>
#include <sys/epoll.h>

// 把socket设置成非阻塞。
int setnonblocking(int fd)
{
    int  flags;

    // 获取fd的状态。
    if  ((flags=fcntl(fd,F_GETFL,0))==-1)
        flags = 0;

    return fcntl(fd,F_SETFL,flags|O_NONBLOCK);
}

// 初始化服务端的监听端口。
int initserver(int port);

int main(int argc,char *argv[])
{
    if (argc != 2) { printf("usage: ./tcpepoll1 port\n"); return -1; }

    // 初始化服务端用于监听的socket。
    int listensock = initserver(atoi(argv[1]));
    printf("listensock=%d\n",listensock);

    setnonblocking(listensock);     // 把监听的socket设置为非阻塞。

    while (true)
    {
        if (accept(listensock,0,0)==-1)
        {
            if (errno!=EAGAIN)
            {
                perror("accept:");   return -1;
            }
        }
        else
            break;
    }

    printf("客户端已连接。\n");

return 0;

    if (listensock < 0) { printf("initserver() failed.\n"); return -1; }

    // 创建epoll句柄。
    int epollfd=epoll_create(1);

    // 为服务端的listensock准备读事件。
    epoll_event ev;              // 声明事件的数据结构。
    ev.data.fd=listensock;   // 指定事件的自定义数据，会随着epoll_wait()返回的事件一并返回。
    // ev.data.ptr=(void*)"超女";   // 指定事件的自定义数据，会随着epoll_wait()返回的事件一并返回。
    ev.events=EPOLLIN;      // 打算让epoll监视listensock的读事件。

    epoll_ctl(epollfd,EPOLL_CTL_ADD,listensock,&ev);     // 把需要监视的socket和事件加入epollfd中。

    epoll_event evs[10];      // 存放epoll返回的事件。

    while (true)        // 事件循环。
    {
        // 等待监视的socket有事件发生。
        int infds=epoll_wait(epollfd,evs,10,-1);

        // 返回失败。
        if (infds < 0)
        {
            perror("epoll() failed"); break;
        }

        // 超时。
        if (infds == 0)
        {
            printf("epoll() timeout.\n"); continue;
        }

        // 如果infds>0，表示有事件发生的socket的数量。
        for (int ii=0;ii<infds;ii++)       // 遍历epoll返回的数组evs。
        {
            // printf("ptr=%s,events=%d\n",evs[ii].data.ptr,evs[ii].events);

            // 如果发生事件的是listensock，表示有新的客户端连上来。
            if (evs[ii].data.fd==listensock)
            {
                struct sockaddr_in client;
                socklen_t len = sizeof(client);
                int clientsock = accept(listensock,(struct sockaddr*)&client,&len);

                printf ("accept client(socket=%d) ok.\n",clientsock);

                // 为新客户端准备读事件，并添加到epoll中。
                ev.data.fd=clientsock;
                ev.events=EPOLLIN;
                epoll_ctl(epollfd,EPOLL_CTL_ADD,clientsock,&ev);
            }
            else
            {
                // 如果是客户端连接的socke有事件，表示有报文发过来或者连接已断开。
                char buffer[1024]; // 存放从客户端读取的数据。
                memset(buffer,0,sizeof(buffer));
                if (recv(evs[ii].data.fd,buffer,sizeof(buffer),0)<=0)
                {
                    // 如果客户端的连接已断开。
                    printf("client(eventfd=%d) disconnected.\n",evs[ii].data.fd);
                    close(evs[ii].data.fd);            // 关闭客户端的socket
                    // 从epollfd中删除客户端的socket，如果socket被关闭了，会自动从epollfd中删除，所以，以下代码不必启用。
                    // epoll_ctl(epollfd,EPOLL_CTL_DEL,evs[ii].data.fd,0);
                }
                else
                {
                    // 如果客户端有报文发过来。
                    printf("recv(eventfd=%d):%s\n",evs[ii].data.fd,buffer);

                    // 把接收到的报文内容原封不动的发回去。
                    send(evs[ii].data.fd,buffer,strlen(buffer),0);
                }
            }
        }
    }

  return 0;
}

// 初始化服务端的监听端口。
int initserver(int port)
{
    int sock = socket(AF_INET,SOCK_STREAM,0);
    if (sock < 0)
    {
        perror("socket() failed"); return -1;
    }

    int opt = 1; unsigned int len = sizeof(opt);
    setsockopt(sock,SOL_SOCKET,SO_REUSEADDR,&opt,len);

    struct sockaddr_in servaddr;
    servaddr.sin_family = AF_INET;
    servaddr.sin_addr.s_addr = htonl(INADDR_ANY);
    servaddr.sin_port = htons(port);

    if (bind(sock,(struct sockaddr *)&servaddr,sizeof(servaddr)) < 0 )
    {
        perror("bind() failed"); close(sock); return -1;
    }

    if (listen(sock,5) != 0 )
    {
        perror("listen() failed"); close(sock); return -1;
    }

    return sock;
}
```



## 实现并发服务器

前面实现的回声服务器一次只能给一个客户端提供服务，提供完服务才可以给下一个提供服务。如何实现同时给多个客户端提供服务？（这里的同时是宏观上的同时。）

### 多进程

多进程：是为每个客户端分配一个子进程来处理请求

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/Gemini_Generated_Image_j0gmjxj0gmjxj0gm.png" alt="Gemini_Generated_Image_j0gmjxj0gmjxj0gm" style="zoom: 25%;" />

* 父进程通过调用accept函数受理连接请求
* fork出子进程，将accept函数返回的套接字文件描述符传递给子进程
* 子进程为客户端提供服务

调用fork函数时子进程会复制父进程的所有资源，但是不会复制套接字。（套接字属于操作系统的资源，fork不会复制，管道也属于操作系统也不会复制，只会复制套接字和管道的文件描述符。）如果复制套接字的话，同一个端口就绑定了多个套接字这就不合理了。只会复制套接字的文件描述符。 下图的服务端套接字就是lfd，客户端连接套接字时cfd。

、<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260317093200180.png" alt="image-20260317093200180" style="zoom:50%;" />

1个套接字存在2个文件描述符时，只有2个文件描述符都终止（销毁）后，才能销毁套接字。如果维持图中的状态，即使子进程销毁了与客户端连接的套接字文件描述符，也无法销毁套接字（服务器套接字同样如此）。因此调用fork函数后，要将无关紧要的套接字文件描述符关掉。

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<signal.h>
#include<sys/wait.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define BUF_SIZE 30
void error_handling(char * message);
void read_childproc(int sig);

int main(int argc, char * argv[])
{
	int serv_sock, clnt_sock;
	struct sockaddr_in serv_adr, clnt_adr;

	pid_t pid;
	struct sigaction act;
	socklen_t adr_sz;
	int str_len, state;
	char buf[BUF_SIZE];
	if(argc != 2){
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	act.sa_handler = read_childproc;			//------从29----
	sigemptyset(&act.sa_mask);					// 为防止产生僵尸进程
	act.sa_flags = 0;							// 而编写的代码
	state = sigaction(SIGCHLD, &act, 0);		//------到32----
	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("bind() error");
	if(listen(serv_sock, 5) == -1)
		error_handling("listen error");

	while(1)
	{
		adr_sz = sizeof(clnt_adr);
		clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &adr_sz);
		if(clnt_sock == -1)
			continue;
		else
			puts("new client connected...");
		pid = fork();	// 执行后，父进程和子进程分别带有一个第47行生成的套接字描述符（受理客户端连接请求时创建的）文件描述符。
		if(pid == -1)
		{
			close(clnt_sock);
			continue;
		}
		if(pid == 0)	//子进程运行的区域。此部分向客户端提供回声服务。
		{
			close(serv_sock); //关闭第33行创建的服务器套接字，这是因为服务器端套接字文件描述符同样也传递到子进程。
			while((str_len = read(clnt_sock, buf, BUF_SIZE)) != 0)
				write(clnt_sock, buf, str_len);

			close(clnt_sock);
			puts("client disconnected...");
			return 0;
		}
		else
			close(clnt_sock);
	}
	close(serv_sock);
	return 0;
}			  

void read_childproc(int sig)
{
	pid_t pid;
	int status;
	pid = waitpid(-1, &status, WNOHANG);
	printf("removed proc id: %d \n", pid);
}

void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```



```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>
#include <signal.h>
#include <sys/wait.h>
#include <errno.h>

// 信号处理函数
void callback(int num)
{
    while(1)
    {
        pid_t pid = waitpid(-1, NULL, WNOHANG);
        if(pid <= 0)
        {
            printf("子进程正在运行, 或者子进程被回收完毕了\n");
            break;
        }
        printf("child die, pid = %d\n", pid);
    }
}

int childWork(int cfd);
int main()
{
    // 1. 创建监听的套接字
    int lfd = socket(AF_INET, SOCK_STREAM, 0);
    if(lfd == -1)
    {
        perror("socket");
        exit(0);
    }

    // 2. 将socket()返回值和本地的IP端口绑定到一起
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(10000);   // 大端端口
    // INADDR_ANY代表本机的所有IP, 假设有三个网卡就有三个IP地址
    // 这个宏可以代表任意一个IP地址
    // 这个宏一般用于本地的绑定操作
    addr.sin_addr.s_addr = INADDR_ANY;  // 这个宏的值为0 == 0.0.0.0
    //    inet_pton(AF_INET, "192.168.237.131", &addr.sin_addr.s_addr);
    int ret = bind(lfd, (struct sockaddr*)&addr, sizeof(addr));
    if(ret == -1)
    {
        perror("bind");
        exit(0);
    }

    // 3. 设置监听
    ret = listen(lfd, 128);
    if(ret == -1)
    {
        perror("listen");
        exit(0);
    }

    // 注册信号的捕捉
    struct sigaction act;
    act.sa_flags = 0;
    act.sa_handler = callback;
    sigemptyset(&act.sa_mask);
    sigaction(SIGCHLD, &act, NULL);

    // 接受多个客户端连接, 对需要循环调用 accept
    while(1)
    {
        // 4. 阻塞等待并接受客户端连接
        struct sockaddr_in cliaddr;
        int clilen = sizeof(cliaddr);
        int cfd = accept(lfd, (struct sockaddr*)&cliaddr, &clilen);
        if(cfd == -1)
        {
            if(errno == EINTR)
            {
                // accept调用被信号中断了, 解除阻塞, 返回了-1
                // 重新调用一次accept
                continue;
            }
            perror("accept");
            exit(0);
 
        }
        // 打印客户端的地址信息
        char ip[24] = {0};
        printf("客户端的IP地址: %s, 端口: %d\n",
               inet_ntop(AF_INET, &cliaddr.sin_addr.s_addr, ip, sizeof(ip)),
               ntohs(cliaddr.sin_port));
        // 新的连接已经建立了, 创建子进程, 让子进程和这个客户端通信
        pid_t pid = fork();
        if(pid == 0)
        {
            // 子进程 -> 和客户端通信
            // 通信的文件描述符cfd被拷贝到子进程中
            // 子进程不负责监听
            close(lfd);
            while(1)
            {
                int ret = childWork(cfd);
                if(ret <=0)
                {
                    break;
                }
            }
            // 退出子进程
            close(cfd);
            exit(0);
        }
        else if(pid > 0)
        {
            // 父进程不和客户端通信
            close(cfd);
        }
    }
    return 0;
}


// 5. 和客户端通信
int childWork(int cfd)
{

    // 接收数据
    char buf[1024];
    memset(buf, 0, sizeof(buf));
    int len = read(cfd, buf, sizeof(buf));
    if(len > 0)
    {
        printf("客户端say: %s\n", buf);
        write(cfd, buf, len);
    }
    else if(len  == 0)
    {
        printf("客户端断开了连接...\n");
    }
    else
    {
        perror("read");
    }

    return len;
}
```

拓展：分割IO的回声客户端。

之前客户端传输数据后，服务端回传数据，回传完毕后客户端才可以发下一个数据。

分割IO：父进程进行读，子进程进行写。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260317094352266.png" alt="image-20260317094352266" style="zoom: 33%;" />

以前的回声客户端是左图，分割IO后变成了右图，客户端不需要发完一次数据，还可以接着发，不需要等收到服务端发来的数据才发下一次数据。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260317094958249.png" alt="image-20260317094958249" style="zoom:33%;" />



分割IO的客户端代码：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>

#define BUF_SIZE 30
void error_handling(char * message);
void read_routine(int sock, char * buf);
void write_routine(int sock, char * buf);

int main(int argc, char * argv[])
{
	int sock;
	pid_t pid;
	char buf[BUF_SIZE];
	struct sockaddr_in serv_adr;
	if(argc != 3){
		printf("Usage: %s <IP><port>\n", argv[0]);
		exit(1);
	}

	sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_adr.sin_port = htons(atoi(argv[2]));

	if(connect(sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("connect() error");

	pid = fork();
	if(pid == 0)
		write_routine(sock, buf);
	else
		read_routine(sock, buf);

	close(sock);
	return 0;
}

void read_routine(int sock, char * buf)
{
	while(1)
	{
		int str_len = read(sock, buf, BUF_SIZE);
		if(str_len == 0)
			return;

		buf[str_len] = 0;
		printf("Message from server: %s", buf);
	}
}
void write_routine(int sock, char * buf)
{
	while(1)
	{
		fgets(buf, BUF_SIZE, stdin);
		if(!strcmp(buf, "q\n") || !strcmp(buf, "Q\n"))
		{
			shutdown(sock, SHUT_WR);	// 调用shutdown函数向服务器端传递EOF。
			return;						// 执行第63行的return语句后，可以调用39行的close函数传递EOF。但现在已通过第33行的fork函数调用复制了文件描述符，
		}								// 此时无法通过1次close函数调用传递EOF，因此需要通过shutdown调用另外传递。
		write(sock, buf, strlen(buf));
	}
}
void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```



运用管道实现如下功能：

> 将回声客户端传输的字符串按序保存到文件中。我希望将该任务委托给另外的进程。换言之，另行创建进程，从向客户端提供服务的进程读取字符串信息。当然，该过程中需要创建用于接收数据的管道。



结构图：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260317112708863.png" alt="image-20260317112708863" style="zoom:50%;" />



```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#include<signal.h>
#include<sys/wait.h>
#define BUF_SIZE 100
void error_handling(char * message);
void read_childproc(int sig);

int main(int argc, char * argv[])
{
	int serv_sock, clnt_sock;
	struct sockaddr_in serv_adr, clnt_adr;
	int fds[2];
	
	pid_t pid;
	struct sigaction act;
	socklen_t adr_sz;
	int str_len, state;
	char buf[BUF_SIZE];
	if(argc != 2){
		printf("Usage: %s <port> \n", argv[0]);
		exit(1);
	}

	act.sa_handler = read_childproc;
	sigemptyset(&act.sa_mask);
	act.sa_flags = 0;
	state = sigaction(SIGCHLD, &act, 0);

	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("bind() error");
	if(listen(serv_sock, 5) == -1)
		error_handling("listen() error");

	pipe(fds);	//创建管道
	pid = fork();	//创建负责保存文件的子进程
	if(pid == 0)
	{
		FILE * fp = fopen("echomsg.txt", "wt");
		char msgbuf[BUF_SIZE];
		int i, len;
		for(i = 0; i < 10; i++)
		{
			len = read(fds[0], msgbuf, BUF_SIZE);
			fwrite((void*)msgbuf, 1, len, fp); //第二个参数表示基本单位是1个字节，第三个参数是要写多少个这样的基本单位。
		}
		fclose(fp);
		return 0;
	}

	while(1)
	{
		adr_sz = sizeof(clnt_adr);
		clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &adr_sz);
		if(clnt_sock == -1)
			continue;
		else
			puts("new client connected...");

		pid = fork(); //创建的所有子进程都拥有第45行创建的管道文件描述符。
		if(pid == 0)
		{
			close(serv_sock);
			while((str_len = read(clnt_sock, buf, BUF_SIZE)) != 0)
			{
				write(clnt_sock, buf, str_len);	// 向客户端提供服务
				write(fds[1], buf, str_len);	// 传输给保存文件的进程
			}

			close(clnt_sock);
			puts("client disconnected...");
			return 0;
		}
		else
			close(clnt_sock);
	}
	close(serv_sock);
	return 0;
}

void read_childproc(int sig)
{
	pid_t pid;
	int status;
	pid = waitpid(-1, &status, WNOHANG);
	printf("remove proc id: %d \n", pid);

}
void error_handling(char * message)
{
	fputs(message, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

B站码农论坛：

思路：将accept函数放到while循环中，如果pid大于0，就continue循环，父进程继续处理请求连接的客户端。此外还要注意关闭父进程的cfd和子进程的lfd。和前面的代码思路是类似的。只不过多了些东西：

* 将socket函数封装
* 增加了父子进程信号处理函数
* 信号处理函数中添加了释放socket的代码

```cpp
/*
 此程序用于演示多进程的socket服务端
*/
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <unistd.h>
#include <netdb.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
using namespace std;

class ctcpserver         // TCP通讯的服务端类。
{
private:
  int    m_listenfd;        // 监听的socket，-1表示未初始化。
  int    m_clientfd;        // 客户端连上来的socket，-1表示客户端未连接。
  string m_clientip;        // 客户端字符串格式的IP。
  unsigned short m_port;    // 服务端用于通讯的端口。
public:
  ctcpserver():m_listenfd(-1),m_clientfd(-1) {}

  // 初始化服务端用于监听的socket。
  bool initserver(const unsigned short in_port)
  {
    // 第1步：创建服务端的socket。
    if ( (m_listenfd=socket(AF_INET,SOCK_STREAM,0))==-1) return false;

    m_port=in_port;

    // 第2步：把服务端用于通信的IP和端口绑定到socket上。
    struct sockaddr_in servaddr;                // 用于存放协议、端口和IP地址的结构体。
    memset(&servaddr,0,sizeof(servaddr));
    servaddr.sin_family=AF_INET;                // ①协议族，固定填AF_INET。
    servaddr.sin_port=htons(m_port);            // ②指定服务端的通信端口。
    servaddr.sin_addr.s_addr=htonl(INADDR_ANY); // ③如果操作系统有多个IP，全部的IP都可以用于通讯。

    // 绑定服务端的IP和端口（为socket分配IP和端口）。
    if (bind(m_listenfd,(struct sockaddr *)&servaddr,sizeof(servaddr))==-1)
    {
      close(m_listenfd); m_listenfd=-1; return false;
    }

    // 第3步：把socket设置为可连接（监听）的状态。
    if (listen(m_listenfd,5) == -1 )
    {
      close(m_listenfd); m_listenfd=-1; return false;
    }

    return true;
    w
  }

  // 受理客户端的连接（从已连接的客户端中取出一个客户端），
  // 如果没有已连接的客户端，accept()函数将阻塞等待。
  bool accept()
  {
    struct sockaddr_in caddr;        // 客户端的地址信息。
    socklen_t addrlen=sizeof(caddr); // struct sockaddr_in的大小。
    if ((m_clientfd=::accept(m_listenfd,(struct sockaddr *)&caddr,&addrlen))==-1) return false;

    m_clientip=inet_ntoa(caddr.sin_addr);  // 把客户端的地址从大端序转换成字符串。

    return true;
  }

  // 获取客户端的IP(字符串格式)。
  const string & clientip() const
  {
    return m_clientip;
  }

  // 向对端发送报文，成功返回true，失败返回false。
  bool send(const string &buffer)
  {
    if (m_clientfd==-1) return false;

    if ( (::send(m_clientfd,buffer.data(),buffer.size(),0))<=0) return false;

    return true;
  }

  // 接收对端的报文，成功返回true，失败返回false。
  // buffer-存放接收到的报文的内容，maxlen-本次接收报文的最大长度。
  bool recv(string &buffer,const size_t maxlen)
  {
    buffer.clear();         // 清空容器。
    buffer.resize(maxlen);  // 设置容器的大小为maxlen。
    int readn=::recv(m_clientfd,&buffer[0],buffer.size(),0);  // 直接操作buffer的内存。
    if (readn<=0) { buffer.clear(); return false; }
    buffer.resize(readn);   // 重置buffer的实际大小。

    return true;
  }

  // 关闭监听的socket。
  bool closelisten()
  {
    if (m_listenfd==-1) return false;

    ::close(m_listenfd);
    m_listenfd=-1;
    return true;
  }

  // 关闭客户端连上来的socket。
  bool closeclient()
  {
    if (m_clientfd==-1) return false;

    ::close(m_clientfd);
    m_clientfd=-1;
    return true;
  }

 ~ctcpserver() { closelisten(); closeclient(); }
};

ctcpserver tcpserver;

void FathEXIT(int sig);  // 父进程的信号处理函数。
void ChldEXIT(int sig);  // 子进程的信号处理函数。

int main(int argc,char *argv[])
{
  if (argc!=2)
  {
    cout << "Using:./demo10 通讯端口\nExample:./demo10 5005\n\n";
    cout << "注意：运行服务端程序的Linux系统的防火墙必须要开通5005端口。\n";
    cout << "      如果是云服务器，还要开通云平台的访问策略。\n\n";
    return -1;
  }

  // 忽略全部的信号，不希望被打扰。顺便解决了僵尸进程的问题。
  // 子进程退出时会给父进程发 SIGCHLD，如果父进程不回收（wait）子进程，子进程就会变成僵尸进程。而把 SIGCHLD 设为忽略后，子进程退出时操作系统会自动回收它，就不会产生僵尸进程了。
  for (int ii=1;ii<=64;ii++) signal(ii,SIG_IGN);

  // 设置信号,在shell状态下可用 "kill 进程号" 或 "Ctrl+c" 正常终止进程
  // 但请不要用 "kill -9 +进程号" 强行终止
  signal(SIGTERM,FathEXIT); signal(SIGINT,FathEXIT);  // SIGTERM（kill） 15 SIGINT（ctrl+c） 2

  if (tcpserver.initserver(atoi(argv[1]))==false) // 初始化服务端用于监听的socket。
  {
    perror("initserver()"); return -1;
  }

  while (true)
  {
    // 受理客户端的连接（从已连接的客户端中取出一个客户端），
    // 如果没有已连接的客户端，accept()函数将阻塞等待。
    if (tcpserver.accept()==false)
    {
      perror("accept()"); return -1;
    }

    int pid=fork();
    if (pid==-1) { perror("fork()"); return -1; }  // 系统资源不足。
    if (pid>0)
    { // 父进程。
      tcpserver.closeclient();  // 父进程关闭客户端连接的socket。
      continue;                 // 父进程返回到循环开始的位置，继续受理客户端的连接。
    }

    tcpserver.closelisten();    // 子进程关闭监听的socket。

    // 子进程需要重新设置信号。
    signal(SIGTERM,ChldEXIT);   // 子进程的退出函数与父进程不一样。
    signal(SIGINT ,SIG_IGN);    // 子进程不需要捕获SIGINT信号。

    // 子进程负责与客户端进行通讯。
    cout << "客户端已连接(" << tcpserver.clientip() << ")。\n";

    string buffer;
    while (true)
    {
      // 接收对端的报文，如果对端没有发送报文，recv()函数将阻塞等待。
      if (tcpserver.recv(buffer,1024)==false)
      {
        perror("recv()"); break;
      }
      cout << "接收：" << buffer << endl;

      buffer="ok";
      if (tcpserver.send(buffer)==false)  // 向对端发送报文。
      {
        perror("send"); break;
      }
      cout << "发送：" << buffer << endl;
    }

    return 0;  // 子进程一定要退出，否则又会回到accept()函数的位置。
  }
}

// 父进程的信号处理函数。
void FathEXIT(int sig)
{
  // 以下代码是为了防止信号处理函数在执行的过程中再次被信号中断。
  signal(SIGINT,SIG_IGN); signal(SIGTERM,SIG_IGN);

  cout << "父进程退出，sig=" << sig << endl;

  kill(0,SIGTERM);     // 向全部的子进程发送15的信号，通知它们退出。

  // 在这里增加释放资源的代码（全局的资源）。
  tcpserver.closelisten();       // 父进程关闭监听的socket。

  exit(0);//不能写return，写return会回到被打断的地方继续执行。exit可以直接结束整个进程。
}

// 子进程的信号处理函数。
void ChldEXIT(int sig)
{
  // 以下代码是为了防止信号处理函数在执行的过程中再次被信号中断。
  signal(SIGINT,SIG_IGN); signal(SIGTERM,SIG_IGN);

  cout << "子进程" << getpid() << "退出，sig=" << sig << endl;

  // 在这里增加释放资源的代码（只释放子进程的资源）。
  tcpserver.closeclient();       // 子进程关闭客户端连上来的socket。

  exit(0);
}
```



### 多线程

多线程：当服务器与客户端 TCP 完成连接后，通过 pthread_create() 函数创建线程，然后将「已连接 Socket」的文件描述符传递给线程函数，接着在线程里和客户端进行通信。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/Gemini_Generated_Image_gwkxdkgwkxdkgwkx.png" alt="Gemini_Generated_Image_gwkxdkgwkxdkgwkx" style="zoom: 50%;" />

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <arpa/inet.h>
#include <pthread.h>

struct SockInfo
{
    int fd;                      // 通信
    pthread_t tid;               // 线程ID
    struct sockaddr_in addr;     // 地址信息
};

struct SockInfo infos[128];

void* working(void* arg)
{
    while(1)
    {
        struct SockInfo* info = (struct SockInfo*)arg;
        // 接收数据
        char buf[1024];
        int ret = read(info->fd, buf, sizeof(buf));
        if(ret == 0)
        {
            printf("客户端已经关闭连接...\n");
            info->fd = -1;
            break;
        }
        else if(ret == -1)
        {
            printf("接收数据失败...\n");
            info->fd = -1;
            break;
        }
        else
        {
            write(info->fd, buf, strlen(buf)+1);
        }
    }
    return NULL;
}

int main()
{
    // 1. 创建用于监听的套接字
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if(fd == -1)
    {
        perror("socket");
        exit(0);
    }

    // 2. 绑定
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;          // ipv4
    addr.sin_port = htons(8989);        // 字节序应该是网络字节序
    addr.sin_addr.s_addr =  INADDR_ANY; // == 0, 获取IP的操作交给了内核
    int ret = bind(fd, (struct sockaddr*)&addr, sizeof(addr));
    if(ret == -1)
    {
        perror("bind");
        exit(0);
    }

    // 3.设置监听
    ret = listen(fd, 100);
    if(ret == -1)
    {
        perror("listen");
        exit(0);
    }

    // 4. 等待, 接受连接请求
    int len = sizeof(struct sockaddr);

    // 数据初始化
    int max = sizeof(infos) / sizeof(infos[0]);
    for(int i=0; i<max; ++i)
    {
        bzero(&infos[i], sizeof(infos[i]));
        infos[i].fd = -1;
        infos[i].tid = -1;
    }

    // 父进程监听, 子进程通信
    while(1)
    {
        // 创建子线程
        struct SockInfo* pinfo;
        for(int i=0; i<max; ++i)
        {
            if(infos[i].fd == -1)
            {
                pinfo = &infos[i];
                break;
            }
            if(i == max-1)
            {
                sleep(1);
                i--;
            }
        }

        int connfd = accept(fd, (struct sockaddr*)&pinfo->addr, &len);
        printf("parent thread, connfd: %d\n", connfd);
        if(connfd == -1)
        {
            perror("accept");
            exit(0);
        }
        pinfo->fd = connfd;
        pthread_create(&pinfo->tid, NULL, working, pinfo);
        pthread_detach(pinfo->tid);
    }

    // 释放资源
    close(fd);  // 监听

    return 0;
}
```

==多人聊天室程序：==

核心逻辑：**主线程负责不断接收新客户端的连接，每来一个客户端，就创建一个新的子线程去专门服务它。所有的子线程共享一个包含所有客户端信息的数组，当收到某人的消息时，就群发给所有人。**

架构图：

![Client-Server Socket-2026-03-23-114854](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/Client-Server%20Socket-2026-03-23-114854.png)

服务器端：

```cpp
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <pthread.h>

#define BUF_SIZE 100
#define MAX_CLNT 256    

void* handle_clnt(void* arg);
void send_msg(char* msg, int len);
void error_handling(char* msg);

int clnt_cnt = 0;
int clnt_socks[MAX_CLNT];
pthread_mutex_t mutx;

int main(int argc, char* argv[])
{
    int serv_sock, clnt_sock;
    struct sockaddr_in serv_adr, clnt_adr;
    socklen_t clnt_adr_sz; // 【优化】规范化类型，使用 socklen_t
    pthread_t t_id;
    
    if(argc != 2)
    {
        printf("Usage: %s <port>\n", argv[0]);
        exit(1);
    }

    pthread_mutex_init(&mutx, NULL);
    serv_sock = socket(PF_INET, SOCK_STREAM, 0);

    memset(&serv_adr, 0, sizeof(serv_adr));
    serv_adr.sin_family = AF_INET;
    serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
    serv_adr.sin_port = htons(atoi(argv[1]));

    if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
        error_handling("bind() error");

    if(listen(serv_sock, 5) == -1)
        error_handling("listen() error");

    printf("Server is running on port %s...\n", argv[1]);

    while(1)
    {
        clnt_adr_sz = sizeof(clnt_adr);
        clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &clnt_adr_sz);
        
        // 【新增保护】防止客户端数量超过数组上限导致内存溢出崩溃
        pthread_mutex_lock(&mutx);
        if (clnt_cnt >= MAX_CLNT) {
            printf("Connection Refused: Max clients reached.\n");
            pthread_mutex_unlock(&mutx);
            close(clnt_sock); // 拒接连接并关闭
            continue;
        }
        
        // 【修复 Bug 1】动态分配内存存放新套接字，防止被下一次 accept 覆盖
        int* new_sock = (int*)malloc(sizeof(int));
        *new_sock = clnt_sock;

        clnt_socks[clnt_cnt++] = clnt_sock;
        pthread_mutex_unlock(&mutx);

        // 传递动态分配的内存地址过去
        pthread_create(&t_id, NULL, handle_clnt, (void*)new_sock);
        pthread_detach(t_id);
        
        printf("Connected client IP: %s, Socket FD: %d \n", inet_ntoa(clnt_adr.sin_addr), clnt_sock);
    }
    
    close(serv_sock);
    pthread_mutex_destroy(&mutx); // 规范操作：销毁互斥锁
    return 0;
}

void* handle_clnt(void* arg)
{
    // 提取传入的套接字，并立即释放 main 函数中 malloc 的内存！
    int clnt_sock = *((int*)arg);
    free(arg); // 【配合修复 Bug 1】

    int str_len = 0, i, j;
    char msg[BUF_SIZE];

    // 只要能读到数据，就群发
    while((str_len = read(clnt_sock, msg, BUF_SIZE)) != 0)
    {
        send_msg(msg, str_len);
    }

    // 客户端断开连接，开始清理数组
    pthread_mutex_lock(&mutx);
    for(i = 0; i < clnt_cnt; i++)
    {
        if(clnt_sock == clnt_socks[i])
        {
            // 【修复 Bug 2】使用标准的 for 循环进行数组前移覆盖，逻辑清晰绝不越界
            for(j = i; j < clnt_cnt - 1; j++)
            {
                clnt_socks[j] = clnt_socks[j + 1];
            }
            break;
        }
    }
    clnt_cnt--;
    pthread_mutex_unlock(&mutx);
    
    printf("Client disconnected, Socket FD: %d \n", clnt_sock);
    close(clnt_sock);
    
    return NULL;
}

void send_msg(char* msg, int len)
{
    int i;
    pthread_mutex_lock(&mutx);
    for(i = 0; i < clnt_cnt; i++)
    {
        write(clnt_socks[i], msg, len);
    }
    pthread_mutex_unlock(&mutx);
}

void error_handling(char* msg)
{
    fputs(msg, stderr);
    fputc('\n', stderr);
    exit(1);
}
```

客户端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#include<pthread.h>
#define BUF_SIZE 100
#define NAME_SIZE 20

void* send_msg(void* arg);
void* recv_msg(void* arg);
void error_handling(char* msg);

char name[NAME_SIZE] = "[DEFAULT]";
char msg[BUF_SIZE];

int main(int argc, char* argv[])
{
	int sock;
	struct sockaddr_in serv_addr;
	pthread_t snd_thread, rcv_thread;
	void* thread_return;
	if(argc != 4)
	{
		printf("Usage: %s<IP><port><name>\n", argv[0]);
		exit(1);
	}

	sprintf(name, "[%s]", argv[3]);
	sock = socket(PF_INET, SOCK_STREAM, 0);

	memset(&serv_addr, 0, sizeof(serv_addr));
	serv_addr.sin_family = AF_INET;
	serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_addr.sin_port = htons(atoi(argv[2]));

	if(connect(sock, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) == -1)
		error_handling("connect() error");

	pthread_create(&snd_thread, NULL, send_msg, (void*)&sock);
	pthread_create(&rcv_thread, NULL, recv_msg, (void*)&sock);
	pthread_join(snd_thread, &thread_return);
	pthread_join(rcv_thread, &thread_return);
	close(sock);
	return 0;
}

void* send_msg(void* arg)	//send thread main
{
	int sock = *((int*)arg);	
	char name_msg[NAME_SIZE + BUF_SIZE];
	while(1)
	{
		fgets(msg, BUF_SIZE, stdin);
		if(!strcmp(msg, "q\n") || !strcmp(msg, "Q\n"))
		{
			close(sock);
			exit(0);
		}
		sprintf(name_msg, "%s %s", name, msg);
		write(sock, name_msg, strlen(name_msg));
	}
	return NULL;
}

void* recv_msg(void* arg)	//read thread main
{
	int sock=*((int*)arg);
	char name_msg[NAME_SIZE + BUF_SIZE];
	int str_len;
	while(1)
	{
		str_len = read(sock, name_msg, NAME_SIZE + BUF_SIZE - 1);
		if(str_len == -1)
			return (void*)-1;
		name_msg[str_len] = 0;
		fputs(name_msg, stdout);
	}
	return NULL;
}

void error_handling(char* msg)
{
	fputs(msg, stderr);
	fputc('\n', stderr);
	exit(1);
}
```



多路复用：用一个进程来维护多个Socket。

与多进程和多线程技术相比，I/O多路复用技术的最大优势是系统开销小，系统不必创建进程/线程，也不必维护这些进程/线程，从而大大减小了系统的开销。

### I/O多路复用

让一个线程/进程管理多个网络连接，使得服务器能够高效的处理大量的并发连接而不需要为每个连接都创建一个线程来管理。

> 如何理解并发连接：宏观的并发就是在一个时间段内发生了很多事情，并发连接就是在短时间内有很多连接到达服务端。

![image-20260311164635527](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260311164635527.png)

IO多路复用主要有select、poll、epoll。select一个进程最多处理1024个连接，poll能处理数千个连接，而epoll能处理百万连接。

再讲这几个技术前，先理清网络通讯的读写事件。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260610162252555.png" alt="image-20260610162252555" style="zoom: 25%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260610162342319.png" alt="image-20260610162342319" style="zoom:25%;" />

> 读事件的第一条讲的是监听socket：已连接队列里有握手完成、准备好的连接，这时监听 socket 变得"可读"，提示你"快调 accept() 把它取走，accept不会阻塞"。后两个讲的是和客户端进行通信的socket。

#### select

select可以使一个进程维护多个文件描述符。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260318144952181.png" alt="image-20260318144952181" style="zoom:50%;" />

使用fd_set数组将要监视的fd集中在一起。fd_set本质上也是个位图。把需要监视的fd对应的位设置为1。

如何设置：因为是位图，所以直接操作该变量会很繁琐，需要用宏来进行操作。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260318145337329.png" alt="image-20260318145337329" style="zoom:33%;" />



- `FD_ZERO(fd_set* fdset)`，将`fd_set`变量的所有位初始化位0。
- `FD_SET(int fd, fd_set * fdest)`，在参数`fd_set`指向的变量中注册文件描述符fd的信息
- `FD_CLR(int fd, fd_set * fdset)`，从参数`fd_set`指向的变量中清除文件描述符fd的信息。
- `FD_ISSET(int fd, fd_set * fdset)`，若参数`fd_set`指向的变量中包含文件描述符fd的信息，则返回“真”。

select函数：

```cpp
#include<sys/select.h>
#include<sys/time.h>
int select(
int maxfd, fd_set * readset, fd_set * writeset, fd_set * exceptset, const struct timeval * timeout);
```

> 参数1：maxfd，监视对象文件描述符数量。(最大的文件描述符值+1)
>
> 参数2：readset（关注读事件），将所有关注 “是否存在带读取数据” 的文件描述符注册到fd_set型变量，并传递其地址值。
>
> 参数3：writeset（关注写事件），将所有关注 “是否可传输无阻塞数据” 的文件描述符注册到fd_set型变量，并传递其地址值。
>
> 参数4：exceptset，将所有关注 “是否发生异常” 的文件描 述符注册到fd_set型变量，并传递其地址值。
>
> 参数5：timeout，调用select函数后，为防止陷入无限阻塞的状态，传递超时信息。
>
> 返回值：发生错误时返回-1，超时返回时返回0。因发生关注的事件返回时，返回大于0的值，该值是发生事件的文件描述符个数。

第五个参数我们之前学过：

```cpp
struct timeval
{
	long tv_sec;	//seconds
	long tv_usec;	//microseconds 微秒
}
```

函数调用后，如何知道哪些文件描述符发生了变化。（监视的文件描述符发生了相应的监视事件。）

发生变化的文件描述符对应位是1，所以可以用宏FD_ISSET来判断哪些发生了变化。

select示例：

```cpp
#include<stdio.h>
#include<unistd.h>
#include<sys/time.h>
#include<sys/select.h>
#define BUF_SIZE 30

int main(int argc, char * argv[])
{
	fd_set reads, temps;	// temps为后面提供初始化作用，用于重复初始化reads注册过的监视项。
	int result, str_len;
	char buf[BUF_SIZE];
	struct timeval timeout;

	FD_ZERO(&reads);	// 初始化fd_set变量
	FD_SET(0, &reads);  // 0是标准输入的文件描述符	//将文件描述符0对应的位设置为1。换言之，需要监视标准输入的变化。

	/*
	 timeout.tv_sec = 5;		
	 timeout.tv_usec = 5000;
	*/	//这是为了设置select函数的超时而添加的。但不能在此时设置超时。
		//因为每次调用select函数后，结构体timeval的成员tv_sec和tv_usec的值将被替换为超时前剩余时间。
		//因此，调用select函数前，每次都需要初始化timeval结构体变量。

	while(1)
	{
		temps = reads;	//为了避免上一次循环监测的影响，每次循环的开始都要将fd_set变量的所有位清空，并注册标准输入的文件描述符0，为了记住初始值的设置，必须经过这种复制过程。这是使用select函数的通用方法。
		timeout.tv_sec = 5;		// 将初始化timeval结构体的代码插入循环后，每次调用select函数前都会初始化新值。
		timeout.tv_usec = 0;
		result = select(1, &temps, 0, 0, &timeout); //调用select函数。如果有控制台输入数据，则返回大于0的整数；如果没有输入数据而引发超时，则返回0。
		if(result == -1)
		{
			puts("select() error!");
			break;
		}
		else if(result == 0)
		{
			puts("Time-out!");
		}
		else
		{
			if(FD_ISSET(0, &temps))		//select函数返回大于0的值时运行的区域。验证发生变化的文件描述符是否为标准输入。若是，则从标准输入读取数据并向控制台输出。
			{
				str_len = read(0, buf, BUF_SIZE);
				buf[str_len] = 0;
				printf("message from console: %s", buf);
			}
		}
	}
	return 0;
}
```

使用select函数实现IO多路复用

思路：让内核去监听客户端连接(lfd)，当有客户端进行连接时 它会让server去调用accept(当有连接时才去立即调用，而不是一直阻塞等待)得到一个用于通信的cfd，最后让内核监管着lfd和所有cfd。

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#include<sys/time.h>
#include<sys/select.h>



#define BUF_SIZE 100
void error_handling(char *buf);

int main(int argc, char * argv[])
{
	int serv_sock, clnt_sock;
	struct sockaddr_in serv_adr, clnt_adr;
	struct timeval timeout;
	fd_set reads, cpy_reads;

	socklen_t adr_sz;
	int fd_max, str_len, fd_num, i;
	char buf[BUF_SIZE];
	if(argc != 2)
	{
		printf("Usage: %s <port> \n", argv[0]);
		exit(1);
	}
	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("listen() error");
	if(listen(serv_sock, 5) == -1)
		error_handling("listen() error");

	FD_ZERO(&reads);
	FD_SET(serv_sock, &reads);	//向要传到select函数第二个参数的fd_set变量reads注册服务器端套接字。
								//这样，接收数据情况的监视对象就包含了服务器端套接字。
								//客户端的连接请求同样通过传输数据完成。
								//因此，服务器端套接字中有接受的数据，就意味着有新的连接请求。
	fd_max = serv_sock;

	while(1)
	{
		cpy_reads = reads;
		timeout.tv_sec = 5;
		timeout.tv_usec = 5000;

		if((fd_num = select(fd_max + 1, &cpy_reads, 0, 0, &timeout)) == -1)	//在while无限循环中调用select函数。select函数的第三和第四个参数为空。只需根据监视目的传递必要的参数。
			break;
		if(fd_num == 0)
			continue;

		for(i = 0; i < fd_max + 1; i++)	
		{
			if(FD_ISSET(i, &cpy_reads))	// 查找发生状态变化的文件描述符
			{
				if(i == serv_sock)	//验证服务器端套接字是否有变化，如果是服务器端套接字的变化，将受理连接请求。
				{
					adr_sz = sizeof(clnt_adr);
					clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &adr_sz);
					FD_SET(clnt_sock, &reads);	// 在fd_set变量reads中注册了与客户端连接的套接字文件描述符。
					if(fd_max < clnt_sock)
						fd_max = clnt_sock;
					printf("Connected client: %d \n", clnt_sock);
				}
				else	//发生变化的套接字并非服务器端套接字时，即有要接收的数据时执行else语句。
				{
					str_len = read(i, buf, BUF_SIZE);
					if(str_len == 0)	//接收的数据为EOF时需要关闭套接字，并从reads中删除相应信息。
					{
						FD_CLR(i, &reads);
						close(i);
						printf("closed client: %d \n", i);
					}
					else	//接收的数据为字符串时，执行回声服务。
					{
						write(i, buf, str_len);
					}
				}
			}
		}
	}
	close(serv_sock);
	return 0;
}

void error_handling(char * buf)
{
	fputs(buf, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

> 小林coding对select的解释：select 实现多路复用的方式是：将已连接的 Socket 都放到一个文件描述符集合，然后调用 select 函数将文件描述符集合拷贝到内核里，让内核来检查是否有网络事件产生，检查的方式很粗暴，就是通过遍历文件描述符集合的方式，当检查到有事件产生后，将此Socket标记为可读或可写，接着再把整个文件描述符集合拷贝回用户态里，然后用户态还需要再通过遍历的方法找到可读或可与的Socket，然后再对其处理。
>
> 所以，对于select 这种方式，需要进行2次遍历」文件描述符集合，一次是在内核态里，一个次是在用户态里，而且还会发生2次「拷贝」文件描述符集合，先从用户空间传入内核空间，由内核修改后，再传出到用户空间中。
>
> 2次拷贝的细节：你调用 `select` 的那一刻，内核需要知道"你到底要监视哪些 fd"。于是内核把你准备好的那个 `readfds` 集合，**从用户空间整个拷贝一份到内核空间**。这样内核才能拿着这份集合，去逐个检查里面标记的 fd 当前是不是就绪了。
>
> 内核检查完之后（哪些可读、哪些不可读），它会**直接修改**内核里那份集合：把**没就绪**的 fd 对应的位清掉，只**留下就绪**的那些位还是 1。换句话说，内核把"我要监视谁"的集合，改写成了"现在谁就绪了"的结果集合。
>
> 然后内核再把这份改好的结果集合，**从内核空间拷贝回用户空间**，覆盖掉你原来那个cpy_reads。`select` 返回后，cpy_reads 里就只剩下就绪 fd 的位还是 1 了，再用 `FD_ISSET` 一个个查，就知道是哪些 fd 有事件了。

select是水平触发模式：select监视的socket如果发生了事件，select会立即返回，通知应用程序处理事件；如果事件没有被处理或者没有处理完，再次调用select的时候会立即再通知。关于水平触发模式还会在后续章节提及。

select存在的问题：

*  采用轮询方式扫描bitmap，性能会随着socket数量增加而下降。
* 每次调用select，会发生两次bitmap拷贝。
* bitmap的大小（决定单个进程/线程能管理的socket数量）由FD_SETSIZE宏设置，默认是1024个，可以修改，但效率会降低。

#### poll

*  poll 和 select 原理基本一致，最大的区别是去掉了最大 1024 个文件描述符的限制。

* select 使用固定长度的 BitsMap，表示文件描述符集合，而且所支持的文件描述符的个数是有限制的，在 Linux 系统中，由内核中的 FD_SETSIZE 限制， 默认最大值为 1024，只能监听 0~1023 的文件描述符。

* poll 不再用 BitsMap 来存储所关注的文件描述符，取而代之用结构体数组，传入内核后转换成了链表，突破了 select 的文件描述符个数限制，当然还会受到系统文件描述符限制。（一个进程默认最多打开的fd个数是1024，但是可以通过ulimit -n来修改。）

* 调用poll前不需要拷贝结构体数组。

```
struct pollfd
{
	int fd; //需要监视的socket
	short events;//需要监视的事件 POLLIN读事件 POLLOUT写事件 POLLIN｜POLLOUT 既监视读也监视写
	short revents; //poll返回的事件
}
```

定义一个结构体数组fds，fds[i].fd为-1时，poll将忽略该socket。

poll函数：`int poll(struct pollfd *fds, nfds_t nfds, int timeout);` 返回值和select函数一样。

| 参数      | 含义                             |
| --------- | -------------------------------- |
| `fds`     | `pollfd` 数组，里面放要监听的 fd |
| `nfds`    | 一般设为maxfd+1                  |
| `timeout` | 超时时间，单位是毫秒             |

当调用 poll 函数时，内核会检查每个 pollfd 结构体中列出的文件描述符，看看是否有任何指定的事件发生。如果有，内核将会在 revents 字段中设置相应的位，以指示哪些事件已经发生。然后poll函数返回，应用程序可以检查每个 pollfd 结构体的 revents 字段来确定每个文件描述符上发生了哪些事件。当 poll 调用之后用revents & POLLIN 判断某事件是否就绪。

```cpp
/*
 * 程序名：tcppoll.cpp，此程序用于演示采用poll模型实现网络通讯的服务端。
 * 作者：吴从周
*/
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <poll.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <sys/fcntl.h>

// 初始化服务端的监听端口。
int initserver(int port);

int main(int argc,char *argv[])
{
    if (argc != 2) { printf("usage: ./tcppoll port\n"); return -1; }

    // 初始化服务端用于监听的socket。
    int listensock = initserver(atoi(argv[1]));
    printf("listensock=%d\n",listensock);

    if (listensock < 0) { printf("initserver() failed.\n"); return -1; }

    pollfd fds[2048];                 // fds存放需要监视的socket。

    // 初始化数组，把全部的socket设置为-1，如果数组中的socket的值为-1，那么，poll将忽略它。
    for (int ii=0;ii<2048;ii++)
        fds[ii].fd=-1;

    // 打算让poll监视listensock读事件。
    fds[listensock].fd=listensock;
    fds[listensock].events=POLLIN;        // POLLIN表示读事件，POLLOUT表示写事件。
    // fds[listensock].events=POLLIN|POLLOUT;

    int maxfd=listensock;        // fds数组中需要监视的socket的实际大小。

    while (true)        // 事件循环。
    {
        // 调用poll() 等待事件的发生（监视哪些socket发生了事件)。
        int infds=poll(fds,maxfd+1,10000);      // 超时时间为10秒。

        // 如果infds<0，表示调用poll()失败。
        if (infds < 0)
        {
            perror("poll() failed"); break;
        }

        // 如果infds==0，表示poll()超时。
        if (infds == 0)
        {
            printf("poll() timeout.\n"); continue;
        }

        // 如果infds>0，表示有事件发生，infds存放了已发生事件的个数。
        for (int eventfd=0;eventfd<=maxfd;eventfd++)
        {
            if (fds[eventfd].fd<0) continue;                               // 如果fd为负，忽略它。

            if ((fds[eventfd].revents&POLLIN)==0)  continue;  // 如果没有读事件，continue

            // 如果发生事件的是listensock，表示已连接队列中有已经准备好的socket（有新的客户端连上来了）。
            if (eventfd==listensock)
            {
                struct sockaddr_in client;
                socklen_t len = sizeof(client);
                int clientsock = accept(listensock,(struct sockaddr*)&client,&len);
                if (clientsock < 0) { perror("accept() failed"); continue; }

                printf ("accept client(socket=%d) ok.\n",clientsock);

                // 修改fds数组中clientsock位置的元素。
                fds[clientsock].fd=clientsock;
                fds[clientsock].events=POLLIN;

                if (maxfd<clientsock) maxfd=clientsock;    // 更新maxfd的值。
            }
            else
            {
                // 如果是客户端连接的socke有事件，表示有报文发过来了或者连接已断开。

                char buffer[1024]; // 存放从客户端读取的数据。
                memset(buffer,0,sizeof(buffer));
                if (recv(eventfd,buffer,sizeof(buffer),0)<=0)
                {
                    // 如果客户端的连接已断开。
                    printf("client(eventfd=%d) disconnected.\n",eventfd);

                    close(eventfd);               // 关闭客户端的socket。
                    fds[eventfd].fd=-1;        // 修改fds数组中clientsock位置的元素，置为-1，poll将忽略该元素。

                    // 重新计算maxfd的值，注意，只有当eventfd==maxfd时才需要计算。
                    if (eventfd == maxfd)
                    {
                        for (int ii=maxfd;ii>0;ii--)  // 从后面往前找。
                        {
                            if (fds[ii].fd!=-1)
                            {
                                maxfd = ii; break;
                            }
                        }
                    }
                }
                else
                {
                    // 如果客户端有报文发过来。
                    printf("recv(eventfd=%d):%s\n",eventfd,buffer);

                    send(eventfd,buffer,strlen(buffer),0);
                }
            }
        }
    }

    return 0;
}

// 初始化服务端的监听端口。
int initserver(int port)
{
    int sock = socket(AF_INET,SOCK_STREAM,0);
    if (sock < 0)
    {
        perror("socket() failed"); return -1;
    }

    int opt = 1; unsigned int len = sizeof(opt);
    setsockopt(sock,SOL_SOCKET,SO_REUSEADDR,&opt,len);

    struct sockaddr_in servaddr;
    servaddr.sin_family = AF_INET;
    servaddr.sin_addr.s_addr = htonl(INADDR_ANY);
    servaddr.sin_port = htons(port);

    if (bind(sock,(struct sockaddr *)&servaddr,sizeof(servaddr)) < 0 )
    {
        perror("bind() failed"); close(sock); return -1;
    }

    if (listen(sock,5) != 0 )
    {
        perror("listen() failed"); close(sock); return -1;
    }

    return sock;
}
```



#### epoll

回顾下select，select可以让一个进程同时管理多个fd，把需要监视的fd集中在了一起。

先来说一下select的缺点：

* 需要循环找到哪些监视对象发生了变化。（监视对象就是需要监视的fd）
* 每次调用select的时候都需要传递监视对象信息。

相比于循环语句，实际上影响性能的最大因素是每次传递监视对象信息。为什么呢？因为监视对象信息需要传递给操作系统，应用程序向操作系统传递数据将对程序造成很大负担，而且无法通过优化代码解决，因此将称为性能上的致命弱点。

那为何需要把监视对象信息传递给操作系统呢？因为套接字是操作系统管理的，select是监视套接字变化的函数，所以需要借助操作系统才能完成功能。

接下来引入epoll，epoll很好的解决的上述问题。

epoll服务端需要的三个函数：

- `epoll_create`：创建保存epoll文件描述符的空间。
- `epoll_ctl` ：向空间注册并注销文件描述符。
- `epoll_wait`：与select函数类似，等待文件描述符发生变化。

select方式中为了保存监视的文件描述符，直接声明了fd_set变量。但epoll方式下由操作系统负责保存监视的文件描述符， 因此需要向操作系统请求创建保存文件描述符的空间，此时用的函数就是epoll_create。

此外，为了添加和删除监视对象文件描述符，select方式中需要`FD_SET`、`FD_CLR`函数。但在epoll方式中，通过`epoll_ctl`函数请求操作系统完成。最后，select方式下调用`select`函数等待文件描述符的变化，而epoll调用`epoll_wait`函数。还有，select方式中通过fd_set变量查看监视对象的状态变化（事件发生与否），而epoll方式中通过如下结构体epoll_event将发生变化的（发生事件的）文件描述符单独集中到一起。

```cpp
struct epoll_event
{
    __unit32_t events; //事件 EPOLLIN EPOLLOUT
    epoll_data_t data;
}
typedef union epoll_data //共同体 union 就是多个变量共用同一块内存空间 不能同时使用多个成员。	
{
    void* ptr;
    int fd;
    __unit32_t u32;
    __unit64_t u64;
}epoll_data_t;
```

声明足够大的epoll_event结构体数组后，传递给epoll_wait函数时，发生变化的文件描述符信息将被填入该数组。

第一个函数：`epoll_create`

`int epoll_create(int size);` size没什么用，操作系统会自动忽略，填一个大于0的数即可。该函数返回epoll文件描述符，失败返回-1。

调用epoll_create函数时创建的文件描述符保存空间称为「epoll例程」

第二个函数：`epoll_ctl` 

`int epoll_ctl(int epfd, int op, int fd, struct epoll_event* event);`

* 失败返回-1，成功返回0。
* epfd：epoll例程对应的文件描述符
* op：指定添加监视对象、删除监视对象、更改等操作（EPOLL_CTL_ADD、EPOLL_CTL_DEL、EPOLL_CTL_MOD）
* fd：注册监视对象
* event：监视对象的事件类型

举例：

`epoll_ctl(A, EPOLL_CTL_ADD, B, C);`：“epoll例程A中注册文件描述符B，主要目的是监视参数C中的事件。”

`epoll_ctl(A, EPOLL_CTL_DEL, B, NULL);`：从epoll例程A中删除文件描述符B。

重点看第四个参数，是一个epoll_event结构体类型的指针

```cpp
struct epoll_event event;
...
event.events = EPOLLIN;	//发生需要读取数据的情况（事件）时
event.data.fd = sockfd;
epoll_ctl(epfd, EPOLL_CTL_ADD, sockfd, &event);
...
```

上述代码将sockfd注册到epoll例程epfd中，并在需要读取数据的情况下产生相应事件。

接下来给出epoll_event变量的成员events中可以保存的常量及所指的事件类型：

| EPOLL_CTL_MOD常量 | 事件类型                                                     |
| ----------------- | ------------------------------------------------------------ |
| EPOLLIN           | 需要读取数据的情况                                           |
| EPOLLOUT          | 输出缓冲为空，可以立即发送数据的情况                         |
| EPOLLPRI          | 收到OOB数据的情况                                            |
| EPOLLRDHUB        | 断开连接或半关闭的情况，这在边缘触发方式下非常有用。         |
| EPOLLERR          | 发生错误的情况                                               |
| EPOLLET           | 以边缘触发的方式得到事件通知。                               |
| EPOLLONESHOT      | 发生一次事件后，相应文件描述符不再收到事件通知。因此需要向epoll_ctl函数的第二个参数传递EPOLL_CTL_MOD,再次设置事件。 |

第三个函数：`epoll_wait`

`int epoll_wait(int epfd, struct epoll_event* events, int maxevents, int timeout);`

> 成功时返回发生事件的描述符总数，失败时返回-1。
>
> 参数1：epfd，epoll例程的文件描述符。
>
> 参数2：events，保存发生事件的文件描述符集合的结构体地址值。
>
> 参数3：maxevents，第二个参数中可以保存的最大事件数。
>
> 参数4：timeout，以1/1000秒为单位的等待时间，传递-1时，表示不启动超时，一直等待直到发生事件。

该函数的调用方法如下。需要注意的是，第二个参数所指定缓冲需要动态分配。

```cpp
int event_cnt;
struct epoll_event* ep_events;//指向epoll_event结构体数组的指针
...
ep_events = malloc(sizeof(struct epoll_event)*EPOLL_SIZE); //EPOLL_SIZE是宏常量
...
events_cnt = epoll_wait(epfd, ep_events, EPOLL_SIZE, -1); 
```

epoll示例：

基于epoll的回声服务端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#include<sys/epoll.h>

#define BUF_SIZE 100
#define EPOLL_SIZE 50	
void error_handling(char* buf);

int main(int argc, char* argv[])
{
	int serv_sock, clnt_sock;
	struct sockaddr_in serv_adr, clnt_adr;
	socklen_t adr_sz;
	int str_len, i;
	char buf[BUF_SIZE];

	struct epoll_event* ep_events;
	struct epoll_event event;
	int epfd, event_cnt;

	if(argc != 2){
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
	error_handling("bind() error");
	if(listen(serv_sock, 5) == -1)
		error_handling("listen() error");

	epfd = epoll_create(EPOLL_SIZE);
	ep_events = malloc(sizeof(struct epoll_event)*EPOLL_SIZE);

	event.events = EPOLLIN;
	event.data.fd = serv_sock;
	epoll_ctl(epfd, EPOLL_CTL_ADD, serv_sock, &event);

	while(1)
	{
		event_cnt = epoll_wait(epfd, ep_events, EPOLL_SIZE, -1);
		if(event_cnt == -1)
		{
			puts("epoll_wait() error");
			break;
		}
		
		for(i = 0; i < event_cnt; i++)
		{
			if(ep_events[i].data.fd == serv_sock)
			{
				adr_sz = sizeof(clnt_adr);
				clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &adr_sz);
				event.events = EPOLLIN;
				event.data.fd = clnt_sock;
				epoll_ctl(epfd, EPOLL_CTL_ADD, clnt_sock, &event);
				printf("connected client: %d\n", clnt_sock);
			}
			else
			{
				str_len = read(ep_events[i].data.fd, buf, BUF_SIZE);
				if(str_len == 0) //close request!
				{
					epoll_ctl(epfd, EPOLL_CTL_DEL, ep_events[i].data.fd, NULL);
					close(ep_events[i].data.fd);
					printf("closed client: %d\n", ep_events[i].data.fd);
				}
				else
				{
					write(ep_events[i].data.fd, buf, str_len);
				}
			}

		}
	}
	close(serv_sock);
	close(epfd);
	return 0;
}

void error_handling(char* buf)
{
	fputs(buf, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

```cpp
/*
 * 程序名：tcpepoll.cpp，此程序用于演示采用epoll模型实现网络通讯的服务端。
 * 作者：吴从周
*/
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <arpa/inet.h>
#include <sys/fcntl.h>
#include <sys/epoll.h>

// 初始化服务端的监听端口。
int initserver(int port);

int main(int argc,char *argv[])
{
    if (argc != 2) { printf("usage: ./tcpepoll port\n"); return -1; }

    // 初始化服务端用于监听的socket。
    int listensock = initserver(atoi(argv[1]));
    printf("listensock=%d\n",listensock);

    if (listensock < 0) { printf("initserver() failed.\n"); return -1; }

    // 创建epoll句柄。
    int epollfd=epoll_create(1);

    // 为服务端的listensock准备读事件。
    epoll_event ev;              // 声明事件的数据结构。
    ev.data.fd=listensock;   // 指定事件的自定义数据，会随着epoll_wait()返回的事件一并返回。
    // ev.data.ptr=(void*)"超女";   // 指定事件的自定义数据，会随着epoll_wait()返回的事件一并返回。
    ev.events=EPOLLIN;      // 打算让epoll监视listensock的读事件。

    epoll_ctl(epollfd,EPOLL_CTL_ADD,listensock,&ev);     // 把需要监视的socket和事件加入epollfd中。

    epoll_event evs[10];      // 存放epoll返回的事件。

    while (true)        // 事件循环。
    {
        // 等待监视的socket有事件发生。
        int infds=epoll_wait(epollfd,evs,10,-1);

        // 返回失败。
        if (infds < 0)
        {
            perror("epoll() failed"); break;
        }

        // 超时。
        if (infds == 0)
        {
            printf("epoll() timeout.\n"); continue;
        }

        // 如果infds>0，表示有事件发生的socket的数量。
        for (int ii=0;ii<infds;ii++)       // 遍历epoll返回的数组evs。
        {
            // printf("ptr=%s,events=%d\n",evs[ii].data.ptr,evs[ii].events);

            // 如果发生事件的是listensock，表示有新的客户端连上来。
            if (evs[ii].data.fd==listensock)
            {
                struct sockaddr_in client;
                socklen_t len = sizeof(client);
                int clientsock = accept(listensock,(struct sockaddr*)&client,&len);

                printf ("accept client(socket=%d) ok.\n",clientsock);

                // 为新客户端准备读事件，并添加到epoll中。
                ev.data.fd=clientsock;
                ev.events=EPOLLIN;
                epoll_ctl(epollfd,EPOLL_CTL_ADD,clientsock,&ev);
            }
            else
            {
                // 如果是客户端连接的socke有事件，表示有报文发过来或者连接已断开。
                char buffer[1024]; // 存放从客户端读取的数据。
                memset(buffer,0,sizeof(buffer));
                if (recv(evs[ii].data.fd,buffer,sizeof(buffer),0)<=0)//recv返回-1有很多种情况，比如EAGAIN / EWOULDBLOCK：表示"现在暂时没有数据可读"。EINTR：表示 recv 在收到数据之前被信号打断了。等等。但是这个程序中socket是阻塞的，因为创建的时候没有加O_NONBLOCK ,所以 recv 没数据时只会一直等，绝不会返回 EAGAIN。 也没有加信号机制，所以不会返回EINTR。在这段代码里返回 -1，几乎只剩下 ECONNRESET 这类真正的异常断开（对端发了 RST，比如对端进程崩了、强制关闭）。而这本来就是一种（非正常的）断开，close 掉它是对的。recv返回0代表是对端正常关闭，所以这里的判断逻辑没问题。
                {
                    // 如果客户端的连接已断开。
                    printf("client(eventfd=%d) disconnected.\n",evs[ii].data.fd);
                    close(evs[ii].data.fd);            // 关闭客户端的socket
                    // 从epollfd中删除客户端的socket，如果socket被关闭了，会自动从epollfd中删除，所以，以下代码不必启用。
                    // epoll_ctl(epollfd,EPOLL_CTL_DEL,evs[ii].data.fd,0);
                }
                else
                {
                    // 如果客户端有报文发过来。
                    printf("recv(eventfd=%d):%s\n",evs[ii].data.fd,buffer);

                    // 把接收到的报文内容原封不动的发回去。
                    send(evs[ii].data.fd,buffer,strlen(buffer),0);
                }
            }
        }
    }

  return 0;
}

// 初始化服务端的监听端口。
int initserver(int port)
{
    int sock = socket(AF_INET,SOCK_STREAM,0);
    if (sock < 0)
    {
        perror("socket() failed"); return -1;
    }

    int opt = 1; unsigned int len = sizeof(opt);
    setsockopt(sock,SOL_SOCKET,SO_REUSEADDR,&opt,len);

    struct sockaddr_in servaddr;
    servaddr.sin_family = AF_INET;
    servaddr.sin_addr.s_addr = htonl(INADDR_ANY);
    servaddr.sin_port = htons(port);

    if (bind(sock,(struct sockaddr *)&servaddr,sizeof(servaddr)) < 0 )
    {
        perror("bind() failed"); close(sock); return -1;
    }

    if (listen(sock,5) != 0 )
    {
        perror("listen() failed"); close(sock); return -1;
    }

    return sock;
}
```

> 把 `recv` 返回 `-1` 的常见 `errno` 按性质分两类列清楚：
>
> 第一类——**fd 有效，连接相关**（正常运行中可能遇到）：
>
> - `EAGAIN` / `EWOULDBLOCK`：非阻塞 socket，此刻没数据。不是断开。
> - `EINTR`：被信号打断。不是断开，应重试。
> - `ECONNRESET`：对端发 RST，异常断开。是断开。
> - `ETIMEDOUT`：连接超时（比如 keepalive 探测失败）。算断开。
>
> 第二类——**fd 或参数本身就不对**（说明代码有 bug）：
>
> - `EBADF`：fd 不是有效的打开描述符（传了坏 fd 或已关闭的 fd）。
> - `ENOTSOCK`：fd 有效，但它指向的不是一个 socket（比如是个普通文件）。
> - `EFAULT`：接收缓冲区的指针指向了非法内存。
> - `EINVAL`：参数非法。

水平触发和边缘触发机制：

水平触发：

◆ 读事件：如果 `epoll_wait` 触发了读事件，表示有数据可读，如果程序没有把数据读完，再次调用 `epoll_wait` 的时候，将立即再次触发读事件。

◆ 写事件：如果发送缓冲区没有满，表示可以写入数据，只要缓冲区没有被写满，再次调用 `epoll_wait` 的时候，将立即再次触发写事件。

边缘触发：

◆ 读事件：`epoll_wait` 触发读事件后，不管程序有没有处理读事件，`epoll_wait` 都不会再触发读事件，只有当新的数据到达时，才再次触发读事件。

◆ 写事件：`epoll_wait` 触发写事件之后，如果发送缓冲区仍可以写（发送缓冲区没有满），`epoll_wait` 不会再次触发写事件，只有当发送缓冲区由**满**变成**不满**时，才再次触发写事件。

==边缘触发和水平触发的区别在于发生事件的时间点。==

##### 边缘触发

边缘触发中输入缓冲收到数据时仅通知1次该事件。即使输入缓冲中还留有数据，也不会再次进行通知。

##### 水平触发（条件触发）

条件触发方式中，只要输入缓冲有数据就会一直通知该事件。

例如，服务器端输入缓冲收到50字节的数据时，服务器端操作系统将通知该事件。但是服务器端读取20字节后还剩下30字节的情况下，仍会通知事件。也就是说，条件触发方式中，只要输入缓冲中还剩有数据，就将以事件方式再次通知应用程序。

> 这里书上用的“注册事件”来代替通知事件。
> 当网卡收到数据，放到操作系统的输入缓冲区后，操作系统内核会把这个对应的文件描述符，添加到一个名叫“就绪队列（Ready List）”的清单里（这就是注册事件）。然后把这个清单扔给应用程序（这就是通知）。两者描述的是同一个结果。
>
> 咱们平时的习惯是：**注册（Register）：是“应用程序”对“操作系统”做的动作。**** **通知（Notify）：是“操作系统”对“应用程序”做的动作**。所以书上读起来有的别扭。

epoll默认以条件触发方式工作。

通过代码了解下条件触发的事件通知方式：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#include<sys/epoll.h>

#define BUF_SIZE 4
#define EPOLL_SIZE 50
void error_handling(char* buf);

int main(int argc, char* argv[])
{
	int serv_sock, clnt_sock;
	struct sockaddr_in serv_adr, clnt_adr;
	socklen_t adr_sz;
	int str_len, i;
	char buf[BUF_SIZE];

	struct epoll_event *ep_events;
	struct epoll_event event;

	int epfd, event_cnt;

	if(argc != 2)
	{
		printf("Usage: %s<port>\n", argv[0]);
		exit(1);
	}

	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&serv_adr, 0 ,sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));

	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("bind() error");
	if(listen(serv_sock, 5) == -1)
		error_handling("listen() error");

	epfd = epoll_create(EPOLL_SIZE);
	ep_events = malloc(sizeof(struct epoll_event)*EPOLL_SIZE);

	event.events = EPOLLIN;
	event.data.fd = serv_sock;
	epoll_ctl(epfd, EPOLL_CTL_ADD, serv_sock, &event);

	while(1)
	{
		event_cnt = epoll_wait(epfd, ep_events, EPOLL_SIZE, -1);
		if(event_cnt == -1)
		{
			puts("epoll_wait() error");
			break;
		}

		puts("return epoll_wait");
		for(i = 0; i < event_cnt; i++)
		{
			if(ep_events[i].data.fd == serv_sock) 
			{
			    adr_sz = sizeof(clnt_adr);
				clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &adr_sz);
				event.events = EPOLLIN;
			       	event.data.fd = clnt_sock;
				epoll_ctl(epfd, EPOLL_CTL_ADD, clnt_sock, &event);
				printf("connected client: %d \n", clnt_sock);
			}
			else
			{
				str_len = read(ep_events[i].data.fd, buf, BUF_SIZE);
				if(str_len == 0)
				{
					epoll_ctl(epfd, EPOLL_CTL_DEL, ep_events[i].data.fd, NULL);
					close(ep_events[i].data.fd);
					printf("closed client: %d \n", ep_events[i].data.fd);
				}
				else
				{
					write(ep_events[i].data.fd, buf, str_len);
				}
			}
		}
	}
	close(serv_sock);
	close(epfd);
}

void error_handling(char* buf)
{
	fputs(buf, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

上述示例与之前的echo_epollserv.c之间的差异如下：

- 将调用read函数时使用的缓冲大小缩减为4字节

- 插入验证epoll_wait函数调用次数的语句。

  > `puts("return epoll_wait");`

减少缓冲大小是为了阻止服务器端一次性读取接收的数据，以便观察。换言之，调用read函数后，输入缓冲中仍有数据需要读取。而且会因此通知新的事件并从epoll_wait函数返回时将循环输出`return epoll_wait`字符串。

将下面这行代码改为`event.events = EPOLLIN|EPOLLET;`

```cpp
//clnt_sock = accept(...)
event.events = EPOLLIN; //改动这一行
```

从客户端接收数据时，仅输出1次`return epoll_wait`字符串，这意味着仅注册（通知）1次事件。

虽然可以验证上述事实，当客户端运行时将发生错误。但如果理解了边缘触发的特性，应该可以分析出错误原因。

==错误原因是什么？==

![image-20260323195140148](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260323195140148.png)



| select模型是条件触发还是边缘触发                             |
| ------------------------------------------------------------ |
| select模型是以条件触发（水平触发）的方式工作的，输入缓冲中如果还剩有数据，肯定会注册事件。 |

接下来先来讲一下如何把套接字改成非阻塞方式。（IO的时候不会阻塞等待）

可以使用在系统编程中学过的fcntl更改套接字属性：

```cpp
int flag = fcntl(fd, F_GETFL, 0);
fcntl(fd, F_SETFL, flag| O_NONBLOCK);
```

通过第一条语句获取之前设置的属性信息，通过第二条语句在此基础上添加非阻塞`O_NONBLOCK`标志。调用read&write函数时，无论是否存在数据，都会形成非阻塞文件（套接字）。

read函数发现输入缓冲中没有数据可读时返回-1，同时在errno中保存EAGAIN常量。

基于边缘触发的回声服务端：

```cpp
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<unistd.h>
#include<arpa/inet.h>
#include<sys/socket.h>
#include<sys/epoll.h>
#include<errno.h>
#include<fcntl.h>
#define BUF_SIZE 4	//为了验证边缘触发的工作方式，将缓冲设置为4字节
#define EPOLL_SIZE 50

void setnonblockingmode(int fd);
void error_handling(char* buf);

int main(int argc, char* argv[])
{
	int serv_sock, clnt_sock;
	struct sockaddr_in serv_adr, clnt_adr;
	socklen_t adr_sz;
	int str_len, i;
	char buf[BUF_SIZE];

	struct epoll_event* ep_events;
	struct epoll_event event;
	int epfd, event_cnt;

	if(argc != 2)
	{
		printf("Usage: %s <port>\n", argv[0]);
		exit(1);
	}

	serv_sock = socket(PF_INET, SOCK_STREAM, 0);
	memset(&serv_adr, 0, sizeof(serv_adr));
	serv_adr.sin_family = AF_INET;
	serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
	serv_adr.sin_port = htons(atoi(argv[1]));
	if(bind(serv_sock, (struct sockaddr*)&serv_adr, sizeof(serv_adr)) == -1)
		error_handling("bind() error");
	if(listen(serv_sock, 5) == -1)
		error_handling("listen() error");

	epfd = epoll_create(EPOLL_SIZE);
	ep_events = malloc(sizeof(struct epoll_event)*EPOLL_SIZE);

	setnonblockingmode(serv_sock);
	event.events = EPOLLIN;
	event.data.fd = serv_sock;
	epoll_ctl(epfd, EPOLL_CTL_ADD, serv_sock, &event);

	while(1)
	{
		event_cnt = epoll_wait(epfd, ep_events, EPOLL_SIZE, -1);
		if(event_cnt == -1)
		{
			puts("epoll_wait() error");	
			break;
		}

		puts("return epoll_wait");	//为观察事件发生数而添加的输出字符串的语句
		for(i = 0; i < event_cnt; i++)
		{
			if(ep_events[i].data.fd == serv_sock)
			{
				adr_sz = sizeof(clnt_adr);
				clnt_sock = accept(serv_sock, (struct sockaddr*)&clnt_adr, &adr_sz);
				setnonblockingmode(clnt_sock);	//将accept函数创建的套接字改为非阻塞模式。
				event.events = EPOLLIN|EPOLLET; //向EPOLLIN添加EPOLLET标志，将套接字事件注册方式改为边缘触发。
				event.data.fd = clnt_sock;
				epoll_ctl(epfd, EPOLL_CTL_ADD, clnt_sock, &event);
				printf("connected client: %d\n", clnt_sock);
			}
			else
			{
				while(1)	//之前的条件触发回声服务器端中没有该while循环。边缘触发方式中，发生事件时需要读取输入缓冲中的所有数据，因此需要循环调用read函数。
				{
					str_len = read(ep_events[i].data.fd, buf, BUF_SIZE);
					if(str_len == 0)
					{
						epoll_ctl(epfd, EPOLL_CTL_DEL, ep_events[i].data.fd, NULL);
						close(ep_events[i].data.fd);
						printf("closed client %d\n", ep_events[i].data.fd);
						break;
					}
					else if(str_len < 0)
					{
						if(errno == EAGAIN)	//read函数返回-1且errno值为EAGAIN时，意味着读取了输入缓冲中的全部数据，因此需要通过break语句跳出while循环。
						{
							break;
						}
					}
					else
					{
						write(ep_events[i].data.fd, buf, str_len);
					}
				}
			}
		}
	}
	close(serv_sock);
	close(epfd);
	return 0;
}

void setnonblockingmode(int fd)
{
	int flag = fcntl(fd, F_GETFL, 0);
	fcntl(fd, F_SETFL, flag|O_NONBLOCK);
}

void error_handling(char* buf)
{
	fputs(buf, stderr);
	fputc('\n', stderr);
	exit(1);
}
```

运行结果：

```cpp
//server：
./EPETserv 5009    
return epoll_wait
connected client: 5
return epoll_wait
return epoll_wait
return epoll_wait
closed client 5
    
//client：   
./eclient 127.0.0.1 5009
Connected........
Input message(Q to quit):hello
Message from server: hello
Input message(Q to quit):TCP/IP
Message from server: TCP/IP
Input message(Q to quit):q
```

上述运行结果中需要注意的是，客户端发送消息次数和服务器端epoll_wait函数调用次数。客户端从请求连接到断开连接共发送4次数据（连接请求也算一次数据），服务器端也相应产生4个事件。

边缘触发相较条件触发的优点：可以分离接收数据和处理数据的时间点。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260322201741329.png" alt="image-20260322201741329" style="zoom:33%;" />

上图运行流程如下：

1. 服务器端分别从客户端A、B、C接收数据。
2. 服务器端按照A、B、C的顺序重新组合收到的数据。
3. 组合的数据将发送给任意主机。

为了完成该过程，若能按如下流程运行程序，服务器端的实现并不难。

1. 客户端按照A、B、C的顺序连接服务器端，并依序向服务器端发送数据。
2. 需要接收数据的客户端应在客户端A、B、C之前连接到服务器端并等待。

但现实中可能频繁出现如下这些情况，换言之，如下情况更符合实际。

1. 客户端C和B正向服务器端发送数据，但A尚未连接到服务器端。
2. 客户端A、B、C乱序发送数据。
3. 服务器端已收到数据，但要接收数据的目标客户端还未连接到服务器端。

因此，即使输入缓冲收到数据，服务器端也能决定读取和处理这些数据的时间点，这样就给服务器端的实现带来巨大的灵活性。

## 通信总结

本地通信：

* pipe管道
* fifo
* mmap内存映射
* 信号
* 本地套接字

网络通信：

* 多进程
* 多线程
* I/O多路复用

## 一些误区

输入和输出都是站在应用程序的角度来说的。

![image-20260321163037565](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321163037565.png)

![image-20260321163057511](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321163057511.png)

