---
title: 「译」 VueDose Tip 5 - 使用 v-bind 和 v-on 的自适应组件
date: 2020-01-08
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./4-Vue 2.6 中的新指令 v-slot
next: ./6-在 Vue 2.6 中不使用 Vuex 创建 Store
---

当你正在使用基于组件的技术时，一旦应用程序开始变大，就需要对组件进行结构化和分类，来使它们尽可能的简单和可维护。

组件组合是一个强大且流行的模式，可以帮助我们复用和构建基于组件的技术的代码...但是组件组合究竟是什么呢？虽然这是一个普通的概念，当您通过一个或者多个组件来创建组件的，你就可以说你正在进行组件组合。

例如，当我们有一个叫 `BaseList` 的基本组件，然后你想创建一个类似的组件，并且在此之上添加一些其他功能，就像 `SortableList`。我称他们为**自适应组件**（也可以称为代理或者包装组件）。

当构建一个自适应组件时，你通常希望 `SortableList` 与原始的 `BaseList` 保持相同的 API，以使组件保持一致。这意味着 `SortableList` 你需要传递所有 props 和 `BaseList` 监听的所有事件到 `BaseList`。

诀窍是：你可以使用 `v-bind` 和 `v-on` 来实现：

```vue
<!-- SortableList  -->
<template>
  <AppList v-bind="$props" v-on="$listeners"> <!-- ... --> </AppList>
</template>

<script>
  import AppList from "./AppList";

  export default {
    props: AppList.props,
    components: {
      AppList
    }
  };
</script>
```

`v-bind` 的工作原理根本上与一个接一个地将所有 props 传递到 `AppList` 一样，只是在一个对象中一次性传递了所有的 props。`$props` 是组件实例中的包含了该组件所有 props 的对象。

可以想象，`v-on="$listeners"` 工作原理完全相同，只是作用于事件。

这同样适用于使用了 `v-model` 的双向绑定组件。如果你不知道，`v-model` 是传递 `value` 属性和监听 `input` 事件的简写。

最后，请记住，在 Vue.js 中，我们必须显示声明组件的 props 才能被解析。创建自适应组件时，一种快速的方法是使用基本组件的 props 来定义它们，就像我在例子中所做的那样：`props: AppList.props`。

### [原文链接](https://vuedose.tips/tips/adaptive-components-using-v-bind-and-v-on)
