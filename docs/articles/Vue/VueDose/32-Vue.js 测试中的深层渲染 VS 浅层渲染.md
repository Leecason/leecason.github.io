---
title: 「译」 VueDose Tip 32 - Vue.js 测试中的深层渲染 VS 浅层渲染
date: 2020-03-04
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - Vue 3
  - VueDose
  - 文章翻译
prev: ./31-在 Vue.js 3 中使用 Composition API 构建 i18n 插件
next: ./33-在 Vue.js 组件中使用 Web Worker 获得极致性能
---

测试仍然是现在最具争议的开发主题之一，深层渲染与浅层渲染也不例外。在这个 Tip 中，我想说明为什么以及何时使用它们。

## 深层渲染

顾名思义，深层渲染将在给定根组件的情况下渲染所有组件树。

为了说明这一点，有下面的 `UserList.vue` 组件：

```vue
<template>
  <ul>
    <li v-for="user in users" :key="user">
      {{ user }}
    </li>
  </ul>
</template>

<script>
  export default {
    props: {
      users: Array
    }
  };
</script>
```

在 `App.vue` 中这样使用：

```vue
<template>
  <div>
    <h3>User List</h3>
    <UserList :users="['Rob Wesley']" />
  </div>
</template>

<script>
  import UserList from "./UserList";

  export default {
    components: { UserList }
  };
</script>
```

它将得到由两个组件的组合 DOM 树：

```html
<div>
  <h3>User List</h3>
  <ul>
    <li>
      Rob Wesley
    </li>
  </ul>
</div>
```

为了验证它，你可以使用 Jest 快照。如果你不太了解快照，可以查看深入了解[快照测试](/articles/Vue/VueDose/9-快照测试（Snapshot%20Testing）在%20Vue.js%20中的威力)的文章。

使用 [@vue/test-units](https://vue-test-utils.vuejs.org/)（官方 Vue.js 测试库时），你可以使用 `mounted` 方法来执行深层渲染。

通过这些，你可以想象之前的快照是从具有以下形状的测试中获取的：

```js
import { mount } from "@vue/test-utils";
import App from "@/App";

describe("App.vue", () => {
  it("Deeply renders the App component", () => {
    const wrapper = mount(App);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
```

## 浅层渲染

与深层渲染相反，浅层渲染仅渲染要测试的组件，而无需进入更深层次。

要实现浅层渲染，可以使用 @vue/test-units 中的 `shallowMount` 方法。

如果你用浅层渲染重写之前的测试：

```js
import { shallowMount } from "@vue/test-utils";
import App from "@/App";

describe("App.vue", () => {
  it("Shallow renders the App component", () => {
    const wrapper = shallowMount(App);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
```

你会看到生成的快照是：

```html
<div>
  <h3>User List</h3>
  <userlist-stub users="Rob Wesley"></userlist-stub>
</div>
```

发生了什么？Jest 自动创建了 `<userlist-stub>`标签，而不是创建和渲染 `UserList` 组件。

请注意一点：`UserList` 组件没有创建，这意味着完全不使用该组件。没有使用它的 `props` 和生命周期...什么都没使用，你马上将要知道为什么这很重要。

## 用哪一种以及何时使用

回顾一些测试理论，测试应该是：

- 独立于其它
- 只专注于测试
- 易于维护且稳定
- 有价值

正如你已经看到的那样，深层渲染时你已经违反了前三点，因为每次子组件更改时，你的测试都会失败。

此外，假设子组件具有副作用，例如与 store 交互或调用 API。这可能会更坏，因为结果可能会出乎意料。

这就是为什么我的看法是：**大多数适合都使用浅层渲染**

问题是：*何时不使用它呢*？我仅会在将一组组件作为一个单元进行测试时，使用 `mount`，这时候将它们视为一个分子。

想想 `UserList` 和 `UserListItem`，或者 `Tab`，`TabGroup` 和 `TabItem`。对于这些情况，当你要测试整个整合的交互时，使用深层渲染是有意义的。

### [原文链接](https://vuedose.tips/tips/deep-vs-shallow-rendering-in-vuejs-tests)
