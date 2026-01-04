---
sidebar: false
---
# C++期末项目----------聊天室

## 项目内容：

  本项目使用`C++`实现一个具备客户端和服务器，拥有群聊、私聊功能的聊天室。

**项目目录** 如下：

```bash
.
├── Client.cpp
├── Client.h
├── Client.o
├── ClientMain.cpp
├── Common.h
├── Makefile
├── README.md
├── Server.cpp
├── Server.h
├── Server.o
├── ServerMain.cpp
├── chatroom_client
└── chatroom_server
```

项目采用的**技术栈及运行环境**如下图所示：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/%E7%BB%98%E5%9B%BE.bmp" alt="绘图" style="zoom:50%;" />

## 项目运行

* 打开Ubuntu 24.04终端
* 输入`make`，生成可执行文件`chatroom_client`和`chatroom_server`
* 输入`./chatroom_server`，运行服务器
* 输入`./chatroom_client`，运行客户端。

## 项目逻辑：

### 主要工作：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/%E7%BB%98%E5%9B%BE(3).bmp" alt="绘图(3)" style="zoom:67%;" />

### **聊天室逻辑：** 
![绘图(4)](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/%E7%BB%98%E5%9B%BE(4).bmp)

![TCP Chat Server Epoll-2025-12-15-115358](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/TCP%20Chat%20Server%20Epoll-2025-12-15-115358.svg)



## 项目演示

* 打开服务器，开启聊天室

![image-20251211153610350](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211153610350.png)

* 运行客户端，三个用户进入聊天室

![image-20251211153732406](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211153732406.png)

![image-20251211153834231](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211153834231.png)

![image-20251211154155662](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211154155662.png)

* 用户6给用户5私发消息

![image-20251211154345169](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211154345169.png)

![image-20251211154402898](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211154402898.png)

* 用户7群发消息

![image-20251211154219161](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211154219161.png)

![image-20251211154243437](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211154243437.png)

![image-20251211154256948](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251211154256948.png)