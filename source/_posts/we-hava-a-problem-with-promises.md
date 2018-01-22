---
title: "[译] 我们遇到了关于promise的问题"
date: 2018-01-22 16:02:20
tags: javascript
---

> 原文地址: [we-have-a-problem-with-promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)

各位JavaScripters,是时候承认:我们遇到了关于promise的问题.

在过去的一年里，我看到很多程序员都在为PouchDB API和其他promise API而苦苦挣扎的问题，这个问题是：

我们很多人都使用promise,*却没有真正理解它*

如果你觉得难以置信,请考虑我最近发布到[Twitter](https://twitter.com/nolanlawson/status/578948854411878400)上的难题

**问题: 下面这四个promise有什么不同?**
```javascript
doSomething().then(function () {
  return doSomethingElse();
});

doSomething().then(function () {
  doSomethingElse();
});

doSomething().then(doSomethingElse());

doSomething().then(doSomethingElse);
```
如果你知道答案,那么祝贺你,你已经是一个promise忍者了,不用再继续阅读这篇文章了.