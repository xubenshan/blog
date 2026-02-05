# AI大模型开发-聊天机器人重点笔记

## Ollama 的部署

### Ollama介绍

Ollama是一个开源软件，主要作用就是：部署大语言模型。

我们课上主要运行的模型就是：`deepseek-r1:1.5b`



### Windows系统

找到资料中提供的：`Ollama-setup.exe` 双击打开后，点击`Install` 即可。



![image-20250726180025521](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726180025.png)

安装好后找到`Ollama` 软件运行，正常会在右下角出现图表，点击图表选择`Settings` 

![image-20250726180103518](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/26/20250726180103.png)

更改模型的安装目录即可。



### MacOS系统

略



### Linux系统

只需要在命令行下执行一条命令，如下：

```shell
curl -fsSL https://ollama.com/install.sh | sh
```

即可自动化完成安装。



#### 开启系统代理

使用自己的：

```shell
export http_proxy="http://ip地址:端口"
export https_proxy="https://ip地址:端口"
```



使用老师的：

```shell
export http_proxy="http://192.168.40.85:7890"
export https_proxy="https://192.168.40.85:7890"
```





#### 手动安装Ollama

1. 下载安装包：`ollama-linux-amd64.tgz` 已经在课堂同步的资料文件夹中有
2. 打开WSL Ubuntu，通过`cd /mnt` 找到你的Windows系统中存放这个安装包的地方
3. 找到安装包后执行：`cp ollama-linux-amd64.tgz ~` 将这个安装包从Windows系统复制到Linux系统的用户家目录
4. 回到家目录：`cd ~`
5. 解压Ollama：`sudo tar -xvf ollama-linux-amd64.tgz -C /usr`    （注意-C是大写的C）
6. 执行：`ollama serve` 启动
   1. 或后台启动：`nohup ollama serve >> ollama.log 2>&1 &`

后续就可以正常用了。



### 运行模型

无论什么操作系统，都可以在终端中运行：

```shell
ollama run deepseek-r1:1.5b
```

即可运行`1.5b`参数的deepseek-r1蒸馏模型。

首次运行需要联网下载，大概1.1GB空间。



### 蒸馏模型

我们运行的模式都是蒸馏模型，即非完整模型。

蒸馏：按照需求进行模型提纯（保留核心网络并进行简化）



我们选择的`1.5b`参数就是蒸馏后的（提纯和简化），为了方便低性能设备的运行。

完整的DeepSeek模型，简单来说显卡不花个`20W`基本没啥体验。



> 模型运行是基于GPU（显卡），因为GPU特点：核多（并行计算能力超强）
>
> - CPU：核心少，比如`i7-13650HX` 仅仅有20个核心，这些核心每一个都超强，CPU适合通用计算
> - GPU（显卡）：核心超多，动辄上千的流处理器（核心），每个核心都垃圾（对比CPU），GPU适合做并行计算
>
> 因为模型的神经网络计算，一般来说是量大，而非计算难度高。
>
> 量大的计算，用显卡超爽（核多）



## Ollama客户端命令

当安装好Ollama后就可以在命令行中运行ollama命令。

### 查看帮助

```shell
ollama --help
```

可以给出命令执行的帮助信息

![image-20250728095604660](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728095604.png)

### 启动Ollama

前台启动

```shell
ollama serve
```



后台启动（推荐）

```shell
nohup ollama serve >> ollama.log 2>&1 &
```



### 其它控制命令

运行模型：

```shell
ollama run 模型名称

ollama run deepseek-r1:7b
```



查看本地有那些模型

```shell
ollama list
```



查看当前正在运行的模型

```shell
ollama ps
```

![image-20250728095738280](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728095738.png)



查看模型的详细信息

```shell
ollama show 模型名称
```

<img src="https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728095810.png" alt="image-20250728095810102" style="zoom:67%;" />

复制一个模型

```shell
ollama cp 模型名称 新模型名称
```

![image-20250728095947681](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728095947.png)



删除模型（慎用）

```shell
ollama rm 模型名称
```

![image-20250728100016432](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728100016.png)



下载模型

```shell
ollama pull 模型名称
```

> 模型名称可以在Ollama官网查询你想要的

![image-20250728100151509](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728100151.png)

此命令，仅下载模型，并不会运行。



## ChatBoxAI工具连接Ollama

我们可以安装ChatboxAI 软件在自己电脑中提供一个对话工具，和我们电脑的Ollama进行连接。



安装：略（找到安装包，一路下一步即可）



### 前置要求

使用ChatBoxAI软件之前，`必须启动`你电脑的Ollama

- 启动你Windows版的Ollama
  - Windows的Ollama默认无法调用显卡的CUDA计算加速
- 或
- `WSL Linux版的Ollama都可以用`  （推荐使用WSL）
  - Linux下CUDA加速性能更好





### 配置

![image-20250728101339469](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728101339.png)

### 使用

![image-20250728101401778](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728101402.png)





## Streamlit

Streamlit是一个Python的第三方库，可以通过很少的代码，开发功能丰富的网页应用。



### 安装

打开Windows系统的`cmd` ，运行：

```shell
pip install streamlit -i https://pypi.tuna.tsinghua.edu.cn/simple
```



### 测试Streamlit

打开Windows系统的`cmd` ，运行：

```shell
streamlit hello
```

会自动打开一个网页，可以看到丰富的官方`demo` 效果。

看完了就可以关了，没啥用。



### 运行Python代码

使用streamlit编写的Python代码无法直接在PyCharm中执行，需要用cmd执行。

打开系统的命令提示符（CMD）程序，执行：

```shell
streamlit run python代码
```





### session_state

Streamlit工具编写的网页会定期刷新，等同于每隔一段时间，重新执行整个Python代码。

比如：

```python
import streamlit as st

st.....
st.....

d = {}

while True:
    d[key] = xxx	# 每次循环的Key 假设永不重复
```

我们代码写的无限循环，不停的给字典添加信息，但是这个字典能够记录的信息永远只有1个key

因为这段代码被Streamlit执行起来，相当于每隔一段时间都定期执行。

则每一次执行字典`d` 都会被赋值为空字典。原有记录信息会丢失。



如果想要在网页运行的过程中存储下来信息，可以用Streamlit内置的字典，这个字典将不会丢失内容。

即将代码改为：

```python
import streamlit as st

st.....
st.....


while True:
    st.session_state[key] = xxx	# 每次循环的Key 假设永不重复
```

`st.session_state` 就是一个字典，我们用这个字典，记录的内容就不会丢失。







## Python调用Ollama

Python有一个第三方库叫做：`ollama` 

要注意我们现在电脑有2个Ollama：

- WSL Linux中运行的Ollama：`软件程序`
- Python的第三方库Ollama



### 安装Ollama Python库

```shell
pip install ollama -i https://pypi.tuna.tsinghua.edu.cn/simple
```



### 使用Python调用Ollama

```python
"""
演示使用Python调用Ollama进行模型对话
先确保Ollama已经启动
"""

import ollama

# 建立和Ollama的连接（代码和Ollama程序）
client = ollama.Client(host="http://127.0.0.1:11434")

# 准备用户的提问
prompt = input("请输入你的问题：")

# 封装要提问的格式
# [{"role":"user", "content": "提问的内容"}]
message = [{"role": "user", "content": prompt}]


# 调用ollama进行回答
result = client.chat(
    model="deepseek-r1:7b",     # 模型名
    messages=message            # 封装好的列表（内含提问信息）
)

# 只输出回答信息
print(result['message']['content'])
```





## 在云平台使用模型

### 获取云平台API KEY

需要在阿里云百炼平台注册账户，创建应用，创建API KEY

https://bailian.console.aliyun.com



![image-20250728180325906](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728180326.png)

如图点击新增应用，选择智能体应用。



![image-20250728180408444](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728180408.png)



获取API KEY

![image-20250728180438383](https://image-set.oss-cn-zhangjiakou.aliyuncs.com/img-out/2025/07/28/20250728180438.png)



### 通过LangChain完成Python代码连接阿里云通义模型

pip安装库

```python
pip install langchain -i https://pypi.tuna.tsinghua.edu.cn/simple
pip install langchain-community -i https://pypi.tuna.tsinghua.edu.cn/simple
pip install dashscope -i https://pypi.tuna.tsinghua.edu.cn/simple
```



示例

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_community.llms import Tongyi

memory = ConversationBufferMemory(return_message=True)


def get_response(prompt, api_key):
    model = Tongyi(model="qwen-max", api_key=api_key)
    chain = ConversationChain(llm=model, memory=memory)

    # 发送请求
    response = chain.invoke({"input": prompt})

    return response["response"]


if __name__ == '__main__':

    print(get_response("请python 1-100的输出", "sk-fa5b080ac78b4323b13f733b50f1d5c0"))

```

> 抄一遍即可，无需理解代码含义，因为有很多基础知识还未学，目前仅仅体验一下。





### Streamlit结合LangChain完成聊天机器人

```python
"""
通过Streamlit完成聊天机器人页面开发
"""
import streamlit as st
import langchain_util as utils

# 添加标题
st.title("黑马聊天机器人（阿里云通义千问模型版）")

# 添加分割线
st.divider()


# 输出第一条消息 机器人欢迎语
if "message" not in st.session_state:
    st.session_state["message"] = [{"role": "assistant", "content": "你好我是人工智能机器人，有什么可以帮到您!"}]
    # st.session_state["message"].append({"role": "assistant", "content": "你好我是人工智能机器人，有什么可以帮到您!"})

# list.append({"role": "user", "content": "内容"})
# state["message"]  =   [ {"role": "user", "content": "内容"} , {"role": "user", "content": "内容"}]
# 每一个消息的对话分为2部分： 角色，内容
# 机器人  角色：assistant   内容：说的话
# 人     角色：user         内容：说的话
for message in st.session_state["message"]:
    st.chat_message(message["role"]).write(message["content"])

# 用户输入 在页面下方添加用户输入栏
prompt = st.chat_input()

if prompt:          # 如果prompt有内容 表示用户提问

    # 首先将用户的提问在页面输出
    st.chat_message("user").write(prompt)

    # 把用户提问这个对话保存到session_state内
    st.session_state["message"].append({"role": "user", "content": prompt})

    # 调用AI回答
    with st.spinner("正在思考中..."):        # 转圈圈的加载框
        res = utils.get_response(prompt, "sk-fa5b080ac78b4323b13f733b50f1d5c0")

    # 将AI回答信息写到屏幕上
    st.chat_message("assistant").write(res)

    # 将AI回答的消息记录到session_state内
    st.session_state["message"].append({"role": "assistant", "content": res})
```