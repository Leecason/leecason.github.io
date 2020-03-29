---
title: 巧用 Proxy
date: 2020-03-29
categories:
  - JavaScript
tags:
  - Proxy
  - ES6
  - Vue 3
---

::: tip
1. 默认值 / “零值”
2. 负索引数组
3. 隐藏属性
4. 缓存
5. 枚举和只读
6. 运算符重载
7. cookie 对象
8. Vue3 数据响应式
:::

<!-- more -->

## 简单介绍

Proxy 是 ES6 中新增的功能，它可以用来自定义对象中的操作。

```js
let proxy = new Proxy(target, handler);
```

`target` 代表需要添加代理的对象，`handler` 用来自定义对象中的操作。

## 默认值 / ”零值“

Go 语言中，零值是特定于类型的隐式默认结构值。其思想是提供类型安全的默认值。JavaScript 中未设置属性的默认值是 `undefined`。使用 `Proxy` 可以改变这种情况。

```js
const withZeroValue = (target, zeroValue) => new Proxy(target, {
  get: (obj, prop) => (prop in obj) ? obj[prop] : zeroValue,
});

let pos = {
  x: 4,
  y: 19
};

console.log(pos.x, pos.y, pos.z); // 4, 19, undefined

pos = withZeroValue(pos, 0);

console.log(pos.z, pos.y, pos.z); // 4, 19, 0
// 可用于坐标系，绘图库可以基于数据的结构自动支持 2D 和 3D 渲染，始终将 `z` 的默认值置为 0 而不是 undefined
```

可以扩展 `withZeroValue` 以 Boolean(`false`)，Number(`0`)，String(`''`)，Object(`{}`)，Array(`[]`)等对应的零值。

## 负索引数组

在 JS 中获取数组中的最后一个元素方式一般都写的很冗长且重复，也容易出错。这就是为什么有一个 TC39 提案定义了一个便利属性 `Array.lastItem` 来获取和设置最后一个元素。

如 Python 和 Ruby，使用负组索引更容易访问最后面的元素。可以简单地使用 `arr[-1]` 替代 `arr[arr.length-1]` 访问最后一个元素。

使用 Proxy 来实现：

```js
const negativeArray = (els) => new Proxy(els, {
  get: (target, propKey, receiver) => Reflect.get(target,
    (+propKey < 0) ? String(target.length + +propKey) : propKey, receiver)
});

// handler.get 将会字符串化所有属性。对于数组访问，需要将属性名强制转换为 Number，可以使用一元加运算符简洁地完成。

const unicorn = negativeArray(['🐴', '🎂', '🌈']); // 现在 [-1] 访问最后一个元素，[-2] 访问倒数第二个元素

unicorn[-1] // '🌈'
```

## 隐藏属性

 JS 没有私有属性。`Symbol` 最初是为了启用私有属性而引入的，但后来使用像`Object.getOwnPropertySymbols` 这样的方法使得它们可以被发现。

长期以来的惯例是使用 `_` 加属性名来命名私有属性。但其实还是可以访问的，只是标记为“不要访问”，`Proxy` 提供了一种稍微更好的方法来屏蔽这些属性。

```js
const hide = (target, prefix = '_') => new Proxy(target, {
  has: (obj, prop) => (!prop.startsWith(prefix) && prop in obj),

  ownKeys: (obj) => Reflect.ownKeys(obj)
    .filter(prop => (typeof prop !== 'string' || !prop.startsWith(prefix))),

  get: (obj, prop, rec) => (prop in rec) ? obj[prop] : undefined
});

// hide 函数包装目标对象，并使得从 in 运算符和 Object.getOwnPropertyNames 等方法无法访问带有下划线的属性

let userData = hide({
  firstName: 'Tom',
  mediumHandle: '@tbarrasso',
  _favoriteRapper: 'Drake'
});

console.log(userData._favoriteRapper); // undefined
console.log('_favoriteRapper' in userData); // false
```

除了闭包之外，这可能是最接近真正私有属性的方法，因为它们无法通过枚举，克隆，访问或修改来访问。
但是，它们在开发控制台中是可见的。只有闭包才能解决这种问题。

## 缓存

在客户端和服务器之间同步状态时，数据可能会随着时间的推移而发生变化，很难确切地知道何时重新同步的逻辑。

`Proxy` 启用了一种新方法：根据需要将对象包装为无效（和重新同步）属性。所有访问属性的尝试都首先检查缓存策略，该策略决定返回当前在内存中的内容还是采取其他一些操作。

```js
const ephemeral = (target, ttl = 60) => {
  const CREATED_AT = Date.now();
  const isExpired = () => (Date.now() - CREATED_AT) > (ttl * 1000);

  return new Proxy(target, {
    get: (obj, prop) => isExpired() ? undefined : Reflect.get(obj, prop);
  });
};
```

它使对象上的所有属性在一段时间后都无法访问。将此方法扩展为根据每个属性设置生存时间(TTL)，并在一定的持续时间或访问次数之后更新它并不困难。

## 枚举和只读

包装一个对象以防止扩展或修改。虽然 `object.freeze` 现在提供了将对象渲染为只读的功能，但是可以对这种方法进行扩展，以便访问不存在属性的枚举对象能更好地处理抛出错误。

```js
// 只读

const NOPE = () => {
  throw new Error("Can't modify read-only view");
};

const NOPE_HANDLER = {
  set: NOPE,
  defineProperty: NOPE,
  deleteProperty: NOPE,
  preventExtensions: NOPE,
  setPrototypeOf: NOPE,
};

const readOnlyView = target => new Proxy(target, NOPE_HANDLER);

// 枚举
// 代理上的代理
const createEnum = (target) => readOnlyView(new Proxy(target, {
  get: (obj, prop) => {
    if (prop in obj) {
      return Reflect.get(obj, prop);
    }
    throw new ReferenceError(`Unknown prop '${prop}'`);
  }
}))
```

现在我们可以创建一个 `Object`，如果尝试访问不存在的属性现在不是返回 `undefined`，而是会抛出异常。 这使得在早期捕获和解决问题变得更加容易。

```js
let SHIRT_SIZES = createEnum({
  S: 10,
  M: 15,
  L: 20
});

SHIRT_SIZES.S; // 10
SHIRT_SIZES.S = 15;

// Uncaught Error: Can't modify read-only view

SHIRT_SIZES.XL;

// Uncaught ReferenceError: Unknown prop "XL"
```

虽然其他框架和语言超集(比如 TypeScript)提供 `enum` 类型，但是这个解决方案的独特之处在于，它使用普通Javascript，而不使用特殊的构建工具或转置器。

## 运算符重载

也许从语法上讲，最吸引人的 `Proxy` 用例是重载操作符的能力，比如使用 `handler.has` 来重载 `in` 操作符。

`in` 操作符用于检查指定的属性是否位于指定的对象或其原型链中。这个例子定义了一个 `range` 函数来比较数字。

```js
const range = (min, max) => new Proxy(Object.create(null), {
  has: (_, prop) => (+prop >= min && +prop <= max);
});

const X = 10.5;
const nums = [1, 5, X, 50, 100];

if (X in range(1, 100)) { // true
  // ...
}

nums.filter(n => n in range(1, 10)); // [1, 5]
```

尽管这个用例不能解决复杂的问题，但它确实提供了干净、可读和可重用的代码。
除了 `in` 运算符，我们还可以重载 `delete` 和 `new`。

## cookie对象

如果你曾经与 `cookie` 进行交互，那么必须处理 `document.cookie`。 这是一个不寻常的 API，因为它读出所有 `cookie` 是以分号分隔的 `string`。

```js
_octo=GH1.2.2591.47507; _ga=GA1.1.62208.4087; has_recent_activity=1
```

可以用 `Proxy`:

```js
const getCookieObject = () => {
  const cookies = document.cookie.split(';').reduce((cks, ck) =>
    ({[ck.substr(0, ck.indexOf('=')).trim()]: ck.substr(ck.indexOf('=') + 1), ...cks})
  , {});
  const setCookie = (name, val) => document.cookie = `${name}=${val}`;
  const deleteCookie = (name) => document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

  return new Proxy(cookies, {
	  set: (obj, prop, val) => (setCookie(prop, val), Reflect.set(obj, prop, val)),
    deleteProperty: (obj, prop) => (deleteCookie(prop), Reflect.deleteProperty(obj, prop)),
  });
};

// 此函数返回一个键值对对象，代理对 document.cookie 进行持久性的所有更改

let docCookies = getCookieObject()

docCookies.has_recent_activity              // "1"
docCookies.has_recent_activity = '2'        // "2"
delete docCookies2['has_recent_activity']   // true
```

## Vue3 数据响应式

Vue3.0 中将会通过 `Proxy` 来替换原本的 `Object.defineProperty` 来实现响应式。

简单版的实现：

```js
const onWatch = (obj, setBind, getLogger) => {
  const handler = {
    get (target, property, receiver) {
      getLogger(target, property);
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      setBind(value, property);
      return Reflect.set(target, property, value);
    }
  }
  return new Proxy(obj, handler);
};

let obj = { a: 1 };

let p = onWatch(
  obj,
  (v, property) => {
    console.log(`监听到属性${property}改变为${v}`)
  },
  (target, property) => {
    console.log(`'${property}' = ${target[property]}`)
  }
)
p.a = 2 // 监听到属性a改变
p.a // 'a' = 2
```

之所以 Vue3.0 要使用 `Proxy` 替换原本的 API 原因在于 `Proxy` 无需一层层递归为每个属性添加代理，一次即可完成以上操作，性能更好，并且原本的实现有一些数据更新不能监听到，但是 `Proxy` 可以完美监听到任何方式的数据改变，唯一缺陷可能就是浏览器的兼容性不好了。

## 参考

- [Proxy 的巧用](https://juejin.im/post/5d2e657ae51d4510b71da69d)
