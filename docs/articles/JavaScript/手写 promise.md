---
title: 手写 Promise
date: 2018-08-23
categories:
  - JavaScript
tags:
  - Promise
  - ES6
  - 手写源码系列
---

## Promise A+ 规范

- [Promises/A+](https://promisesaplus.com/)

## 特点

- `Promise` 的状态为三种之一: **等待态（Pending）**、**执行态（Fulfilled）**和**拒绝态（Rejected）**，状态不受外界影响，状态一旦改变，就不会再变。

- `Promise` 存放两个变量：`value(值)` 和 `reason(据因)`

- `Promise` 实例上有 `then` 方法，`then` 方法返回一个新的 `Promise`，支持链式调用

优点：

- 解决回调地狱

- 解决并发问题

缺点：

- 基于回调

- 无法中止

## 实现

### 简易版本

```js
const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

// 构造函数接受一个 executor，new Promise 时同步执行
// 一般在里面执行异步操作，执行完后调用 resolve 或 reject
function Promise (executor) {
  const self = this;

  this.status = PENDING; // 一开始的状态为 pending
  this.value = undefined; // 保存 resolve 的值
  this.reason = undefined; // 保存 reject 据因

  // 收集 then 中的回调，状态改变时依次调用，订阅发布模式
  self.onResolveCallbacks = [];
  self.onRejectCallbacks = [];

  function resolve (value) {
    if (self.state === PENDING) {
      self.state = RESOLVED;
      self.value = value;
      self.onResolveCallbacks.forEach((cb) => cb(self.value));
    }
  }

  function reject (reason) {
    if (self.state === PENDING) {
      self.state = REJECTED;
      self.reason = reason;
      self.onRejectCallbacks.forEach((cb) => cb(self.reason));
    }
  }

  try { // executor 可能出错，需要捕获并 reject
    executor(resolve, reject); // 同步执行 executor
  } catch (e) {
    reject(e);
  }
}

// 实现 then 函数
Promise.prototype.then = function (onFulfilled, onRejected) {
  const self = this;

  // 判断是否为函数，因为这两个参数为可选参数，当不是函数时，需要创建一个函数实现透传
  // Promise.resolve(123).then().then().then((v) => console.log(v))
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : r => r;

  // 异步情况
  if (self.state === PENDING) {
    self.onResolveCallbacks.push(onFulfilled);
    self.onRejectCallbacks.push(onRejected);
  }

  // 同步情况
  if (self.state === RESOLVED) {
    onFulfilled(self.value);
  }

  if (self.state === REJECTED) {
    onRejected(self.reason);
  }
}
```

### promise A+ 规范

```js
const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function Promise (executor) {
  const self = this;

  this.status = PENDING; // 一开始的状态为 pending
  this.value = undefined; // 保存 resolve 的值
  this.reason = undefined; // 保存 reject 据因

  // 收集 then 中的回调，状态改变时依次调用，订阅发布模式
  self.onResolveCallbacks = [];
  self.onRejectCallbacks = [];

  function resolve (value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }

    setTimeout(() => { // 异步执行
      if (self.state === PENDING) {
        self.state = RESOLVED;
        self.value = value;
        self.onResolveCallbacks.forEach((cb) => cb(self.value));
      }
    }, 0);
  }

  function reject (reason) {
    setTimeout(() => { // 异步执行
      if (self.state === PENDING) {
        self.state = REJECTED;
        self.reason = reason;
        self.onRejectCallbacks.forEach((cb) => cb(self.reason));
      }
    }, 0);
  }

  try { // executor 可能出错，需要捕获并 reject
    executor(resolve, reject); // 同步执行 executor
  } catch (e) {
    reject(e);
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  const self = this;
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : r => r;

  // 每个 then 函数都需要返回一个新的 promise
  let promise2 = new Promise(function (resolve, reject) {
    if (self.state === RESOLVED) {
      setTimeout(function () { // 异步执行
        try {
          const x = onFulfilled(self.value);
          // x 可能为普通值，也可能为 promise
          // 判断 x 的值 => promise2 的状态
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    }

    if (self.state === REJECTED) {
      setTimeout(function () { // 异步执行
        try {
          const x = onRejected(self.reason);
          resolutionProcedure(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    }

    if (self.state === PENDING) {
      self.onResolveCallbacks.push(function (value) {
        setTimeout(function () { // 异步执行
          try {
            const x = onFulfilled(self.value);
            // 若 x 也为 promise，可能是第三方库实现的 thenable 对象
            resolutionProcedure(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });

      self.onRejectCallbacks.push(function (reason) {
        setTimeout(function () { // 异步执行
          try {
            const x = onRejected(self.reason);
            resolutionProcedure(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
    }
  });

  return promise2;
}

// 实现兼容多种 promise 的 resolutionProcedure
// https://promisesaplus.com/#point-47
// 根据标准来实现
function resolutionProcedure (promise2, x, resolve, reject) {
  if (primise2 === x) { // 标准 2.3.1，x 不能与 promise2 相等
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  if (x instanceof Promise) { // 标准 2.3.2
    // 如果 x 状态还没确定，需要等待直到 x 状态改变
    if (x.status === PENDING) {
      x.then(function (value) {
        resolutionProcedure(promise2, value, resolve, reject);
      }, reject);
    } else {
      x.then(resolve, reject);
    }
  }

  let called = false; // 标记是否已经调用过函数
   // 2.3.3
   // 判断 x 是否为对象或函数，否则直接 resolve
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // 获取 then 方法
      let then = x.then;
      if (typeof then === 'function') { // 如果 then 为函数
        then.call(
          x,
          function (v) {
            if (called) return;
            called = true;
            resolutionProcedure(promise2, v, resolve, reject);
          },
          function (r) {
            if (called) return;
            called = true;
            reject(r);
          })
      } else { // 如果 then 不为函数，将 x 传入 resolve
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else { // 2.3.4
    resolve(x);
  }
}
```
