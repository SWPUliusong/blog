---
title: "[译] 我们遇到了关于promise的问题"
date: 2018-01-22 16:02:20
tags: javascript
---

> 原文地址: [we-have-a-problem-with-promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)

各位JavaScripters,是时候承认:我们遇到了关于promise的问题.

不,并非是promise本身.由A +规范定义的promise是非常棒的.

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
这就是所谓的*"composing promises"*.每个函数只有在前一个promise已经resolve时才会被调用，并且会携带该promise的输出被调用。

# 新手问题2: 我该如何在promise中使用`forEach()`?
这是大多数人对promise的理解开始瓦解的地方.只要遇到他们熟悉的`forEach()`循环(或`for`循环或`while`循环),他们不知道如何使它与promise工作.所以他们会像下面这样写:
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
即使你不会期待错误,但应该总是谨慎的添加一个`catch()`.如果你的假设结果是错误的,它会让你的生活更轻松.

# 新手错误4: 使用"deferred"
这是我看到的最多的错误,我甚至不愿意在这里重复它,因为担心像Beetlejuice一样，只调用它的名字就会召唤更多的实例。

简单来说,promise历史悠久,JavaScript社区用了很长时间使它规范化.在早期,jQuery和Angular使用了"deferred"模式.但是现在已经被ES6 promise规范取代,并由像Q,When,RSVP,Lie等库实现.

首先，大多数promise库都为您提供了从第三方库"import" Promise的方法。例如，Angular的$q模块允许你使用$q.when()来包装非promise。所以Angular用户可以这样包装PouchDB的promise：
```javascript
$q.when(db.put(doc)).then(/* ... */); // <-- this is all the code you need
```
另一个策略是构造模式,他对非promise是有用的.例如，要包装一个基于回调的API，比如Node `fs.readFile()`，你可以简单地做：
```javascript
new Promise(function (resolve, reject) {
  fs.readFile('myfile.txt', function (err, file) {
    if (err) {
      return reject(err);
    }
    resolve(file);
  });
}).then(/* ... */)
```
完成！我们已经击败了可怕的def ...啊哈，抓住了我自己。:)
> 有关为什么这是反模式的更多信息，请查看[Bluebird wiki页面上的诺言反模式](https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns#the-deferred-anti-pattern)。

# 新手错误5: 使用副作用而不是返回
这段代码有什么问题?
```javascript
somePromise().then(function () {
  someOtherPromise();
}).then(function () {
  // Gee, I hope someOtherPromise() has resolved!
  // Spoiler alert: it hasn't.
});
```
好吧，这是一个好的点去谈论你所需要知道的关于promise的一切.

严格说，这是一个奇怪的招数.一旦你明白了，将防止我一直在谈论的所有错误。你准备好了吗？

正如我之前所说,promise的魅力在于他将珍贵的`return`和`throw`还给了我们.但是在实践中实际是什么样呢?

每个promise都会给你一个`then()`方法(还有`catch()`,它只是`then(null, ...)`的语法糖),这里我们在一个`then()`函数内部:
```javascript
somePromise().then(function () {
  // I'm inside a then() function!
});
```
这里我们应该怎么做?有三种方案:
1. `return`另一个promise
2. `return`一个同步值(或者undefined)
3. `throw`一个同步错误
就是这样。一旦你明白了这个诀窍，你就明白了promise。所以让我们依次通过每一个点

## 1.return另一个promise
这是你在promise书籍中常见的一种模式,就像上面的*"composing promises"*一样:
```javascript
getUserByName('nolan').then(function (user) {
  return getUserAccountById(user.id);
}).then(function (userAccount) {
  // I got a user account!
});
```
注意到我是`return`第二个promise - 这`return`是至关重要的。如果我没有`return`，那么`getUserAccountById()`实际上会产生一个副作用，下一个函数将接收`undefined`而不是`userAccount`。

## 2.return一个同步值(或者undefined)
返回`undefined`通常是一个错误，但是返回一个同步值实际上是一个将同步代码转换为promise代码的好方法。例如，假设我们有一个用户的内存缓存。我们可以这样做：
```javascript
getUserByName('nolan').then(function (user) {
  if (inMemoryCache[user.id]) {
    return inMemoryCache[user.id];    // returning a synchronous value!
  }
  return getUserAccountById(user.id); // returning a promise!
}).then(function (userAccount) {
  // I got a user account!
});
```
这不是很棒吗？第二个函数不关心userAccount是同步还是异步取出，第一个函数可以自由返回同步或异步值。

不幸的的是,在JavaScript中,无返回值的函数总是返回`undefiend`,这意味着当你打算return某些值时，意外地引入副作用是很容易的。

出于这个原因，我总是在`then()`函数内部`return`或者`throw`，这是个人习惯。我建议你也这样做。

## 3.throw一个同步错误
说起来`throw`，这是promise可以变得更加棒的地方。假设我们想`throw`在用户注销的情况下发生的同步错误。这很容易：
```javascript
getUserByName('nolan').then(function (user) {
  if (user.isLoggedOut()) {
    throw new Error('user logged out!'); // throwing a synchronous error!
  }
  if (inMemoryCache[user.id]) {
    return inMemoryCache[user.id];       // returning a synchronous value!
  }
  return getUserAccountById(user.id);    // returning a promise!
}).then(function (userAccount) {
  // I got a user account!
}).catch(function (err) {
  // Boo, I got an error!
});
```
如果用户退出，我们`catch()`将得到一个同步错误;而且如果任意一个promise被reject,它也将收到的异步错误。同样的，函数不关心它得到的错误是同步的还是异步的。

这是特别有用的，因为它可以帮助识别开发过程中的编码错误。例如，如果在`then()`函数内部的任何一点，我们做一个`JSON.parse()`，如果JSON是无效的，它可能会引发同步错误。通过回调，这个错误将被吞噬，但是有了promise，我们可以简单地在我们的`catch()`函数内处理它。

# 高级错误
好吧，现在你已经学会了让promise变得简单的一招，让我们来谈谈边缘案例。当然，总会有边缘情况。

我将这些错误归类为“高级”，因为我只看到已经相当熟悉promise的程序员做过。但是，如果我们想要解决我在这篇文章开头提出的难题，我们需要讨论它们。

高级错误1: 不知道`Promise.resolve()`
正如我上面所展示的，promise对于将同步代码封装为异步代码非常有用。但是，如果你发现自己打字很多：
```javascript
new Promise(function (resolve, reject) {
  resolve(someSynchronousValue);
}).then(/* ... */);
```
你可以使用`Promise.resolve()`更简洁的表达它
```javascript
Promise.resolve(someSynchronousValue).then(/* ... */);
```
这对捕捉任何同步错误也非常有用。这是非常有用的，我已经养成了习惯,几乎所有返回promise API的方法, 都像这样：
```javascript
function somePromiseAPI() {
  return Promise.resolve().then(function () {
    doSomethingThatMayThrow();
    return 'foo';
  }).then(/* ... */);
}
```
只要记住: 任何可以同步`throw`的代码都是一个很好的选择,他不可能在调试时吞噬错误.但是如果你用`Promise.resolve()`包裹所有的,那么你总是可以确定稍后在`catch()`内捕获它

同样的`Promise.reject()`，你可以用它来返回一个立即被reject的promise：
```javascript
Promise.reject(new Error('some awful error'));
```

# 高级错误2：`then(resolveHandler).catch(rejectHandler)`和`then(resolveHandler, rejectHandler)`不完全一样
我上面说`catch()`的只是糖。所以这两个片段是相同的：
```javascript
somePromise().catch(function (err) {
  // handle error
});

somePromise().then(null, function (err) {
  // handle error
});
```
但是，这并不意味着以下两个片段是等价的：
```javascript
somePromise().then(function () {
  return someOtherPromise();
}).catch(function (err) {
  // handle error
});

somePromise().then(function () {
  return someOtherPromise();
}, function (err) {
  // handle error
});
```
如果您想知道为什么它们不等价，请考虑如果第一个函数引发错误会发生什么情况：
```javascript
somePromise().then(function () {
  throw new Error('oh noes');
}).catch(function (err) {
  // I caught your error! :)
});

somePromise().then(function () {
  throw new Error('oh noes');
}, function (err) {
  // I didn't catch your error! :(
});
```
事实证明，当你使用`then(resolveHandler, rejectHandler)`格式时，如果它本身的`resolveHandler`抛出错误，它的`rejectHandler`实际上不会捕获到。

出于这个原因，我已经把"永远不要使用`then()`的第二个参数"作为个人的习惯，而总是喜欢`catch()`。例外情况是,当我编写异步Mocha测试时，我可能会写一个测试来确保抛出错误：
```javascript
it('should throw an error', function () {
  return doSomethingThatThrows().then(function () {
    throw new Error('I expected an error!');
  }, function (err) {
    should.exist(err);
  });
});
```

# 高级错误3: promises和promise工厂
假设你想要一个接一个地执行一系列的promise。也就是说，你想要类似Promise.all()的东西，但是不能并行执行promise。

你可能天真地写这样的东西：
```javascript
function executeSequentially(promises) {
  var result = Promise.resolve();
  promises.forEach(function (promise) {
    result = result.then(promise);
  });
  return result;
}
```
不幸的是，这不会按照你想要的方式工作。你传递给`executeSequentially()`的promise将仍然并行执行。

发生这种情况的原因是你根本不想操作一系列的promise。根据promise规范，只要promise被创建，它就开始执行。所以你真正想要的是一系列的promise工厂：
```javascript
function executeSequentially(promiseFactories) {
  var result = Promise.resolve();
  promiseFactories.forEach(function (promiseFactory) {
    result = result.then(promiseFactory);
  });
  return result;
}
```
我知道你在想什么：“这个Java程序员到底是谁，他为什么要谈论工厂？” promise工厂是非常简单的，它只是一个返回promise的函数：
```javascript
function myPromiseFactory() {
  return somethingThatCreatesAPromise();
}
```
为什么这个工作？这是有效的，因为promise工厂在被调用前不会创造promise。它和一个then函数一样工作 - 事实上，它是一样的！

如果你看看`executeSequentially()`上面的功能，然后想象`myPromiseFactory`代替`result.then(...)`里面的，那么希望点亮你的大脑。那一刻，你将会得到启发。

# 高级错误4: 如果我想要两个promise的结果呢？
很多时候，一个promise将取决于另一个promise，但是我们需要所有promise的输出。例如：
```javascript
getUserByName('nolan').then(function (user) {
  return getUserAccountById(user.id);
}).then(function (userAccount) {
  // dangit, I need the "user" object too!
});
```
为了成为优秀的JavaScript开发人员，避免厄运的金字塔，我们可能只是将user对象存储在上一级作用域的变量中：
```javascript
var user;
getUserByName('nolan').then(function (result) {
  user = result;
  return getUserAccountById(user.id);
}).then(function (userAccount) {
  // okay, I have both the "user" and the "userAccount"
});
```
他是可行的,但我个人不太赞成.我推荐的方式是: 放开偏见,接纳金字塔:
```javascript
getUserByName('nolan').then(function (user) {
  return getUserAccountById(user.id).then(function (userAccount) {
    // okay, I have both the "user" and the "userAccount"
  });
});
```
...至少，暂时这样.如果缩进成为一个问题，那么你可以做JavaScript开发人员自古以来一直在做的事情，将该函数提取到一个命名函数中：
```javascript
function onGetUserAndUserAccount(user, userAccount) {
  return doSomething(user, userAccount);
}

function onGetUser(user) {
  return getUserAccountById(user.id).then(function (userAccount) {
    return onGetUserAndUserAccount(user, userAccount);
  });
}

getUserByName('nolan')
  .then(onGetUser)
  .then(function () {
  // at this point, doSomething() is done, and we are back to indentation 0
});
```
随着您的promise代码开始变得越来越复杂，您可能会发现自己将越来越多的功能提取到命名函数中。我发现这形成了非常美观的代码，可能看起来像这样：
```javascript
putYourRightFootIn()
  .then(putYourRightFootOut)
  .then(putYourRightFootIn)  
  .then(shakeItAllAbout);
```
这就是promise。

# 高级错误5: promise向下传递
最后，这是我在上面介绍promise难题时所提到的错误。这是一个非常深奥的用例，它可能永远不会出现在你的代码中，但它确实让我感到惊讶。

你认为这个代码打印出来了什么？
```javascript
Promise.resolve('foo').then(Promise.resolve('bar')).then(function (result) {
  console.log(result);
});
```
如果你认为它打印出来`bar`，那就错了。它实际上打印出来`foo`！

原因就是当我们传递给`then()`一个非函数(例如一个promise)时,它事实上理解为`then(null)`,这就导致了前一个promise的结果向下传递,你可以自己测试下:
```javascript
Promise.resolve('foo').then(null).then(function (result) {
  console.log(result);
});
```
添加任意数量的`then(null)`,它仍然打印`foo`.

这实际上回到了前面关于promise和promise工厂的观点。总之，你可以直接传递一个promise给`then()`方法，但是它不会像你想的那样工作。`then()`应该是一个函数，所以很可能你的意思是：
```javascript
Promise.resolve('foo').then(function () {
  return Promise.resolve('bar');
}).then(function (result) {
  console.log(result);
});
```
这将打印bar，如我们所料。

所以只要提醒自己：总是把一个函数传递给then()！

# 解决难题
现在我们已经学习了promise所有相关的,应该可以解决我在文章开头提出的问题了.

这里是每个问题的答案,以图形格式,以便你更好地理解它

## 难题1
```javascript
doSomething().then(function () {
  return doSomethingElse();
}).then(finalHandler);
```
答案:
```
doSomething
|-----------------|
                  doSomethingElse(undefined)
                  |------------------|
                                     finalHandler(resultOfDoSomethingElse)
                                     |------------------|
```

## 难题2
```javascript
doSomething().then(function () {
  doSomethingElse();
}).then(finalHandler);
```
答案:
```
doSomething
|-----------------|
                  doSomethingElse(undefined)
                  |------------------|
                  finalHandler(undefined)
                  |------------------|
```

# 难题3
```javascript
doSomething().then(doSomethingElse())
  .then(finalHandler);
```
答案:
```
doSomething
|-----------------|
doSomethingElse(undefined)
|---------------------------------|
                  finalHandler(resultOfDoSomething)
                  |------------------|
```

# 难题4
```javascript
doSomething().then(doSomethingElse)
  .then(finalHandler);
```
答案:
```
doSomething
|-----------------|
                  doSomethingElse(resultOfDoSomething)
                  |------------------|
                                     finalHandler(resultOfDoSomethingElse)
                                     |------------------|
```
如果这些答案仍然不够明了，那么我鼓励你重新阅读这篇文章，或者定义doSomething()和doSomethingElse()方法，并在浏览器中自己尝试。

> **说明**: 对于这些示例，我假设`doSomething()`和`doSomethingElse()`都返回promise，而这些promise代表JavaScript事件循环之外完成的任务(例如IndexedDB、Network、setTimeout)，这就是为什么它们在适当的时候表现出并发。这是一个[JSBin](http://jsbin.com/tuqukakawo/1/edit?js,console,output)的演示.

对于promise的更高级用法，请查看我的[promise protips cheat sheet](https://gist.github.com/nolanlawson/6ce81186421d2fa109a4)

# 关于promise的最后一句话
promise是伟大的。如果您还在使用回调，我强烈建议您切换到promise。你的代码将变得更小，更优雅，更容易理解。

如果你不相信我，这是证明：[PouchDB的map/reduce模块的重构](https://t.co/hRyc6ENYGC)，用promise来代替回调。结果：290次插入，555次删除。

顺便说一句，写那个讨厌的回调代码的人是...我！因此，这是我promise的第一课，我感谢其他PouchDB的贡献者一路指导我。

话虽如此，但promise并不完美。确实，他们比回调更好，但是这很像是说在肚子上打了一拳比在牙齿上踢一脚好。当然，一个比另一个更好，但是如果你有选择的话，你可能会避免他们两个。

虽然优于回调，但promise仍然难以理解且容易出错，正如我感到不得不写这篇博客的事实所证明的那样。新手和专家都会经常把这些东西搞砸，实际上，这不是他们的错。问题是promise，虽然类似于我们在同步代码中使用的模式，但它是一个合适的替代品，不完全相同。

事实上，你不应该学一堆神秘的规则和新的API来做事情，在同步的世界里，你可以用熟悉的模式，比如做得很清楚return，catch，throw，和for循环。不应该有两个平行的系统，你必须时刻保持头脑清醒。