---
title: 「译」 VueDose Tip 23 - 在 Vue.js 中使用作用域插槽
date: 2020-01-29
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./22-在 Vue.js 中使用快照进行快速内容测试
next: ./24-Vue.js 中的数据提供（Data Provider）组件
---

我多次了解到想要在 Vue.js 开发时提高生产率的公司。

这是一个过于开放的问题，但至少可以通过它们在应用程序中经常构建什么功能，然后用可复用组件的工具包来实现部分功能，你可以把常用逻辑放入工具包中，它同时又足够灵活以适应其它应用。

Vue.js 具有*插槽*，来使组件具有可重新定义的结构，但它们本身的功能非常有限。有时你需要一些数据或者状态来定义组件如何渲染。

如果你还不知道插槽，建议你先在 [Vue.js 文档](https://vuejs.org/v2/guide/components-slots.html)中学习。

作用域插槽是 Vue.js 中的一个高级功能，它可以帮你解决这个问题。它们就像普通的插槽一样，但是它们也可以接收属性。

让我们构建一个 `Clock.vue` 组件来说明这一点。简单来说，它是一个时间计数器：

```vue
<template>
  <div class="clock">
    <slot :time="time">
      <p>Default slot</p>
      <p>Time: {{ time.toLocaleTimeString() }}</p>
    </slot>
  </div>
</template>

<script>
  export default {
    data: () => ({
      time: new Date()
    }),
    created() {
      setInterval(() => {
        this.time = new Date(this.time.getTime() + 1000);
      }, 1000);
    }
  };
</script>
```

你可能已经注意这行 `<slot :time="time">`，这就是接收`time`属性的插槽。这就是 `Clock.vue` 组件可以在封装计时器逻辑本身的同时，将时间数据发送到使用它的组件的方式。

你可能还意识到，该组件已经由自己渲染了时间，因为它在插槽中具有一些默认内容。

但是，如果我们想重新定义其渲染的内容，同时又保留计时器的逻辑，该怎么办呢？

由于我们将 `time` 属性传递给了插槽，因此我们可以简单地在 `Clock` 插槽的根元素上使用 `v-slot` 指令来做到这一点。因此，无论你想在哪里渲染 `Clock` 组件，都可以这样写：

```vue
<template>
  <Clock>
    <template v-slot="{ time }">
      <p><b>Slot override!</b></p>
      <p>Date: {{ time.toLocaleDateString() }}</p>
      <p>Time: {{ time.toLocaleTimeString() }}</p>
    </template>
  </Clock>
</template>
```

`v-slot` 接收从 `Clock` 组件内部传递的所有 props。由于这是 JavaScript 对象，我们可以使用对象展开操作符像 `{ time }` 来获取时间的 prop。

你看到作用域插槽的威力了吗？你可以做一些更强大的工作，例如无渲染（render-less）组件，这将在以后的 Tip 中看到。

### [CodeSandbox](https://codesandbox.io/s/yjjq04vn91)

### [原文链接](https://vuedose.tips/tips/using-scoped-slots-in-vue-js)
