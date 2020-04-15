---
title: 「译」 VueDose Tip 12 - 当 Vue 组件创建的时候执行侦听器
date: 2020-01-18
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./11-简单且高性能的 Vue.js 函数式组件
next: ./13-在 Nuxt.js 中重定向 404 Not Found
---

尽管 Vue 为我们提供了在大多数情况下非常有用的计算属性，但是在一些情况下，你可能需要使用侦听器。

默认情况下，侦听器仅在所侦听的属性的值发生变化时才会执行，这完全说得通。

这是你为 dog 属性定义侦听器的方法：

```js
export default {
  data: () => ({
    dog: ""
  }),
  watch: {
    dog(newVal, oldVal) {
      console.log(`Dog changed: ${newVal}`);
    }
  }
};
```

到目前为止，一切都很好。如果你尝试该代码，`dog` 的值改变后侦听器将会被调用。

但是，在某些情况下，你需要在组件创建后立即执行侦听器。你可以将逻辑移入一个方法中，然后在侦听器和 `created` 生命周期钩子中调用它，但是有一个简单的方法。

你可以使用侦听器的完整版本来传递 `immediate: true` 选项。这将使其在组件创建的时候立即执行。

```js
export default {
  data: () => ({
    dog: ""
  }),
  watch: {
    dog: {
      handler(newVal, oldVal) {
        console.log(`Dog changed: ${newVal}`);
      },
      immediate: true
    }
  }
};
```

如你所见，在完整版本中，你需要在侦听器对象 `handler` 键中设置侦听器的回调函数。

### [CodeSandbox](https://codesandbox.io/s/rwxp7pnklo)

### [原文链接](https://vuedose.tips/tips/run-watchers-when-a-vue-js-component-is-created)
