---
title: "[译] 我们遇到了关于promise的问题"
date: 2018-01-22 16:02:20
tags: javascript
---

> 原文地址: [we-have-a-problem-with-promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)

各位JavaScripters,是时候承认:我们遇到了关于promise的问题.

不,并非是promise本身.由A +规范定义的承诺是非常棒的.

在过去的一年里,我看到很多程序员都在为PouchDB API和其他promise API而苦苦挣扎的问题,这个问题是：

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

答案是在这篇文章的最后,但首先,我想探讨为什么promise如此棘手,为什么我们这些许多新手和专家都被他们绊倒了.我也将提供我认为是独特的见解,一个奇怪的把戏,这使得promise简单易理解.是的,我真的相信他们并不那么困难！

但首先,让我们挑战关于promise的一些常见假设.

# 为什么要promise
如果你阅读有关promise的文献,你会经常发现引用厄运的金字塔,一些可怕的回调代码稳步地向屏幕右侧延伸.

promise确实解决了这个问题,但不仅仅是缩进.正如优秀的演讲["Redemption from Callback Hell"](http://youtu.be/hf1T_AONQJU)中解释的那样,真正的回调问题是它们剥夺了我们如`return`和`throw`这样的关键字.相反,我们的程序的整个流程是基于副作用：一个函数偶然地调用另一个函数.

事实上,回调干了更糟糕的事：他们剥夺了我们在编程语言中通常认为是理所当然的堆栈.没有堆栈的情况下编写代码就像在没有刹车踏板的情况下驾驶一辆汽车一样：除非在你要用到它时,否则你不会意识到你有多么需要它

promise的全部意义就是当我们处理异步时让我们回到丢失的语言层面: `return`,`throw`还有堆栈.打不死你必须知道怎样正确的使用promise以利用他们.

# 新手的错误
有些人尝试以漫画的形式解释promise,或者以名词化的方式: "哦,这是一个你可以作为异步值传递的东西"

我不认为这样的解释有帮助.对我而言,promise都是关于代码结构和流程的.所以,我认为最好是重温一些常见的错误，并向他们展示如何解决这些错误。我把这些称为新手错误,意味着, "你现在是一个新手,但你不久会成为专家"

# 新手问题1: promise的厄运金字塔
看看人们如何使用PouchDB基于promise的API，我看到很多不好的promise模式。最常见的不良做法是：
```javascript
remotedb.allDocs({
  include_docs: true,
  attachments: true
}).then(function (result) {
  var docs = result.rows;
  docs.forEach(function(element) {
    localdb.put(element.doc).then(function(response) {
      alert("Pulled doc with id " + element.doc._id + " and added to local db.");
    }).catch(function (err) {
      if (err.name == 'conflict') {
        localdb.get(element.doc._id).then(function (resp) {
          localdb.remove(resp._id, resp._rev).then(function (resp) {
// et cetera...
```
是的,你可以像回调一样使用promise,这没错,它就像你用一台强力的砂光机挫你的指甲一样,但你确实这么做

如果你认为这种错误只限于绝对的初学者，你会惊讶地发现我实际上是从黑莓官方开发者博客上面得到的代码。旧的回调习惯很难改掉.（对于开发者：选择你很抱歉,但你的例子是有启发性的。）

更好的风格是这样的：
```javascript
remotedb.allDocs(...).then(function (resultOfAllDocs) {
  return localdb.put(...);
}).then(function (resultOfPut) {
  return localdb.get(...);
}).then(function (resultOfGet) {
  return localdb.put(...);
}).catch(function (err) {
  console.log(err);
});
```
这就是所谓的promise结构.每个函数只有在前一个promise已经resolve时才会被调用，并且会携带该promise的输出被调用。

# 新手问题2: 我该如何在promise中使用`forEach()`?
这是大多数人对promise的理解开始瓦解的地方.只要遇到他们熟悉的`forEach()`循环(或`for`循环或`while`循环),他们不知道如何使它与承诺工作.所以他们会像下面这样写:
```javascript
// I want to remove() all docs
db.allDocs({include_docs: true}).then(function (result) {
  result.rows.forEach(function (row) {
    db.remove(row.doc);  
  });
}).then(function () {
  // I naively believe all docs have been removed() now!
});
```
这个代码有什么问题?问题是第一个函数实际上是返回的`undefined`,这意味着第二个函数不会等待`db.remove()`被调用的所有文档。事实上，它不等待任何事情，并可以在删除了任何数量的文档时被执行！

这是一个特别隐秘的错误，因为你可能没有注意到任何错误，假设PouchDB快速移除这些文档以使UI更新。这个bug只会在奇怪的竞赛情况下或在某些浏览器中弹出，在这种情况下几乎不可能进行调试。

所有这一切的原因是`forEach()`/ `for`/ `while`不是你正在寻找的结构。你想要`Promise.all()`：
```javascript
db.allDocs({include_docs: true}).then(function (result) {
  return Promise.all(result.rows.map(function (row) {
    return db.remove(row.doc);
  }));
}).then(function (arrayOfResults) {
  // All docs have really been removed() now!
});
```
这里发生了什么？基本上`Promise.all()`需要一个promise数组作为输入，然后它返回给你另一个promise，只有当promise数组中的每一个都已经resolve时才能resolve。它是for循环的异步等价物。

`Promise.all()`还将结果数组传递给下一个函数，这可能会非常有用，例如，如果您尝试`get()`从PouchDB 执行多个任务。如果子promise中的任何一个被reject,在`all()`promise也会reject,这是更加有用。

# 新手错误3: 忘记添加`.catch()`
这是另一个常见的错误。他们充满自信自己的promise永远不会抛出一个错误，许多开发人员忘记在他们的代码中任何地方添加`.catch()`。不幸的是，这意味着任何抛出的错误都会被吞噬，而且甚至在控制台中都看不到。这可能是一个真正的调试痛苦。

为了避免这种令人讨厌的情况，我已经习惯于简单地将以下代码添加到我的promise链中：
```javascript
somePromise().then(function () {
  return anotherPromise();
}).then(function () {
  return yetAnotherPromise();
}).catch(console.log.bind(console)); // <-- this is badass
```