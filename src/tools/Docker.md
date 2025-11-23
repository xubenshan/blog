# Docker容器

> 参考资料：
>
> [B站尚硅谷](https://www.bilibili.com/video/BV1Zn4y1X7AZ?spm_id_from=333.788.videopod.episodes&vd_source=5940e85c0b18a907a0fdea51914b4f65&p=10) [微信公众号](https://mp.weixin.qq.com/s/vRpC34t0T6xzmvDDdO2fLg)

## 容器、镜像、仓库

Docker是一个容器化技术（管理容器的工具）。

![image-20251103205244390](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103205244390.png)

![image-20251103205316791](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103205316791.png)

每个应用就是一个容器。每一个容器都可以看作一个独立的系统（有文件系统、内存、CPU、进程空间）。从源主机来看，每个容器都是一个进程。

### 安装Docker

> 可以去阿里云或腾讯云购买Linux云服务器或者在Vmware中安装Linux虚拟机。
>
> 也可以直接在windows下安装docker。安装教程：https://mp.weixin.qq.com/s/vRpC34t0T6xzmvDDdO2fLg

## 命令

![image-20251103205431722](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103205431722.png)

### 镜像命令

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104133148522.png" alt="image-20251104133148522" style="zoom:33%;" />

![image-20251104134533883](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104134533883.png)

下载指定版的镜像：去dockerhub里面下载。

![image-20251104134757835](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104134757835.png)

### 搭建自己的docker镜像源



### 容器命令

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104133238622.png" alt="image-20251104133238622" style="zoom:33%;" /><img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104135527875.png" alt="image-20251104135527875" style="zoom: 50%;" />



```bash
docker run【options】镜像名 创建并运行容器

-d 后台启动，不会阻塞当前窗口
-p 源主机端口：容器端口 端口挂载(容器的端口和源主机的端口进行映射，使得可以通过访问源主机的端口来访问容器端口。)（要注意源主机的端口是打开的（涉及到防火墙安全组规则），外部浏览器才可以访问该端口。）
--name 容器名
--network 网络名
--restart always 开机自启动
-v 源主机目录：容器目录 目录挂载

docker ps(process status) 查看进程状态 -a查看所有容器,包括没运行的。-q只答应容器ID。
docker rm -f 容器ID（容器名）强制删除
删除所有的容器：docker rm -f $(docker ps -aq)
docker exec -it 容器名 /bin/bash 进入该容器，命令行进行交互。
exit 退出容器

docker inspect 容器名：查看容器的相关细节。
```

把容器打包成镜像 commit

保存镜像为tar包 save

别人用tar包加载出镜像 load

![image-20251104135841187](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104135841187.png)

![image-20251104135935726](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104135935726.png)

![image-20251104140002377](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104140002377.png)

 ![image-20251104140049752](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104140049752.png)

登陆dockerhub：

![image-20251104140304852](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104140304852.png)

 镜像改名：

![image-20251104140343488](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104140343488.png)

把镜像提交到仓库：

![image-20251104140410506](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104140410506.png)

![image-20251104140501150](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104140501150.png)



## 文件映射

### 目录挂载

宿主机目录的初始状态决定了容器第一次启动后目录的状态。

数据文件可以采用目录挂载





### 卷映射

在宿主机上创建一个叫卷的存储区域，并将该区域和容器内的目录关联。

卷创建时会自动复制容器内目录的初始状态。

配置文件采用卷映射。

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104141143121.png" alt="image-20251104141143121" style="zoom:80%;" />

卷统一放在了/var/lib/docker/volumes/目录：

![image-20251104141304552](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104141304552.png)

docker volume inspect 卷名：查看卷的相关信息

## 网络

![image-20251104141719108](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104141719108.png)

创建自定义网络，在同一网络的容器就可以使用容器名+容器端口互相访问。

docker network create mynet 创建子网

![image-20251104142118288](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104142118288.png)



![image-20251103215907167](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103215907167.png)

## Docker Compose

批量管理容器 

![image-20251104133020486](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104133020486.png)

yaml文件的写法：

![image-20251104142544169](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104142544169.png)

![image-20251104142614735](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104142614735.png)

```yaml
有了yaml文件 docker compose -f compose.yaml up -d 上线容器
```

![image-20251104142853439](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104142853439.png)



## Dockerfile

制作自己的镜像

![image-20251104143150554](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104143150554.png)

![image-20251104143349674](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104143349674.png)



镜像分层机制：

![image-20251104143454418](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104143454418.png)

yaml文件和makefile可以通过docker官网查看如何编写。

https://docs.docker.com/reference/

![image-20251104144356944](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251104144356944.png)

## 总结

![image-20251103220201379](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251103220201379.png)