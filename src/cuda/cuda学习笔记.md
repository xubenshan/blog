# CUDA C++学习笔记

> CUDA是NVIDIA提供的通用并行计算平台和编程模型。

## 搭建CUDA C++开发环境

### wsl配置环境

> 前置环境：Linux系统：Ubuntu22.04 显卡：NVIDIA GeForce RTX 4060

* 安装NVIDIA最新显卡驱动。（我没有安装最新的，也配置成功了。）
* 验证本地的显卡驱动是否可以成功映射到wsl2中：打开wsl2输入`nvidia-smi`，会打印出显卡信息表格。右上角显示的CUDA版本指的是该显卡类型支持的CUDA最高版本。

![image-20260331152056800](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260331152056800.png)

* 在wsl2中安装C++开发环境（这步肯定安装过。）用`gcc --version`和`g++ --version`来验证。
* **安装 CUDA Toolkit** ：获取官方 Keyring 并配置源。

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
```

安装 CUDA Toolkit `sudo apt-get install cuda-toolkit-12-8` 这里一定要注意toolkit版本要小于等于上面显卡信息表格中显示的版本。

* 配置环境变量

```bash
nano ~/.bashrc
# 在文件末尾添加下面两行：
export PATH=/usr/local/cuda/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
# 在 nano 中，按 Ctrl+O 保存，回车确认，然后按 Ctrl+X 退出
```

* 刷新环境变量：`source ~/.bashrc`
* 验证是否安装成功：`nvcc --version`
* 创建demo测试环境是否配置成功：`nano hello.cu`

测试代码如下：

```c++
#include <iostream>

__global__ void helloFromGPU() {
    printf("Hello from GPU thread %d!\n", threadIdx.x);
}

int main() {
    std::cout << "Hello from CPU!" << std::endl;

    // 启动1个Block，包含5个Thread
    helloFromGPU<<<1, 5>>>();

    // 等待GPU执行完成
    cudaDeviceSynchronize();

    return 0;
}
```

编译命令：`nvcc hello.cu -o hello
`

运行命令：`./hello`

![image-20260331153146874](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260331153146874.png)

## CUDA C++程序入门

### Host Device

### 网格 线程块 线程

### 线程索引

### 编译流程

### 程序框架

一个小demo：

```cpp

```

代码中的向上取整：`(N + blockSize - 1) / blockSize` 等价于数学上的 $\lceil N / blockSize \rceil$

### CUDA线程并行

当执行一个CUDA程序时，并非所有的thread都是同时并行的。同时并行的线程数和CUDA核心有关。

~~理论上，同一个block里的所有thread是并行的。而不同block之间的并行取决于硬件的参数，即流多处理器（SM）的数量决定。~~

一个流多处理器可以同时运行多个线程块。

基于 Turing GPU 架构的 NVIDIA T4 GPU 具有 40 个 SM 和 2560 个 CUDA 核心，每个 SM 可支持多达 1024 个活动线程。

* 在 Turing（图灵）架构下，**每个 SM 里面物理上只包含了 64 个 CUDA 核心**。
* T4 的一个 SM 里，最多只能同时驻扎1024➗ **32 =32个 Warp**。调度器就是在这 32 个小组之间飞速切换，把他们轮流送到那 64 个物理核心上去执行指令的。

~~下图显示一段需要8个block的CUDA代码，是如何由两个不同GPU（2vs4流处理器）所执行的。左边的GPU只有2个流处理器，最多只能有2个block同时运行；而右边GPU有4个流处理器，最多能有4个block同时运行。~~

![image-20260331201216453](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260331201216453.png)



![image-20260331210855633](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260331210855633.png)

## GPU内存模型

CUDA 的性能很大程度由内存访问方式决定。

1. *__device__* 声明变量，存在global memory。
2. *__shared__* 声明共享变量，存在shared memory
3. *__constant__* 声明常量， 存在global memory。

内存主要包括：寄存器、局部内存、共享内存、全局内存、常量内存。

### 全局内存

特点：

- 所有线程都能访问
- 容量大
- 相对慢

适合存放：

- 输入数组
- 输出数组
- 大型查找表
- 大矩阵

### 共享内存

特点：

- 一个 block 内共享
- 比 global memory 快得多
- 容量有限

适合：

- block 内重复使用的数据
- 分块缓存
- 中间结果复用

### 寄存器

特点：

- 每个线程私有
- 速度最快
- 数量有限

适合存放：

- 局部变量
- 累加器
- 小型中间结果

### 局部内存

和寄存器一样，都是线程私有。寄存器装不下局部变量的时候，就会溢出到局部内存。

### 常量内存

特点：

- 只读
- 适合所有线程读取同一份小数据
- 由硬件缓存优化

适合放：

- 常量参数
- 小型只读配置
- 系统参数

## GPU硬件结构

同一个 block 中的 thread 在同一个 SM 中并行执行。

> 如何理解在同一个SM？**Block是 GPU 硬件进行任务分配和调度的最小“不可分割”单位。一个 Block 不能被拆成两半放到两个不同的 SM上去执行。**只有把整个 Block 作为一个整体“塞”进同一个 SM，才能保证它们共享同一块物理 Shared Memory（共享内存）
>
> 如何理解这句话中的并行？这**并不意味着**如果一个 block 有 1024 个线程，这 1024 个线程会绝对同时执行。这 1024 个线程会全部**驻留**在这个 SM 内部，它们被分成 32 个 Warp（每个 Warp 32个线程）。SM 内部的硬件调度器会以极快的速度，挑出几个准备好的 Warp，让它们利用现有的几十/上百个 SP（CUDA Core） **物理上同时运算**。当一批 Warp 等待内存数据时，立刻切换另一批 Warp 去并行计算，从而让整个 SM 里的物理计算单元（SP）一直保持极其饱满的“并行”工作状态。

## 一些边角料

吞吐量：单位时间内完成的工作量。在GPU情境下，吞吐量就是单位时间内完成了多少次运算

异步：同步就是按照一定的次序进行，步调一致。比如A执行完再执行B，按顺序执行。异步就是没有顺序，可能A执行一会B再执行接着A再执行；或者A执行的过程中，B也在执行。

更专业的描述：异步是指任务的发起方调用一个耗时操作后，不需要在原地等待结果返回，而是立刻继续往下执行其他指令。当那个耗时操作在后台完成后，系统会通过状态改变、事件通知或回调函数，来通知发起方处理结果。