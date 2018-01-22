---
title: 如何通过饿了么 Node.js 面试(一) --- JavaScript 基础问题
date: 2018-01-08 20:02:20
tags: [javascript, nodejs]
---

### 前言
饿了么很久之前曾在github上发表过一篇**[如何通过饿了么 Node.js 面试](https://github.com/ElemeFE/node-interview/)**,文中对一个合格noder需要掌握的知识点进行了一个大致的梳理,这里我就按照他的顺序做一个简单的整理,也算是对是自身知识的一个回顾和加强

## 类型判断
#### `==`(相等)和`===`(严格相等)的区别:
1. 类型相同时,简单类型直接比较值,复杂类型比较是否同一引用.
2. 两者类型不同,且为数字,布尔,字符串时,`===`直接返回false,而`==`会先将它们都转化成数字,再做严格比较.
3. 两者类型不同,且为复杂类型比较简单类型时,`===`直接返回false,而`==`会先将复杂类型转化成原始值,再做严格比较.
4. `null`和`undefined`互相`==`,且不和其他值相等,但只`===`自身
5. `NaN`不等于所有值(包括自己)

<!-- more -->

`==`比较图
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fn9i33ty02j30ip0hljro.jpg)
`===`比较图
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fn9i33yetrj30iq0hj0t0.jpg)
`if`判断图
js在做if判断的时候基本只有6个假值: 布尔值`false`,数字`0`,空字符串`""`,`null`,`undefined`,`NaN`
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fn9i342spsj30ad0ez74r.jpg)
> 来自于 [JavaScript-Equality-Table](https://dorey.github.io/JavaScript-Equality-Table/)

#### `typeof`操作符
> 来自 [mdn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof) 的描述
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fna6vwbw9wj30q40bp0te.jpg)
在 JavaScript 最初的实现中，JavaScript 中的值是由一个表示类型的标签和实际数据值表示的。对象的类型标签是 0。由于 null 代表的是空指针（大多数平台下值为 0x00），因此，null的类型标签也成为了 0，typeof null就错误的返回了"object"

可以看到typeof的判断类型时,对于null和其他一些复杂对象都返回了`object`

#### `instanceof`操作符
> `instanceof` 运算符用来检测 constructor.prototype 是否存在于参数 object 的原型链

下面一段代码可以大致表示`instanceof`的工作流程
```javascript
// o instanceof obj
function isInstance(o, obj) {
    // 获取o的原型链
    let proto = o.__proto__
    // 直到尽头null
    while(proto) {
        if(proto === obj.prototype) {
            return true
        }
        // 沿原型链继续向上
        proto = proto.__proto__ 
    }
    return false
}

isInstance(o, obj)
```
`instanceof`在检测时会沿左值的原型链一路向上依次与右值的`prototype`比较,只要在原型链上就会返回`true`,如果再做精确判断时可能会出现偏差

在类型判断上,`typeof`和`instanceof`都存在一定的缺陷,网上流传一段非常简洁的代码可以返回参数的精确类型,缺点嘛...暂未发现.
```javascript
function getType(target) {
    return Object.prototype.toString.call(target).slice(8, -1)
}
```

## 作用域
- 作用域就是保存变量的一个域
- 所有作用域构成了一个树形结构,全局作用域就是这个树的根节点.
- 代码执行时就在当前作用域查找是否保存了该变量,如果没有则沿着上级作用域一次向上查找,到根节点为止,查不到就报错
```javascript
var a = 1;
function fa() {
    // var a = 2;
    (function fb() {
        // var a = 3;
        (function fc(){
            // var a = 4;
            console.log(a);
        })()
    })()
}
fa()
// 打印1
```
对于这段代码来说,作用域大致如图:
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fnkvc0lrakj30dt09r3yj.jpg)
js引擎在fc里查不到变量a,则沿着作用域链向上,最终在全局作用域找到a.

- 对于ES5来说,只存在全局作用域和函数作用域.
- 而在ES6中则多了一个块级作用域

ES6中的`let`,`const`等都具有块级作用域,而对于`function`来说,ES6规定:
> - 允许在块级作用域内声明函数。
> - 函数声明类似于var，即会提升到全局作用域或函数作用域的头部。
> - 同时，函数声明还会提升到所在的块级作用域的头部。
也就是说,在符合ES6规范的JS引擎里,`function`和`var`一样会出现声明提前,但是赋值会延后到代码位置
```javascript
// 浏览器的 ES6 环境
function f() { console.log('I am outside!'); }
(function () {
  if (false) {
    // 重复声明一次函数f
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```
> **等价于**
```javascript
// 浏览器的 ES6 环境
function f() { console.log('I am outside!'); }
(function () {
  var f = undefined;
  if (false) {
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// Uncaught TypeError: f is not a function
```

> 来自于[阮一峰老师的博客](http://es6.ruanyifeng.com/)

## 引用传递
- 对于简单类型来说,是值传递
- 对于复杂类型来说,是引用传递

> 其实在函数调用时,传入的都是一份拷贝,而到底是值还是引用,取决于原值是值还是引用

#### json对象拷贝函数
```javascript
// 第一种
function copyJSON(json) {
    return JSON.parse(JSON.stringify(json))
}

// 第二种
function cloneJSON(json) {
    let result = null
    if (json instanceof Array) {
        result = json.map(i => cloneJSON(i))
    } else if (json instanceof Object) {
        result = {}
        let keys = Object.keys(json)
        keys.forEach(key => {
            result[key] = cloneJSON(json[key])
        })
    } else {
        result = json
    }
    return result
}
```

## 内存释放
存储方式
1. 栈: 包含局部变量和指向堆上对象的引用
2. 堆: 存放对象

我们知道JS引擎和jvm一样是自动垃圾回收,V8将对象按存活时间进行分代,按照不同分代施以更高效的垃圾回收算法.

主要将内存分为新生代和老生代
> 新生代在64位和32位上分别为32MB和16MB
> 老生代分别为1400MB和700MB

#### 新生代回收算法
> 新生代内存中主要使用Scavenge算法,一种采用复制的方式实现的垃圾回收算法.它将内存一分为二,每一部分空间称为semispace.在这两个semispace空间中,只有一个处于使用中,另一个处于闲置状态.处于使用中的semispace空间称为From空间,处于闲置的则称为To空间.当我们分配对象时,先是在From空间分配.当开始进行垃圾回收时,会检查From空间中的存活对象,这些存活对象将被复制到To空间,而未存活的对象占用的空间将被释放.完成复制后,From空间和To空间角色互换.

新生代内存中的对象满足一些条件后会被晋升到老生代中:
1. 对象经历过scavenge回收
2. To空间的内存占比超过限制

#### 老生代回收算法
V8中主要采用了Mark-Sweep(标记清除法)和Mark-Compact(标记整理法)相结合的方式对老生代进行垃圾回收.
##### 标记清除法
在开始垃圾回收时,遍历堆中所有对象,并标记存活的对象,然后清除没有被标记的对象
- 优点: 不用浪费一半空间;而且老生代中死亡的对象占少数,所以也能高效处理
- 缺点: 清理完成后,内存空间会出现过不连续的状态.若下次分配一个所有碎片都无法满足的大对象时,则会触发不必要的垃圾回收

##### 标记整理法
Mark-Compact主要是为了解决Mark-Sweep的内存碎片问题.Mark-Compact的区别在于标记之后,将所有存活对象移向一端,完成后,清除边界外的内存
**它可以清理出更大的连续空间,但也带来了更多的时间消耗,所以只是对Mark-Sweep的一次补全,对于老生代内存,V8主要还是使用Mark-Sweep算法**

##### 三种算法比较
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fnpecdv2gkj30ny04sgm0.jpg)

##### Buffer的内存
在nodejs的开发过程中,会处理网络流和文件I/O,这种大的内存占用如果由V8来管理分配,则1400MB的限制是很头疼的,所以buffer是由node的c++的内建模块管理,属于堆外内存.在开发的过程中,不需要考虑V8的限制.

> 朴灵 [<<深入浅出nodejs>>](https://item.jd.com/11355978.html)
> [【译】Node.js 垃圾回收](https://eggggger.xyz/2016/10/22/node-gc/)