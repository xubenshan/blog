# Linux网络编程

> 参考资料：谷歌 
>
> [B站【TCP/IP 网络编程从零开始】 ](https://www.bilibili.com/video/BV1pu411G7P6/?p=4&share_source=copy_web&vd_source=27f42b63247f23de392dffcd83fd59f)
>
> [套接字](https://subingwen.cn/linux/socket/)
>
> [黑马Linux网络编程]https://www.bilibili.com/video/BV1iJ411S7UA/?share_source=copy_web&vd_source=2c7f42b63247f23de392dffcd83fd59f)

## Socket

两个进程之间进行通信的接口

应用程序通常通过"套接字"向网络发出请求或者应答网络请求，使主机间或者一台计算机上的进程间可以通讯。

socket是一种"打开—读/写—关闭"模式的实现，服务器和客户端各自维护一个"文件"，在建立连接打开后，可以向自己文件写入内容供对方读取或者读取对方内容，通讯结束时关闭文件。

套接字

描述IP地址和端口

并发：多个任务在时间片段内交替进行

并行：多个任务在多个处理器上同时执行

 TCP 是一种面向连接的、可靠的，基于字节流的传输层通信协议。为两台主机提供高可靠性的数据通信服务。<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173103195.png" alt="image-20251203173103195" style="zoom:50%;" /><img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203173118950.png" alt="image-20251203173118950" style="zoom: 42%;" />

使用TCP协议的socket交互流程：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251205114055065.png" alt="image-20251205114055065" style="zoom:50%;" />

bind函数：为socket绑定IP和端口  

listen函数：设置监听上限（服务器能同时和多少个客户端建立TCP连接）

accept函数：阻塞监听客户端连接 返回一个新的socket文件描述符（fd）

![image-20251203174529382](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203174529382.png)

三次握手：

![image-20251203174623156](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251203174623156.png)

四次挥手：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204124621076.png" alt="image-20251204124621076" style="zoom: 50%;" />

客户端和服务端通信的流程：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204192908892.png" alt="image-20251204192908892" style="zoom:50%;" />

大端：**数据的低位保存在内存的高地址中，而数据的高位保存在内存的低地址中**.

小端：**数据的低位保存在内存的低地址中，而数据的高位保存在内存的高地址中**。

在计算机系统中，我们是以**字节为单位**的，**每个地址单元都对应着一个字节，一个字节为8bit**。对于位数大于8位的**处理器**，例如16位或者32位的处理器，由于寄存器宽度大于一个字节，那么必然存在着一个如果将多个字节安排的问题。

![image-20251204194846366](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251204194846366.png)

127.0.0.1是本地回环地址。













