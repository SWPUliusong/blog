---
title: 如何通过饿了么 Node.js 面试(一) --- JavaScript 基础问题
date: 2018-01-08 20:02:20
tags: javascript
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
> 原图来自 [JavaScript-Equality-Table](https://dorey.github.io/JavaScript-Equality-Table/)

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
