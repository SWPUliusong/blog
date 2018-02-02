---
title: "[译] 我们遇到了关于promise的问题"
date: 2018-01-22 16:02:20
tags: javascript
---

> 原文地址: [we-have-a-problem-with-promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)

各位JavaScripters,是时候承认:我们遇到了关于promise的问题.

不，并非是promise本身。由A +规范定义的承诺是非常棒的。

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

如果你知道答案,那么祝贺你,你已经是一个promise忍者了,可以不用再继续阅读这篇文章了.
<!-- more -->

对于其他99.99％的人，你有一个很好的公司。没有人回应我的推特可以解决这个问题，我自己也对第三个答案感到惊讶。是的，即使我写了测验！

答案是在这篇文章的最后，但首先，我想探讨为什么promise如此棘手，为什么我们这些许多新手和专家都被他们绊倒了。我也将提供我认为是独特的见解，一个奇怪的把戏，这使得promise简单易理解。是的，我真的相信他们并不那么困难！

但首先，让我们挑战关于promise的一些常见假设。
