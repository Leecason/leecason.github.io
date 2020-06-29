---
title: 手写 JS 基础 API
date: 2018-08-01
categories:
  - JavaScript
tags:
  - ES6
  - 手写源码系列
---

::: tip
1. 实现 new 操作符
2. 实现 let、const
3. 手写 call、apply
4. 手写 bind
5. 实现 instanceof
6. 数组扁平化
:::

<!-- more -->

## 实现 new 操作符

```js
function myNew (fn, ...args) {
  let obj = Object.create(fn.prototype); // 相当于 obj.__proto__ = foo.prototype

  let result = fn.apply(obj, args); // 执行构造方法, 绑定新 this

  // 如果构造方法 return 了一个对象，那么就返回该对象，否则返回创建的新对象
  return Object.prototype.toString.call(result) === '[object Object]' ? result : obj;
}
```

## 实现 let

```js
(function () {
  for (var i = 0; i < 3; i++) {
    console.log(i); // 0 1 2
  }
})();

console.log(i); // Uncaught ReferenceError: i is not defined
```

## 实现 const

```js
function myConst (key, value) {
  Object.defineProperty(window, key, {
    enumerable: false,
    configurable: false,
    get: function () {
      return value;
    },
    set: function (newVal) {
      if (newVal !== value) {
        throw new TypeError('Assignment to constant variable.')
      } else {
        return value;
      }
    },
  });
}

myConst('obj', { a: 1 });
obj.a // 1
obj = {};  // Uncaught TypeError: Assignment to constant variable
```

## 手写 call

```js
Function.prototype.myCall = function (obj, ...args) {
  if (typeof this !== 'function') {
    throw new Error('error')
  }

  const fn = Symbol('fn'); // 防止 fn 覆盖
  const context = obj || window;
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn]; // 删除 fn 属性
  return result;
}
```

## 手写 apply

```js
Function.prototype.myApply = function (obj, args) { // 在 call 基础上改变入参即可
  if (typeof this !== 'function') {
    throw new Error('error');
  }

  const fn = Symbol('fn'); // 防止 fn 覆盖
  const context = obj || window;
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn]; // 删除 fn 属性
  return result;
}
```

## 手写 bind

```js
Function.prototype.myBind = function (context, ...args1) {
  if (typeof this !== 'function') {
    throw new Error('error');
  }

  const fn = this;

  const bound = function (...args2) {
    const args = args1.concat(args2);
    const ctx = this instanceof fn // 是否为 new 调用
      ? this
      : context

    fn.apply(ctx, args);
  }

  bound.prototype = Object.create(fn.prototype);

  return bound;
}
```

## 实现 instanceof

```js
function myInstanceof (l, r) {
  const R = r.prototype; // 原型对象
  let L = l.__proto__;

  while (L) {
    if (L === R) {
      return true;
    }
    L = L.__proto__;
  }

  return false;
}
```

## 数组扁平化

```js
const arr = [1, [1, 2], [1, 2, 3]];
// 1. es6 的 flat
const result = arr.flat(Infinity);

// 2.
const str = JSON.stringify(arr);
// 会有 JSON.stringify 的弊端
// 例如将数组中的 symbol，function，undefined 转为 null
const result = JSON.parse(str);

// 3.
function flat (arr) {
  const result = []；
  for (const item of arr) {
    Array.isArray(item) ? result = result.concat(flat(item)) : result.push(item);
  }
  return result;
}

// 4.
function flat (arr) {
  return arr.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? flat(item) : item);
  }, []);
}

// 5.
function flat (arr) {
  let result = [...arr];
  while (result.some(Array.isArray)) {
    result = [].concat(...result);
  }
  return result;
}
```

