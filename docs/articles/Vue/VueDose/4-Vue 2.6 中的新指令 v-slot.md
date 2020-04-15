---
title: 「译」 VueDose Tip 4 - Vue 2.6 中的新指令 v-slot
date: 2020-01-07
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - Vue 指令
  - 文章翻译
prev: ./3-通过 PurgeCss 移除未使用的 CSS
next: ./5-使用 v-bind 和 v-on 的自适应组件
---

Vue.js 的 2.6.0-beta.3 版本，启用了一项新功能，可以进一步简化作用域插槽。

它引入了一种新的 `v-slot` 指令及其简写，如 [`RFC-0001`](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-new-slot-syntax.md) 和 [`RFC-0002`](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0002-slot-syntax-shorthand.md) 中所述。

为了了解它如何简化语法，让我们看看它在当前作用域插槽中的情况。假设你有一个 `List` 组件，该组件在它的作用域内暴露了一个过滤列表。

你使用该作用域插槽列表的方式类似于：

```vue
<template>
  <List :items="items">
    <template slot-scope="{ filteredItems }">
      <p v-for="item in filteredItems" :key="item">{{ item }}</p>
    </template>
  </List>
</template>
```

List 组件的实现方式不太相关，但你可以在此 [CodeSandbox](https://codesandbox.io/s/wwzx6zw47w) 中查看它的示例。

使用 `v-slot`，你可以直接在组件标签上写入插槽的作用域，而无需格外层。

```vue
<template>
  <List v-slot="{ filteredItems }" :items="items">
    <p v-for="item in filteredItems" :key="item">{{ item }}</p>
  </List>
</template>
```

请记住 `v-slot` 只能使用在组件和 `template` 标签上，不能使用在普通的 HTML 标签中使用。

这样，在很难推导出作用域来源的嵌套作用域插槽时，代码特别易读。

`v-slot` 指令同样引入了一种合并 `slot` 和 `scoped-slots` 指令的方式，通过冒号 `:` 分隔它们。

例如，此示例取自 [vue-promised](https://github.com/posva/vue-promised)。

```vue
<template>
  <Promised :promise="usersPromise">
    <p slot="pending">Loading...</p>

    <ul slot-scope="users">
      <li v-for="user in users">{{ user.name }}</li>
    </ul>

    <p slot="rejected" slot-scope="error">Error: {{ error.message }}</p>
  </Promised>
</template>
```

可以使用 `v-slot` 改写为：

```vue
<template>
  <Promised :promise="usersPromise">
    <template v-slot:pending>
      <p>Loading...</p>
    </template>

    <template v-slot="users">
      <ul>
        <li v-for="user in users">{{ user.name }}</li>
      </ul>
    </template>

    <template v-slot:rejected="error">
      <p>Error: {{ error.message }}</p>
    </template>
  </Promised>
</template>
```

最后，`v-slot` 有一个 `#` 符号作为简写，所以之前的示例可以被改写为：

```vue
<template>
  <Promised :promise="usersPromise">
    <template #pending>
      <p>Loading...</p>
    </template>

    <template #default="users">
      <ul>
        <li v-for="user in users">{{ user.name }}</li>
      </ul>
    </template>

    <template #rejected="error">
      <p>Error: {{ error.message }}</p>
    </template>
  </Promised>
</template>
```

请记住，默认的 `v-slot` 的简写是 `#default`。

### [原文链接](https://vuedose.tips/tips/remove-unused-css-with-purge-css)
