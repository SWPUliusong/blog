---
title: 记一次nodejs外网无法访问的故障
date: 2019-04-10 18:52:39
tags: nodejs
---


本人在最近的一次开发过程中，突然出现一个问题：请求外网地址是总是超时。例如像这样：
```javascript
const axios = require("axios")

const request = axios.create({});

(async function test() {
    try {
        let res = await request("https://www.google.com/")
        console.log(res.data)
    } catch (error) {
        console.error(error)
    }
})()
```
<!-- more -->
![](http://ww1.sinaimg.cn/large/005tsFX0ly1g206eupuoej30d5024t8o.jpg)

这是怎么回事呢？第一反应是我的梯子是失效了，但是youtube、facebook都可以正常打开。

这是为什么呢？为什么通过nodejs发出的请求没有被代理？让我不禁怀疑难道还要在http和https里单独配置代理才行吗？

所以我决定从ssr的工作原理中寻找答案，果然在网络某文章上了解了大概
> ss/ssr的原理都是socks5代理。它只是简单的传递数据包，把你的网络请求通过一条连接你和代理服务器之间的通道，由服务器转发到目的地

也就是说ss/ssr只是代理socks5，而其他的实现方式则不管

### 解决方法
既然我们已经知道问题出在那里，所以我们只需要使用socks5的client即可。

我这里是在[https://www.npmjs.com/](https://www.npmjs.com/)随便搜索的socks5有关的包，之所以选择他们，是因为可以直接和axios结合。
```javascript
const axios = require("axios")
const httpAgent = require("socks5-http-client").Agent
const httpsAgent = require("socks5-https-client/lib/Agent")

const request = axios.create({
    timeout: 5000,
    httpAgent: new httpAgent({ keepAlive: true }),
    httpsAgent: new httpsAgent({ keepAlive: true }),
});

(async function test() {
    try {
        let res = await request("https://www.google.com/")
        console.log(res.data)
    } catch (error) {
        console.error(error)
    }
})()
```
![](http://ww1.sinaimg.cn/large/005tsFX0ly1g207eirhsjj30uq06ujt6.jpg)
可以看到，成功打印出了html文件内容，大功告成！！！