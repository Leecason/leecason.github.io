---
title: Symbol.iterator
date: 2020-04-14
categories:
  - JavaScript
tags:
  - iterator
  - ES6
---

::: tip
1. iterator 作用
2. iterator 遍历过程
3. 默认 iterator 接口
4. 调用 iterator 场合
:::

<!-- more -->

## iterator 作用

- 为各种数据接口（`Array`、`Object`，ES6 新增的 `Map`、`Set`）提供一个统一、简便的访问接口
- 使得数据结构的成员能够按某种次序排列
- ES6 创造了一种新的遍历命令 `for...of` 循环，iterator 接口主要供 `for...of` 消费

## iterator 遍历过程

- 创建一个指针对象，指向当前数据结构的起始位置，遍历器本身就是一个指针对象
- 第一次调用指针对象的 `next`，指针指向数据结构的第一个成员
- 第二次调用指针对象的 `next`，指针指向数据结构的第二个成员
- 不断调用指针对象的 `next`，直至它指向数据结构的结束位置

每次调用 `next`，都返回一个包含 `value` 和 `done` 的对象

- `value`: 当前成员的值
- `done`: 表示遍历是否结束

## 默认 iterator 接口

当使用 `for...of` 时就会自动去找 iterator 接口

一种数据结构只要部署了 iterator 接口，我们就称其为“可遍历的”

ES6 规定，默认的 iterator 部署在 `Symbol.iterator`

ES6 有些数据结构原生具备 iterator 接口（比如数组），不用做任何处理，就可以被 `for...of` 遍历，一些数据结构则没有（比如对象）。

原生具备了 iterator 接口的数据结构:

- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象
- NodeList 对象

对象之所有没有默认 iterator 接口，是因为遍历的顺序不确定，需要开发者手动指定。本质上，遍历器是一种线性处理，部署了遍历器接口就相当于部署一种线性转换

如果 `Symbol.iterator` 方法对应的不是遍历器生成函数（即返回一个遍历器对象），则会报错

```js
var obj = {};

obj[Symbol.iterator] = () => 1;

[...obj] // TypeError: [] is not a function
```

## 调用 iterator 的场合

- 解构赋值
- 扩展运算符，只要某个数据结构部署了 iterator 接口，就可以对它使用扩展运算符转为数组
- `yield*` 后面跟的是一个可遍历结构，它会调用该结构的遍历器接口
- 任何接受数组为参数的场合，因为数据的遍历会调用遍历器接口
  - `for...of`
  - `Array.from`
  - `Map()`, `Set()`, `WeakMap()`, `WeakSet()`
  - `Promise.all`
  - `Promise.race`

## `for...of` 优点

- 语法简洁
- 不同于 `forEach`, 可以使用 `break`, `continue`, `return`
- 提供了遍历所有数据结构的统一操作接口

## 参考

- [ECMAScript 6 入门 by 阮一峰](http://bes6.ruanyifeng.com/#docs/iterator)
