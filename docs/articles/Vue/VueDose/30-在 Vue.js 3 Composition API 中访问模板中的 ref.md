---
title: 「译」 VueDose Tip 30 - 在 Vue.js 3 Composition API 中访问模板中的 ref
date: 2020-02-05
sidebar: false
categories:
  - Vue
tags:
  - Vue 3
  - VueDose
  - 文章翻译
prev: ./29-在 Vue.js 3 Composition API 中访问实例属性
next: ./31-在 Vue.js 3 中使用 Composition API 构建 i18n 插件
---

你已经在上一个 Tip [在 Vue.js 3 Composition API 中访问实例属性](/articles/Vue/VueDose/29-在%20Vue.js%203%20Composition%20API%20中访问实例属性)中，看到了如何使用新语法访问实例属性。

但是，你如果读过上一个 Tip，你已经了解到我们钟爱的 `this.$refs` 并不包含在 **setup context 对象** 中。

那么，如何在 Composition API 中使用模板 ref 呢？

这可能比你想象的要简单！重点就是，Vue.js 统一了 refs 的概念，所以你只需要使用你已经知道的用来声明响应式变量的 `ref()` 函数，即可声明模板 ref。

请记住，ref 名称必须与变量名称相同。让我来说明一下。对于模板：

```vue
<template>
  <div>
    <h2 ref="titleRef">{{ formattedMoney }}</h2>
    <input v-model="delta" type="number" />
    <button @click="add">Add</button>
  </div>
</template>
```

我已经在 `<h2>` 标签上设置了 `titleRef`。一切都在模板上操作的。现在在 `setup` 函数中，你需要声明一个与 `titleRef` 相同名字的 ref，例如将其初始化为 `null`：

```js
export default {
  setup(props) {
    // Refs
    const titleRef = ref(null);

    // Hooks
    onMounted(() => {
      console.log("titleRef", titleRef.value);
    });

    return {
      titleRef
      // ...
    };
  }
};
```

你可以通过 `.value` 属性访问这个 ref 的值，就像访问其它响应式变量一样。你如果按照示例中所示进行操作，则应该在控制台中看到结果  *titleRef  `<h2>10.00</h2>`*。

### [CodeSandbox](https://codesandbox.io/s/template-refs-in-composition-api-w8rux)

### [原文链接](https://vuedose.tips/tips/access-template-refs-in-composition-api-in-vuejs-3)
