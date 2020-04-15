---
title: 「译」 VueDose Tip 24 - Vue.js 中的数据提供（Data Provider）组件
date: 2020-01-30
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./23-在 Vue.js 中使用作用域插槽
next: ./25-使用 CSS Scroll Snap 和 Vue.js 的最现代的轮播组件
---

使用基于组件的技术（例如 Vue.js），并不意味着所有的组件都具有 UI。

实际上，我最喜欢的在大型应用中使用高级的可复用的方法是使用组件组合。

通过*作用域插槽*，正如你在[在 Vue.js 中使用作用域插槽](/articles/Vue/VueDose/23-在%20Vue.js%20中使用作用域插槽)所看到的，你可以在一个组件中封装逻辑，然后用 prop 传递给插槽。这样，你可以通过组合多个组件来组成新组件的 UI 和行为。

今天，我将向你展示一个**数据提供（Data Provider）组件**示例。

数据提供组件是一个**无渲染（renderless）组件**，这意味着它不需要渲染任何内容。

创建*无渲染组件*的基础是在*渲染函数*中创建一个有作用域的的插槽并向它传递任何 prop：

```js
render() {
  return this.$scopedSlots.default({
    loading: !this.loaded,
    data: this.data
  });
}
```

由于[作用域插槽的不一致性](https://github.com/vuejs/vue/issues/8056)（已在 2.6 版本修复），因此你最好这样做，以使其在任何情况下都能正常工作：

```js
render() {
  const slot = this.$scopedSlots.default({
    loading: !this.loaded,
    data: this.data
  });

  return Array.isArray(slot) ? slot[0] : slot;
}
```

要创建数据提供组件，必须在创建组件时执行 ajax/fetch 调用，然后将数据传递给作用域插槽。

`DataProvider.js` 的最终版本可以是：

```js
import axios from "axios";

export default {
  props: ["url"],
  data: () => ({
    data: null,
    loaded: false
  }),
  created() {
    axios.get(this.url).then(({ data }) => {
      this.data = data;
      this.loaded = true;
    });
  },
  render() {
    const slot = this.$scopedSlots.default({
      loading: !this.loaded,
      data: this.data
    });

    return Array.isArray(slot) ? slot[0] : slot;
  }
};
```

请注意，这是一个 `.js` 文件。由于它只是组件的脚本（script）部分，因此它不必是 `.vue` 文件。

数据提供组件也有一个加载状态，因此你可以根据该状态来渲染不同的 UI。例如：

```vue
<template>
  <DataProvider url="https://jsonplaceholder.typicode.com/users">
    <div v-slot="{ data, loading }">
      <div v-if="loading">Loading...</div>
      <div v-else>
        <h2>Result: {{ data.length }} users</h2>
        <p v-for="user in data" :key="user.id">{{ user.name }}</p>
      </div>
    </div>
  </DataProvider>
</template>
```

以上！

### [CodeSandbox](https://codesandbox.io/s/2w6zp30kjy)

### [原文链接](https://vuedose.tips/tips/data-provider-component-in-vue-js)
