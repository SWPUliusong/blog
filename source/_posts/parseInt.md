---
title: 手写parseInt
date: 2019-01-14 16:45:30
tags: javascript
---

### parseInt功能描述
> 下图来自[MDN parseInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt)
>![](https://ws1.sinaimg.cn/large/005tsFX0ly1fz67ts9un6j30hq0f0dii.jpg)

<!-- more -->

### 说明
根据MDN的描述和具体使用可得，实现parseInt的功能点主要注意以下几点：

1. 第一个参数会被转化成字符串，而且前后空格也会去除
2. radix的合法范围为2-36，而且v8会强制转换radix为number，如果转换结果是NaN，还会重新将radix赋值为10
3. 特别注意26个字母，在 radix>10 时，他们也是合法数字

### 实现
```javascript
function int(str, radix = 10) {
  // radix为2-36的数字,若radix转换后为NaN，则重置为10
  if(isNaN(radix)) radix = 10
  if (radix < 2 || radix > 36) return NaN
  // 将str参数转换为string类型
  if (typeof str !== "string") {
    str = str.toString()
  }
  // 去除前后空格
  str = str.trim()
  // 匹配字符串前面的合法数字(包括26个字母)
  let reg = /^[+|-]?[\d|a-z|A-Z]+/
  if (reg.test(str)) {
    let stack = []
    // 逐位分析合法性
    let numStr = str.match(reg)[0]
    for (let i = 0; i < numStr.length; i++) {
      let item = numStr[i]
      // 若该位为字母，则转换为对应数字10-35
      if (/^[a-z|A-Z]$/.test(item)) {
        item = item.toUpperCase().charCodeAt() - 65 + 10
      }
      // 若该位的值大于进制值，则说明此后的字符串不合法
      if (item >= radix) break;
      // 合法值依次从头加入栈中，这样索引位置就代表进制次方
      stack.unshift(item)
    }
    // 遍历完若stack为空，说明没有合法数字
    if (stack.length === 0) return NaN
    // 计算结果
    let result = 0
    stack.forEach((bit, i) => {
      result += bit * radix ** i
    })

    return result
  }

  return NaN
}
```

### 测试
```javascript
function test(val, expect, desc) {
  desc = `验证不通过! 你的值为${val}, 期望值为${expect}`
  if (val === expect || (isNaN(val) && isNaN(expect))) {
    return console.log(true)
  }
  return console.log(desc)
}

test(int(" 111@#$%", 2), parseInt(" 111@#$%", 2))
test(int("111@#$%", 2), parseInt("111@#$%", 2))
test(int("16#%%", 5), parseInt("16#%%", 5))
test(int("616#%%", 5), parseInt("616#%%", 5))
test(int("17[,", 5), parseInt("17[,", 5))
test(int("16*()*", 36), parseInt("16*()*", 36))
test(int("161_+)()", 36), parseInt("161_+)()", 36))
test(int("ff}}", 16), parseInt("ff}}", 16))
test(int("0000", 1), parseInt("0000", 1))
test(int("0000", "12"), parseInt("0000", "12"))
test(int("0000", "123"), parseInt("0000", "123"))
test(int("0000", "abc"), parseInt("0000", "abc"))

结果:
$ node test
true
true
true
true
true
true
true
true
true
true
true
true
```