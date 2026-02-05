# AI大模型开发-Linux重点笔记

## 虚拟机安装

### VMware安装后的验证

快捷键：`win + r` 打开运行窗口

输入：`ncpa.cpl`回车，可以看到自己电脑的网络适配器

![image-20250723181815442](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/23/20250723181815.png)

![image-20250723181843181](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/23/20250723181843.png)

> 当安装完成后，确认有`VMnet1` 好`VMnet8` 2个虚拟网卡



### Ubuntu系统安装流程

确认有系统安装光盘，在给同学们的资料中：`资料/虚拟机/ubuntu-20.04.6-desktop-amd64.iso` 这个就是操作系统安装光盘。



后续流程如下截图过程

1. 

![image-20250724115703577](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724115704.png)



2. 



![image-20250724115734028](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724115734.png)

3. ![image-20250724115817905](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724115818.png)

4. ![image-20250724115848650](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724115849.png)

5. ![image-20250724115941127](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724115941.png)

6. ![image-20250724120008760](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724120009.png)

7. ![image-20250724120024674](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724120025.png)

8. 进入安装流程

   ![image-20250724120036926](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724120037.png)

   安装过程全自动化，无需人工干预，等待即可。



### 安装后打快照

![image-20250724120621985](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724120622.png)

![image-20250724120640936](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724120641.png)

如图，就做了快照备份，后续有问题可以随时回退

> 建议每隔一段时间就打个快照



### 检查是否联网

![image-20250724120930396](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724120930.png)

如上图在虚拟机的桌面，右键点击`Open in Terminal` 



然后输入命令：`ip addr` 可以看到虚拟机的IP地址，如下图

![image-20250724121033724](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724121033.png)



或者执行命令：`ping baidu.com`

![image-20250724121132082](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724121132.png)

能看到和百度网址的延迟毫秒信息即可





### 问题

![image-20250724120808481](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724120808.png)

启动虚拟机，遇到这个，直接点击否即可。





## 基础命令

### 命令基础格式

![image-20250724181242949](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/24/20250724181243.png)

- command 命令本体，必写
- options可选选项，控制命令的细节
- parameter，可选参数，控制命令的指向目标





### ls命令

```python
ls [-a -l -h] [参数]
```



#### 参数的作用

决定ls命令要查看的目标

`ls /` 查看根目录内容

`ls /usr` 查看`/usr`目录内容

#### -a选项

查看全部文件，包括隐藏文件，都显示

在Linux中以`.`开头的文件是隐藏文件和隐藏文件夹

#### -l选项

以列表形式查看内容

不用`-l` 以平铺形式查看

#### -h选项

以更容易理解的方式显示文件大小（以K M G为单位）



#### HOME目录

在Linux系统中每一个用户都有的专属文件夹，有全部操作权限

默认路径是：`/home/用户名`

比如用户名：caoyu则路径是：`/home/caoyu`



#### 当前工作目录

终端软件当前所在的目录，可以通过`pwd` 命令查看

#### 隐藏文件

以`.`开头的文件和文件夹是默认隐藏的需要用`ls -a` 的模式查看

### cd命令

更改工作目录

语法：

```python
cd 路径
```

- 绝对、相对路径都可以

### pwd命令

查看当前的工作目录

语法：

```python
pwd
```

没有选项、没有参数



### 相对、绝对路径

- `相对`：以当前所在文件夹为路径起点
- 绝对：以根目录所在文件夹为路径起点

### 路径符号

- `.` ，当前目录
- `..` ，上一`级`目录
- `~` ，用户的家目录
- `-` ，上一`次`的目录

### mkdir命令

语法：

```python
mkdir [-p] 路径
```

功能：创建指定文件夹

- `-p` 连续创建多层级的文件夹，如mkdir -p 111/222/333



### touch

功能：创建空文件

语法：

```python
touch 文件路径
```



### cat

功能：查看文件内容

语法：

```python
cat 文件路径
```



### more

功能：查看文件内容

语法：

```python
more 文件路径
```

- 可以翻页查看，按空格翻页，按`q` 退出查看



### cp

功能：复制文件和文件夹

语法：

```python
cp -r 参数1 参数2
```

- `-r` 选项用于文件夹复制
- 参数1 被复制的
- 参数2 要复制去的地方



### mv

功能：移动文件和文件夹（Windows中的剪切）

语法：

```python
mv 参数1 参数2
```

- 参数1 被移动的
- 参数2 要移动去的地方 如果不存在则改名
- 不需要`-r` 选项



### rm

功能：删除文件和文件夹

语法：

```python
rm [-r -f] 参数1 参数2 ... 参数N
```

- 参数，被删除的文件或文件夹
- `-r` 删除文件夹用
- `-f` 强制删除（不提示，直接删除）



可以写` rm -rf *.txt`   `*` 表示通配符，表示 删除全部以`.txt`结尾的



> 注意，不要以root用户执行：rm -rf /*



### which

功能：查看在Linux系统中所有可执行的命令的文件本地所在。

> 在Linux系统中执行的命令，本身是一个程序，即一个程序文件。

语法

```shell
which 命令
```



### find

功能：查找符合条件的文件所在

#### 按文件名

语法：

```shell
find 起始路径 -name "被查找的文件名"
```

> 起始路径如果是`/` 表示全盘搜索。
>
> 这样需要管理权限，即root权限。
>
> 可以通过执行： 
>
> - `sudo su -` 切换到root管理员用户去执行，
> - 或
> - `sudo find ...` 在find命令前加入sudo临时获得管理员权限



被查找的文件名，支持通配符，如：

- `find / -name "test*"` 是在全盘搜索，以`test`开头的文件
- `find / -name "*test"` 搜索以`test` 结尾的文件
- `find / -name "*test*"` 搜索包含`test` 的文件

即，` * == 任何`  的结果都是`True` 



#### 按文件大小

语法：

```shell
find 起始路径 -size +|-n(k|M|G)
```

- `+` 表示大于，`-` 表示小于
- `n`表示数字
- `k M G` 表示大小单位，k KB  M MB  G GB

示例

- `+10k` 大于10KB
- `-10M` 小于10MB
- `+1G` 大于1G



### grep

功能：在指定的内容（输入）中过滤包含关键字的行（仅保留包含关键字的行）

语法：`grep [-n] "关键字" 输入内容` 

- `-n` 显示过滤后的内容，在原始输入内容中的行号

示例：

- `grep hello a.txt`  在a.txt文件中，过滤hello关键字（仅保留包含hello关键字的行）
- `grep -n hello a.txt`  在a.txt文件中，过滤hello关键字（仅保留包含hello关键字的行），并显示行号

> 一般搭配管道符使用，如：` ls /usr/bin | grep gst` 查看/usr/bin下，带有gst关键字的内容



### wc

功能：用来统计输入中的如：字节数量、字符数量、单词数量、行数量

语法：

```shell
wc [-c -m -l -w] 输入内容
```

- `-c` 统计字节
- `m` 统计字符
- `-l` 统计行
- `-w` 统计单词数



如果不提供选项，则wc本身统计：字节、单词、行数



> 一般搭配管道符使用

### 管道符

功能：将管道符的左侧的结果，作为管道符右侧程序的输入。管道符本身是：`|`

示例

- `ls -l /usr/bin | wc -l` 将`ls -l /usr/bin`的结果作为wc命令的输入，含义就是：
  - 统计/usr/bin文件夹下的内容数量

管道符可以写多个，如下：

- `ls -l /usr/bin | grep gst | wc -l` 
  - 将`ls -l /usr/bin`的结果作为`grep gst` 的输入
  - 将`ls -l /usr/bin | grep gst`的结果作为wc -l的输入
  - 含义：统计`/usr/bin` 下带有gst关键字的内容的数量



### echo

功能：和Python的print一样，将内容输出到屏幕中。

语法：

```shell
echo 内容
```



### 反引号 `

在Linux中，被`包围的内容，将作为命令去执行。

如：

- `echo pwd`  将输出pwd字样

- ```shell
  echo `pwd`   # 将输出pwd运行的结果，即当前所在工作目录
  ```



### tail

功能：查看文件尾部或跟踪文件更改

语法：

```shell
tail [-f | -num] 文件路径
```

- `-f` 表示持续跟踪文件更改，如需退出按`ctrl + c`退出
- `-num` 表示查看文件尾部多少行，默认是`-10` 

 

### head

功能：查看文件头部内容

语法：

```shell
head [-num] 文件路径
```

- `-num`  表示查看头部多少行，默认是`-10` 



### 重定向符号

含义：将输出的内容重新定向到文件中记录
Linux中有2个：

- `>` 将符号左侧内容的结果，重新定向即`覆盖`写入右侧的文件中
- `>>` 将符号左侧内容的结果，重新定向即`追加`写入右侧的文件中

> 如果右侧提供的文件不存在，则新建



### vi/vim编辑器

![image-20250726120123230](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726120123.png)

VI编辑器是命令行下面的`类似文本编辑器`的程序，可以在命令行下完成文件的编辑。

有3个工作模式：

1. 命令模式，可以输入各类快捷指令，如删除行、跳转光标等等
2. 输入模式，可以正常输入你想要的内容，即开始编辑文件
3. 底线命令模式，可以完成对整个文件的控制，如保持、退出等



语法：

```python
vi 文件
```

即可进入vi编辑器界面

#### 命令模式

当进入vi编辑器，就是命令模式，此模式下可以通过快捷键完成对文件内容的控制，如下：

![image-20250726120344057](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726120344.png)



#### 输入模式

输入模式可以在这个模式下正常编写内容

如果要进入输入模式，必须在命令模式下，通过快捷键进入：

1. `i` 在当前光标位置，开始编辑
2. `o` 在光标下一行开启新行进行编辑
3. `O` 在光标上一行开启新行进行编辑
4. `a`在光标右侧开始编辑
5. `A` 在光标所在行的尾部开始编辑

> 一般就用：`i` 立刻编辑  或 `o` 下一行开始编辑



输入模式要回退到命令模式，按`esc` 即可



#### 底线命令模式

可以对整个文件做控制。

进入方式为：在命令模式下，输入`:` 进入底线命令模式。

常见的控制指令有：

- `w` 保存更改
- `q` 退出vi程序
- `!` 强制（强制退出、强制保存）
- `set nu` 显示文件行号

组合使用：

- `wq` 保存并退出
- `q!` 忽略更改强制退出
- `wq!` 强制保存并退出

### apt

Linux系统的应用商店，在命令行模式下是：`apt` 命令

通过这个命令可以联网安装软件

语法：

```shell
apt install | remove  程序名 [-y]
```

> 必须联网

- `install` 安装程序
- `remove` 删除程序
- `-y` 可选，表示不要提示直接执行





> 此命令需要root权限，普通用户无权执行。

解决方式：

1. 通过`sudo su -` 切换到root用户执行
2. 通过` sudo apt install xxx` 以root权限执行这个命令
   1. sudo 表示不切换用户，但是此命令以root身份执行



#### 更换apt的网址为国内网站

专业说法：更换APT程序的源

国内有很多公司提供了镜像网站，使用和官方的完全一致，但是网络条件好非常多，常见有：阿里云源、163源、清华源等



步骤：

1. 打开清华源官网：`https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu`
2. 选择Ubuntu版本，我们是`20.04` ,复制下图红框中的文本内容
3. ![image-20250726150202034](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726150202.png)
4. 备份原有文件，命令是：` sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak`
5. 编辑文件：`sudo vim /etc/apt/sources.list`  将原有内容清空，粘贴刚刚在网站复制的文本，保存
6. 执行`sudo apt update` 即可
7. 后续的`apt` 命令将从清华大学网站下载内容



### 后台运行程序

命令：

```shell
nohup 你要执行的命令 >> 日志记录文件 2>&1 &
```

比如启动ollama命令：`ollama serve`  这个会前台运行（终端关闭或ctrl + c关闭后，程序会停止）

我们需要转入后台运行：

```shell
nohup ollama serve >> ollama.log 2>&1 &
```

- `nohup` 表示进入后台执行，linux自带程序
- `>>` 将程序运行的日志记录到文件内
- `2>&1 &`  将标准输出和标准错误都记录到日志文件内并后台执行





### WSL 安装

首先先在Windows系统中完成了`WSL` 功能的开启

![image-20250726154700832](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726154701.png)

> 如果这个功能无法开启，请尝试更新Windows系统到最新



通过应用商店图形化安装即可，注意如果网络条件不好，可以用热点，大概消耗500MB流量。

![image-20250726160114403](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726160114.png)

打开提示这个，需要开启虚拟机平台特性

需要确认：

1. 应用和功能中勾选虚拟机平台（默认会自动勾选）

   ![image-20250726160311578](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726160311.png)

   某些系统显示是`虚拟机平台`

2. 确认开启电脑CPU的虚拟化支持（这个正常也是开启的，因为你能用VMware玩虚拟机，这个功能100%是启用的）





首次打开需要等待一会，如下图

![image-20250726160838753](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726160925.png)



之后可以设置用户名

![image-20250726160903956](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726160928.png)

![image-20250726160959857](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726161000.png)

自行设置密码，完成后即可使用。

![image-20250726161015213](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726161015.png)

如图一切完事。







通过命令提示符安装WSL Ubuntu发行版

1. 打开命令提示符程序，执行`wsl --update`   即更新到最新版
2. 执行命令查看有那些Linux可以装：`wsl --list --online`
3. 执行命令安装：`wsl --install Ubuntu-20.04`