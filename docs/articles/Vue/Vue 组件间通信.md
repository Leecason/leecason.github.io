---
title: Vue 组件间通信
date: 2019-05-10
categories:
  - Vue
tags:
  - Vue 2
  - Vuex
---

::: tip
1. 父子通信
2. 兄弟通信
3. 跨级通信
:::

<!-- more -->

> 组件是 vue.js最强大的功能之一，而组件实例的作用域是相互独立的，这就意味着不同组件之间的数据无法相互引用

## `props/$emit`

父组件向子组件传值: `props`
子组件向父组件传值（以事件的形式）: `$emit`

## 事件总线

通过一个空的 Vue 实例作为中央事件总线，用它来触发和监听事件

```js
const EventBus =new Vue();
EventBus.$emit(事件名, 数据);
EventBus.$on(事件名, data => {});
```

项目笔记大时，可以通过状态管理解决方案 vuex

## Vuex

Vuex 实现了单向数据流，在全局拥有一个 State 存放数据，要更改数据必须通过 Mutation，而异步操作必须通过 Action，Action 也是通过 Mutation 来修改 State 的，最后根据 State 的变化，渲染到视图上

## $attrs/$listeners

`$attrs` 包含父作用域中不被 prop 所识别（且获取）的特性绑定（class、style 除外），可以通过 `v-bind=$attrs` 传入内部组件，通常配合 `inheritAttrs` 使用，**父组件中绑定的非 props 属性**

`$listeners` 包含父作用域中不含 `.native` 修饰的 v-on 事件监听器，可以通过 `v-on=$listeners` 传入内部组件，**父组件中绑定的非原生事件**

## provide/inject

需一起使用，允许一个组件向子孙后代注入一个依赖，主要解决了跨组件通信问题

provide 和 inject 绑定并不是可响应的，但是如果是可监听的对象，那么其属性是可响应的

可以使用 `Vue.observable` 来优化响应式 provide

## $parent/$children 与 ref

`$parent/$children` 访问父/子实例

`ref` 在普通 DOM 上使用则引用指向 DOM，若用在子组件上，引用指向子组件实例

## 总结

父子通信: 父 -> 子 `props`，子 -> 父 `$emit`，`$parent/$children`，`ref`，`provide/inject`，`$attrs/$listeners`

兄弟通信: EventBus，Vuex

跨级通信：EventBus，Vuex，`provide/inject`，`$attrs/$listeners`
