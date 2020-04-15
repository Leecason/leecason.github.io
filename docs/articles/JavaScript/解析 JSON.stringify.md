---
title: 解析 JSON.stringify
date: 2020-03-14
categories:
  - JavaScript
tags:
  - JSON
---

::: tip
1. 三个参数介绍：value, replacer, space
2. 代码演示各种情况的输出
:::

<!-- more -->

## 语法

> JSON.stringify(value[, replacer [, space]])

### `value`

将要序列化成一个 JSON 字符串的值

1.转换值有 `toJSON` 方法，则调用此方法

2.非数组对象的属性不能保证序列化后的顺序

3.布尔值、数字、字符串的包装对象在序列化后转为原始值

4.`undefined`、任意函数以及 `symbol` 值

  - 直接作为 value，返回 `undefined`
  - 作为对象的属性，被忽略
  - 作为数组的属性，返回 `null`

5.循环引用的对象，会抛错误

6.所有以 `symbol` 为属性键的属性都会被忽略，即便第二个参数 `replacer` 中强制指定了该属性

7.`Date` 日期调用自身的 `toJSON` 将其转换为字符串（同 `Date.toISOString()`）

8.`NaN`、`Infinity` 及 `null` 都转为 `null`

9.其他类型的对象，包括 `Map` / `Set` / `WeakMap` / `WeakSet`，仅会序列化可枚举的属性

### `replacer`

可选，自定义序列化结果

1.为函数时，每一项需要走函数处理
2.为数组时，则结果仅包含数组指定的属性
3.为 `null` 或 未提供，则所有项都会被序列化

### `space`

可选，指定缩进用的空白字符串，用于美化输出（pretty-print）

1.为数字，代表多少个空格，上限为 10，小于 1 则没有空格
2.为字符串，取该字符串前 10 位，作为空格
3.未提供，则没有空格

## 示例

```js
// 转换值有 `toJSON` 方法，则调用此方法
let obj = {
  foo: 'foo',
  toJSON: function () {
    return 'bar';
  }
};
JSON.stringify(obj); // '"bar"'
JSON.stringify({x: obj}); // "{"x":"bar"}"
```

```js
// 布尔值、数字、字符串的包装对象在序列化后转为原始值
JSON.stringify(String('123')); // '"123"'
JSON.stringify(Number(456)); // "456"
JSON.stringify(Boolean(true)); // "true"
```

```js
// undefined、任意函数以及 symbol 值

// 1.直接作为 value，返回 undefined
JSON.stringify(undefined); // undefined
JSON.stringify(function () { return 'b' }); // undefined
JSON.stringify(() => 'c'); // undefined

// 2.作为对象的属性，被忽略
// 3.作为数组的属性，返回 null
let obj = {
  a: undefined,
  b () {
    return 'b';
  },
  c: () => 'c',
  D: Symbol('d'),
  e: [
    undefined,
    function () {
      return 'b';
    },
    () => 'c',
    Symbol('d'),
  ],
};
JSON.stringify(obj); // "{"e": [null,null,null,null]}"
```

```js
// 循环引用的对象，会抛错误
let loopObj = {};
loopObj.loopObj = loopObj;
JSON.stringify(loopObj); // Uncaught TypeError: Converting circular structure to JSON
```

```js
// 所有以 symbol 为属性键的属性都会被忽略，即便第二个参数 replacer 中强制指定了该属性

JSON.stringify({[Symbol("foo")]: "foo"}); // "{}"

JSON.stringify({[Symbol.for("foo")]: "foo"}, [Symbol.for("foo")]); // "{}"

JSON.stringify(
  {[Symbol.for("foo")]: "foo"},
  function (k, v) {
    if (typeof k === "symbol"){
      return "a symbol";
    }
  }
); // "{}"
```

```js
// Date 日期调用自身的 toJSON 将其转换为字符串（同 Date.toISOString()）
JSON.stringify(new Date()); // ""2020-03-14T12:53:04.216Z""
```

```js
// NaN、Infinity 及 null 都转为 null
JSON.stringify(NaN); // "null"
JSON.stringify(Infinity); // "null"
JSON.stringify(-Infinity); // "null"
JSON.stringify(null); // "null"
```

```js
// 其他类型的对象，包括 Map / Set / WeakMap / WeakSet，仅会序列化可枚举的属性
JSON.stringify(
  Object.create(
    null,
    {
      x: { value: 'x', enumerable: false },
      y: { value: 'y', enumerable: true },
    },
  ),
); // "{"y":"y"}"
```

```js
let obj = {
  name: 'stringify',
  title: 'json',
};

function replacer (key, val) {
  if (key === 'name') {
    return '';
  }
  return val;
}

// replacer 为函数
JSON.stringify(obj, replacer); // "{"name":"","title":"json"}"
// replacer 为数组
JSON.stringify(obj, ['name']); // "{"name":"stringify"}"
```

```js
let obj = {
  name: 'stringify',
  title: 'json',
};

// space 为数字
JSON.stringify(obj, null, 1000);
// "{
//           "name": "stringify",
//           "title": "json"
// }"

// space 为字符串
JSON.stringify(obj, null, '12345');
// "{
// 12345"name": "stringify",
// 12345"title": "json"
// }"

JSON.stringify(obj, null, '12345678900000');
// "{
// 1234567890"name": "stringify",
// 1234567890"title": "json"
// }"
```
