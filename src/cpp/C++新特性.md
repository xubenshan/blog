---
title: C++新特性
#icon: gears
order: 5
---
# C++新特性
> 参考侯捷的视频

## auto自动推导类型

代替冗长复杂的变量声明。

在模板中，用于声明依赖模板参数的变量。

函数模板依赖模板参数的返回值。

用于lambda表达式中。

![image-20251126144416507](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251126144416507.png)

使用auto声明函数指针：

![image-20251126144448521](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251126144448521.png)

## 函数模板高级

在[C++](https://baike.baidu.com/item/C%2B%2B)11中，decltype[操作符](https://baike.baidu.com/item/操作符/8978896)，用于查询[表达式](https://baike.baidu.com/item/表达式/7655228)的数据类型。

语法：decltype(expression) var;

decltype分析表达式并得到它的类型，不会计算执行[表达式](https://so.csdn.net/so/search?q=表达式&spm=1001.2101.3001.7020)。函数调用也一种表达式，因此不必担心在使用decltype时执行了函数。

decltype推导规则（按步骤）：

1）如果expression是一个没有用括号括起来的标识符，则var的类型与该标识符的类型相同，包括const等限定符。

2）如果expression是一个函数调用，则var的类型与函数的返回值类型相同（函数不能返回void，但可以返回void *）。

3）如果expression是一个左值（能取地址）(要排除第一种情况)、或者用括号括起来的标识符，那么var的类型是expression的引用。

4）如果上面的条件都不满足，则var的类型与expression的类型相同。

如果需要多次使用decltype，可以结合typedef和using。



## 移动构造函数

复制构造和移动构造的区别：

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251230163244970.png" alt="image-20251230163244970" style="zoom: 33%;" /><img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251230163257764.png" alt="image-20251230163257764" style="zoom: 33%;" />

复制构造的对象各自占有独立的堆内存，而移动构造，只有一个堆内存。复制构造函数要将临时对象的资源复制到目标对象。而移动构造函数要将临时对象的资源移动到目标对象。

```cpp
#include <iostream>
#include <cstring>

class MyString {
public:
    char* data;

    MyString(const char* str) {
        int length = strlen(str);
        data = new char[length + 1];
        strcpy(data, str);
    }

    ~MyString() {
        delete[] data;
    }

    // 移动构造函数
    MyString(MyString&& other) noexcept {
        data = other.data;
        other.data = nullptr;
    }
};

int main() {
    MyString str1("Hello");
    MyString str2 = std::move(str1);  // move函数把str1转化为右值引用

    std::cout << str2.data << std::endl;  // 输出 "Hello"

    return 0;
}
```

移动构造函数与其他构造函数相比，参数类型前面多了一个`&&`，表示右值引用。在C++11之前，我们无法直接访问临时对象（右值），因此无法定义移动构造函数。但是通过引入右值引用，我们可以获取到临时对象，并将其资源移动到目标对象中。

在移动构造函数中，通常会执行以下操作：

- 将源对象的资源指针或资源句柄复制给目标对象，避免深拷贝。
- 将源对象的资源指针或资源句柄置为`nullptr`，以确保源对象析构时不会释放资源。

拷贝构造函数的参数是左值引用。



## 可变参数模板

 基本语法：

```cpp
template<typename... Args>//Args是模板参数包
void show(const Args&... args)//args是函数参数包
{
	....
}
```



## 移动语义和右值引用

需要采取某种方式，让编译器知道何时需要复制，何时不需要。这就引出了右值引用。















