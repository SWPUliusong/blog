---
title: '构建一个可重连,可断开的Img组件'
date: 2017-12-19 17:01:25
tags: vue
---

### 需求
- 有一个加载动画过度
- 可以重新加载网络不畅失败的图片
- 当组件销毁时,应该断开加载连接,防止浪费带宽

<!-- more -->

### 解决方案
1. 加载过渡
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
首先将它赋给组件内展示的img元素的src属性,显示加载图标;然后创建一个img元素

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
        imgElem: null
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
      // 组件删除销毁时,重置隐藏Img的src属性可以断开加载链接
      this.imgElem.src = loadingIcon;
    }
  };
</script>
```