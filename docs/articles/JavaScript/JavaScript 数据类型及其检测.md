---
title: JavaScript 数据类型及其检测
date: 2020-04-05
categories:
  - JavaScript
tags:
  - 数据类型
---

::: tip
1. 数据类型
2. 4 种数据类型检测方法比较
:::

<!-- more -->

## 基础数据类型

`Undefined` `Null` `String` `Number` `Boolean` `Symbol`

- 值不可变
- 存放在**栈内存**，占据空间小，大小固定
- `==` 只进行值的比较，会进行数据类型转换，`===` 会比较类型和值

## 引用数据类型

对象类型

- 值是可变的（对象属性）
- 同时保存在**栈区**和**堆区**，占据空间大，大小不固定。存在栈中会影响程序运行性能。在栈中存储指针，该指针指向堆中实体起始地址。当解释器寻找引用时，会首先检索其在栈中的地址，取得地址后在堆中获得实体。
- 比较是引用的比较

## 检测数据类型

### `typeof`

返回一个表示数据类型的字符串，返回结果包括 `string` `number` `boolean` `object` `undefined` `symbol` `function` `bigint`

**弊端:**

```js
typeof NaN; // number
typeof Infinity; // number

typeof null; // object    浏览器的 Bug: 所有的值在计算中都以二进制编码存储，浏览器中把前三位 000 的当对象，而 null 的二进制前三位是 000，所以结果为对象，但它不是对象，是空对象指针，是基础数据类型

typeof []; // object
typeof new Date(); // object
typeof new RegExp(); // object
// 无法区分 object
```

判断一个值是否为对象:

```js
// https://github.com/vuejs/vue/blob/dev/src/shared/util.js#L41
function isObject (obj) {
  return obj !== null && typeof obj === 'object');
}
```

### `instanceof`

判断 A 是否是 B 的实例，**用来测试一个对象在其原型链中是否存在一个构造函数的 prototype 属性。**

```js
[] instanceof Array; // true
{} instanceof Object; // true
[] instanceof Object; // true
new Date() instanceof Date; // true
new RegExp() instanceof RegExp; // true

// es6 中还可以
Array.isArray([]); // true
```

**弊端:**

- 检测的实例必须是引用数据类型，对于基础数据类型，字面量创建出来的不能检测，构造函数创建的实例可以检测：

```js
1 instanceof Number; // false
new Number(1) instanceof Number; // true

// 从严格意义上来讲，只有构造函数创建出来的结果才是标准的对象数据类型，也是标准的 Number 类的实例，字面量创建出来的结果是基础数据类型，不是严谨的实例，但是由于 JS 松散的特点，可以使用 Number.prototype 上提供的方法
```

- 只要在当前实例的原型链上，检测结果都为 `true`，**在类的原型继承中，检测出来的结果未必准确**

```js
[] instanceof Array; // true
[] instanceof Object; // true

function fn () {}
fn instanceof Function; // true
fn instanceof Object; // true
```

- 不能检测 `null` 和 `undefined`，它们所属类为 Null 和 Undefined，但是被浏览器保护起来了，不允许我们在外面访问

### `constructor`

`constructor` 与 `instanceof` 很类似，但是 `constructor` 检测 Object 与 `instanceof` 不一样，并且可以检测基础数据类型。

一般 `实例.constructor === 类.prototype.constructor`

```js
([]).constructor === Array; // true
([]).constructor === Object; // false
(1).constructor === Number; // true
```

**弊端:**

- `null` 和 `undefined` 是无效的对象，因此没有 `constructor`，需要通过其它方式来判断
- 函数的 `constructor` 是不稳定的，主要体现在类的原型重写，因为 JS 的 `constructor` 是不被保护的，在重写时很容易将原本的 `constructor` 覆盖，检测结果就不准确了

```js
function Fn () {}
Fn.prototype = new Array();
var f = new Fn()
f.constructor; // Array
```

### `Object.prototype.toString.call()`

**最准确最常用方式**，先获取对象的 `toString` 方法，在调用时让 `this` 指向第一个参数

`toString` 重要说明:

- 本意是转换为字符串
- 对于 `Number` `String` `Boolean` `Array` `Date` `RegExp` `Function` 原型上的 `toString` 方法都是把当前类型转换为字符串类型（它们的作用仅仅是用来转换字符串）
- `Object` 上的 `toString` 不是用来转换为字符串的

`Object` 上的 `toString` 作用是返回当前调用函数的主体所属的类的详细信息 `[object Object]`，第一个是代表当前实例是对象数据类型（固定），第二个是代表当前 `this` 所属的类为 `Object`

返回值: `[object 当前被检测实例所属的类]`

```js
Object.prototype.toString.call('') ;   // [object String]
Object.prototype.toString.call(1) ;    // [object Number]
Object.prototype.toString.call(true) ; // [object Boolean]
Object.prototype.toString.call(undefined) ; // [object Undefined]
Object.prototype.toString.call(null) ; // [object Null]
Object.prototype.toString.call(new Function()) ; // [object Function]
Object.prototype.toString.call(new Date()) ; // [object Date]
Object.prototype.toString.call([]) ; // [object Array]
Object.prototype.toString.call(new RegExp()) ; // [object RegExp]
Object.prototype.toString.call(new Error()) ; // [object Error]
Object.prototype.toString.call(document) ; // [object HTMLDocument]
Object.prototype.toString.call(window) ; //[object global] window 是全局对象 global 的引用
```

**弊端：**

- 只能检测内置类
- 自定义类都返回 `[object Object]`

```js
// vue 中的工具方法
// https://github.com/vuejs/vue/blob/dev/src/shared/util.js#L48
const _toString = Object.prototype.toString

export function toRawType (value) {
  return _toString.call(value).slice(8, -1)
}

export function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

export function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}
```

## 参考

- [JavaScript 数据类型及其检测](https://github.com/ljianshu/Blog/issues/4)
- [JS中数据类型检测四种方式的优缺点](https://juejin.im/post/5e88a683f265da47db2e38b8)
- [Vue](https://github.com/vuejs/vue/)
