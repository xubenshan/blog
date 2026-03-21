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
>
> 《TCP/IP网络编程》
>
> Socket 的本质是对 **TCP/IP 协议栈** 的编程接口封装。

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

> 还有一个函数inet_aton也可以把点分十进制IP地址转化成网络字节序的二进制形式（inet_ntoa正好反过来，把网络字节序二进制形式转化成点分十进制IP地址）。但是只支持IPV4协议，安全性也不高，所以现在基本不用了，只用pton函数。
>
> `char* inet_ntoa(struct in_addr in);`
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

可以利用常数INADDR_ANY让 Socket**监听这台机器上的所有有效 IP 地址**，不管客户端发送数据的目的IP是服务器的哪个IP，只要端口是8888，就传给这个socket。（服务器通常有很多网卡，也就有很多IP地址。）数据类型是in_addr_t，也就是一个uint32_t类型。

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

## send和recv函数

send：是一个系统调用函数，用来发送消息到一个套接字中

`ssize_t send(int sockfd, const void *buf, size_t len, int flags);`

send和write的唯一区别就是最后一个参数：flags的存在，当我们设置flags为0时，send和wirte是同等的。

recv:

`ssize_t recv(int sockfd, void* buf, size_t len, int flags);`



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



标准IO函数的缺点：

* 不容易进行双向通信
* 有可能频繁调用fflush
* 需要以FILE指针的形式返回文件描述符

==如何用标准IO函数进行socket网络通信==：利用fdopen函数将socket的文件描述符转换成FILE指针类型，这样就可以向操作本地文件那样操作socket。

`FILE* fdopen(int fildes, const char* mode)`

* 成功返回FILE指针 失败返回NULL。

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

多路复用：用一个进程来维护多个Socket。

与多进程和多线程技术相比，I/O多路复用技术的最大优势是系统开销小，系统不必创建进程/线程，也不必维护这些进程/线程，从而大大减小了系统的开销。

### I/O多路复用

让一个线程/进程管理多个网络连接，使得服务器能够高效的处理大量的并发连接而不需要为每个连接都创建一个线程来管理。

> 如何理解并发连接：宏观的并发就是在一个时间段内发生了很多事情，并发连接就是在短时间内有很多连接到达服务端。

![image-20260311164635527](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260311164635527.png)

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
> 参数2：readset，将所有关注 “是否存在带读取数据” 的文件描述符注册到fd_set型变量，并传递其地址值。
>
> 参数3：writeset，将所有关注 “是否可传输无阻塞数据” 的文件描述符注册到fd_set型变量，并传递其地址值。
>
> 参数4：exceptset，将所有关注 “是否发生异常” 的文件描述符注册到fd_set型变量，并传递其地址值。
>
> 参数5：timeout，调用select函数后，为防止陷入无限阻塞的状态，传递超时信息。
>
> 返回值：发生错误时返回-1，超时返回时返回0。因发生关注的事件返回时，返回大于0的值，该值是发生事件的文件描述符数。

第五个参数我们之前学过：

```cpp
struct timeval
{
	long tv_sec;	//seconds
	long tv_usec;	//microseconds
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



小林coding：

> select 实现多路复用的方式是，将已连接的 Socket 都放到一个文件描述符集合，然后调用 select 函数将文件描述符集合拷贝到内核里，让内核来检查是否有网络事件产生，检查的方式很粗暴，就是通过遍历文件描述符集合的方式，当检查到有事件产生后，将此Socket标记为可读或可写，接着再把整个文件描述符集合拷贝回用户态里，然后用户态还需要再通过遍历的方法找到可读或可与的Socket，然后再对其处理。
>
> 所以，对于select 这种方式，需要进行2次遍历」文件描述符集合，一次是在内核态里，一个次是在用户态里，而且还会发生2次「拷贝」文件描述符集合，先从用户空间传入内核空间，由内核修改后，再传出到用户空间中。





















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

## 一些误区

![image-20260321163037565](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321163037565.png)

![image-20260321163057511](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260321163057511.png)

