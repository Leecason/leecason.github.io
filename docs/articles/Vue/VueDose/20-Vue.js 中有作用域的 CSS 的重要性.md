---
title: 「译」 VueDose Tip 20 - Vue.js 中有作用域的 CSS 的重要性
date: 2020-01-26
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./19-用 MaxMind 实现地理货币
next: ./21-在 Vue.js 有作用域的 CSS 中使用 deep 选择器来设置内部元素的样式
---

有时我看到 Vue.js 的新开发人员对 Vue.js 中有作用域的 CSS 感到困惑。有些人在不真正知道它如何工作的情况下使用它。

如果你是这样的，我喜欢本节 Tip 可以帮助你了解为什么以及何时使用，何时不使用它😉。

我不会深入研究该理论，因为你可以在 [vue-loader 文档](https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles)中了解它。要知道，这是 vue-loader 的特点，可以通过模拟 Shadow DOM 功能来避免样式冲突并封装样式。

让我们来看一个不使用有作用域的 CSS 的出现问题的例子。

假设我们有一个 `BaseList.vue` 具有以下的结构：

```vue
<template>
  <ul class="list">
    <li class="list-item" v-for="item in items" :key="item">
      {{ item }}
    </li>
  </ul>
</template>
```

然后使用相同的代码创建两个组件。称为 `RedList.vue` 和 `BlueList.vue`：

```vue
<template>
  <BaseList :items="items" />
</template>

<script>
import BaseList from "./BaseList";

export default {
  props: ["items"],
  components: {
    BaseList
  }
};
</script>
```

现在，根据颜色为它们添加两种不同的样式。例如，对于 `BlueList.vue`：

```vue
<style>
.list-item {
  color: white;
  background: #42a5f5;
}
</style>
```

就像我在 [此CodeSandbox](https://codesandbox.io/s/zwkj000z7p) 所做的那样，将它们放在一起，然后...surprise！你将看到，即使两个组件都定义了不同的颜色，它们也显示相同的颜色：

这是因为当我们不使用有作用域的 CSS 时，即使它们位于不同的组件中，它们也是全局的。因此，在这种情况下，一种样式将覆盖另一种样式。

这就是为什么有作用域 CSS 的如此重要的原因：它们避免了这些冲突的发生。

讲个笑话：如果你在上面的示例中尝试将 `scoped` 单词放入 `style` 标签中，则会看到列表项的样式不生效😅。

这是正常的，**下一节你将了解**如何使用有作用域的 CSS 设置**内部元素**的样式。

最后，我想提到的是，你可以将有作用域的（局部样式）与全局的（不是有作用域的样式）样式混合使用。你可能会想在以下的场景使用全局样式：

- 在应用跨组件的样式（通用样式）时
- 编写第三方库时。如果应用了有作用域的 CSS 时，这将使你的库无法自定义样式。

请记住，有作用域的 CSS 并不是唯一的解决方案。你也可以使用 CSS 模块或者诸如 BEM 之类的方法。

### [原文链接](https://vuedose.tips/tips/the-importance-of-scoped-css-in-vue-js)
