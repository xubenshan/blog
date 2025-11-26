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