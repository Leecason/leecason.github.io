---
title: 「译」 VueDose Tip 21 - 在 Vue.js 有作用域的 CSS 中使用 /deep/ 选择器来设置内部元素的样式
date: 2020-01-27
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./20-Vue.js 中有作用域的 CSS 的重要性
next: ./22-在 Vue.js 中使用快照进行快速内容测试
---

在[Vue.js 中有作用域的 CSS 的重要性](/articles/Vue/VueDose/20-Vue.js%20中有作用域的%20CSS%20的重要性)中，你可以看到为什么当我们想要在组件中实现样式封装时，有作用域的 CSS 十分重要。如果你还没有读过那篇 Tip，我强烈建议你去读一下以便理解这篇 Tip。

但是，当我们尝试将[该示例](https://codesandbox.io/s/zwkj000z7p)的样式转换为有作用域的 CSS 时，样式丢失了。

是这样的：使用有作用域的 CSS 时，你可以修改你想要自定义的组件的根元素。

换言之，从 `BlueList.vue` 和 `RedList.vue` 的例子中，我们只能修改 `BaseList.vue` 的 `.list` 类，因为它是该组件的根元素的类。

但是内部元素呢？我们想给 `.list-item` 类设置样式以更改列表项的颜色。

为此，我们有了 `/deep/` 选择器，你可以使用它来访问组件的内部元素，如下所示：

```vue
<style scoped>
.list /deep/ .list-item {
  color: white;
  background: #42a5f5;
}
</style>
```

看看[更新后的示例](https://codesandbox.io/s/40y6v5w3w0)，看看它现在如何按预期工作的，并且每个都有不同的颜色。

### [CodeSandbox](https://codesandbox.io/s/40y6v5w3w0)

### [原文链接](https://vuedose.tips/tips/style-inner-elements-in-scoped-css-using-deep-selector-in-vue-js)
