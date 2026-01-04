---
#title: 布局与功能禁用
#icon: gears
order: 1
---
# Git学习笔记

> 我学习Git的原因就是为了很方便的将本地代码上传到远程仓库，比如`gitee`，`GitHub`。

## **版本控制**

> 学习Git前一定要了解什么是版本控制。

所谓的版本控制其实就是一种管理文件，工程历史记录的一种技术。这种技术可以很方便的查看更改历史记录，恢复到以前的版本。版本控制常用于管理多人协同开发项目中。

常见的版本控制工具：

* Git
* SVN
* CVS
* VSS
* TFS
* Visual studio Online

版本控制的分类

* 本地版本控制

记录文件每次的更新，对每个版本做一个快照。

* 集中版本控制

所有的版本数据都存储在一个中央服务器上，用户从服务器上同步更新或上传自己的修改。

所有的数据都在一个服务器上，用户本地只有自己以前同步的版本，只有联网才能看到之前的版本。另外如果这个服务器损坏，就会丢失所有的数据，需要定期备份。SVN是集中版本控制的典型。

* 分布式版本控制

每个用户的电脑都是一个服务器，所有的版本信息都同步到本地的每个用户，这样就可以在本地查看所有的版本历史，离线在本地提交，只需联网的时候push到相应的服务器或其他用户那里。每个用户保存的都是所有的版本数据，因此不用担心出现因为服务器损坏，或者网络问题，而不能工作的情况。Git是分布式版本控制的典型。

## **Git简介**

> Git就是一个分布式版本控制工具。

Git是由Linux之父Linus开发的。是目前世界上最先进的分布式版本控制系统。

Git是开源的，免费的，最初的Git是为辅助Linux内核开发的，来代替Bitkeeper来管理和维护代码。

## **Git的安装**
### Windows下Git的安装
[Git下载官网](https://git-scm.com/downloads)

在Git官网下载可能会非常慢，还会出现打不开网页的现象。小伙伴们可以去淘宝镜像下载：http://npm.taobao.org/mirrors/git-for-windows/  ，下载对应版本即可。

安装的过程中只要无脑下一步即可。

安装完成之后，在开始菜单中会有Git项。如下图：

<img src="https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731165152676.png" alt="image-20220731165152676" style="zoom: 80%;" />

简单说一下，`Git Bash`是类似`linux`的命令行；`Git CMD`是类似`window cmd`的命令行；`Git GUI`是图形化界面。

在日常使用中，我们一般只用`Git Bash`。

我自己下载的是`2.36.1`版本。通过`win+R`，打开运行，输入`cmd`。然后输入`git --version`，就可以查看对应的版本信息了。

![image-20220731165743893](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731165743893.png)

## **Git的环境配置**

```bash
git config --system --list
# 查看系统配置

git config --global --list
# 查看本地配置
```

使用Git前我们需要设置用户名和密码。

* `git config --global user.name "用户名"`

* `git config --global user.email "邮箱"`

设置完成后输入`git config --global --list`，就可以查看用户名和邮箱是否设置成功。

![image-20220731182535086](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731182535086.png)

另外Git在安装过程中会自动的将环境添加到系统变量的path路径下。不用额外进行添加。

![image-20220731182135209](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731182135209.png)

## **Git基本理论**

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20250922172945107.png" alt="image-20250922172945107" style="zoom:50%;" />

工作区：写代码的目录

暂存区：stage .git里面的index文件

本地仓库：.git文件夹

工作区文件的状态（git status）：

* untracked（没纳入本地仓库）
* tracked(Unmodified Modified Staged)

```bash
git相关指令

本地仓库常用命令
git status
git log 查看日志 按q退出
git reset 取消暂存/切换指定版本
切换指定版本：git reset --hard 版本号
git add 
git commit

远程仓库常见命令
git remote 查看远程仓库
git remote add
git push
git pull：从远程仓库获取最新版本，合并到本地仓库
eg: git pull origin main 把远程仓库的main分支合并到当前所在分支
git clone
```



## **Git项目搭建**

在工作盘新建一个名为`test`文件夹，进入文件夹内部，右键打开`git bash`。

输入`git init`，将这个文件夹初始化成`git`管理的文件夹。

![image-20220731182959388](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731182959388.png)

我们会看到文件夹内部多了一个`.git`文件夹。

输入`touch test.txt`，在工作目录下创建了一个test文本。

![image-20220731195654748](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731195654748.png)

`git add test.txt`，将test文件添加到暂存区；

`git commit -m "add test.txt"` 将test文件提交到本地仓库；

![image-20220731205156110](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731205156110.png)

至此，我们已经将创建的文件存储在本地仓库了，我们可以通过pull命令将本地仓库同步到远程仓库中。下面看具体的做法。

### 使用Github

首先你要有一个Github账户。没有注册的小伙伴们可以先去注册一下。

由于本地Git仓库和GitHub仓库之间的传输是通过SSH加密的，因此我们要进行一些必要的配置。

创建SSH key。看一下用户目录下是否有.ssh文件夹，里面是否有`id_rsa`和 `id_rsa.pub`。没有的话就要执行下面的命令（之前没用过github或gitee的话一般是没有的）

```bash
# 进入用户目录下的.ssh目录 C:\Users\86186\\.ssh
# 生成ssh公钥 右键git bash
ssh-keygen -t tsa -C "youremail@example.com" //邮箱地址换成自己的
```

然后一路回车，使用默认值即可。执行完成后，.ssh文件夹下面就出现`id_rsa`和 `id_rsa.pub`文件，第一个是私钥，不能告诉别人；第二个是公钥。

![image-20220801215656790](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220801215656790.png)

打开公钥文件，将里面的内容复制下来。

登录github，点击设置，找到"SSH and GPG keys" ，点击"New SSH key"。

![image-20220801220445338](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220801220445338.png)

将公钥内容复制到Key文本框中，title随便起个名字，点击`Add SSH key`。ssh key添加成功！

输入 `ssh -T git@github.com `   若出现`You've successfully authenticated,but GithHub does not provide shell access`则证明已经连接上GitHub了。

接下来就该创建一个远程仓库了！

点击右上角的加号，新建仓库 `New repository` 。

<img src="https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731200551687.png" alt="image-20220731200551687" style="zoom:67%;" />

然后输入仓库名称，仓库描述，是否公开，最后创建仓库。

<img src="https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731204108694.png" alt="image-20220731204108694" style="zoom:67%;" />


github仓库就创建完成了，接下来我们要让远程仓库和本地仓库关联起来。

在test文件夹下运行命令 `git remote add origin git@github.com:xubenshan/test.git`。注意要将`xubenshan/test`换成你自己的用户名。否则你关联的就是我的远程库，你是无法将本地库推送上去的。

![image-20220731204824909](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731204824909.png)

出现`unsafe repository`这种情况的话，运行git给你的解决方案即可。`git config --global --add safe.directory F:/test`。

再次运行 `git remote add origin git@github.com:xubenshan/test.git`。这样就将本地库同远程库关联起来了。

在GitHub官方文档里面，关联完成后，还要将当前分支`master`改成`main`。`master`可能跟黑人有关。对于我们来说改不改其实问题不大。我们就不改了，这样命令会少一些。

执行命令`git push -u origin master`。这样就可以将本地仓库上传到远程库里面了。其中`origin`是远程库的名字，`master`是本地仓库的当前分支。

需要注意的是第一次执行这个命令的时候需要加`-u`。Git会把本地的`master`分支内容推送到远程新的`master`分支，还会把本地的`master`分支和远程的`master`分支关联起来，在以后的推送或者拉取时就可以简化命令。直接执行`git push`。

![Snipaste_2022-07-31_21-31-53](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/Snipaste_2022-07-31_21-31-53.jpg)

刷新`github`界面就能看到我们上传的test文件了·。

另外我们可以将GitHub里面的项目克隆到本地来。在GitHub上面新建一个仓库，这次我们勾选上`Add a README file`。仓库会自动创建一个`README.md`文件。

![image-20220801070555082](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220801070555082.png)

在本地e盘执行`git clone git@github.com:xubenshan/test.git`，注意这里的仓库名仍然要换成你自己的。

![image-20220801071312130](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220801071312130.png)

github上面的项目就克隆到了本地，我们会发现e盘多了个test文件夹。

```bash
# 进入test文件夹
cd test
# 查看test文件夹下的内容
ls
# test文件夹下出现了一个README.md文件。
# 我们就会发现远程库成功克隆到了本地！
```

之后我们就可以将本地的文件通过`git add` `git commit`  `git push`命令上传到远程仓库。注意push的时候不是`master`而是`main`。这是因为clone的时候自动将本地的分支命名为`main`。	

> Git支持多种协议，默认的`git://`使用ssh，但也可以使用`https`等其他协议。只不过`https`速度比较慢。	

![image-20220801072319285](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220801072319285.png)

> 其他常用的git命令

```bash
# 查看远程库信息
git remote -v

# 删除远程库 （只是解除本地库与远程库的关系，不是物理上的删除远程库。要想真的删除远程库，必须在github上面操作）
git remote rm <name>

# clone和pull的区别
git clone 是从零开始将整个远程仓库复制到本地，创建全新的本地仓库；
git pull 是在连接上远程仓库的基础上，从远程拉取最新代码并自动合并到当前本地分支，实现本地更新
```

[clone和pull的区别](https://cloud.tencent.com/developer/article/2108853)



### 使用gitee

先注册登录码云，完善个人的信息。

设置本机绑定ssh公钥，实现免密码登录。

```bash
# 进入用户目录下的.ssh目录 C:\Users\86186\\.ssh
# 生成ssh公钥
ssh-keygen -t tsa
ssh
```



![Snipaste_2022-07-31_21-50-51](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/Snipaste_2022-07-31_21-50-51.jpg)

生成完之后打开`id_rsa.pub`文件，将公钥粘贴到gitee里面。

![image-20220731215659358](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731215659358.png)

添加成功！

创建仓库，和GitHub类似，这里就不再重复了。

然后我们在本地库使用命令`git remote add`把它和远程库关联起来。

`git remote add origin git@gitee.com:xu-benshan/test.git`。

之后的操作就和GitHub如出一辙了。`git push -u origin master`。

### Git问题汇总

在push的过程中，出现`error: failed to push some refs to 'gitee.com:xu-benshan/test.git`。解决方案参考[博客](https://blog.csdn.net/m0_43599959/article/details/108934056?ops_request_misc=&request_id=&biz_id=102&utm_term=failed%20to%20push%20some%20refs%20to%20%27g&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-108934056.142^v35^pc_rank_34&spm=1018.2226.3001.4187)

`error: failed to push some refs to 'github.com:xubenshan/test.git`

另一种原因：执行了`git branch -M main`，将`master`分支重命名为`main`。pull的时候要将`master`改成`main`。

`git push -u origin main`



在`push`的过程中出现下面情况：

![image-20220817070550908](https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220817070550908.png)

说明远程库和你的本地库版本不一样，这时候要先将远程库`pull`到本地库，然后再`push`到远程库。

```bash
git pull --rebase origin master
git push origin master
```

<img src="https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220817071019403.png" alt="image-20220817071019403" style="zoom:80%;" />



## **Git操作**



### 分支管理

```bash
git branch 列出所有分支 -r列出远程分支 -a列出本地分支和远程分支
git branch xxx 创建分支
git checkout xxx 切换分支
git push origin xxx
git merge xxx 合并分支 把xxx分支合并到当前分支
git branch -d xxx 删除分支
```



### 标签管理

标签：某个分支某个特定时间点的状态 （快照）

v1.0 v2.0 

```bash
git tag
git tag xxx 创建标签
git push origin xxx 将标签推送到远程仓库
git checkout -b [branch] [name] 创建分支保存指定的标签
```





## **使用vscode操作Git**

