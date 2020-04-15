---
title: 「译」 VueDose Tip 6 - 在 Vue 2.6 中不使用 Vuex 创建 Store
date: 2020-01-10
sidebar: false
categories:
  - Vue
tags:
  - Vuex
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./5-使用 v-bind 和 v-on 的自适应组件
next: ./7-基于 vue-multiselect 构建一个 ImageSelect 组件
---

Vue.js 2.6 引入了一些新特性，我真正喜欢的是这个新的全局 [observable API](https://vuejs.org/v2/api/#Vue-observable)。

现在你可以在组件范围外创建响应式对象。而且，当你在组件中使用它们时，它将适当地触发渲染更新。

这样，你可以不需要 `Vuex` 的帮助创建非常简单的 `stores`，适合非常简单的场景，例如需要共享某些外部的 `state` 的情况。

对于本技巧示例，你将会构建一个简单的计数功能，在该功能中将 `state` 外部化到我们的 `store` 中。

首先创建 `store.js`：

```js
import Vue from "vue";

export const store = Vue.observable({
  count: 0
});
```

如果你对 `mutations` 和 `actions` 感到满意，则可以创建简单的函数来更新数据来使用该模式：

```js
import Vue from "vue";

export const store = Vue.observable({
  count: 0
});

export const mutations = {
  setCount(count) {
    store.count = count;
  }
};
```

现在，你只需要在组件中使用它即可。要访问 `state`，就像 `Vuex` 一样，我们将使用 `computed` 属性和 `methods` 进行 `mutations`：

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="setCount(count + 1);">+ 1</button>
    <button @click="setCount(count - 1);">- 1</button>
  </div>
</template>

<script>
  import { store, mutations } from "./store";

  export default {
    computed: {
      count() {
        return store.count;
      }
    },
    methods: {
      setCount: mutations.setCount
    }
  };
</script>
```

### [CodeSandbox](https://codesandbox.io/s/k3kpqz2wz7)

### [原文链接](https://vuedose.tips/tips/creating-a-store-without-vuex-in-vue-js-2-6)
