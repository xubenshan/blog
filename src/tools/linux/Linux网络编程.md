#  Linux网络编程

> 参考资料： 
>
> [B站【TCP/IP 网络编程从零开始】 ](https://www.bilibili.com/video/BV1pu411G7P6/?p=4&share_source=copy_web&vd_source=27f42b63247f23de392dffcd83fd59f)
>
> [套接字](https://subingwen.cn/linux/socket/)
>
> [黑马Linux网络编程](https://www.bilibili.com/video/BV1iJ411S7UA/?share_source=copy_web&vd_source=2c7f42b63247f23de392dffcd83fd59f)

## 前置知识

### TCP/IP模型

![image-20251213144405086](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251213144405086.png)

### 网络字节序

大端：**数据的低位保存在内存的高地址中，而数据的高位保存在内存的低地址中**.

小端：**数据的低位保存在内存的低地址中，而数据的高位保存在内存的高地址中**。

计算机采用的是小端法，而网络数据流采用大端字节序 。所以要进行网络字节序和主机字节序的转换。

```cpp
# 所需函数
htonl 本地转网络（IP）
htons 本地转网络（端口）
ntohl
ntohs
点分十进制->string->atoi函数->int->htonl函数->网络字节序

   
    
```

客户端连接的时候需要用到pton函数：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205142759702.png" alt="image-20251205142759702" style="zoom:50%;" />

获取客户端IP的时候需要用到ntop函数

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205155314049.png" alt="image-20251205155314049" style="zoom:50%;" />

在计算机系统中，我们是以**字节为单位**的，**每个地址单元都对应着一个字节，一个字节为8bit**。对于位数大于8位的**处**

**理器**，例如16位或者32位的处理器，由于寄存器宽度大于一个字节，那么必然存在着一个如果将多个字节安排的问题。

![image-20251204194846366](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204194846366.png)

127.0.0.1是本地回环地址。



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

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205114055065.png" alt="image-20251205114055065" style="zoom:50%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203174529382.png" alt="image-20251203174529382" style="zoom:50%;" />

### socket涉及的函数

* socket函数：创建一个socket。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144601009.png" alt="image-20251205144601009" style="zoom:50%;" />

* bind函数：为socket绑定IP和端口  

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144623529.png" alt="image-20251205144623529" style="zoom:50%;" />

* listen函数：设置监听上限（服务器能同时和多少个客户端建立TCP连接）

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144658113.png" alt="image-20251205144658113" style="zoom:50%;" />

* accept函数：阻塞监听客户端连接 返回一个新的与客户端成功连接的socket文件描述符（fd）

![image-20251205145702289](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205145702289.png)

* connect函数：

![image-20251205155940503](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205155940503.png)

>  客户端不需要bind函数，系统会隐式绑定。



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





### socaddr地址结构

![image-20251205143541882](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205143541882.png)![image-20251205144131870](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144131870.png)

## TCP工作流程

三次握手：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203174623156.png" alt="image-20251203174623156" style="zoom:50%;" />

四次挥手：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204124621076.png" alt="image-20251204124621076" style="zoom: 33%;" />

 TCP 是一种面向连接的、可靠的，基于字节流的传输层通信协议。为两台主机提供高可靠性的数据通信服务。<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173103195.png" alt="image-20251203173103195" style="zoom:50%;" /><img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173118950.png" alt="image-20251203173118950" style="zoom: 42%;" />



## 阻塞和非阻塞

产生阻塞的场景：读设备文件、读网络文件。读常规文件没有阻塞概念。

现在明确一下阻塞（Block）这个概念。当进程调用一个阻塞的系统函数时，该进程被置于睡眠（Sleep）状态，这时内核调度其它进程运行，直到该进程等待的事件发生了（比如网络上接收到数据包，或者调用sleep指定的睡眠时间到了）它才有可能继续运行。

与睡眠状态相对的是运行（Running）状态，在Linux内核中，处于运行状态的进程分为两种情况：+

* 正在被调度执行。CPU处于该进程的上下文环境中，程序计数器（eip）里保存着该进
  程的指令地址，通用寄存器保存着该进程运算过程的中间结果，正在执行该进程的指令正在读写该进程的地址空间。

* 就绪状态。该进程不需要等待什么事件发生，随时都可以执行，但CPU暂时还在执行
  另一个进程，所以该进程在一个就绪队列中等待被内核调度。系统中可能同时有多个就绪的进程，那么该调度谁执行呢？内核的调度算法是基于优先级和时间片的，而且会根据每个进程的运行情况动态调整它的优先级和时间片，让每个进程都能比较公平地得到机会执行，同时要兼顾用户体验，不能让和用户交互的进程响应太慢

## 僵尸进程 孤儿进程

子进程终止，父进程还没有回收子进程残留在内核中的资源（PCB）,称为该进程为僵尸进程。

僵尸进程kill命令无效。

孤儿进程：父进程比子进程更早终止，系统会自动给孤儿进程一个PPID。



