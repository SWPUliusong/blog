---
title: '构建一个Vue的Img组件'
date: 2017-12-19 17:01:25
tags: vue
---

### 需求
- 有一个加载动画过度
- 可以重新加载网络不畅失败的图片
- 当组件销毁时,应该断开加载连接,防止浪费带宽

<!-- more -->

### 解决方案
- 加载过渡
网络上copy了一个加载图标的base64字符串
```javascript
let loadingIcon = `data:image/svg+xml;base64,PHN2ZyB4bW
    xucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9
    IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsP
    SJ3aGl0ZSI+CiAgPHBhdGggb3BhY2l0eT0iLjI1IiBkPSJNMTYgMC
    BBMTYgMTYgMCAwIDAgMTYgMzIgQTE2IDE2IDAgMCAwIDE2IDAgTTE
    2IDQgQTEyIDEyIDAgMCAxIDE2IDI4IEExMiAxMiAwIDAgMSAxNiA0
    Ii8+CiAgPHBhdGggZD0iTTE2IDAgQTE2IDE2IDAgMCAxIDMyIDE2I
    EwyOCAxNiBBMTIgMTIgMCAwIDAgMTYgNHoiPgogICAgPGFuaW1hdG
    VUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXB
    lPSJyb3RhdGUiIGZyb209IjAgMTYgMTYiIHRvPSIzNjAgMTYgMTYi
    IGR1cj0iMC44cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIC8+
    CiAgPC9wYXRoPgo8L3N2Zz4K`;
```
首先将它赋给组件内展示dom的img元素的src属性,显示加载图标;然后创建一个img元素,将它的src属性设置为真实图片的链接;这时,浏览器会开始加载图片,监听img的load事件,触发时再把真实图片src赋给dom上的img元素,由于浏览器都会缓存静态资源(除非后台设置不缓存),所以这次加载不经网络请求,直接从本地缓存获取
```javascript
this.imgSrc = loadingIcon;
let img = document.createElement("img");
img.src = this.src;
img.addEventListener("load", () => {
    this.imgSrc = img.src;
});
```

- 重新加载
有时候,网络不畅而图片又很多时,图片也会加载失败,可以监听img的error事件,当触发时,删除img的src再重新赋值,引起浏览器重新加载
```javascript
let count = 0;
let limit = parseInt(this.reloadCount) || 3;
img.addEventListener("error", () => {
    count++;
    delete img.src;
    if (count === limit) {
        img.src = "./static/deleted.jpg";
    } else {
        img.src = this.src;
    }
});
```

- 断开链接
当组件销毁时,如果连接仍然存在,势必会消耗带宽;这里可以保存加载图片的img对象,在销毁组件时,将他的src重置为预留图标
```javascript
let img = (this.imgElem = document.createElement("img"));

    ......

beforeDestroy() {
  if(!this.isConnection) return
  this.imgElem.src = loadingIcon;
}
```

### 测试
这里用v-if来触发销毁事件
```javascript
new Vue({
  el: '#app',
  template: `<div>
    <button @click="destroy">destroy</button>
    <my-image v-if="show" :src="src" alt="123" />
  </div>`
  data: {
    show: true,
    src: "https://ws1.sinaimg.cn/large/005tsFX0gy1fmfiiy7pmtj30ux0k8h7h.jpg"
  },
  methods: {
    destroy() {
      this.show = false
    }
  }
})
```
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fmoim7i635j30jv0hrdhk.jpg)

在未加载时点击按钮,图片停止了加载,这里加载了部分所以返回了206,有时会直接显示cancel这个链接

测试demo: https://jsfiddle.net/50wL7mdz/84704/

### 最终代码
```html
<template>
  <img :src="imgSrc" :alt="alt">
</template>

<script>
  // 图片未加载完成时显示加载图标指令
  let loadingIcon = `data:image/svg+xml;base64,PHN2ZyB4bW
        xucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9
        IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsP
        SJ3aGl0ZSI+CiAgPHBhdGggb3BhY2l0eT0iLjI1IiBkPSJNMTYgMC
        BBMTYgMTYgMCAwIDAgMTYgMzIgQTE2IDE2IDAgMCAwIDE2IDAgTTE
        2IDQgQTEyIDEyIDAgMCAxIDE2IDI4IEExMiAxMiAwIDAgMSAxNiA0
        Ii8+CiAgPHBhdGggZD0iTTE2IDAgQTE2IDE2IDAgMCAxIDMyIDE2I
        EwyOCAxNiBBMTIgMTIgMCAwIDAgMTYgNHoiPgogICAgPGFuaW1hdG
        VUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXB
        lPSJyb3RhdGUiIGZyb209IjAgMTYgMTYiIHRvPSIzNjAgMTYgMTYi
        IGR1cj0iMC44cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIC8+
        CiAgPC9wYXRoPgo8L3N2Zz4K`;
  export default {
    props: ["src", "alt", "reloadCount"],
    data() {
      return {
        imgSrc: loadingIcon,
        imgElem: null,
        isConnection: true
      };
    },
    mounted() {
      // 不阻塞UI线程
      setTimeout(() => {
        let count = 0;
        // 重新加载次数限制
        let limit = parseInt(this.reloadCount) || 3;
        let img = (this.imgElem = document.createElement("img"));
        // 隐式加载图片
        img.src = this.src;
        // 等img对象将图片加载缓存完成再把src赋给dom元素
        img.addEventListener("load", () => {
          this.imgSrc = img.src;
          this.isConnection = false
        });
        // 图片加载失败则重新加载
        img.addEventListener("error", () => {
          count++;
          delete img.src;
          if (count === limit) {
            img.src = "./static/deleted.jpg";
          } else {
            img.src = this.src;
          }
        });
      });
    },
    beforeDestroy() {
      if(!this.isConnection) return
      // 组件删除销毁时,重置隐藏Img的src属性可以断开加载链接
      this.imgElem.src = loadingIcon;
    }
  };
</script>
```