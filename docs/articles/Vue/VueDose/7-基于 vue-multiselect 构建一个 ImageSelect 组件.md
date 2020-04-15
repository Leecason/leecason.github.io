---
title: 「译」 VueDose Tip 7 - 基于 vue-multiselect 构建一个 ImageSelect 组件
date: 2020-01-12
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./6-在 Vue 2.6 中不使用 Vuex 创建 Store
next: ./8-关于 Vuex 的两个鲜为人知的事实
---

在学习自适应组件的概念之前以及如何使用 `v-bind` 和 `v-on` 来对 props 和事件进行代理来构建它的基础之前，[有两个技巧](/articles/Vue/VueDose/5-使用%20v-bind%20和%20v-on%20的自适应组件)。

现在是时候展示它了。你知道 [vue-multiselect](https://vue-multiselect.js.org/) 吗？这是 [Damian Dulisz](https://twitter.com/damiandulisz) 构建的令人惊奇的选择器组件。鉴于 `vue-multiselect` 的灵活性和可定制性，它可以以多种不同的方式来使用。这就是一个良好的第三方组件应该具有的可复用性。

根据其文档中的[本示例](https://vue-multiselect.js.org/#sub-custom-option-template)，让我们构建一个 `ImageSelect` 组件。为此，该示例重新定义了一些 `vue-multiselect` 暴露的作用域插槽：

```html
<multiselect v-model="value" :options="options">
  <template slot="singleLabel" slot-scope="{ option }">
    <img class="option__image" :src="option.img" alt="Sth" />
    <span class="option__desc">
      <span class="option__title">{{ option.title }}</span>
    </span>
  </template>

  <template slot="option" slot-scope="{ option }">
    <img class="option__image" :src="option.img" alt="Sth" />
    <span class="option__desc">
      <span class="option__title">{{ option.title }}</span>
      <span class="option__small">{{ option.desc }}</span>
    </span>
  </template>
</multiselect>
```

我没有进入组件去分析作用域插槽的实现，只是假设代码可以工作，以防你不了解它们。在这基础上实现 `ImageSelect` 才是当前的主要任务。

从之前的技巧中，你可能已经知道你需要使用 `v-bind="$props"` 和 `v-on="$listeners"` 以便代理 props 和产生的事件。

你还需要根据原始的 `vue-multiselect` 组件重新声明 props，你可以从源代码的 `MultiselectMixin` 中获取它们：

```vue
<template>
  <multiselect v-bind="$props" v-on="$listeners">
    <template slot="singleLabel" slot-scope="{ option }">
      <img class="option__image" :src="option.img" alt="No Man’s Sky" />
      <span class="option__desc">
        <span class="option__title">{{ option.title }}</span>
      </span>
    </template>

    <template slot="option" slot-scope="{ option }">
      <img class="option__image" :src="option.img" alt="No Man’s Sky" />
      <span class="option__desc">
        <span class="option__title">{{ option.title }}</span>
        <span class="option__small">{{ option.desc }}</span>
      </span>
    </template>
  </multiselect>
</template>

<script>
  import Multiselect from "vue-multiselect";
  import MultiselectMixin from "vue-multiselect/src/multiselectMixin";

  export default {
    components: {
      Multiselect
    },
    props: MultiselectMixin.props
  };
</script>
```

这是使用该 `ImageSelect` 组件的方法，传递最少的 props 以使其可以工作：

```vue
<template>
  <ImageSelect
    v-model="imageValue"
    :options="imageOptions"
    label="title"
    track-by="title"
    :show-labels="false"
  />
</template>

<script>
  import ImageSelect from "./ImageSelect";

  export default {
    components: {
      ImageSelect
    },
    data: () => ({
      imageValue: null,
      imageOptions: [
        { title: "Random img", img: "https://picsum.photos/300/150" },
        { title: "Cool image", img: "https://picsum.photos/300/151" }
      ]
    })
  };
</script>
```

如果你运行此代码，你会发现有些东西无法正常工作。特别是这个 `show-labels` prop。问题是它不是作为 prop 传递给 `vue-multiselect` 的，而是一个 attribute！通过组件实例的 $attrs 可以访问到它们。（译注：因为 `MultiselectMixin` 的 props 中不包含 `show-labels`）

基本上，我们不仅需要代理 props，还要代理 attributes 以使它们可以工作。

要做到这一点，我将使用一个 `computed` 属性合并 `$props` 和 `$attrs` 这两个到一个对象：

```vue
<template>
  <multiselect v-bind="allBindings" v-on="$listeners">
    <!-- ... -->
  </multiselect>
</template>

<script>
  import Multiselect from "vue-multiselect";
  import MultiselectMixin from "vue-multiselect/src/multiselectMixin";

  export default {
    components: {
      Multiselect
    },
    props: MultiselectMixin.props,
    computed: {
      allBindings() {
        // Need to proxify both props and attrs, for example for showLabels
        return { ...this.$props, ...this.$attrs };
      }
    }
  };
</script>
```

你可以在我为你准备的 [CodeSandbox](https://codesandbox.io/s/n71oq781r0) 中尝试一下。你会看到它还有一些附加的自适应组件，例如 `SingleSelect` 和 `MultiSelect`。

*Pss：他们有一些CSS技巧，我们将在接下来的技巧中介绍*

### [CodeSandbox](https://codesandbox.io/s/n71oq781r0)

### [原文链接](https://vuedose.tips/tips/create-an-image-select-component-on-top-of-vue-multiselect)
