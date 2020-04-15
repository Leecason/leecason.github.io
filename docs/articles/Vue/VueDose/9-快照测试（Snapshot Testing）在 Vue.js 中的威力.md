---
title: 「译」 VueDose Tip 9 - 快照测试（Snapshot Testing）在 Vue.js 中的威力
date: 2020-01-15
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - Jest
  - 测试
  - Snapshot Testing
  - VueDose
  - 文章翻译
prev: ./8-关于 Vuex 的两个鲜为人知的事实
next: ./10-监听第三方 Vue.js 组件上的生命周期钩子
---

如果你要进行测试，有可能已经用过[Jest](https://jestjs.io/)了：Facebook 创建的多合一测试框架。现在是那里最受欢迎的工具，自从我第一次尝试以来就一直在使用它。

要测试 Vue.js 的组件，你还可以使用由[Edd Yerburg](https://twitter.com/EddYerburgh)编写的官方辅助库[vue-test-utils](https://vue-test-utils.vuejs.org/)，该库使测试 Vue.js 应用更加容易。

这是使用 `Jest` 和 `vue-test-utils` 进行测试的示例：

```js
it('has a message list of 3 elements', () => {
  const cmp = createCmp({ messages: ['msg-1', 'msg-2', 'msg-3'] })
  expect(cmp.is('ul')).toBe(true)
  expect(cmp.find('.message-list').isEmpty()).toBe(false)
  expect(cmp.find('.message-list').length).toBe(3)
})

it('has a message prop rendered as a data-message attribute', () => {
  const cmp = createCmp({ message: 'Cat' })
  expect(cmp.contains('.message')).toBe(true)
  expect(cmp.find('.message').props('message').toBe('Cat')
  expect(cmp.find('.message').attributes('data-message').toBe('Cat')

  // Change the prop message
  cmp.setProps({ message: 'Dog' })
  expect(cmp.find('.message').props('message').toBe('Dog')
  expect(cmp.find('.message').attributes('data-message').toBe('Dog')
})
```

如你所见，`vue-test-utils` 为你提供了许多你可以用于检查 props，类，内容，搜索等方法。它为你提供了更改东西的方法，例如 `setProps`，这很酷。

上面的测试拥有非常具体的断言，其形式为`用'message'类找到元素并且它的'data-message'属性是否设为'Cat'`。

但是，如果我告诉你...你如果使用快照测试则不需要这么做。

基本上，你可以使用快照测试来改写上面的测试：

```js
it("has a message list of 4 elements", () => {
  const cmp = createCmp({ messages: ["msg-1", "msg-2", "msg-3"] });
  expect(cmp.element).toMatchSnapshot();
});

it("has a message prop rendered as a data-message attribute", () => {
  const cmp = createCmp({ message: "Cat" });
  expect(cmp.element).toMatchSnapshot();

  cmp.setProps({ message: "Dog" });
  expect(cmp.element).toMatchSnapshot();
});
```

测试的价值将保持不变甚至可能更大，因为有时在快照中你会发现不相关的回归。

注意，在此测试中，我仅仅使用了 `toMatchSnapshot` 来断言，仅此而已。这使测试变得更加轻松快捷，因为你没有必要再去检查所有特定的东西。

测试的动态发生了变化：你无需再编写特定的断言，而是以所需的方式设置组件的状态并对其进行快照。

快照用于断言**渲染状态**：它们描述在给定状态下如何渲染组件，并在以后的运行中，将对比快照来检查其有效性。

请记住，并非总是需要快照测试。这取决于你需要测试的内容。

### [原文链接](https://vuedose.tips/tips/the-power-of-snapshot-testing)
