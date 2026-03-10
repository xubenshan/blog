---
title: C++新特性
#icon: gears
order: 5
---
# C++新特性
> 参考侯捷的视频以及网上的各种资料。包括C++11 C++14 C++17

## 原始字面量

原始字面量（值）可以直接表示字符串的实际含义，不需要转义和连接。

语法：

`R"(字符串的内容)"`

`R"xxx(字符串的内容)xxx"` xxx是说明文字

```cpp
#include <iostream>         // 包含头文件。
using namespace std;        // 指定缺省的命名空间。

int main()
{
    // 使用转义的方法
    string path = "C:\Program Files\Microsoft OneDrive\tail\nation";//使用单个反斜杠会报错，因为\是转义字符，\P \M是非法的转义。
    string path = "C:\\Program Files\\Microsoft OneDrive\\tail\\nation";//正确方式是用两个反斜杠。
    cout << "path is " << path << endl;

    // 使用C++11原始字面量
    string path1 = R"abcd(C:\Program Files\Microsoft OneDrive\tail\nation)abcd";
    cout << "path1 is " << path1 << endl;
    
    string str = "
        <no>0001</no>/
        <name>西施</name>/
        <sc>火树银花</sc>/
        <yz>沉鱼</yz>/
        <age>23</age>/
        <weight>48.5</weight>/
        <height>170</height>";//字符串内容太多，可以用/来换行书写。
    cout << str << endl;
}
 // 用原始字面量实现换行书写。
    string str = R"(
        <no>0001</no>
        <name>西施</name>
        <sc>火树银花</sc>
        <yz>沉鱼</yz>
        <age>23</age>
        <weight>48.5</weight>
        <height>170</height>)";
    cout << str << endl;
}
```



## auto自动推导类型

代替冗长复杂的变量声明。

在模板中，用于声明依赖模板参数的变量。

函数模板依赖模板参数的返回值。

用于lambda表达式中。

![image-20251126144416507](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251126144416507.png)

使用auto声明函数指针：

![image-20251126144448521](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20251126144448521.png)

## 函数模板高级

在[C++](https://baike.baidu.com/item/C%2B%2B)11中，decltype操作符，用于查询表达式的数据类型。

语法：decltype(expression) var;

decltype分析表达式并得到它的类型，不会计算执行[表达式](https://so.csdn.net/so/search?q=表达式&spm=1001.2101.3001.7020)。函数调用也一种表达式，因此不必担心在使用decltype时执行了函数。

decltype推导规则（按步骤）：

1）如果expression是一个没有用括号括起来的标识符，则var的类型与该标识符的类型相同，包括const等限定符。

2）如果expression是一个函数调用，则var的类型与函数的返回值类型相同（函数不能返回void，但可以返回void *）。

3）如果expression是一个左值（能取地址）(要排除第一种情况)、或者用括号括起来的标识符，那么var的类型是expression的引用。

4）如果上面的条件都不满足，则var的类型与expression的类型相同。

如果需要多次使用decltype，可以结合typedef和using。

## lambda函数

lambda函数是C++11标准新增的语法糖，也称为lambda表达式或匿名函数。

![image-20260301170448383](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260301170448383.png)

* 参数列表：lambda函数不能有默认参数，不支持可变参数。
* 返回类型：可以不写，让编译器自动推导类型。
* 函数体：和普通函数的函数体没什么区别
* 捕获列表：通过捕获列表，lambda函数可以访问父作用域中的非静态局部变量（静态局部变量可以直接访问，不能访问全局变量）。捕获方式可以是值捕获和引用捕获。值捕获的变量，在函数体内部不能修改变量的值。

![image-20260301171923645](https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260301171923645.png)

* 函数选项：在lambda函数中，如果希望修改值捕获变量的值，可以加mutable选项，但是，在lambda函数的外部，变量的值不会被修改。

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int multiplier = 3;
    std::vector<int> vec = {1, 2, 3, 4, 5};

    // 使用 lambda 配合标准库算法 std::for_each
    // 这里按值捕获了外部的 multiplier
    std::for_each(vec.begin(), vec.end(), [multiplier](int n) {
        std::cout << n * multiplier << " "; 
    });
    // 输出: 3 6 9 12 15
    //也可以这样写
    /*auto f = [multiplier](int n) {
        std::cout << n * multiplier << " "; 
    }
    std::for_each(vec.begin(), vec.end(), f; 	
    });*/
    return 0;
}
```

lambda函数的本质：C++ 中的 Lambda 表达式本质上是一个**匿名的函数对象。 当我们写下一个 Lambda 时，编译器会在后台默默为我们生成一个未命名的类。这个类**重载了 `operator()`**（函数调用运算符）。

- 如果我们使用了**捕获列表**，编译器就会在这个匿名类中生成对应的**私有成员变量**，并在类的构造函数中将外部变量初始化给这些成员。
- 按值捕获，就是成员变量的值拷贝；按引用捕获，成员变量就是指针或引用。
- 由于生成的 `operator()` 默认是 `const` 成员函数，所以按值捕获的变量在内部无法修改，这就是为什么需要 `mutable` 关键字来取消这个 `const` 限制。

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



## 委托构造函数和继承构造函数

在实际的开发中，为了满足不同的需求，一个类可能会重载多个构造函数。多个构造函数之间可能会有重复的代码。例如变量初始化，如果在每个构造函数中都写一遍，这样代码会显得臃肿。

委托构造就是在一个构造函数的初始化列表中调用另一个构造函数。

注意：

* 不要生成环状的构造过程。

* 一旦使用委托构造，就不能在初始化列表中初始化其它的成员变量。

```cpp
#include <iostream>
using namespace std;

class AA
{
private:
    int      m_a;
    int      m_b;
    double   m_c;
public:
    // 有一个参数的构造函数，初始化m_c
    AA(double c) {
        m_c = c + 3;     // 初始化m_c
        cout << " AA(double c)" << endl;
    }
    // 有两个参数的构造函数，初始化m_a和m_b
    AA(int a, int b) {
        m_a = a + 1;     // 初始化m_a
        m_b = b + 2;    // 初始化m_b
        cout << " AA(int a, int b)" << endl;
    }
    // 构造函数委托AA(int a, int b)初始化m_a和m_b
    AA(int a, int b, const string& str) : AA(a, b) {
        cout << "m_a=" << m_a << ",m_b=" << m_b << ",str=" << str << endl;
    }
    // 构造函数委托AA(double c)初始化m_c
    AA(double c, const string& str) : AA(c) {
        cout << "m_c=" << m_c << ",str=" << str << endl;
    }
};

int main()
{
    AA a1(10, 20, "我是一只傻傻鸟。");

    AA a2(3.8, "我有一只小小鸟。");
}
```

继承构造函数：

在C++11之前，派生类如果要使用基类的构造函数，可以在派生类构造函数的初始化列表中指定。

C++11推出了继承构造（Inheriting Constructor），在派生类中使用using来声明继承基类的构造函数。

```cpp
#include <iostream>
using namespace std;

class AA       // 基类。
{
public:
    int      m_a;
    int      m_b;
    // 有一个参数的构造函数，初始化m_a
    AA(int a) : m_a(a) { cout << " AA(int a)" << endl; }
    // 有两个参数的构造函数，初始化m_a和m_b
    AA(int a, int b) : m_a(a), m_b(b) { cout << " AA(int a, int b)" << endl; }
};

class BB :public AA       // 派生类。
{
public:
    double   m_c;
    using AA::AA;     // 使用基类的构造函数。
    // 有三个参数的构造函数，调用A(a,b)初始化m_a和m_b，同时初始化m_c
    BB(int a, int b, double c) : AA(a, b), m_c(c) {//注意这里使用基类构造函数构造派生类构造函数，不是委托构造。
        cout << " BB(int a, int b, double c)" << endl;
    }
    void show() { cout << "m_a=" << m_a << ",m_b=" << m_b << ",m_c=" << m_c << endl; }
};

int main()
{
    // 将使用基类有一个参数的构造函数，初始化m_a
    BB b1(10);       
    b1.show();

    // 将使用基类有两个参数的构造函数，初始化m_a和m_b
    BB b2(10,20);  
    b2.show();

    // 将使用派生类自己有三个参数的构造函数，调用A(a,b)初始化m_a和m_b，同时初始化m_c
    BB b3(10,20,10.58);  
    b3.show();
}
```



## 移动语义

了解这两个特性需要先了解右值引用。

需要采取某种方式，让编译器知道何时需要复制，何时不需要。这就引出了右值引用。

左值：可以取地址、有明确的内存存储空间、有名字的对象

右值：不可以取地址，没有名字的对象

C++11扩展了右值的概念，分为了纯右值和将亡值。

右值又分为纯右值和将亡值。

* 纯右值：非引用返回的临时变量、字面量（除去字符串字面量比如："str"，字符串字面量的类型是 const char[]）、运算表达式产生的结果、lambda表达式
* 将亡值：与右值引用相关的表达式，例如：将要被移动的对象、T&&函数返回的值、std::move()的返回值、转换成T&&的类型的转换函数的返回值。

接下来看右值引用和左值引用。

左值引用：`数据类型& 变量名=左值;`

右值引用：`数据类型&& 变量名=右值;`

左值引用只能绑定到左值，右值引用只能绑定右值，常量左值引用`const int& j = 0`可以绑定到右值或左值。

-----------------------------------------

拓展：再介绍一种万能引用（转发引用）

万能引用在形式上**长得和右值引用一模一样，都是 &&**。但是，成为万能引用有一个前提条件：**必须发生类型推导。**主要有以下两个场景（类型推导）：

**1. 模板函数参数**

```cpp
template <typename T> 

void func(T&& param) { // 这里的 T&& 就是万能引用    // ... }
```

**2. auto类型声明**

```cpp
auto&& var = some_function(); // 这里的 auto&& 也是万能引用
```

万能引用示例：

```cpp
template <typename T>
void print(T&& param) {
    // 编译器会根据传入的参数，自动推导 param 到底是左值引用还是右值引用
}

int x = 10;
const int cx = 20;

print(x);       // 传入左值，T被推导为int& ，根据引用折叠，int& && -> int&   param 变成了int&
//引用折叠：右值引用的右值引用折叠成右值引用，所有其他组合均折叠成左值引用。
print(cx);      // 传入 const 左值，param 变成了 const 左值引用 (const int&)
print(30);      // 传入右值，T被推导为int（就这样规定的），param 变成了右值引用 (int&&)
print(std::move(x)); // 传入右值，param 变成了右值引用 (int&&)
```

万能引用的目的就是为了实现完美转发。

-----------------------------------------



**引入右值引用的主要目的是实现移动语义。**

所谓的移动语义就是把资源通过浅拷贝从一个对象转移到另一个对象上面。实现移动语义需要两个函数：移动构造函数 移动赋值函数（移动赋值运算符）

<img src="https://xubenshan-pic.oss-cn-beijing.aliyuncs.com/img/image-20260117165829322.png" alt="image-20260117165829322" style="zoom:50%;" />

在C++11中，我们用左值去初始化一个对象或为一个已有对象赋值时，会调用拷贝构造函数或拷贝赋值运算符来拷贝资源，而当我们用一个右值来初始化或赋值时，会调用移动构造函数或移动赋值运算符来移动资源，从而避免拷贝，提高效率。

拷贝构造函数：`类名(类名&& 源对象){......}`

拷贝赋值运算符：`类名& operator=(类名&& 源对象){……}`

对于一个左值，会调用拷贝构造函数，但是有些左值是局部变量，生命周期也很短，能不能也移动而不是拷贝呢？C++11为了解决这个问题，提供了std::move()方法来将左值转义为右值，从而方便使用移动语义。它其实就是告诉编译器，虽然我是一个左值，但不要对我用拷贝构造函数，用移动构造函数吧。左值对象被转移资源后，不会立刻析构，只有在离开自己的作用域的时候才会析构，如果继续使用左值中的资源，可能会发生意想不到的错误。

如果没有提供移动构造/赋值函数，只提供了拷贝构造/赋值函数，编译器找不到移动构造/赋值函数就去寻找拷贝构造/赋值函数。

移动语义对于拥有资源（如内存、文件句柄）的对象有效，如果是基本类型，使用移动语义没有意义。

```cpp
#include <iostream>
using namespace std;

class AA
{
public:
    int* m_data = nullptr;  // 数据成员，指向堆区资源的指针。

    AA() = default;             // 启用默认构造函数。

    void alloc() {                // 给数据成员m_data分配内存。
        m_data = new int;                       // 分配内存。
        memset(m_data, 0, sizeof(int));   // 初始化已分配的内存。
    }

    AA(const AA& a) {     // 拷贝构造函数。
        cout << "调用了拷贝构造函数。\n";            // 显示自己被调用的日志。
        if (m_data == nullptr) alloc();                     // 如果没有分配内存，就分配。
        memcpy(m_data, a.m_data, sizeof(int));     // 把数据从源对象中拷贝过来。
    }

    AA(AA&& a) {     // 移动构造函数。
        cout << "调用了移动构造函数。\n";            // 显示自己被调用的日志。
        if (m_data != nullptr) delete m_data;         // 如果已分配内存，先释放掉。
        m_data = a.m_data;                                   // 把资源从源对象中转移过来。
        a.m_data = nullptr;                                    // 把源对象中的指针置空。
    }

    AA& operator=(const AA& a) { // 赋值函数。
        cout << "调用了赋值函数。\n";                   // 显示自己被调用的日志。
        if (this == &a)   return *this;                      // 避免自我赋值。
        if (m_data == nullptr) alloc();                     // 如果没有分配内存，就分配。
        memcpy(m_data, a.m_data, sizeof(int));    // 把数据从源对象中拷贝过来。
        return *this;
    }

    AA& operator=(AA&& a) { // 移动赋值函数。
        cout << "调用了移动赋值函数。\n";            // 显示自己被调用的日志。
        if (this == &a)   return *this;                      // 避免自我赋值。
        if (m_data != nullptr) delete m_data;         // 如果已分配内存，先释放掉。
        m_data = a.m_data;                                   // 把资源从源对象中转移过来。
        a.m_data = nullptr;                                    // 把源对象中的指针置空。
        return *this;
    }

     ~AA() {                 // 析构函数。
         if (m_data != nullptr) {
             delete m_data; m_data = nullptr;
         }
    }
};

int main()
{
    AA a1;                  // 创建对象a1。
    a1.alloc();             // 分配堆区资源。
    *a1.m_data = 3;   // 给堆区内存赋值。
    cout << "a1.m_data=" << *a1.m_data << endl;

    AA a2 = a1;         // 将调用拷贝构造函数。
    cout << "a2.m_data=" << *a2.m_data << endl;

    AA a3;
    a3 = a1;              // 将调用赋值函数。
    cout << "a3.m_data=" << *a3.m_data << endl;

    auto f = [] { AA aa; aa.alloc(); *aa.m_data = 8; return aa; };   // 返回AA类对象的lambda函数。
    AA a4 = f();                // lambda函数返回临时对象，是右值，将调用移动构造函数。
    cout << "a4.m_data=" << *a4.m_data << endl;

    AA a6;
    a6 = f();              // lambda函数返回临时对象，是右值，将调用移动赋值函数。
    cout << "a6.m_data=" << *a6.m_data << endl;
}
```



## 完美转发

在函数模板中，可以将参数“完美”的转发给其它函数。所谓完美，即不仅能准确的转发参数的值，还能保证被转发参数的左、右值属性不变。

能否实现完美转发，决定了该参数在传递过程使用的是拷贝语义还是移动语义。

为了支持完美转发，C++11提供了以下方案：

1）如果模板中（包括类模板和函数模板）函数的参数书写成为T&& 参数名，那么，函数既可以接受左值引用，又可以接受右值引用。

2）提供了模板函数``std::forward<T>(参数)`` ，用于转发参数，如果 参数是一个右值，转发之后仍是右值引用；如果参数是一个左值，转发之后仍是左值引用。

```cpp
#include <iostream>
using namespace std;

void func1(int& ii) {        // 如果参数是左值，调用此函数。
    cout << "参数是左值=" << ii << endl;
}

void func1(int&& ii) {     // 如果参数是右值，调用此函数。
    cout << "参数是右值=" << ii << endl;
}

// 1）如果模板中（包括类模板和函数模板）函数的参数书写成为T&& 参数名，
// 那么，函数既可以接受左值引用，又可以接受右值引用。
// 2）提供了模板函数std::forward<T>(参数) ，用于转发参数，
// 如果参数是一个右值，转发之后仍是右值引用；如果 参数是一个左值，转发之后仍是左值引用。
template<typename TT>
//void func(TT&& ii)
//{
//    func1(ii);
//} 这样是不行的，实参是ii时，TT被推到成int& 形参的类型时左值引用。实参是8时，TT被推导成int，形参的类型是右值引用。但是传给func1时，为什么没有调用右值引用版本的func1？
/*核心原因：有名字的右值引用也是左值。根据 C++ 的规则，只要一个表达式有名字，它就是左值。 因为你可以通过这个名字 ii 多次访问这个对象，甚至取它的地址。而右值（如数字 8）是临时的、没有名字的。

因此，当你直接调用 func1(ii) 时：

编译器看到的实参是 ii 这个变量名。

ii 是一个左值（尽管它的类型是右值引用）。

编译器会优先匹配 func1(int&) 这个左值版本的函数。*/
void func(TT&& ii)
{
    func1(forward<TT>(ii));
}

int main()
{
    int ii = 3;
    func(ii);       // 实参是左值。
    func(8);       // 实参是右值。
}
```

## 智能指针

智能指针的底层逻辑全靠四个英文字母：**RAII**（Resource Acquisition Is Initialization，资源获取即初始化）。

把在堆上申请的内存封装进一个**分配在栈上的对象**里。利用 C++ 语言的绝对规则——**局部栈对象在离开作用域时（无论是正常结束还是抛出异常），必定会自动调用析构函数。** 智能指针就是在自己的析构函数里写了 `delete`。这样就把手动管理内存的苦差事，交给了编译器自动执行。

主要有三种智能指针：`std::unique_ptr`、`std::shared_ptr`、`std::weak_ptr`，头文件 `<memory>`。智能指针本质是模板类。

先来介绍`std::unique_ptr`，一个对象同一时间只能被一个指针拥有。

```cpp
#include <iostream>
#include <memory>
using namespace std;

class AA
{
public:
	string m_name;
	AA() { cout << m_name << "调用构造函数AA()。\n"; }
	AA(const string & name) : m_name(name) { cout << "调用构造函数AA("<< m_name << ")。\n"; }
	~AA() { cout << m_name << "调用了析构函数~AA(" << m_name << ")。\n"; }
}

int main()
{
	AA* p = new AA("西施");
    //需要手动写delete p 才能释放内存。
    //我们可以创建一个unique_ptr对象，来管理普通指针
    unique_ptr<AA> pu1(p);
    //这样就不需要手动释放内存。
	unique_ptr<AA> pu2 = pu1;           // 错误，不能用其它unique_ptr拷贝构造。
	unique_ptr<AA> pu3;
	pu3 = pu1;                            // 错误，不能用=对unique_ptr进行赋值。

}

```

初始化：`unique_ptr<AA> pu1(new AA("西施"))`

使用方法：

* 智能指针重载了*和->操作符，可以像使用指针一样使用unique_ptr。
* 不支持普通的拷贝和赋值。
* 不要用同一个裸指针初始化多个unique_ptr对象。(裸指针就是普通指针)
* get()方法返回裸指针。
* 不要用unique_ptr管理不是new分配的内存。
* 把智能指针传递给函数时，只能传引用。因为unique_ptr没有拷贝构造函数。或者用裸指针。

更多技巧：

1）将一个unique_ptr赋给另一个时，如果源unique_ptr是一个临时右值，编译器允许这样做；如果源unique_ptr将存在一段时间，编译器禁止这样做。一般用于函数的返回值。

```cpp
unique_ptr<AA> p0;
p0 = unique_ptr<AA>(new AA ("西瓜"));//等号右侧就是一个临时右值。
```

2）用nullptr给unique_ptr赋值将释放对象。

3）release()释放对原始指针的控制权，将unique_ptr置为空，返回裸指针。（可用于把unique_ptr传递给子函数，子函数将负责释放对象）

4）std::move()可以转移对原始指针的控制权。（可用于把unique_ptr传递给子函数，子函数形参也是unique_ptr）

演示下3 4点：

```cpp
#include <iostream>
#include <memory>
using  namespace std;

class AA
{
public:
	string m_name;
	AA() { cout << m_name << "调用构造函数AA()。\n"; }
	AA(const string & name) : m_name(name) { cout << "调用构造函数AA("<< m_name << ")。\n"; }
	~AA() { cout << "调用了析构函数~AA(" << m_name << ")。\n"; }
};

// 函数func1()需要一个指针，但不对这个指针负责。
void func1(const AA* a) {
	cout << a->m_name << endl;
}

// 函数func2()需要一个指针，并且会对这个指针负责。
void func2(AA* a) {
	cout << a->m_name << endl;
	delete a;
}

// 函数func3()需要一个unique_ptr，不会对这个unique_ptr负责。
void func3(const unique_ptr<AA> &a) {
	cout << a->m_name << endl;
}

// 函数func4()需要一个unique_ptr，并且会对这个unique_ptr负责。
void func4(unique_ptr<AA> a) {
	cout << a->m_name << endl;
}

int main()
{
	unique_ptr<AA> pu(new AA("西施"));

	cout << "开始调用函数。\n";
	//func1(pu.get());        // 函数func1()需要一个指针，但不对这个指针负责。
	//func2(pu.release());  // 函数func2()需要一个指针，并且会对这个指针负责。
	//func3(pu);                // 函数func3()需要一个unique_ptr，不会对这个unique_ptr负责。
	func4(move(pu));     // 函数func4()需要一个unique_ptr，并且会对这个unique_ptr负责。move把控制权转移到了形参a，形参a来管理原始指针。
	cout << "调用函数完成。\n";

	if (pu == nullptr) cout << "pu是空指针。\n";
}

```

5) reset()释放对象。

```cpp
void reset(T * _ptr= (T *) nullptr);

pp.reset();    // 释放pp对象指向的资源对象。

pp.reset(nullptr); // 释放pp对象指向的资源对象

pp.reset(new AA("bbb")); // 释放pp指向的资源对象，同时指向新的对象。
```

6) swap()交换两个unique_ptr的控制权。

`void swap(unique_ptr<T> &_Right);`

7）unique_ptr也可跟普通指针那样，当基类指针指向派生类对象时，也具有多态性质。

8）unique_ptr不是绝对安全，如果程序中调用exit()退出，全局的unique_ptr可以自动释放，但局部的unique_ptr无法释放。

再来介绍`shared_ptr`

shared_ptr共享它指向的对象，多个shared_ptr可以指向相同的对象，在内部采用计数机制来实现。

当新的shared_ptr与对象关联时，引用计数增加1。当shared_ptr超出作用域时，引用计数减1。当引用计数变为0时，则表示没有任何shared_ptr与对象关联，则释放该对象。

shared_ptr的初始化和unique_ptr其实是一样的，不过C++11标准提供了另一种更方便的初始化方式make_shared。

```cpp
shared_ptr<AA> p0 = make_shared<AA>("西施");  // C++11标准，效率更高。
shared_ptr<int> pp1=make_shared<int>();         // 数据类型为int。
shared_ptr<AA> pp2 = make_shared<AA>();       // 数据类型为AA，默认构造函数。
shared_ptr<AA> pp3 = make_shared<AA>("西施");  // 数据类型为AA，一个参数的构造函数。
shared_ptr<AA> pp4 = make_shared<AA>("西施",8); // 数据类型为AA，两个参数的构造函数。
```

另外shared_ptr没有禁用拷贝构造函数和赋值函数，因此可以这样初始化：

```cpp
shared_ptr<AA> p0(new AA("西施")); 
shared_ptr<AA> p1(p0);                 //  调用拷贝构造函数
shared_ptr<AA> p1=p0;                 // 调用拷贝构造函数
//或者shared_ptr<AA> p1; 
//p1 = p0;//调用赋值函数
```

use_count()方法返回引用计数器的值。

unique()方法，如果use_count()为1，返回true，否则返回false。

1）~~将一个unique_ptr赋给另一个时，如果源unique_ptr是一个临时右值，编译器允许这样做；如果源unique_ptr将存在一段时间，编译器禁止这样做。一般用于函数的返回值。~~

2）用nullptr给shared_ptr赋值将把计数减1，如果计数为0，将释放对象，空的shared_ptr==nullptr。

3）~~release()释放对原始指针的控制权，将unique_ptr置为空，返回裸指针。~~

4）std::move()可以转移对原始指针的控制权。还可以将unique_ptr转移成shared_ptr。

5）reset()改变与资源的关联关系。

pp.reset();    // 解除与资源的关系，资源的引用计数减1。

pp. reset(new AA("bbb")); // 解除与资源的关系，资源的引用计数减1。关联新资源。

6）swap()交换两个shared_ptr的控制权。

`void swap(shared_ptr<T> &_Right);`

7）shared_ptr也可象普通指针那样，当指向一个类继承体系的基类对象时，也具有多态性质，如同使用裸指针管理基类对象和派生类对象那样。

8）shared_ptr不是绝对安全，如果程序中调用exit()退出，全局的shared_ptr可以自动释放，但局部的shared_ptr无法释放。

9）shared_ptr的线程安全性：

* shared_ptr的引用计数本身是线程安全（引用计数是原子操作）。

* 多个线程同时读同一个shared_ptr对象是线程安全的。

* 如果是多个线程对同一个shared_ptr对象进行读和写，则需要加锁。

* 多线程读写shared_ptr所指向的同一个对象，不管是相同的shared_ptr对象，还是不同的shared_ptr对象，也需要加锁保护。

10）如果unique_ptr能解决问题，就不要用shared_ptr。unique_ptr的效率更高，占用的资源更少。

**接下来再讲一下删除器：**

在默认情况下，智能指针过期的时候，用delete原始指针; 释放它管理的资源。

程序员可以自定义删除器，改变智能指针释放资源的行为。

删除器可以是全局函数、仿函数和Lambda表达式，形参为原始指针。

```cpp
#include <iostream>
#include <memory>
using  namespace std;

class AA
{
public:
	string m_name;
	AA() { cout << m_name << "调用构造函数AA()。\n"; }
	AA(const string & name) : m_name(name) { cout << "调用构造函数AA("<< m_name << ")。\n"; }
	~AA() { cout << "调用了析构函数~AA(" << m_name << ")。\n"; }
};

void deletefunc(AA* a) {    // 删除器，普通函数。
	cout << "自定义删除器（全局函数）。\n";
	delete a;
}

struct deleteclass               // 删除器，仿函数。
{
	void operator()(AA* a) {
		cout << "自定义删除器（仿函数）。\n";
		delete a;
	}
};

auto deleterlamb = [](AA* a) {   // 删除器，Lambda表达式。
	cout << "自定义删除器（Lambda）。\n";
	delete a;
};

int main()
{
	shared_ptr<AA> pa1(new AA("西施a"), deletefunc);
	//shared_ptr<AA> pa2(new AA("西施b"), deleteclass());
	//shared_ptr<AA> pa3(new AA("西施c"), deleterlamb);
	
	//unique_ptr<AA,decltype(deletefunc)*> pu1(new AA("西施1"), deletefunc);
    // unique_ptr<AA, void (*)(AA*)> pu0(new AA("西施1"), deletefunc);
	//unique_ptr<AA, deleteclass> pu2(new AA("西施2"), deleteclass());
	//unique_ptr<AA, decltype(deleterlamb)> pu3(new AA("西施3"), deleterlamb);
}
```

shared_ptr内部维护了一个共享的引用计数器，多个shared_ptr可以指向同一个资源。但是如果出现了**循环引用**的情况，引用计数永远无法归0，资源不会被释放。

```cpp
#include <iostream>
#include <memory>
using  namespace std;

class BB;

class AA
{
public:
	string m_name;
	AA() { cout << m_name << "调用构造函数AA()。\n"; }
	AA(const string & name) : m_name(name) { cout << "调用构造函数AA("<< m_name << ")。\n"; }
	~AA() { cout << "调用了析构函数~AA(" << m_name << ")。\n"; }
	shared_ptr<BB> m_p;
};

class BB
{
public:
	string m_name;
	BB() { cout << m_name << "调用构造函数BB()。\n"; }
	BB(const string& name) : m_name(name) { cout << "调用构造函数BB(" << m_name << ")。\n"; }
	~BB() { cout << "调用了析构函数~BB(" << m_name << ")。\n"; }
	shared_ptr<AA> m_p;
};

int main()
{
	shared_ptr<AA> pa = make_shared<AA>("西施a");
	shared_ptr<BB> pb = make_shared<BB>("西施b");
	
	pa-> m_p = pb;
	pb-> m_p = pa;
}
//想一想为什么AA和BB资源无法释放。
```

weak_ptr 是为了配合shared_ptr而引入的，它指向一个由shared_ptr管理的资源但不影响资源的生命周期。也就是说，将一个weak_ptr绑定到一个shared_ptr不会改变shared_ptr的引用计数。

不论是否有weak_ptr指向，如果最后一个指向资源的shared_ptr被销毁，资源就会被释放。

weak_ptr更像是shared_ptr的助手而不是智能指针。

weak_ptr没有重载 ->和 *操作符，不能直接访问资源。

有以下成员函数：

1）operator=(); // 把shared_ptr或weak_ptr赋值给weak_ptr。

2）expired();   // 判断它指向的资源是否已过期（已经被销毁）。

3）lock();    // 返回shared_ptr，如果资源已过期，返回空的shared_ptr。

4）reset();    // 将当前weak_ptr指针置为空。

5）swap();    // 交换。

以下是weak_ptr的精髓：==（涉及到多线程，以后再看）==

weak_ptr**不控制对象的生命周期，但是，它知道对象是否还活着。**

**用lock()函数把它可以提升为shared_ptr，如果对象还活着，返回有效的shared_ptr，如果对象已经死了，提升会失败，返回一个空的shared_ptr。**

**提升的行为（lock()）是线程安全的。**

```cpp
#include <iostream>
#include <memory>
using  namespace std;

class BB;

class AA
{
public:
	string m_name;
	AA() { cout << m_name << "调用构造函数AA()。\n"; }
	AA(const string& name) : m_name(name) { cout << "调用构造函数AA(" << m_name << ")。\n"; }
	~AA() { cout << "调用了析构函数~AA(" << m_name << ")。\n"; }
	weak_ptr<BB> m_p;
};

class BB
{
public:
	string m_name;
	BB() { cout << m_name << "调用构造函数BB()。\n"; }
	BB(const string& name) : m_name(name) { cout << "调用构造函数BB(" << m_name << ")。\n"; }
	~BB() { cout << "调用了析构函数~BB(" << m_name << ")。\n"; }
	weak_ptr<AA> m_p;
};

int main()
{
	shared_ptr<AA> pa = make_shared<AA>("西施a");

	{
		shared_ptr<BB> pb = make_shared<BB>("西施b");

		pa->m_p = pb;
		pb->m_p = pa;

		shared_ptr<BB> pp = pa->m_p.lock();            // 把weak_ptr提升为shared_ptr。
		if (pp == nullptr)
			cout << "语句块内部：pa->m_p已过期。\n";
		else
			cout << "语句块内部：pp->m_name=" << pp->m_name << endl;
	}

	shared_ptr<BB> pp = pa->m_p.lock();            // 把weak_ptr提升为shared_ptr。
	if (pp == nullptr)
		cout << "语句块外部：pa->m_p已过期。\n";
	else
		cout << "语句块外部：pp->m_name=" << pp->m_name << endl;
}
```

## 时间操作

C++11提供了chrono模版库，实现了一系列时间相关的操作（时间长度、系统时间和计时器）。头文件：#include <chrono> 命名空间：在这个库里面的函数和类在std::chrono这个命名空间中。chrono属于std的一个子名字空间。

### 时间长度

duration模板类用于表示一段时间（时间长度、时钟周期），

```cpp
#include <iostream>
#include <chrono>      // chrono库的头文件。
using namespace std;

int main()
{
    chrono::hours  t1(1);                                  // 1小时
    chrono::minutes  t2(60);                            //  60分钟
    chrono::seconds  t3(60 * 60);                    //  60*60秒
    chrono::milliseconds  t4(60 * 60 * 1000);  // 60*60*1000毫秒
    chrono::microseconds t5(60 * 60 * 1000 * 1000);          // 警告：整数溢出。
    chrono::nanoseconds t6(60 * 60 * 1000 * 1000*1000);  // 警告：整数溢出。

    if (t1 == t2)    cout << "t1==t2\n";
    if (t1 == t3)    cout << "t1==t3\n";
    if (t1 == t4)    cout << "t1==t4\n";

    // 获取时钟周期的值，返回的是int整数。
    cout << "t1=" << t1.count() << endl;
    cout << "t2=" << t2.count() << endl;
    cout << "t3=" << t3.count() << endl;
    cout << "t4=" << t4.count() << endl;

    chrono::seconds t7(1);                                         // 1秒
    chrono::milliseconds  t8(1000);                           // 1000毫秒
    chrono::microseconds t9(1000 * 1000);              // 1000*1000微秒
    chrono::nanoseconds t10(1000 * 1000 * 1000);  //  1000*1000*1000纳秒

    if (t7 == t8)    cout << "t7==t8\n";
    if (t7 == t9)    cout << "t7==t9\n";
    if (t7 == t10)  cout << "t7==t10\n";

    // 获取时钟周期的值。
    cout << "t7=" << t7.count() << endl;
    cout << "t8=" << t8.count() << endl;
    cout << "t9=" << t9.count() << endl;
    cout << "t10=" << t10.count() << endl;
}
```

### 系统时间

system_clock类支持了对系统时钟的访问，提供了三个静态成员函数：

```cpp
// 返回当前时间的时间点。
static std::chrono::time_point<std::chrono::system_clock> now() noexcept;

// 将时间点time_point类型转换为std::time_t 类型。
static std::time_t to_time_t( const time_point& t ) noexcept;

// 将std::time_t类型转换为时间点time_point类型。
static std::chrono::system_clock::time_point from_time_t( std::time_t t ) noexcept;
```

```cpp
#define _CRT_SECURE_NO_WARNINGS  // localtime()需要这个宏。
#include <iostream>
#include <chrono>
#include <iomanip>   // put_time()函数需要包含的头文件。
#include <sstream>
using namespace std;

int main()
{
    // 1）静态成员函数chrono::system_clock::now()用于获取系统时间。（C++时间）
  chrono::time_point<chrono::system_clock> now = chrono::system_clock::now();
   // 自动类型推导 auto now = chrono::system_clock::now();

    // 2）静态成员函数chrono::system_clock::to_time_t()把系统时间转换为time_t。（UTC时间）
    time_t t_now = chrono::system_clock::to_time_t(now);
  //  auto t_now = chrono::system_clock::to_time_t(now);
	// 时间偏移
    // t_now = t_now + 24*60*60;   // 把当前时间加1天。
    // t_now = t_now + -1*60*60;   // 把当前时间减1小时。
    // t_now = t_now + 120;           // 把当前时间加120秒。

    // 3）std::localtime()函数把time_t转换成本地时间。（北京时）
    // localtime()不是线程安全的，VS用localtime_s()代替，Linux用localtime_r()代替。
    tm* tm_now = std::localtime(&t_now);
   //auto tm_now = std::localtime(&t_now);

    // 4）格式化输出tm结构体中的成员。
    std::cout << std::put_time(tm_now, "%Y-%m-%d %H:%M:%S") << std::endl;
    std::cout << std::put_time(tm_now, "%Y-%m-%d") << std::endl;
    std::cout << std::put_time(tm_now, "%H:%M:%S") << std::endl;
    std::cout << std::put_time(tm_now, "%Y%m%d%H%M%S") << std::endl;

    stringstream ss;   // 创建stringstream对象ss，需要包含<sstream>头文件。
    ss << std::put_time(tm_now, "%Y-%m-%d %H:%M:%S");    // 把时间输出到对象ss中。
    string timestr = ss.str();     // 把ss转换成string的对象。
    cout << timestr << endl;
}
```

### 计时器

steady_clock类相当于秒表，操作系统只要启动就会进行时间的累加，常用于耗时的统计（精确到纳秒）。

```cpp
#include <iostream>
#include <chrono>
using namespace std;

int main()
{
    // 静态成员函数chrono::steady_clock::now()获取开始的时间点。
    chrono::steady_clock::time_point start = chrono::steady_clock::now();
    //auto start = chrono::steady_clock::now();

    // 执行一些代码，让它消耗一些时间。
    cout << "计时开始 ...... \n";
    for (int ii = 0; ii < 1000000; ii++) {
        // cout << "我是一只傻傻鸟。\n";
    }
    cout << "计时完成 ...... \n";

    // 静态成员函数chrono::steady_clock::now()获取结束的时间点。
    chrono::steady_clock::time_point end = chrono::steady_clock::now();
    //auto end = chrono::steady_clock::now();

    // 计算消耗的时间，单位是纳秒。
    auto dt = end - start;
    cout << "耗时: " << dt.count() << "纳秒（"<<(double)dt.count()/(1000*1000*1000)<<"秒）";
}
```

