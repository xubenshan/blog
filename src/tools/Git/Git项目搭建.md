

# Git项目搭建

## 本地仓库操作

* 进入你的项目目录，右键选择`git bash`。

* 输入`git init`，将这个文件夹初始化成`git`管理的文件夹。

![image-20220731182959388](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20220731182959388.png)

* 输入`git add .`，表示把目录所有的内容上传到暂存区。

* 输入`git commit -m "first"`，将暂存区的内容传到git本地仓库。

<!--///-->

## 关联远程仓库

要想上传至Github仓库，首先要建立SSH连接。所以我们要进行一些配置。

* 创建SSH密钥。进入`C:\Users\xubenshan\.ssh`文件夹，里面是否有`id_rsa`和 `id_rsa.pub`。没有的话就执行下面的命令。

```bash
# 生成ssh公钥 右键git bash
ssh-keygen -t tsa -C "邮箱地址" //邮箱地址换成自己的
```

然后一路回车，使用默认值即可。执行完成后，.ssh文件夹下面就出现`id_rsa`和 `id_rsa.pub`文件。

打开`id_rsa.pub`文件，复制里面的内容。

* 登陆Github。将`id_rsa.pub`的内容复制到New SSH Key。![image-20220801220445338](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20220801220445338.png)

* 输入 `ssh -T git@github.com `   若出现`You've successfully authenticated,but GithHub does not provide shell access`则证明已经连接上GitHub了。
* 建立远程仓库。<img src="https://cdn.jsdelivr.net/gh/xubenshan/pic-blog@main/img/image-20220731204108694.png" alt="image-20220731204108694" style="zoom:67%;" />

创建仓库后会出现以下界面：

![image-20251105125127342](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251105125127342.png)

回到Git bash，运行以下命令：

```bash
git remote add origin git@github.com:xubenshan/demo1.git#要换成你的用户名和仓库名。
git branch -M main
git push -u origin main
```

至此，成功将Github仓库和本地Git仓库关联在一起。

<!--///-->

## 后续流程

本地修改代码后，可以使用以下命令推送到Github仓库。
```bash
git add . 
git commit -m "描述性文字"
git push
```

