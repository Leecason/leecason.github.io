---
title: 「译」 VueDose Tip 25 - 使用 CSS Scroll Snap 和 Vue.js 的最现代的轮播组件
date: 2020-01-31
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./24-Vue.js 中的数据提供（Data Provider）组件
next: ./26-使用 CSS Conic Gradient 和 Vue.js 的最现代的饼图组件
---

上周我和我挚爱的朋友 [Laura Bonmati](https://twitter.com/laurabonmati) 去了 Codemotion Madrid。这是西班牙最大的极客交流会之一。

我们最喜欢的演讲之一是 [Sonia Ruiz](https://twitter.com/Yune__vk) 的 *“CSS 的最新功能”*，该 Tip 来自我从她的演讲中获得的一些灵感，因此让我们在 twitter 上为她点赞吧！

在她展示的功能中，令我感到惊喜的是 `scroll-snap`，并且用它来构建轮播非常容易，所以我想...让它成为一个组件！

首先，创建一个具有以下结构的 `Carousel.vue` 组件：

```vue
<template>
  <div class="carousel-wrapper">
    <div class="carousel" :style="{ width, height }">
      <slot/>
    </div>
  </div>
</template>

<script>
export default {
  props: ["width", "height"]
};
</script>

<style scoped>
.carousel {
  display: flex;
  overflow: scroll;
  scroll-snap-type: x mandatory;
}

.carousel > * {
  flex: 1 0 100%;
  scroll-snap-align: start;
}
</style>
```

这里最重要的部分是使用 `scroll-snap-type`。我们迫使滚动吸附在沿 x 轴的 `.carousel` 元素内的每一项。

然后，你需要使轮播中的每个项目都占据容器的全部空间。你可以使用 `flex: 1 0 100%` 并用 `scroll-snap-align: start` 定义每项的对齐。

请注意，我传递了 `width` 和 `height` 属性，因此你可以轻松地从组件外部设置轮播尺寸。

顺便提一下，如果不知道 `<slot/>` 如何工作，可以查看[在 Vue.js 中使用作用域插槽](/articles/Vue/VueDose/23-在%20Vue.js%20中使用作用域插槽)和[Vue 2.6 中的新指令 v-slot](/articles/Vue/VueDose/4-Vue%202.6%20中的新指令%20v-slot)，并进一步了解它们（包括作用域插槽）。

这样，你就拥有了一个轮播组件，该组件可以使用鼠标平滑的滚动。

让我们添加一些功能吧？如果要手动更改当前轮播页，该怎么办？

正如你可能已经想到的那样，轮播根据滚动条“滚动”，因此你必须改变滚动的位置。

实际上，每个滚动定位都是轮播图的宽度乘以轮播图位置的乘积。

让我们添加几个按钮，使我们可以在轮播图中来回移动，以便我们可以浏览每个轮播图：

```vue
<template>
  <div class="carousel-wrapper">
    <div class="carousel" :style="{ width, height }">
      <slot/>
    </div>
    <button @click="changeSlide(-1)">Prev Slide</button>
    <button @click="changeSlide(1)">Next Slide</button>
  </div>
</template>

<script>
export default {
  props: ["width", "height"],
  methods: {
    changeSlide(delta) {
      const carousel = this.$el.querySelector(".carousel");
      const width = carousel.offsetWidth;
      carousel.scrollTo(carousel.scrollLeft + width * delta, 0);
    }
  }
};
</script>
```

这些按钮调用 `changeSlide`，传递你想要改变的轮播的位置参数。

该方法使用当前轮播页的宽度，并通过检查当前滚动位置并添加应改变像素来计算滚动位置。计算公式是 `carousel.scrollLeft + width * delta`。

如果你尝试使用该组件，可以看到它会按照预期工作，但是滚动并不流畅。相反的，它是立即改变轮播页的。

幸运的是，最现代 CSS 来了！

你可以在轮播元素上使用 `scroll-behavior: smooth` 属性，滚动将再次变得平滑！

```css
.carousel {
  display: flex;
  overflow: scroll;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
}
```

最后，使用组件的方法非常简单：

```vue
<template>
  <Carousel width="400px" height="250px">
    <div class="blue">Blue</div>
    <div class="green">Green</div>
    <div class="red">Red</div>
  </Carousel>
</template>
```

你认识到构建此组件有多么容易了吗？现代 CSS 真是太好了！

我敢肯定，你现在正在考虑改善它的很多方法：每隔 X 秒自动切换，循环滚动，切换到指定的轮播页...请告诉我你的想法并将其展示给我！我很高兴看到你的实现！

当前，请记住，此组件使用了非常新的 CSS 属性，因此仅在最新的浏览器中受支持。

但是你必须构建轮播的未来！

### [CodeSandbox](https://codesandbox.io/s/carousel-component-5zkbe)

### [原文链接](https://vuedose.tips/tips/the-most-modern-carousel-component-using-css-scroll-snap-and-vue-js)
