---
title: 「译」 VueDose Tip 29 - 在 Vue.js 3 Composition API 中访问实例属性
date: 2020-02-04
sidebar: false
categories:
  - Vue
tags:
  - Vue 3
  - VueDose
  - 文章翻译
prev: ./28-轻松切换到 Vue.js 3 Composition API
next: ./30-在 Vue.js 3 Composition API 中访问模板中的 ref
---

在上一个 Tip [轻松切换到 Vue.js 3 Composition API](/articles/Vue/VueDose/28-将%20Vue%20组件轻松切换到%20Vue.js%203%20Composition%20API)中，我解释了如何将 Vue.js 基于对象 API 的组件迁移到新的 Composition API。

然而，这并不完整。我们以前使用的实例属性，例如 `this.$emit`，`this.$slots`，`this.$attrs`，该怎么办呢？他们虽然在组件实例 `this` 上， 但 Composition API 中并没有 `this`。

在上一篇 Tip 中，我并没有使用 prop, 我们过去使用 `this` 来访问 `prop`，但是现在你根本不可能访问到它。

事实上，我之前没有说明过当使用 Composition API 时，`setup` 函数的参数。

`setup` 函数的第一个参数接收组件所有的 prop。接着[上一个 Tip](/articles/Vue/VueDose/28-轻松切换到%20Vue.js%203%20Composition%20API) 的示例，我们来为 `money`和 `delta` 本地状态增加两个 prop 作为他们的初始值：

```js
export default {
  props: {
    money: {
      type: Number,
      default: 10
    },
    delta: {
      type: Number,
      default: 1
    }
  },
  setup(props) {
    const money = ref(props.money);
    const delta = ref(props.delta);

    // ...
  }
};
```

十分简单。在 Vue.js 组件中，除了 prop 管理外，没有其它变化。

其它所有的实例属性和例如 `$emit` 的方法呢？你可以在 `setup` 函数的第二个参数：**setup context 对象**中找到它们。

*setup context*的有以下结构：

```js
interface SetupContext {
  readonly attrs: Record<string, string>;
  readonly slots: { [key: string]: (...args: any[]) => VNode[] };
  readonly parent: ComponentInstance | null;
  readonly root: ComponentInstance;
  readonly listeners: { [key: string]: Function };
  emit(event: string, ...args: any[]): void;
}
```

更 cool 的是，我们可以在 `setup context` 上使用对象解构，并且它们都不失去响应式的特性。

为了说明这一点，我将修改之前的示例，并在 `onMounted` 钩子中打印一些东西，以及在 `money` 改变时触发 `money-changed` 事件：

```js
setup(props, { emit, attrs, slots }) {
    // State
    const money = ref(props.money);
    const delta = ref(props.delta);

    // Hooks
    onMounted(() => {
      console.log("Money Counter (attrs): ", attrs);
      console.log("Money Counter (slots): ", slots);
    });

    // Watchers
    const moneyWatch = watch(money, (newVal, oldVal) =>
      emit("money-changed", newVal)
    );
}
```

以上！现在，你已经可以使用大多数 Vue.js 组件实例属性和方法了。

但是你可能意识到，**并非所有内容都在渲染时的 context** 中...比如 `this.$refs`，还有会注入一些内容的插件，例如 `this.$store`，这些该怎么办呢？

不用担心，我将在接下来的 Tip 中介绍！

### [CodeSandbox](https://codesandbox.io/s/composition-context-yq2s8)

### [原文链接](https://vuedose.tips/tips/use-old-instance-properties-in-composition-api-in-vuejs-3)
