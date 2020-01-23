---
title: 「译」 VueDose Tips - 简单且高性能的 Vue.js 函数式组件
date: 2019-05-17
categories:
  - Vue
tags:
  - Vue
  - VueDose
  - Vue tips
  - 文章翻译
---

有时候我们不需要复杂的组件，在某些情况下我们甚至不需要它们具有自己的状态。当构建没有太多逻辑的 UI 组件时可能就是这种情况。

对于这种情况，**函数式组件**会非常合适。它们是无状态且无实例的，这意味着它甚至没有一个实例（因此无法调用`this.$emit`等）。

这使它们**易于**推理，**更快**，更**轻量**。

问题是，什么时候可以使用函数式组件？简单：当它们**只依赖 props**时。

例如，以下组件：

```vue
<template>
  <div>
    <p v-for="item in items" @click="$emit('item-clicked', item)">
      {{ item }}
    </p>
  </div>
</template>

<script>
  export default {
    props: ["items"]
  };
</script>
```

可以用函数式方式改写为：

```vue
<template functional>
  <div>
    <p v-for="item in props.items" @click="props.itemClick(item);">
      {{ item }}
    </p>
  </div>
</template>
```

注意改变的事情：

- 在 `template` 标签中写 `functional`
- 通过 `props` 访问 Props
- 因为我们无权使用 `$emit`，所以我们可以将函数作为 prop。这就是 Reach 社区一直以来所做的，并且运行良好。
- 无需 `script` 部分

你想看到它的作用吗？在此 [CodeSandbox](https://codesandbox.io/s/rwxp7pnklo) 中自己确认一下吧。

[原文链接](https://vuedose.tips/tips/simple-and-performant-functional-vue-js-components)
