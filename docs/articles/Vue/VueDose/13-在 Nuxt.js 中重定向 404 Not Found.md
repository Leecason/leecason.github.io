---
title: 「译」 VueDose Tip 13 - 在 Nuxt.js 中重定向 404 Not Found
date: 2020-01-19
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - Nuxt
  - VueDose
  - 文章翻译
prev: ./12-当 Vue 组件创建的时候执行侦听器
next: ./14-在 Vue 侦听器中测试逻辑
---

对我来说， `Nuxt` 是我用过最好的软件之一。遵循 JAM Stack 趋势，无论是 SPA，Server Side Render（SSR）应用程序还是静态生成的网站，它都使我构建 Web 应用程序的工作效率更高。

*Pss，实际上 [VueDose 网站](https://vuedose.tips/)是在 Nuxt 上构建的静态网站 😉*

但是，仍然有很多次发现了非常有趣的但不在文档中的技巧...先停下来！让我们分享第一个热门的 `Nuxt` 技巧！

如果你熟悉 `Nuxt.js`，则应该了解 [pages](https://nuxtjs.org/guide/views/#pages) 概念。你还应该知道有一个特殊的 [Error page](https://nuxtjs.org/guide/views#error-page)（虽然它在'布局'文件夹下，但它是一个页面）。

你可以覆盖默认的 `error page` 然后对其进行自定义...但是如果我们想要其他行为，该怎么办？

在一些情况下，我们可能希望当用户访问不存在的页面时，将其重定向到主页。

诀窍是：你可以通过创建以下 `pages/*.vue` 组件轻松做到这一点：

```vue
<!-- pages/*.vue -->
<script>
export default {
  asyncData ({ redirect }) {
    return redirect('/')
  }
}
</script>
```

在 `Nuxt` 中，路由由文件命名约定定义。因此，当我们创建 `*.vue` 文件时，实际上是在 Vue Router 上使用了通配符路由。

然后，无论是在客户端或是服务端，我们使用 `Nuxt` 的 `redirect` 方法来执行重定向。

我们在 `asyncData` 中进行此操作，因为在那里有 `Nuxt` 上下文，但是它也可以完美地与 `fetch` 方法一起使用：

```vue
<!-- pages/*.vue -->
<script>
export default {
  fetch({ redirect }) {
    return redirect("/");
  }
};
</script>
```

输入任何不存在的 Url 试一下。你可以看到如何重定向的。

### [原文链接](https://vuedose.tips/tips/redirect-404-not-found-in-nuxt-js)
