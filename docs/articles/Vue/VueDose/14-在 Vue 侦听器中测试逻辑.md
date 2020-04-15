---
title: 「译」 VueDose Tip 14 - 在 Vue 侦听器中测试逻辑
date: 2020-01-20
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - 测试
  - VueDose
  - 文章翻译
prev: ./13-在 Nuxt.js 中重定向 404 Not Found
next: ./15-在 Vue.js 中使用动态引入提高性能
---

即使大多数时候我们使用计算属性来响应数据更改，但有时我们还是必须使用侦听器才能执行复杂的操作或者对 API 的异步调用。我们尽量简单地来完成这个示例。

假设你有一个内部值发生改变时触发 `input` 事件的组件：

```vue
<template>
  <input v-model="internalValue" />
</template>
<script>
  export default {
    data() {
      return {
        internalValue: ""
      };
    },
    watch: {
      internalValue(value) {
        this.$emit("input", value);
      }
    }
  };
</script>
```

当需要测试该功能时，我们想到的第一件事是我们必须挂载这个组件，改变 `internalValue` 数据，然后期望侦听器被触发。

但是你知道吗？Vue 核心成员已经对该功能进行了测试。我们不需要再做一次。当某一个值改变时，与其相关的侦听器将触发。尤雨溪对此非常有信心。

你可以这样做测试：

```js
test("emits input event when interalValue changes", () => {
  const wrapper = shallowMount(YourComponent);

  wrapper.vm.$options.watch.internalValue.call(wrapper.vm, 15);

  expect(wrapper.emitted("input")[0][0]).toBe(15);
});
```

Vue 会将 `$options.watch` 对象附加到我们在组件中定义的每个侦听器，因此我们在这里所做的就是使用`call()`直接调用侦听器。

`call`的第一个参数是函数内部（组件实例）`this`的上下文，然后，我们可以传递更多的参数。

总结一下：“不要测试框架”

有时很难从你所使用的库已经测试了数千次的特性中识别出你自己的代码。我向你保证，当数据发生变化时，侦听器将触发。

测试其中的逻辑，不要浪费你宝贵的时间来尝试重新创建可能引起侦听器触发的场景和条件。

### [原文链接](https://vuedose.tips/tips/testing-logic-inside-a-vue-js-watcher)
