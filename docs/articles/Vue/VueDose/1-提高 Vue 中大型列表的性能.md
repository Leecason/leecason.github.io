---
title: 「译」 VueDose Tip 1 - 提高 Vue 中大型列表的性能
date: 2020-01-01
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 性能优化
  - 文章翻译
next: ./2-评估 Vue 应用程序中的运行时性能
---

通常，我们需要获取对象列表，例如 user 列表，item 列表，articles 列表等等。

有时，我们甚至不需要修改它们，仅显示它们或者将它们保存在全局 state 中（例如 `Vuex`）。一段用于获取该列表的简单代码如下所示:

```js
export default {
  data: () => ({
    users: {}
  }),
  async created() {
    const users = await axios.get("/api/users");
    this.users = users;
  }
};
```

默认情况下，`Vue` 会使数组中的每个对象的每第一级的属性变为响应式。

对于大型对象而言，这可能会很昂贵。是的，有时候这些列表使分页的，但是你可能只在前端列出了其他列表。

`Google Maps` 的 `markers` 通常就是这种情况，实际上它们是很庞大的对象。

因此，在这些情况下，如果我们阻止 `Vue` 让这些列表变为响应式，那么我们就可以获得一些性能。我们可以让列表在添加到组件之前使用 `Object.freeze` 来做到这一点：

```js
export default {
  data: () => ({
    users: {}
  }),
  async created() {
    const users = await axios.get("/api/users");
    this.users = Object.freeze(users);
  }
};
```

请记住，这同样适用于 `Vuex`：

```js
const mutations = {
  setUsers(state, users) {
    state.users = Object.freeze(users);
  }
};
```

顺便说一句，如果你需要修改这个数组，你仍然可以通过创建一个新的数组来做到。例如，为了添加一项，你可以通过以下方式进行操作：

```js
state.users = Object.freeze([...state.users, user]);
```

你是否想知道**性能提升**了多少？ 我们将在下一个技巧中看到它，请继续关注！

### [原文链接](https://vuedose.tips/tips/improve-performance-on-large-lists-in-vue-js/)
