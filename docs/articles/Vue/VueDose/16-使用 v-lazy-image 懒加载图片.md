---
title: 「译」 VueDose Tip 16 - 使用 v-lazy-image 懒加载图片
date: 2020-01-22
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./15-在 Vue.js 中使用动态引入提高性能
next: ./17-Nuxt.js 中页面和布局之间的简单过渡效果
---

前一段时间，我想在图片中使用懒加载，以便仅在它们进入视图时才加载它们。

研究后，我找到了不同的方法来做，但是它们比我想象的要麻烦一些。

我想要像具有`<img>`标签，可以被懒加载的简单的东西。

因此，我创建了[v-lazy-image](https://github.com/alexjoverm/v-lazy-image)，这是一个 Vue 组件，继承了`<img>`标签的 API 并应用了懒加载。

要使用它，请通过运行`npm install v-lazy-image`来安装，你可以将其全局添加到项目中：

```js
// main.js
import Vue from "vue";
import { VLazyImagePlugin } from "v-lazy-image";

Vue.use(VLazyImagePlugin);
```

然后使用起来就像使用一个`<img>`一样简单：

```vue
<template>
  <v-lazy-image src="http://lorempixel.com/400/200/" />
</template>
```

你甚至可以设置`src-placeholder`属性为小图片（通常是图片的小版本）来使用**渐进式图像加载技术**，甚至可以使用 CSS 来应用自己的过渡效果：

```vue
<template>
  <v-lazy-image
    src="https://cdn-images-1.medium.com/max/1600/1*xjGrvQSXvj72W4zD6IWzfg.jpeg"
    src-placeholder="https://cdn-images-1.medium.com/max/80/1*xjGrvQSXvj72W4zD6IWzfg.jpeg"
  />
</template>

<style scoped>
  .v-lazy-image {
    filter: blur(10px);
    transition: filter 0.7s;
  }
  .v-lazy-image-loaded {
    filter: blur(0);
  }
</style>
```

你可以查看由[@aarongarciah](https://twitter.com/aarongarciah)制作的[这个demo](https://codesandbox.io/s/9l3n6j5944)，在这里可以看到许多不同的 CSS 效果！

### [CodeSandbox](https://codesandbox.io/s/9l3n6j5944)

### [原文链接](https://vuedose.tips/tips/lazy-loading-images-with-v-lazy-image)
