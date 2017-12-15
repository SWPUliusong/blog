---
title: '利用hexo构建github page'
date: 2017-12-13 20:45:51
tags: 
    - hexo
    - github page
toc: true
---

## 前提
1. git
2. node.js

## 一、全局安装hexo
```
> npm i -g hexo
```
## 二、初始化文件
```
> mkdir blog  // 文件夹名随意
> cd ./blog
> hexo init
```
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fmfiiy7pmtj30ux0k8h7h.jpg)

此时执行 `hexo s` 就能看到默认主题样式

![](https://ws1.sinaimg.cn/large/005tsFX0gy1fmfio4i0nyj311q0j647p.jpg)

## 三、修改配置和主题
编辑器打开文件夹，修改根目录下的`_config.yml`文件
```
# 网站主标题
title: Hexo
# 网站描述(可用于SEO)
description: html,css,js,javascript
# 作者
author: SWPUliusong
```
默认主题采用了`landscape`,这里修改成`yilia`
github搜索yilia，star最多的那个，复制git地址,终端执行命令
```
> git clone https://github.com/litten/hexo-theme-yilia.git themes/yilia
```
![](https://ws1.sinaimg.cn/large/005tsFX0gy1fmfjn1stn1j311y0kgn0o.jpg)

修改根目录`_config.yml`文件`theme`字段为`yilia`，重新执行`hexo s`，打开浏览器就能看到主题样式

![](https://ws1.sinaimg.cn/large/005tsFX0gy1fmfjsf72cgj311v0jeabh.jpg)

> **此时打开`theme/yilia`主题文件夹下的`_config.yml`，按照主题作者的注释配置博客**

## 四、发布
修改根目录下`_config.yml`文件的`deploy`字段
```
deploy:
  type: git
  repo: https://github.com/你的名字/你的名字.github.io.git   //git仓库地址
  branch: master
```
然后执行
```
// 生成静态文件
> hexo g
// 发布到配置的仓库
> hexo d
```
> 注意：发布前必须先在github创建这个仓库

> 发布文章、页面等规则参考[hexo文档](https://hexo.io/zh-cn/docs/)

然后就可以打开https://你的名字.github.io/了