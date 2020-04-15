---
title: 「译」 VueDose Tip 8 - 关于 Vuex 的两个鲜为人知的事实
date: 2020-01-13
sidebar: false
categories:
  - Vue
tags:
  - Vuex
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./7-基于 vue-multiselect 构建一个 ImageSelect 组件
next: ./9-快照测试（Snapshot Testing）在 Vue.js 中的威力
---

在 Vue.js 组件中使用 Vuex 时，我们往往会忘记其暴露在映射函数旁边的一个惊人的 API。

让我们看看它可以做什么，但是首先让我们为示例创建一个基本的 store：

```js
const store = new Vuex.Store({
  state: {
    count: 0
  },
  getters: {
    getCountPlusOne: state => state.count + 1
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  }
});
```

## Watch

watch 方法是将外部代码和 Vuex 集成在一起的最有用的方法，无论是在你 `awesomeService` 或者 `catchAllAuthUtils` 中。

使用方法：

```js
const unsubscribe = store.watch(
  (state, getters) => {
    return [state.count, getters.getCountPlusOne];
  },
  watched => {
    console.log("Count is:", watched[0]);
    console.log("Count plus one is:", watched[1]);
  },
  {}
);

// To unsubscribe:
unsubscribe();
```

我们正在做的是传入两个函数来调用 watch 方法，一个是返回我们想要监视的 `state` 和/或 `getters` 的某一部分，另一个是当 `state.count` 或者 `getCountPlusOne` 改变时我们要调用的函数。

与 `React`，`Angular` 甚至 `JQuery` 集成时，这非常有用。

参见此[CodeSandbox](https://codesandbox.io/s/vm6r05qjq0)中的示例。

## SubscribeAction

有时，与其监视 store 的一个属性的变化，不如对一个特定的动作做出响应，`login` 和 `logout` 就是如此，Vuex 为我们提供了 `SubscribeAction`。

调用 `SubscribeAction` 会添加一个'回调函数'，该回调在每次操作时都会运行，可用于调用自定义代码。

让我们用它在每次操作之前和之后启动和停止全局的‘加载 spinner’！

```js
const unsubscribe = store.subscribeAction({
  before: (action, state) => {
    startBigLoadingSpinner();
  },
  after: (action, state) => {
    stoptBigLoadingSpinner();
  }
});

// To unsubscribe:
unsubscribe();
```

### [CodeSandbox](https://codesandbox.io/s/vm6r05qjq0)

### [原文链接](https://vuedose.tips/tips/two-less-known-facts-about-vuex)
