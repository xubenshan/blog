# Linux入门

> 参考：[韩顺平一周学会Linux](bilibili.com/video/BV1Sv411r7vd/)

## 前置知识

* VMware：虚拟机，用来安装Linux系统。
* Linux系统：比如Ubuntu、CentOS。
* xshell：通过ssh连接到Linux系统
* vscode：ssh远程连接Linux系统进行开发

Linux是操作系统

Linux是个内核，包装起来就出现了不同的发行版。比如Centos、Ubuntu等。

Linux和unix的关系：unix衍生出Linux

## 开发环境配置

### 安装VMware

虚拟机：VMware Workstation 17pro

### 安装Ubuntu

Ubuntu密码：123456

Centos 密码：xbs

### Centos发行版安装

网址：https://www.centos.org/

安装版本：CentOS 8.1和7.6版本

https://vault.centos.org/8.1.1911/isos/x86_64/

https://mirrors.aliyun.com/centos-vault/7.6.1810/isos/x86_64/

Linux分区：需要手动分区，分成boot、swap、根分区

![image-20251010104020187](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251010104020187.png)

### 安装VMtools

作用：使主机和Linux虚拟机可以共享文件夹

## 网络连接的三种方式

* 桥接模式：虚拟机和主机在同一个网段，可以和外界通讯
* NAT模式：虚拟机和主机不在同一个网段，但是可以和外界通讯
* 主机模式：独立系统，不能和外界通讯

快照、克隆、删除

## 远程登陆

xshell：远程登陆

xftp：文件下载和上传

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251010145505283.png" alt="image-20251010145505283" style="zoom:50%;" />

协议sftp 端口号22 协议ftp 对应端口号为21

### vscode远程连接Ubuntu

* 手动启动Openssh服务

```bash
sudo apt update
sudo apt install openssh-server
sudo systemctl start ssh
sudo systemctl enable ssh
```

检查是否开启ssh服务

```bash
sudo systemctl status ssh
```

* vscode端安装open-ssh插件

* 远程连接

  ![image-20250919101426186](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250919101426186.png)

  ![image-20250919101443983](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250919101443983.png)

  输入用户名@host。host指的Linux服务器的IP地址。可以通过`ifconfig`查看。
  
  > vscode远程连接Centos系统报错：无法建立连接：远程主机不满足运行vscode服务器的先决条件。
  >
  > 原因是VS Code 远程开发需要 **glibc ≥ 2.28**。
  >
  > 通过命令ldd --version 查看glibc版本发现低于2.28。
  >
  > 解决办法：回退vscode版本1.98。

在终端中好用的快捷键：ctrl+a光标跳到开头 ctrl+e光标跳到末尾 ctrl+u清除一行

> 终端就是用户和操作系统进行交互的窗口。终端内置命令行解释器，比如shell cmd powershell bash（属于shell的一种）。命令行解释器的作用是把用户输入的命令进行解析，交给操作系统来执行命令， 然后把结果返回到终端。

## 目录结构

Linux一切皆文件

![image-20251010101416961](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251010101416961.png)

/etc/password 用户的配置文件

/etc/shadow 口令的配置文件

/etc/group 组的配置文件

## vim的使用

正常模式（可以删除拷贝） 插入模式（按i） 命令行模式（按esc退出插入模式，再输入：wq。写入并退出）

删除一行 dd

拷贝一行 yy

在一般模式下 输入G 定位到首行 输入gg 定位到末行

撤销 u

定位 ：＋要定位的行号

查找 /【要查找的内容】

设置行号  ：set nu

## 常见操作

### 如何安装软件

在官网下载的软件安装包可能是AppImage类型：

以屏幕截图软件snipaste为例；

```bash
//首先进入安装包所在目录
cd /home/xbs/Downloads/
//添加可执行权限
sudo chmod +x Snipaste-2.10.8-x86_64.AppImage
//直接运行
./Snipaste-2.10.8-x86_64.AppImage

```

## 常用命令

```shell

cd .. 切换到根目录
pwd 显示当前所在目录
切换成root管理员 su - root
返回原先的用户 logout
man 获取命令信息
ls -a 列出所有文件（包括隐藏文件 .开头的是隐藏文件）
ls -l 一行行的显示
ls -lh 文件大小信息按正常人类习惯显示
mkdir 创建文件夹 -p创建多级文件夹
touch 创建空文件
cp  【要拷贝的对象】 【拷贝到哪】-r 递归复制整个文件夹
强制覆盖 \cp
mv 移动或重命名
rm -rf 目录 强制删除
cat 查看文件内容 -n显示行号	（一般后面会跟上管道命令|more）
less 也可以查看文件内容
echo 输出内容到控制台
head -n 数字 文件 查看文件头几行
tail -n 数字 文件 查看文件尾几行
tail还可以用于实时监控 -f参数
tail -f /home/mydate.txt
重定向 >(覆盖写) >>（追加写） 例子：echo hello > /home/mydate.txt

ls -l /home >> /home/info.txt 将home目录下的文件列表写入info.txt中
cat 文件1 > 文件2 将文件1的内容覆盖到文件2	
ln指令：软链接、类似快捷方式，指向特定的路径。
ln -s /root /home/myroot 在home目录下创建一个软连接myroot，连接到root目录
history 10 查看最近10个指令
 !5 执行历史记录为5的指令
 
```

```bash
搜索查找类
find /home -name hello.txt 查找home目录下的hello.txt
find / -size +200M 查找系统中大于200M的文件

locate 快速定位文件路径
由于locate基于数据库查询，所以第一次运行的时候，必须使用updatedb指令创建数据库。

which 查看某个指令在哪个目录

grep过滤查找 常结合管道指令使用。
何为管道指令：| 表示将前一个命令的处理结果传递给后面的命令处理

在hello.txt文件中，查找yes所在的行，并显示行号
cat hello.txt |grep -n "yes"
```

```bash
压缩和解压指令
gzip 压缩
gunzip 解压

常用：
zip xxx.zip 要压缩的文件或文件夹
unzip -d 目录

zip -r myhome.zip /home -r表示递归压缩

将myhome.zip解压到/opt/tmp目录下
unzip -d /opt/temp myhome.zip

tar指令可以压缩可以解压缩
解压：tar -zxvf pc.tar.gz -C /opt/temp -C 指定解压到哪里
压缩 tar -zcvf /home/hello.java
```

```bash
定时调度crond
定时去调度某个脚本或者命令（数据库备份等）

crontab -e编辑 -l显示 -r删除
service crond restart 重启任务调度

定时任务at：队列里面有很多作业；atd每隔60s检测队列，如果作业和当前时间匹配，就执行此作业。对每个作业只会执行一次，执行完毕后将作业从队列中移除。

首先要确保开启atd进程：
ps -ef 检查进程
我们只关心atd进程，因为采用过滤命令。
ps -ef | grep atd

```

例子：

![image-20251013123850645](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013123850645.png)、

atrm 编号 删除指定编号的任务

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013115546768.png" alt="image-20251013115546768" style="zoom:67%;" />







### 用户管理

* 添加用户

useradd 用户名（默认用户家目录在/home文件夹下）

useradd -d 指定目录 用户名 给创建的用户制定家目录

passwd 用户名： 设置密码

* 删除用户

删除用户，保留其家目录的内容：userdel 用户名

都删掉：userdel -r 用户名

查询用户 id 用户名

切换用户 su - 用户名

查看当前登陆用户 whoami

#### 用户组

添加用户时没有指定组名，那么系统会默认生成跟用户名相同的组名。

groupadd 组名

groupdel 组名

useradd -g 用户组 用户名

usermod -g 用户组 用户名

### 运行级别

常用运行级别3和5。

级别1可以用来找回密码

通过init【0123456】切换不同运行级别

systemctl get-default 查看默认运行级别



**面试题：如何找回root密码**

进入单用户模式（级别1）



绝对路径：/表示根目录。从根目录写起。

cd /root 切换到root目录

相对路径：.表示当前目录 ..表示父目录

例子：root目录和home目录并列。当前目录是root目录，如何切换到home目录

cd ../home 

cd ~ 回到家目录

cd .. 回到当前目录的上一级目录

例子：使用相对路径切换到root目录，当前目录在/home/tome。cd ../../root



### 组

对于一个文件而已，他存在一个所有者。存在一个所在组。组内的用户对该文件就有一定的权限。

```bash
ls -ahl 查看所有者
chown 所有者 文件名   修改文件的所有者
chgrp 组名 文件名 修改文件所在的组
同时修改所有者和所在组 chown 所有者：所在组 文件名
```

![image-20251011104719842](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251011104719842.png)

红色方框就是文件的所有者。

除文件的所有者和所在组的用户外，系统的其他用户都是文件的其他组。



#### 用户权限

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251011110322188.png" alt="image-20251011110322188" style="zoom:67%;" />

-代表普通文件

权限作用到目录：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251011160229037.png" alt="image-20251011160229037"  />

权限作用到文件：<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251011160259462.png" alt="image-20251011160259462" style="zoom:50%;" />

```bash
chmod 修改权限
```

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251011111501984.png" alt="image-20251011111501984" style="zoom:50%;" />

​      通过数字来修改权限  ![image-20251011154713567](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251011154713567.png)

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251011165141305.png" alt="image-20251011165141305" style="zoom:80%;" />                                                                                     

代码：`chmod g+rwx wu`



注意区分 `chmod`和`chown`。chmod是修改文件或目录的权限；chown是修改文件或目录的所有者



## 分区

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013143734747.png" alt="image-20251013143734747" style="zoom:80%;" />

`lsblk`命令 查看设备挂载信息

![image-20251013143704466](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013143704466.png)

SCSI硬盘标识为sdx~。x为盘号 可以是abcd。~是数字，表示该硬盘的第几个分区

![image-20251013144139390](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013144139390.png)

添加硬盘-》设置分区-》格式化-》挂载

格式化：

![image-20251013145148965](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013145148965.png)

挂载：

![image-20251013145322730](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013145322730.png)

取消挂载：umount

重启后挂载就失效了。因此需要设置开机自动挂载。

![image-20251013145731709](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013145731709.png)

查询系统整体磁盘使用情况；

![image-20251013150333236](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013150333236.png)

查询指定目录的磁盘占用情况：

![image-20251013150644365](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013150644365.png)

常用的磁盘命令：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013151028019.png" alt="image-20251013151028019" style="zoom:33%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013151036983.png" alt="image-20251013151036983" style="zoom:33%;" />

说明：wc命令是统计单词个数。



## 网络配置

linux系统ip 虚拟机vmnet8 主机ip

>  ip在同一个网段才能进行通信。

系统默认采用的DHCP（自动分配IP），每次开机后都会重新分配IP。这样会导致IP经常发生变化。因此要学会如何手动配置IP。



hostname命令查看主机名。 在/etc/hostname中修改主机名。重启后生效。

![image-20251013160729146](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013160729146.png)

ping主机名的时候，会去host文件中寻找有没有该主机名和ip地址的映射关系。找不到映射关系，就ping不通。

所以我们要修改host文件，设置映射关系。（好像就是DNS域名解析）

![image-20251013161747353](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013161747353.png)

如何修改hosts文件，参考该文章https://zhuanlan.zhihu.com/p/438447914

用户在浏览器输入网址，DNS是如何将网址转化成ip地址的。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251013163011363.png" alt="image-20251013163011363" style="zoom:67%;" />

## 进程

 进程：执行的程序  

PID：每个进程会分配一个ID号

进程：前台进程（屏幕可以直接看到的）、后台进程

僵死进程：进程已经终止了，但是还占用内存资源。

> ps命令查看当前进程有哪些
>
> ps -aux
>
> <img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103144905989.png" alt="image-20251103144905989" style="zoom:50%;" />
>
> ![image-20251103145101579](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103145101579.png)

查看某个进程的父进程：

![image-20251103151718589](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103151718589.png)

终止进程：

killall 进程名：该进程下面的子进程也会被终止。

kill 进程号     -9 强制终止

![image-20251103152828165](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103152828165.png)

查看进程树：pstree -p（显示进程号） -u（显示用户名）

### 服务

服务(service) 本质就是进程，但是是运行在后台的，通常都会监听某个端口，等待其它程序的请求，比如(mysqld , sshd、防火墙等)，因此我们又称为守护进程。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103154059603.png" alt="image-20251103154059603" style="zoom:50%;" />

有些服务监听的端口是固定的：sshd22 pop3110 telnet23 http80 mysql 3306

![image-20251103154002346](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103154002346.png)

运行级别：

![image-20251103154147880](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103154147880.png)

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103154738449.png" alt="image-20251103154738449" style="zoom:80%;" />

![image-20251103155158005](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103155158005.png)

### 防火墙

> 在真正的生产环境，往往需要将防火墙打开，但问题来了，如果我们把防火墙打开，那么外部请求数据包就不能跟服务器监听端口通讯。这时，需要打开指定的端口。比如 80、22、8080 等
>
> ![image-20251103160722806](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103160722806.png)

![image-20251103160213376](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103160213376.png)

端口号协议如何查看：

netstat -anp | more

![image-20251103160400585](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103160400585.png)

### 动态监控进程

![image-20251103161805265](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103161805265.png)

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103161836476.png" alt="image-20251103161836476" style="zoom:50%;" />

![image-20251103161919497](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103161919497.png)

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103164045244.png" alt="image-20251103164045244" style="zoom:80%;" />

### 监控网络状态

  ![image-20251103164114449](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103164114449.png)

![image-20251103164203692](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103164203692.png)



## 软件安装rpm、yum

  rpm用于互联网下载包的打包及安装工具，它包含在某些 Linux 分发版中。它生成具有.RPM 扩展名的文件。RPM是 RedHat Package Manager（RedHat 软件包管理工具）的缩写，类似 windows 的 setup.exe，这一文件格式名称虽然打上了RedHat 的标志，但理念是通用的。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103170207680.png" alt="image-20251103170207680" style="zoom: 67%;" />

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103170217994.png" alt="image-20251103170217994" style="zoom:67%;" />

![image-20251103170454183](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103170454183.png)

​     <img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103171239399.png" alt="image-20251103171239399" style="zoom:50%;" />

![](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103172516100.png)

## Shell编程

### 变量

### 运算符

### 条件判断

### Case语句

### 循环

### read

### 函数



## Ubuntu系统

给root用户设置密码：

![image-20251107145504809](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251107145504809.png)

### apt命令

apt类似于Centos中的yum命令。可以完成对软件的安装、卸载、更新。

![image-20251107150106417](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251107150106417.png)

```bash
sudo apt-get update 更新源
sudo apt-get install package 安装包
sudo apt-get remove package 删除包
sudo apt-cache show package 获取包的相关信息
sudo apt-get source package 下载包的源代码
```

将下载源修改为国内镜像源。

阿里镜像站：https://developer.aliyun.com/mirror/ubuntu?spm=a2c6h.13651102.0.0.3e221b11gzsfXw

ssh是远程连接的常用协议。

