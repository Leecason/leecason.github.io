---
title: 「译」 VueDose Tip 10 - 监听第三方 Vue.js 组件上的生命周期钩子
date: 2020-01-16
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./9-快照测试（Snapshot Testing）在 Vue.js 中的威力
next: ./11-简单且高性能的 Vue.js 函数式组件
---

这是我从我的朋友 [Damian Dulisz](https://twitter.com/damiandulisz) 那里学到的一个非常有用的技巧，他是 Vue.js 核心团队的成员，他创建了 [Vue newsletter](https://news.vuejs.org/) 和 [vue-multiselect](https://vue-multiselect.js.org/)。

在某些情况下我需要知道组件何时从父组件被 `created`、`mounted`、`updated` 了，尤其是在为普通 JS 库构建组件时。

你可能已经在自己的组件中拥有了类似的功能，例如，从子组件发出生命周期钩子中的事件，就像这样：

```js
mounted() {
  this.$emit("mounted");
}
```

因此，你可以从父组件监听它 `<Child @mounted="doSomething"/>`。

让我告诉你：这是没有必要的，实际上，你将无法在第三方组件上做到这一点。

相反，解决方案就很简单，监听加上了 `@hook:` 前缀的生命周期钩子名称的事件就可以了。

例如，你想在第三方组件 [`v-runtime-template`](https://github.com/alexjoverm/v-runtime-template) 渲染时执行某项操作，则可以监听 `updated` 生命周期钩子：

```html
<v-runtime-template @hook:updated="doSomething" :template="template" />
```

### [CodeSandbox](https://codesandbox.io/s/18r05pkmn7)

### [原文链接](https://vuedose.tips/tips/listen-to-lifecycle-hooks-on-third-party-vue-js-components)
