---
title: C++入门
#icon: gears
order: 1
---

# C++入门

> 开发环境：Clion IDE gcc编译器

## 搭建开发环境

### vscode配置C++环境

#### 编译器下载

采用gcc编译器,mingw里面包含gcc。

##### 下载MinGW-w64

下载地址：https://link.zhihu.com/?target=https%3A//github.com/niXman/mingw-builds-binaries/releases

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917223733692.png" alt="image-20250917223733692" style="zoom:50%;" />

解压到D盘mingw64文件夹中。

配置环境变量：

win+i 打开设置，点击系统，下滑找到系统信息，点击高级系统设置-环境变量。将路径添加到系统变量Path中。

![image-20250917223919960](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917223919960.png)

win+r 输入cmd，打开终端。输入gcc -v，查看是否配置成功。

![image-20250917224213083](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917224213083.png)

### 安装插件

code runner

C/C++

C/C++ Extension Pack

### 配置编译环境



`c_cpp_properties.json`

利用插件自动生成代码。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917232105693.png" alt="image-20250917232105693" style="zoom:50%;" />

更改配置：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917225848728.png" alt="image-20250917225848728" style="zoom:50%;" />

`launch.json`：调试代码用的。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917230757344.png" alt="image-20250917230757344" style="zoom:50%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917230824419.png" alt="image-20250917230824419" style="zoom:50%;" />

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "g++.exe - Build and debug active file",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}\\${fileBasenameNoExtension}.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${fileDirname}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "miDebuggerPath": "D:\\mingw64\\bin\\gdb.exe",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ],
            "preLaunchTask": "C/C++: g++.exe 生成活动文件"
        }

    ]
}
```

`tasks.json`：用来将代码编译成可执行文件

终端-配置任务

![image-20250917230252553](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917230252553.png)

点击运行代码，若出现乱码，重启即可。

![image-20250919161721322](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250919161721322.png)

![image-20250917230333805](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917230333805.png)

![image-20250919161759271](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250919161759271.png)

运行完之后会自动生成一个settings.json。

文件结构:

![image-20250917231113858](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250917231113858.png)



C++常用的编译器：Clang  GCC（Linux） MSVC（微软的 比如VS就自带MSVC）

编译有四个过程（Toolchain）：预处理 编译 汇编 链接

CMake是构建项目的工具，可以自动生成Makefile文件，将源代码变成可执行程序。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251121102708169.png" alt="image-20251121102708169" style="zoom:50%;" />

## 基础语法

### 变量

### 数据类型

### 运算符

### 选择结构

### 循环结构

### 函数

### 指针

### 数组

### 引用

### 命名空间







