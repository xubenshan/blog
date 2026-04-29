---
title: C++入门
author: 小熊
#icon: gears
order: 1
---

# C++入门

>  根据B站码农论坛视频、黑马笔记、《C++ Primer Plus（第6版）中文版》整理的笔记。

## 搭建开发环境

### vscode远程连接Linux服务器

vscode这边只需要安装C++、CMake Tools 插件即可。

我们需要搭建Linux的开发环境。我采用的服务器是Ubuntu22.04 。需要在终端执行以下命令来配置开发环境。

```bash
# 1.更新包列表: 更新包管理器的包列表，确保你能从最新的仓库中获取软件。
sudo apt update

# 2.安装 GCC 编译器 : GCC 是 GNU Compiler Collection 的简称，是最常用的C和C++编译器。
sudo apt install gcc 

# 3.安装构建工具: build-essential 包提供了很多开发标准C和C++程序所需的工具。
# 包括 g++（GNU C++ 编译器）、make（用于自动化编译的工具）和一些其他必要的库和开发文件。
sudo apt install build-essential

# 3.安装调试工具
sudo apt install gdb 
 
# 3.安装检测内存泄漏工具 valgrind
sudo apt install valgrind

# Valgrind 主要用于内存泄露检测、内存调试以及性能分析的工具。

```

接下来要用vscode远程连接服务器：

* 服务端手动启动Openssh服务（openssh是实现ssh协议的软件）

```bash
sudo apt update
sudo apt install openssh-server # 安装 OpenSSH 服务器，以支持 ssh 连接 我买的是阿里云服务器，没有执行这条命令，也可以进行远程连接。
sudo systemctl start ssh
sudo systemctl enable ssh 
```

检查是否开启ssh服务

```bash
sudo systemctl status ssh
```

* vscode端安装remote-ssh插件（用trae的话不用安这个插件，直接用远程资源管理器。）

![image-20260422132823960](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260422132823960.png)

* 远程连接

  ![image-20250919101426186](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250919101426186.png)

  ![image-20250919101443983](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250919101443983.png)

  输入`用户名@host -A`。host指的Linux服务器的IP地址。可以通过`ifconfig`查看。（ifconfig查看的是内网IP。）

  > vscode远程连接Centos系统报错：无法建立连接：远程主机不满足运行vscode服务器的先决条件。
  >
  > 原因是VS Code 远程开发需要 **glibc ≥ 2.28**。
  >
  > 通过命令ldd --version 查看glibc版本发现低于2.28。
  >
  > 解决办法：回退vscode版本1.98。

* 判断开发环境是否搭建完成：

```cpp
#include <iostream>

using std::cout;
using std::endl;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}
```

![image-20260208163318640](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260208163318640.png)

> 每次远程登陆Linux都需要输入密码，很麻烦，下面介绍如何才能免密登陆。
>
> 1. 生成密钥对：输入 ` ssh-keygen -t rsa -b 2048 -f C:\Users\YourUsername\.ssh\id_rsa_windows`，一路回车。会生成两个文件，一个公钥`id_rsa_windows.pub`、一个私钥`id_rsa_windows`。
> 2. 打开`id_rsa_windows.pub`文件，复制上面的内容。
> 3. 把本地ssh公钥复制到Linux端：粘贴到Linux端的`~/.ssh/authorized_keys`文件中。
> 4. 手动指定私钥位置：打开ssh客户端配置文件`C:\Users\YourUsername\.ssh\config`。把私钥文件路径`  IdentityFile C:\Users\xubenshan\.ssh\id_rsa_windows `粘贴到config中的对应Linux服务器IP的位置。如下图所示。
 ![image-20260218211729266](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260218211729266.png)

> 场景：连接的是实验室的服务器，需要配置下ssh公钥。把本地的公钥也就是`id_rsa.pub`复制到服务器`~/.ssh/authorized_keys` ~是当前登录用户的主目录。不需要手动指定私钥位置，因为ssh客户端会自动去寻找`id_rsa`文件。前面之所以要指定，是因为公钥私钥名字是自定义的，不是系统默认的。

> ![image-20260429114828427](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260429114828427.png)
>
> 如果报上述错误，windows下搜索可选功能，安装openssh客户端。（正常来说window10以上系统和mac会自带openssh客户端服务。）

使用g++对源文件进行编译：

| -o         | 指定可执行文件名                           | g++ -o test test.cpp |
| ---------- | ------------------------------------------ | -------------------- |
| -std=c++11 | 指定C++11标准                              |                      |
| -g         | 对源代码进行编译                           |                      |
| -O         | 在编译链接过程中进行优化处理               |                      |
| -c         | 只编译，生成汇编文件，不链接成为可执行文件 |                      |

> 拓展：vscode常用快捷键
>
> ctrl+d 选中下一个相同的内容
>
> alt+上下键 整行代码上移或下移
>
> alt+左键 在任意位置添加光标，同时在不同位置打字
>
> ctrl+p 跳转文件
>
> ctrl+b 收起侧边栏
>
> ctrl+j 打开终端
>
> shift+alt+→ 扩展选中的内容



### CLion配置C++环境

为了能在控制台正确显示中文，需要在main函数中加入以下代码：

```cpp
system("chcp 65001");
```



### vscode配置C++环境

#### 编译器下载

采用gcc编译器，mingw里面包含gcc。

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

* code runner

* C/C++

* C/C++ Extension Pack

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



C++常用的编译器：Clang（macos）  GCC（Linux） MSVC（微软的 比如VS就自带MSVC）

编译有四个过程（Toolchain）：预处理 编译 汇编 链接

CMake是构建项目的工具，可以自动生成Makefile文件，将源代码变成可执行程序。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251121102708169.png" alt="image-20251121102708169" style="zoom:50%;" />

## main函数的参数

main函数有三个参数：`argc` `argv` `envp`

```cpp
int main(int argc,char *argv[],char *envp[])//char* argv[]等价于char** argv
{
    return 0;
}
//第三个参数一般省略
//argc:程序参数的个数，注意包含程序本身
//argv:这是一个数组，存放每个参数的值。argv[0]即程序本身。
//envp：存放环境变量，数组最后一个元素是空。
```

比如终端输入`g++ main.cpp 3 2`。那么`argc=3` `argv[1] = 3 argv[2] = 2`

## gdb调试

`apt -y install gdb`

如果希望程序可调试，编译时需要加-g选项，并且，不能使用-O的优化选项。

`gdb 可执行文件`

| **命令**        | **简写** | **命令说明**                                                 |
| --------------- | -------- | ------------------------------------------------------------ |
| set        args |          | 设置程序运行的参数。  例如：./demo 张三 西施 我是一只傻傻鸟  设置参数的方法是：  set args 张三 西施 我是一只傻傻鸟 |
| break           | b        | 设置断点，b 20 表示在第20行设置断点，可以设置多个断点。      |
| run             | r        | 开始运行程序, 程序运行到断点的位置会停下来，如果没有遇到断点，程序一直运行下去。 |
| next            | n        | 执行当前行语句，如果该语句为函数调用，不会进入函数内部。 VS的F10 |
| step            | s        | 执行当前行语句，如果该语句为函数调用，则进入函数内部。VS的F11  注意了，如果函数是库函数或第三方提供的函数，用s也是进不去的，因为没有源代码，如果是自定义的函数，只要有源码就可以进去。 |
| print           | p        | 显示变量或表达式的值，如果p后面是表达式，会执行这个表达式。  |
| continue        | c        | 继续运行程序，遇到下一个断点停止，如果没有遇到断点，程序将一直运行。  VS的F5 |
| set var         |          | 设置变量的值。  假设程序中定义了两个变量：  int ii;   char name[21];  set var ii=10 把ii的值设置为10；  set var name="西施"。 |
| quit            | q        | 退出gdb。                                                    |

用gdb调试核心文件：

调试core文件的步骤如下：

1）用ulimit -a查看当前用户的资源限制参数；

2）用ulimit -c unlimited把core file size改为unlimited；

3）运行程序，产生core文件；

4）运行gdb 程序名 core文件名；

5）在gdb中，用bt查看函数调用栈。

用gdb调试正在运行中的程序：

`gdb 程序名 -p 进程编号`
![image-20260218221831958](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260218221831958.png)

## 基础语法

### 变量

### 数据类型

C风格的字符串：

C++的string是一个类，封装了C风格的字符串。

C语言约定：如果字符型（char）数组的末尾包含了空字符\0（也就是0），那么该数组中的内容就是一个字符串。

因为字符串需要用0结尾，所以在声明字符数组的时候，要预留多一个字节用来存放0。`char name[21]; // 声明一个最多存放20个英文字符或十个中文的字符串。`

* C风格字符串初始化：`char name[11] = "hello";     // 初始内容为hello，系统会自动添加0。`
* `char name[11] = { 0 };     //把全部的元素初始化为0。`

字符串的一些操作函数：

清空字符串：`memset(name,0,sizeof(name));  // 把全部的元素置为0`

赋值字符串：`char* strcpy(char* dest, const char* src)`;

功 能: 将参数src字符串拷贝至参数dest所指的地址。

返回值: 返回参数dest的字符串起始地址。

复制完字符串后，会在dest后追加0。

**如果目标字符串的内存空间不够大，会导致数组的越界。**

赋值字符串的另一个函数：`char * strncpy(char* dest,const char* src, const size_t n)`

功能：把src前n个字符的内容复制到dest中。

返回值：dest字符串起始地址。

如果src字符串长度小于n，则拷贝完字符串后，在dest后追加0，直到n个。

**如果src的长度大于等于n，就截取src的前n个字符，不会在dest后追加0。**

**如果目标字符串所指的内存空间不够大，会导致数组的越界。**

获取字符串长度：`size_t strlen( const char* str);`

strlen()函数计算的是字符串的实际长度，遇到0结束。

字符串拼接：`char* strcat(char* dest,const char* src);`

功能：将src字符串拼接到dest所指的字符串尾部。

返回值：返回dest字符串起始地址。

dest最后原有的结尾字符0会被覆盖掉，并在连接后的字符串的尾部再增加一个0。

字符串拼接的另一个函数：`char *strncat (char* dest,const char* src, const size_t n);`

功能：将src字符串的前n个字符拼接到dest所指的字符串尾部。

返回值：返回dest字符串的起始地址。

如果n大于等于字符串src的长度，那么将src全部追加到dest的尾部，如果n小于字符串src的长度，只追加src的前n个字符。

strncat会将dest字符串最后的0覆盖掉，字符追加完成后，再追加0。

字符串比较：`int strcmp(const char *str1, const char *str2 );`

功能：比较str1和str2的大小。

返回值：相等返回0，str1大于str2返回1，str1小于str2返回-1；

字符串比较的另一个函数：`int strncmp(const char *str1,const char *str2 ,const size_t n)`

功能：比较str1和str2前n个字符的大小。

返回值：相等返回0，str1大于str2返回1，str1小于str2返回-1；

两个字符串比较的方法是比较字符的ASCII码的大小，从两个字符串的第一个字符开始，如果分不出大小，就比较第二个字符，如果全部的字符都分不出大小，就返回0，表示两个字符串相等。

> 实际开发中只关心字符串是否相等，不关心谁大。

查找字符：`const char *strchr(const char *s, int c);`

返回在字符串s中第一次出现c的位置，如果找不到，返回0。

`const char *strrchr(const char *s, int c);`

返回在字符串s中最后一次出现c的位置，如果找不到，返回0。

查找字符串：`char *strstr(const char* str,const char* substr);`

功能：检索子串在字符串中首次出现的位置。

返回值：返回字符串str中第一次出现子串substr的地址；如果没有检索到子串，则返回0。

> 一些注意事项：
>
> 字符串的结尾标志是0，按照约定，在处理字符串的时候，会从起始位置开始搜索0，一直找下去，找到为止（不会判断数组是否越界）。
>
> 结尾标志0后面的都是垃圾内容。
>
> **字符串在每次使用前都要初始化**，减少入坑的可能，**是每次，不是第一次**。
>
> 不要在函数中对字符指针用sizeof运算，因为得到的是指针的大小。所以，不能在函数中对传入的字符串用memset函数进行初始化，除非字符串的长度也作为参数传入到了函数中。



### 运算符

### 选择结构

### 循环结构

### 函数

#### 回调函数

> 回调函数简单来说就是把函数A作为参数传给函数B，在未来某一时刻函数B调用了函数A，那么就称函数A是回调函数。
>
> 传参的方式指的就是函数指针。

函数指针的语法：

假设某个函数的原型是`int func1(int bh,string str);` 则函数指针的声明：`int (*ptr)(int,string)`。这里的形参名可以写，可以不写。赋值：`ptr = func1`。

使用函数指针：`ptr(3,"nihao");`。C风格调用函数指针的方法：`(*ptr)(3,"nihao");`

回调函数的示例：

```cpp
#include <iostream>         // 包含头文件。
using namespace std;        // 指定缺省的命名空间。

void zs(int a)         // 张三的个性化表白函数。
{
	cout  <<"a=" << a << "我要先翻三个跟斗再表白。\n";   // 个性化表白的代码。
}

void ls(int a)         // 李四的个性化表白函数。
{
	cout << "a=" << a << "我有一只小小鸟。\n";   // 个性化表白的代码。
}

void show(void (*pf)(int),int b)//把实参从外面传进去
{
	cout << "表白之前的准备工作已完成。\n";       // 表白之前的准备工作。
	pf(b);                                                                     // 用函数指针名调用个性化表白函数。
	cout << "表白之后的收尾工作已完成。\n";       // 表白之后的收尾工作。
}
//////////////////////////////////
void show(void (*pf)(int))
{
	cout << "表白之前的准备工作已完成。\n";       // 表白之前的准备工作。
    int b = 3;//由调用者函数提供实参
	pf(b);                                                                     // 用函数指针名调用个性化表白函数。
	cout << "表白之后的收尾工作已完成。\n";       // 表白之后的收尾工作。
}
int main()
{
	show(zs);          // 张三要表白。
	show(ls);          // 李四要表白。
}
////////////////////////////////////

int main()
{
	show(zs, 3);          // 张三要表白。
	show(ls, 4);          // 李四要表白。
}
//如何给回调函数传递实参
// *由调用者函数提供实参
// *从外面传进去实参
```



#### 静态变量

| 全局变量                                           | 静态全局变量         | 静态局部变量         |
| -------------------------------------------------- | -------------------- | -------------------- |
| 整个工程，其他文件可以通过extern关键字来使用该变量 | 当前文件             | 函数作用域           |
| 静态存储区                                         | 静态存储区           | 静态存储区           |
| 程序运行期间一直存在                               | 程序运行期间一直存在 | 程序运行期间一直存在 |

局部变量和静态局部变量的区别：静态局部变量不会随着函数调用完成而销毁，会保留其值。静态局部变量也是局部变量，在函数外面是访问不到的。

看下面的代码示例：

```cpp
void func() {
    static int num = 10; // 名字 'num' 只在 func 内部有效
}

int main() {
    // num = 20;  // ❌ 编译错误！main 函数不认识 'num'
    // func::num = 20; // ❌ 也不行，C++ 没有这种语法
    return 0;
}
```

实际上，由于静态局部变量**只要程序还在运行，这个变量的内存地址就一直是有效的**，数据一直都在那里，只是名字被隐藏了。既然内存还在，只要我们能把这个变量的地址从函数里“偷”出来，外部就可以随意读写它！

```cpp
#include <iostream>

// 这个函数返回静态局部变量的指针（地址）
int* get_static_addr() {
    static int count = 10; 
    std::cout << "函数内部: " << count << std::endl;
    return &count; // ✅ 合法！因为 count 在函数结束后内存不会被销毁
}

int main() {
    // 1. 获取地址
    int* ptr = get_static_addr();
    
    // 2. 在外部修改它
    *ptr = 999; 
    std::cout << "在 main 函数中修改了变量..." << std::endl;

    // 3. 再次调用函数验证
    get_static_addr(); // 输出将是 999，证明修改成功！

    return 0;
}
```

#### 函数重载

#### 函数重写



### 指针

#### new和delete运算符

![image-20260301161319159](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260301161319159.png)

#### 函数指针

函数指针就是指向函数的指针。基本语法如下:

```cpp
int demo(int a, int b)
{
	

}

int newptr = （*ptr）（int,int）
//可以用auto关键字简化：
auto newptr = demo;
```

顶层const和底层const

顶层：变量本身是个常量。比如：`int* const p1`，const 紧挨着 p1，说明 p1 自身不可变，这就是顶层 const。

底层：通常只和指针和引用有关。指针/引用指向/绑定的那个对象是常量。（说的是在指针/引用眼里那个对象是常量，也就是不能用指针/引用修改对象的值。）

一个指针可以同时具有顶层 const 和底层 const。

```cpp
int i = 0;
const int* const p3 = &i;
```

> 为什么要区分顶层和底层const？
>
> #### 规则A：拷贝时，顶层 const 会被无视，底层 const 必须严格匹配！
>
> 当你把一个变量赋值给另一个变量时，变量**本身**是不是常量根本不重要（因为你是把值拷走，又不是修改原来的变量）。但底层 const 关系到访问权限，编译器会严格检查。 原则是：你可以把【非底层const】拷贝给【底层const】 但绝对不能把【底层const】拷贝给【非底层const】
>
> #### 规则 B：使用 auto 推导类型时，顶层 const 会被丢弃。
>
> 如果你用 auto 让编译器猜类型，它会忽略顶层 const，但保留底层 const。

区分指针常量和常量指针。

指针常量：这个常量是一个指针，表示指针的内容不能改变，也就是存储的地址不能改变。

常量指针：指向常量的指针，表示不能通过指针来修改指向对象的值。指针本身的内容可以修改。

### 数组

### 引用

### 枚举

枚举是一种创建符号常量的方法。

> 创建常量有很多种方法：define const 枚举constexpr等等。
>
> 所谓的常量就是初始化后不可修改的变量或者字面量（写在代码里的固定值）
>
> constexpr：constexpr 用于定义**编译期常量**。它不仅意味着值不能被修改，还保证了这个值在程序编译阶段就已经确定了。
>
> const：const 用于定义**运行期只读变量**或**编译期常量**。一旦被初始化，它的值就不能再被改变。const 变量的值可以在**运行期**才计算出来，但一旦赋值就不准再改了；而 constexpr 必须在**编译期**就能算出来。
>
> 比如：int userInput; std::cin >> userInput; const int RUNTIME_CONST = userInput * 2; 
>
> RUNTIME_CONST只有在运行期用户输入值的时候才能确认下来。
>
> 字面量：int a = 42;          // 42 是整型字面量常量 const char* s = "Hi"; // "Hi" 是字符串字面量常量 (储存在只读数据段）

语法：`enum 枚举名 { 枚举量1 , 枚举量2 , 枚举量3, ......, 枚举量n }`

`enum colors { red , yellow , blue };`

这条语句完成了两项工作：

* 让colors成了一种新的枚举类型的名称，可以用它创建枚举变量。`colors col = red`.

* 将red、yellow、blue作为符号常量，默认值是0、1、2。

C++11标准：

```cpp
// 现代做法：强类型枚举 (C++11)
enum class ErrorCode {
    SUCCESS = 0,
    NOT_FOUND = 404,
    SERVER_ERROR = 500
};
ErrorCode status = ErrorCode::SUCCESS; // 必须带作用域前缀

// 传统做法：C语言风格枚举（不推荐，容易名字冲突）
enum Color { RED, GREEN, BLUE }; 
Color myColor = RED;
```



### 命名空间

## 1 内存分区模型

C++程序在执行时，将内存大方向划分为**4个区域**

- 代码区：存放函数体的二进制代码，由操作系统进行管理的
- 全局区：存放全局变量和静态变量以及常量
- 栈区：由编译器自动分配释放, 存放函数的参数值,局部变量等
- 堆区：由程序员分配和释放,若程序员不释放,程序结束时由操作系统回收

![image-20251127222840071](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251127222840071.png)

![image-20260301102619137](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260301102619137.png)

**栈和堆的主要区别：**

1) 管理方式不同：栈是系统自动管理的，在出作用域时，将自动被释放；堆需手动释放，若程序中不释放，程序结束时由操作系统回收。

2) 空间大小不同：堆内存的大小受限于物理内存空间；而栈就小得可怜，一般只有8M（可以修改系统参数)。

3）分配方式不同：堆是动态分配；栈有静态分配和动态分配（都是自动释放）。

4）分配效率不同：栈是系统提供的数据结构，计算机在底层提供了对栈的支持，进栈和出栈有专门的指令，效率比较高；堆是由C++函数库提供的。

5）是否产生碎片：对于栈来说，进栈和出栈都有着严格的顺序（先进后出），不会产生碎片；而堆频繁的分配和释放，会造成内存空间的不连续，容易产生碎片，太多的碎片会导致性能的下降。

6）增长方向不同：栈向下增长，以降序分配内存地址；堆向上增长，以升序分配内存地址。



### 1.1 程序运行前

​	在程序编译后，生成了exe可执行程序，**未执行该程序前**分为两个区域

​	**代码区：**

​		存放 CPU 执行的机器指令

​		代码区是**共享**的，共享的目的是对于频繁被执行的程序，只需要在内存中有一份代码即可

​		代码区是**只读**的，使其只读的原因是防止程序意外地修改了它的指令

​	**全局区：**

​		全局变量和静态变量存放在此.

​		全局区还包含了常量区, 字符串常量和其他常量也存放在此.

​		==该区域的数据在程序结束后由操作系统释放==.













**示例：**

```c++
//全局变量
int g_a = 10;
int g_b = 10;

//全局常量
const int c_g_a = 10;
const int c_g_b = 10;

int main() {

	//局部变量
	int a = 10;
	int b = 10;

	//打印地址
	cout << "局部变量a地址为： " << (int)&a << endl;
	cout << "局部变量b地址为： " << (int)&b << endl;

	cout << "全局变量g_a地址为： " <<  (int)&g_a << endl;
	cout << "全局变量g_b地址为： " <<  (int)&g_b << endl;

	//静态变量
	static int s_a = 10;
	static int s_b = 10;

	cout << "静态变量s_a地址为： " << (int)&s_a << endl;
	cout << "静态变量s_b地址为： " << (int)&s_b << endl;

	cout << "字符串常量地址为： " << (int)&"hello world" << endl;
	cout << "字符串常量地址为： " << (int)&"hello world1" << endl;

	cout << "全局常量c_g_a地址为： " << (int)&c_g_a << endl;
	cout << "全局常量c_g_b地址为： " << (int)&c_g_b << endl;

	const int c_l_a = 10;
	const int c_l_b = 10;
	cout << "局部常量c_l_a地址为： " << (int)&c_l_a << endl;
	cout << "局部常量c_l_b地址为： " << (int)&c_l_b << endl;

	system("pause");

	return 0;
}
```

打印结果：

![1545017602518](assets/1545017602518.png)



总结：

* C++中在程序运行前分为全局区和代码区
* 代码区特点是共享和只读
* 全局区中存放全局变量、静态变量、常量
* 常量区中存放const修饰的全局常量  和 字符串常量






### 1.2 程序运行后



​	**栈区：**

​		由编译器自动分配释放, 存放函数的参数值,局部变量等

​		注意事项：不要返回局部变量的地址，栈区开辟的数据由编译器自动释放



**示例：**

```c++
int * func()
{
	int a = 10;
	return &a;
}

int main() {

	int *p = func();

	cout << *p << endl;
	cout << *p << endl;

	system("pause");

	return 0;
}
```







​	**堆区：**

​		由程序员分配释放,若程序员不释放,程序结束时由操作系统回收

​		在C++中主要利用new在堆区开辟内存

**示例：**

```c++
int* func()
{
	int* a = new int(10);
	return a;
}

int main() {
	int *p = func();
	cout << *p << endl;
	cout << *p << endl;  
	system("pause");
	return 0;
}
```



**总结：**

堆区数据由程序员管理开辟和释放

堆区数据利用`new`关键字进行开辟内存









### 1.3 new操作符



​	C++中利用==new==操作符在堆区开辟数据

​	堆区开辟的数据，由程序员手动开辟，手动释放，释放利用操作符 ==delete==

​	语法：` new 数据类型`

​	利用new创建的数据，会返回该数据对应的类型的指针

注意：区分new和malloc函数

**示例1： 基本语法**

```c++
int* func()
{
	int* a = new int(10);
	return a;
}

int main() {

	int *p = func();

	cout << *p << endl;
	cout << *p << endl;

	//利用delete释放堆区数据
	delete p;

	//cout << *p << endl; //报错，释放的空间不可访问

	system("pause");

	return 0;
}
```



**示例2：开辟数组**

```c++
//堆区开辟数组
int main() {

	int* arr = new int[10];

	for (int i = 0; i < 10; i++)
	{
		arr[i] = i + 100;
	}

	for (int i = 0; i < 10; i++)
	{
		cout << arr[i] << endl;
	}
	//释放数组 delete 后加 []
	delete[] arr;

	system("pause");

	return 0;
}

```

配对原则：在 C++ 中，new 和 delete 必须严格配对。

- 如果你用 new 申请单个对象，就用 delete 释放。
- 如果你用 new type[] 申请**数组**，就必须用 delete[] 释放。









## 2 引用

### 2.1 引用的基本使用

**作用： **给变量起别名

**语法：** `数据类型 &别名 = 原名`

### 2.2 引用注意事项

* 引用必须初始化
* 引用在初始化后，不可以改变

示例：

```C++
int main() {

	int a = 10;
	int b = 20;
	//int &c; //错误，引用必须初始化
	int &c = a; //一旦初始化后，就不可以更改
	c = b; //这是赋值操作，不是更改引用

	cout << "a = " << a << endl;
	cout << "b = " << b << endl;
	cout << "c = " << c << endl;

	system("pause");

	return 0;
}
```











### 2.3 引用做函数参数

**作用：**函数传参时，可以利用引用的技术让形参修饰实参

**优点：**可以简化指针修改实参



**示例：**

```C++
//1. 值传递
void mySwap01(int a, int b) {
	int temp = a;
	a = b;
	b = temp;
}

//2. 地址传递
void mySwap02(int* a, int* b) {
	int temp = *a;
	*a = *b;
	*b = temp;
}

//3. 引用传递
void mySwap03(int& a, int& b) {
	int temp = a;
	a = b;
	b = temp;
}

int main() {

	int a = 10;
	int b = 20;

	mySwap01(a, b);
	cout << "a:" << a << " b:" << b << endl;

	mySwap02(&a, &b);
	cout << "a:" << a << " b:" << b << endl;

	mySwap03(a, b);
	cout << "a:" << a << " b:" << b << endl;

	system("pause");

	return 0;
}

```



> 总结：通过引用参数产生的效果同按地址传递是一样的。引用的语法更清楚简单













### 2.4 引用做函数返回值



作用：引用是可以作为函数的返回值存在的



注意：**不要返回局部变量引用**

用法：函数调用作为左值



**示例：**

```C++
//返回局部变量引用
int& test01() {
	int a = 10; //局部变量
	return a;
}

//返回静态变量引用
int& test02() {
	static int a = 20;
	return a;
}

int main() {

	//不能返回局部变量的引用
	int& ref = test01();
	cout << "ref = " << ref << endl;
	cout << "ref = " << ref << endl;

	//如果函数做左值，那么必须返回引用
	int& ref2 = test02();
	cout << "ref2 = " << ref2 << endl;
	cout << "ref2 = " << ref2 << endl;

	test02() = 1000;

	cout << "ref2 = " << ref2 << endl;
	cout << "ref2 = " << ref2 << endl;

	system("pause");

	return 0;
}
```















### 2.5 引用的本质

本质：**引用的本质在c++内部实现是一个指针常量.**

指针常量：这个指针指向的变量是固定的。

讲解示例：

```C++
//发现是引用，转换为 int* const ref = &a;
void func(int& ref){
	ref = 100; // ref是引用，转换为*ref = 100
}
int main(){
	int a = 10;
    
    //自动转换为 int* const ref = &a; 指针常量是指针指向不可改，也说明为什么引用不可更改
	int& ref = a; 
	ref = 20; //内部发现ref是引用，自动帮我们转换为: *ref = 20;
    
	cout << "a:" << a << endl;
	cout << "ref:" << ref << endl;
    
	func(a);
	return 0;
}
```

结论：C++推荐用引用技术，因为语法方便，引用本质是指针常量，但是所有的指针操作编译器都帮我们做了













### 2.6 常量引用



**作用：** 常量引用主要用来修饰形参，防止误操作



在函数形参列表中，可以加==const修饰形参==，防止形参改变实参



**示例：**



```C++
//引用使用的场景，通常用来修饰形参
void showValue(const int& v) {
	//v += 10;
	cout << v << endl;
}

int main() {

	//int& ref = 10;  引用本身需要一个合法的内存空间，因此这行错误
	//加入const就可以了，编译器优化代码，int temp = 10; const int& ref = temp;
	const int& ref = 10;

	//ref = 100;  //加入const后不可以修改变量
	cout << ref << endl;

	//函数中利用常量引用防止误操作修改实参
	int a = 10;
	showValue(a);

	system("pause");

	return 0;
}
```









## 3 函数提高

### 3.1 函数默认参数



在C++中，函数的形参列表中的形参是可以有默认值的。

语法：` 返回值类型  函数名 （参数= 默认值）{}`



**示例：**

```C++
int func(int a, int b = 10, int c = 10) {
	return a + b + c;
}

//1. 如果某个位置参数有默认值，那么从这个位置往后，从左向右，必须都要有默认值
//2. 如果函数声明有默认值，函数实现的时候就不能有默认参数
int func2(int a = 10, int b = 10);
int func2(int a, int b) {
	return a + b;
}

int main() {

	cout << "ret = " << func(20, 20) << endl;
	cout << "ret = " << func(100) << endl;

	system("pause");

	return 0;
}
```







### 3.2 函数占位参数



C++中函数的形参列表里可以有占位参数，用来做占位，调用函数时必须填补该位置



**语法：** `返回值类型 函数名 (数据类型){}`



在现阶段函数的占位参数存在意义不大，但是后面的课程中会用到该技术



**示例：**

```C++
//函数占位参数 ，占位参数也可以有默认参数
void func(int a, int) {
	cout << "this is func" << endl;
}

int main() {

	func(10,10); //占位参数必须填补

	system("pause");

	return 0;
}
```









### 3.3 函数重载

#### 3.3.1 函数重载概述



**作用：**函数名可以相同，提高复用性



**函数重载满足条件：**

* 同一个作用域下
* 函数名称相同
* 函数参数**类型不同**  或者 **个数不同** 或者 **顺序不同**



**注意:**  函数的返回值不可以作为函数重载的条件



**示例：**

```C++
//函数重载需要函数都在同一个作用域下
void func()
{
	cout << "func 的调用！" << endl;
}
void func(int a)
{
	cout << "func (int a) 的调用！" << endl;
}
void func(double a)
{
	cout << "func (double a)的调用！" << endl;
}
void func(int a ,double b)
{
	cout << "func (int a ,double b) 的调用！" << endl;
}
void func(double a ,int b)
{
	cout << "func (double a ,int b)的调用！" << endl;
}

//函数返回值不可以作为函数重载条件
//int func(double a, int b)
//{
//	cout << "func (double a ,int b)的调用！" << endl;
//}


int main() {

	func();
	func(10);
	func(3.14);
	func(10,3.14);
	func(3.14 , 10);
	
	system("pause");

	return 0;
}
```













#### 3.3.2 函数重载注意事项



* 引用作为重载条件
* 函数重载碰到函数默认参数





**示例：**

```C++
//函数重载注意事项
//1、引用作为重载条件

void func(int &a)
{
	cout << "func (int &a) 调用 " << endl;
}

void func(const int &a)
{
	cout << "func (const int &a) 调用 " << endl;
}


//2、函数重载碰到函数默认参数

void func2(int a, int b = 10)
{
	cout << "func2(int a, int b = 10) 调用" << endl;
}

void func2(int a)
{
	cout << "func2(int a) 调用" << endl;
}

int main() {
	
	int a = 10;
	func(a); //调用无const
	func(10);//调用有const


	//func2(10); //碰到默认参数产生歧义，需要避免

	system("pause");

	return 0;
}
```





## 编译

C++的编译有四部分：预处理、编译、汇编、链接。

汇编完之后得到obj类型文件（windows系统）或.o类型文件（Linux系统）：二进制目标文件

只有源文件才能编译、头文件不可以。

链接：编译后的目标文件和他们所需要的库文件（lib）链接在一起 得到可执行文件。

编译模式：通常，在一个 C++ 程序中，只包含两类文件—— .cpp 文件和 .h 文件。其中，.cpp 文件被称作 C++ 源文件，里面放的都是 C++ 的源代码；而 .h 文件则被称作 C++ 头文件，里面放的也是 C++ 的源代码。

C++ 语言支持"分别编译"（separatecompilation）。也就是说，一个程序所有的内容，可以分成不同的部分分别放在不同的 .cpp 文件里。.cpp 文件里的东西都是相对独立的，在编译时不需要与其他文件互通，只需要在编译成目标文件后再与其他的目标文件做一次链接（link）就行了。比如，在文件 a.cpp 中定义了一个全局函数 "void a(){}"，而在文件 b.cpp 中需要调用这个函数。即使这样，文件 a.cpp 和文件 b.cpp 并不需要相互知道对方的存在，而是可以分别地对它们进行编译，编译成目标文件之后再链接，整个程序就可以运行了。这是如何实现的？文件 b.cpp 中，在调用 "void a()" 函数之前，先声明一下这个函数 "void a();"，就可以了。这是因为编译器在编译 b.cpp 的时候会生成一个符号表（symbol table），像 "void a()" 这样的看不到定义的符号，就会被存放在这个表中。再进行链接的时候，编译器就会在别的目标文件中去寻找这个符号的定义。一旦找到了，程序也就可以顺利地生成了。

> 注意声明和定义的区别，"声明"则只是声明这个符号的存在，即告诉编译器，这个符号可能是在其他文件中定义的，我这里先用着，你链接的时候再到别的地方去找找看它到底是什么吧。定义的时候要按 C++ 语法完整地定义一个符号（变量或者函数）在整个程序中可以多次声明，但是只能定义一次。
>
> 变量如何声明？extern int a;  // 这是一个纯粹的【声明】。int b; //这是声明也是定义

头文件里面放声明 源文件放定义。当然不绝对，头文件中也可以出现定义，具体细节参考：

[](https://www.runoob.com/w3cnote/cpp-header.html)



## 命名空间

命名空间分割了全局空间，每个命名空间都是一个作用域，用来防止名字冲突。

```cpp
namespace aa

{
	int b = 0;
 // 类、函数、模板、变量的声明和定义。

}

int main()
{
	

}
```

使用命名空间的名字：aa::b

或者using aa::b;或者using namespace aa；

用using声明名后，就可以进行直接使用名称。但是如果该声明区域有相同的名字，则会报错。

using namespace命名空间 将使整个命名空间中的名字可用。如果声明区域有相同的名字，局部版本将隐藏命名空间中的名字，不过，可以使用域名解析符使用命名空间中的名称。

C++标准库的命名空间是std；

> std::string_literals  string_literals是std的子命名空间
>
> ![image-20260302162347153](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260302162347153.png)

名字空间污染：**将过多的标识符（变量名、函数名、类名等）引入到了不该出现的全局作用域或特定的作用域中，大大增加了命名冲突（Name Clashes）的风险。**

最常见的污染源就是滥用 using namespace std;。

C++ 标准库（STL）中定义了大量的名字（如 count, data, time, max, min, distance 等）。如果你在全局定义了一个同名变量，编译器就不知道你想使用哪个名字。

```cpp
#include <iostream>
using namespace std;

// 定义一个全局变量
int cout = 0;

int main() {
    // 💥 编译报错！
    // 编译器不知道这里的 cout 是指你的全局 int 变量，还是 std::cout 函数
    cout << count << endl;
    return 0;
}
```

## 内存对齐

计算机在存储数据的时候为了方便CPU快速的读取数据，在数据之间留了一些空隙。不按照字节顺序一个挨一个排放，而是按照特定倍数的地址（如4的倍数、8的倍数）来排放数据的机制。

CPU读取数据不是按照字节一个个读取的，是以内存存取粒度为单位进行读取的。

32位系统CPU的内存存取粒度是4字节。该处理器只能从地址为4的倍数的内存开始读取数据。32位系统中int是4字节，char是1字节。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251230170142644.png" alt="image-20251230170142644" style="zoom:50%;" />

在Linux系统下，可以通过预编译命令`#pragma pack(n)`，n = 1,2,4,8,16来改变对齐系数。gcc默认对齐系数是`4`

对齐单位：是给定值`#pragma pack(n)`和结构体中最长数据类型长度中较小的那个。

### 对齐规则：

* 结构体第一个成员的**偏移量（offset）**为0，以后每个成员相对于结构体首地址的 offset 都是**该成员大小与对齐单位中较小那个**的整数倍，如有需要编译器会在成员之间加上填充字节。
* **结构体的总大小**为对齐单位的**整数倍**，如有需要编译器会在最末一个成员之后加上填充字节。



## 左值右值

判断左值和右值的区别

左值：有确定的内存地址、可反复使用

右值：1. 没有身份的临时结果，比如字面量、函数按值返回的对象 2. 将亡值：有身份但是即将销毁



## 静态库和动态库

库：就是把函数和类打包在一起称为库。

库分为静态库和动态库。

>  编译的过程：预处理-编译-汇编-链接

静态库：程序在编译时会把库文件的二进制代码链接到目标程序中，这种方式称为静态链接。

如果多个程序中用到了同一静态库中的函数或类，就会存在多份拷贝。

程序的更新和发布不方便，如果某一个静态库更新了，所有使用它的程序都需要重新编译。

```cpp
//制作静态库
g++ -c -o lib库名.a 库代码文件
 
//使用静态库
g++ 选项 源代码文件 -L库文件所在目录 -l库名
```

动态库：程序在编译时不会把库文件的二进制代码链接到目标程序中，而是在运行时候才被载入。

如果多个进程中用到了同一动态库中的函数或类，那么在内存中只有一份，避免了空间浪费问题。

程序升级比较简单，不需要重新编译程序，只需要更新动态库就行了。

可以实现进程之间的代码共享，因此动态库也称为共享库。

```cpp
//制作动态库
g++ -fPIC -shared -o lib库名.so 库代码文件
 
//使用动态库
g++ 选项 源代码文件 -L库文件所在目录 -l库名
//运行可执行程序前，需要设置LD_LIBRARY_PATH环境变量
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:库文件所在目录
```



内存泄漏：在堆上动态分配了一块内存，用一个指针指向这块内存。后来这个指针被销毁了，但是因为一些原因内存没有释放，这就叫内存泄漏。