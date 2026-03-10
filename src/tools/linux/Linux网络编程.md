#  Linux网络编程

> 参考资料： 
>
> [B站【TCP/IP 网络编程从零开始】 ](https://www.bilibili.com/video/BV1pu411G7P6/?p=4&share_source=copy_web&vd_source=27f42b63247f23de392dffcd83fd59f)
>
> [C++网络编程，从Socket基础到Epoll](https://www.bilibili.com/video/BV1Ce411b7so?spm_id_from=333.788.videopod.episodes&vd_source=5940e85c0b18a907a0fdea51914b4f65&p=19)
>
> [套接字](https://subingwen.cn/linux/socket/)
>
> [黑马Linux网络编程](https://www.bilibili.com/video/BV1iJ411S7UA/?share_source=copy_web&vd_source=2c7f42b63247f23de392dffcd83fd59f)

## 前置知识

### TCP/IP模型

![image-20251213144405086](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251213144405086.png)

### 并发服务器

所谓的并发服务器是指服务器能够同时处理多个客户端的请求

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

为了解决字节序问题，统一规定**网络数据流采用大端字节序**，要进行网络字节序和主机字节序的转换。

```cpp
# 所需函数
htonl(usigned long) 本地转网络（IP） IP一般四个字节，long类型就是4字节；port一般两个字节，short就是2字节。
htons(usigned short) 本地转网络（端口）
ntohl  网络转本地（IP）
ntohs 网络转本地（端口）
点分十进制->string->atoi函数（字符串转整数）->int->htonl函数->网络字节序
```

![image-20260309130538721](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309130538721.png)

inet_pton函数可以把点分十进制IP地址转化成网络字节序二进制形式：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205142759702.png" alt="image-20251205142759702" style="zoom:50%;" />

> 还有一个函数inet_aton也可以把点分十进制IP地址转化成网络字节序的二进制形式。但是只支持IPV4协议，安全性也不高，所以现在基本不用了，只用pton函数。
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



### 服务端：

* socket函数：创建一个socket。

  `int socket(int domain, int type, int protocol)`
  成功返回fd，失败返回-1。设置errno。

  * domain：socket使用的协议族

  ![image-20260310212035826](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260310212035826.png)

  * type：套接字的数据传输方式：SOCK_STREAM(面向连接的套接字）、SOCK_DGRAM（面向消息的套接字）
  * protocol：通信中使用的协议（一般设置成0就行）如果同一协议族中存在多个数据传输方式相同的协议，那么就需要指定第三个参数
  * 成功返回fd，失败返回-1，设置errno

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144601009.png" alt="image-20251205144601009" style="zoom:50%;" />

* bind函数：为socket绑定IP和端口  

`int bind(int sockfd, const struct sockaddr* addr, socklen_t addrlen)`

下面介绍下sockaddr这个结构体，这个结构体存储了socket要绑定的IP地址和端口号：

```cpp
struct sockaddr
{
	sa_family_t sin_family; //地址族
    char sa_data[14]；// 地址信息
}
```

这是一个通用的结构体，下面介绍IPV4专用的结构体：

```cpp
struct sockaddr_in
{
	sa_family_t sin_family; //地址族
    unit16_t    sin_port; //16位TCP/UDP端口号
    struct      in_addr sin_addr;//32位IP地址（IPV4）
    char        sin_zero[8];//弃用 
}

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

IP地址初始化也可以采用：

```cpp
 int dst;
inet_pton(AF_INET, "192.157.22.45", (void*)&dst);
addr.sin_addr.s_addr=dst;
```

可以利用常数INADDR_ANY自动获得服务器端的IP地址，数据类型是in_addr_t，也就是一个unit32_t类型。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144623529.png" alt="image-20251205144623529" style="zoom:50%;" />

![image-20260309140136603](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260309140136603.png)



* listen函数：设置监听上限（服务器能同时和多少个客户端建立TCP连接）

`int listen(int sockfd, int backlog)`

* backlog：连接请求等待队列的长度，上限值是128。比如长度为5说明最多使5个连接请求进入队列。（同时与服务器建立连接的上限数，也就是同时进行3次握手的客户端数量）
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
    ///////////
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
    /////////
}
```



### 简单的C/S通信案例

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

## TCP相关知识

三次握手：

SYN是Synchronization的简写，表示收发数据前传输的同步消息。

ACK：表示确认消息

第一步：客户端主动发起connect，SYN J：传输的数据包序号是J。此时connect函数进入阻塞状态。

第二步：服务器调用accept函数，处理连接请求，传输的数据包序号是K，ACK为J+1，表示对数据包J的确认，告知客户端你需要给我发送序号为J+1的数据包。

第三步：客户端传输序号为J+1的数据包，ACK为K+1。客户端接收到该消息并把数据包塞进网卡准备发出去的一瞬间connect函数返回。当服务端收到发过来的数据包时，accept函数返回。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203174623156.png" alt="image-20251203174623156" style="zoom:50%;" />

四次挥手：

FIN：表示断开连接。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204124621076.png" alt="image-20251204124621076" style="zoom: 33%;" />

 TCP 是一种面向连接的、可靠的，基于字节流的传输层通信协议。为两台主机提供高可靠性的数据通信服务。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173103195.png" alt="image-20251203173103195" style="zoom:50%;" /><img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173118950.png" alt="image-20251203173118950" style="zoom: 42%;" />



TCP协议的数据没有数据边界，比如服务端调用了1次write函数传输了40个字节的数据，客户端可能调用了4次read函数，每次读取10个字节。读取10个字节的时候，剩下的30个字节在哪？

答案是输入缓冲区。每个套接字维护了两个缓存：输入缓冲、输出缓冲。![image-20260310090258374](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260310090258374.png)

* I/O缓冲在每个TCP套接字中单独存在。
* I/O缓冲在创建套接字时自动生成。
* 即使关闭套接字也会继续传递输出缓冲中遗留的数据。
* 关闭套接字将丢失输入缓冲中的数据。

> 需要明白一个知识点，调用write函数并不会把数据直接传输到接收端，而是传输到输入缓冲。调用read函数也并不会直接读接收端发过来的数据，而是读取输入缓冲中的数据。

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





## 实现并发服务器

### 多进程

多进程：是为每个客户端分配一个进程来处理请求

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/Gemini_Generated_Image_j0gmjxj0gmjxj0gm.png" alt="Gemini_Generated_Image_j0gmjxj0gmjxj0gm" style="zoom: 25%;" />

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

### 多线程

多线程：当服务器与客户端 TCP 完成连接后，通过 pthread_create() 函数创建线程，然后将「已连接 Socket」的文件描述符传递给线程函数，接着在线程里和客户端进行通信。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/Gemini_Generated_Image_gwkxdkgwkxdkgwkx.png" alt="Gemini_Generated_Image_gwkxdkgwkxdkgwkx" style="zoom: 33%;" />

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

多路复用：用一个进程来维护多个Socket。

与多进程和多线程技术相比，I/O多路复用技术的最大优势是系统开销小，系统不必创建进程/线程，也不必维护这些进程/线程，从而大大减小了系统的开销。

### I/O多路复用

#### select

让内核去监听客户端连接(lfd)，当有客户端进行连接时 它会让server去调用accept(当有连接时才去立即调用，而不是一直阻塞等待)得到一个用于通信的cfd，最后让内核监管着lfd和所有cfd。

#### poll

#### epoll

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



