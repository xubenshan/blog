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

### 并发服务器

所谓的并发服务器是指服务器能够同时处理多个客户端的请求 

> 根据我的理解，并发有广义并发和狭义并发。狭义并发就是指多个任务交替执行，因为cpu运转速度很快，所以宏观上来看这些任务就是同时进行。广义并发是指多个任务在同一时间段内执行，不在乎是交替执行还是并行。因此并行也属于并发。

并发是宏观并行、微观串行。

多个请求同时到达或被处理

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

### socket涉及的函数

* socket函数：创建一个socket。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144601009.png" alt="image-20251205144601009" style="zoom:50%;" />

* bind函数：为socket绑定IP和端口  

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144623529.png" alt="image-20251205144623529" style="zoom:50%;" />

* listen函数：设置监听上限（服务器能同时和多少个客户端建立TCP连接）

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144658113.png" alt="image-20251205144658113" style="zoom:50%;" />

* accept函数：阻塞监听客户端连接 返回一个新的与客户端成功连接的socket文件描述符（fd）

  所以客户端和服务端通信的过程会建立两个fd，一个用于监听（lfd）一个用于通信（cfd）

![image-20251205145702289](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205145702289.png)

* connect函数：

![image-20251205155940503](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205155940503.png)

>  客户端不需要bind函数，系统会隐式绑定。

### socaddr地址结构

![image-20251205143541882](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205143541882.png)![image-20251205144131870](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205144131870.png)

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



## TCP工作流程

三次握手：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203174623156.png" alt="image-20251203174623156" style="zoom:50%;" />

四次挥手：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204124621076.png" alt="image-20251204124621076" style="zoom: 33%;" />

 TCP 是一种面向连接的、可靠的，基于字节流的传输层通信协议。为两台主机提供高可靠性的数据通信服务。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173103195.png" alt="image-20251203173103195" style="zoom:50%;" /><img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173118950.png" alt="image-20251203173118950" style="zoom: 42%;" />



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

### 网络通信和本地通信

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



