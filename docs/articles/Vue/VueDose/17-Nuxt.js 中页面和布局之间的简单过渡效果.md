---
title: 「译」 VueDose Tip 17 - Nuxt.js 中页面和布局之间的简单过渡效果
date: 2020-01-23
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - Nuxt
  - VueDose
  - 文章翻译
prev: ./16-使用 v-lazy-image 懒加载图片
next: ./18-在 Vue.js 中调试模板
---

Vue.js 使动画和过渡非常容易实现。因此，你应该利用这个机会为你的应用程序/网站增添些许亮点。

Nuxt.js 在 Vue.js 所提供的功能之上构建。它使你可以非常快速且几乎不费吹灰之力地在页面之间创建非常简单的过渡。

你只需要在 `page.vue` 文件中定义过渡的名称。此名称将生成 6 个过渡类，这些过渡类可用于页面之间的过渡效果。

```js
export default {
  transition: "default"
};
```

Nuxt.js 会将其解释为 `<transition name="default">`，并将在你的 CSS 代码中寻找以下类，这些类将定义页面之间的过渡。

```css
.default-enter {
}
.default-enter-active {
}
.default-enter-to {
}
.default-leave {
}
.default-leave-active {
}
.default-leave-to {
}
```

你一定要查看 [Vue.js 文档](https://vuejs.org/v2/guide/transitions.html#Transition-Classes)来了解这些类何时使用以及过渡模式。但让我们使用透明度来定义页面间非常简单的过渡。

```css
.page-enter-active,
.page-leave-active {
  transition-property: opacity;
  transition-timing-function: ease-in-out;
  transition-duration: 500ms;
}
.page-enter,
.page-leave-to {
  opacity: 0;
}
```

将此代码集成到 Nuxt.js 应用程序/网站后，页面之间的默认过渡将花费 1000 毫秒，上一个页面内容将淡出，然后新的页面将淡入。你甚至不需要定义过渡名称因为 `page` 就是默认的过渡名称。你可以在[CodeSandbox](https://codesandbox.io/embed/2xovlqpv9n)中查看。

如果希望为某个页面创建特殊的过渡，则你可以在 `page.vue` 定义一个过渡名称，就像我在[CodeSandbox](https://codesandbox.io/embed/2xovlqpv9n)中为`intro.vue`做的那样。如你所见，如果你访问`intro.vue`页面，过渡就是两个黑色矩形。

[https://codesandbox.io/embed/2xovlqpv9n](https://codesandbox.io/embed/2xovlqpv9n)

请注意，仅当你在具有相同布局的页面之间切换时，页面之间的过渡效果才有效。如果要在具有两种不同的布局的页面之间导航，则必须使用 Nuxt.js 的 [布局过渡](https://nuxtjs.org/api/configuration-transition#the-layouttransition-property)。如果你访问`other.vue`页面，你将在我们的 CodeSandbox 中看到。

NuxtJS 已经在[页面过渡]()和[布局过渡]()上设置了一些默认值。这些默认值可以在`nuxt.config.js`中直接覆盖：

```js
module.exports = {
  /* Layout Transitions */
  layoutTransition: {
    name: "layout",
    mode: ""
  },
  /* Page Transitions */
  pageTransition: {
    name: "default",
    mode: ""
  }
};
```

这些只是 Nuxt.js 中页面之间转换的基础。Vue.js 的内部隐藏着更多的内容，可用于创建疯狂的动画和过渡。因此，请继续挖掘文档并查看 Sarah Drasner 的[这个示例](https://github.com/sdras/page-transitions-travelapp)。

### [CodeSandbox](https://codesandbox.io/embed/2xovlqpv9n)

### [原文链接](https://vuedose.tips/tips/simple-transition-effect-between-pages-and-layouts-in-nuxt-js)
