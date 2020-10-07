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

## 简易版本

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

## promise A+ 规范

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
    if (self.status === PENDING) {
      self.status = RESOLVED;
      self.value = value;
      self.onResolveCallbacks.forEach((cb) => cb(self.value));
    }
  }

  function reject (reason) {
    if (self.status === PENDING) {
      self.status = REJECTED;
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

Promise.prototype.then = function (onFulfilled, onRejected) {
  const self = this;

  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : r => { throw r };

  // 每个 then 函数都需要返回一个新的 promise
  let promise2 = new Promise(function (resolve, reject) {
    if (self.status === RESOLVED) {
      // 标准 2.2.4
      // 确保 onFulfilled 和 onRejected 方法异步执行
      // 且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行
      setTimeout(function () {
        try {
          const x = onFulfilled(self.value);
          // x 可能为普通值，也可能为 promise
          // 判断 x 的值 => promise2 的状态
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    }

    if (self.status === REJECTED) {
      setTimeout(function () { // 异步执行
        try {
          const x = onRejected(self.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    }

    if (self.status === PENDING) {
      self.onResolveCallbacks.push(function (value) {
        setTimeout(function () { // 异步执行
          try {
            const x = onFulfilled(self.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });

      self.onRejectCallbacks.push(function (reason) {
        setTimeout(function () { // 异步执行
          try {
            const x = onRejected(self.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
    }
  });

  return promise2;
};

// 实现兼容多种 promise 的 resolvePromise
// https://promisesaplus.com/#point-47
// 根据标准来实现
function resolvePromise (promise2, x, resolve, reject) {
  if (promise2 === x) { // 标准 2.3.1，x 不能与 promise2 相等
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  // 标记是否已经调用过函数
  // 如果返回的是 promise 在执行其 resolve 或 reject 后不能再 resolve 或 reject
  let called = false;
   // 判断 x 是否为对象或函数，否则直接 resolve
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // 获取 then 方法，获取 x.then 时可能报错，如果抛错需要捕获并调用 promise2 的 reject
      let then = x.then;
      if (typeof then === 'function') { // 如果 then 为函数
        // 如果再使用 x.then 取值时可能会抛错，因为可能是其它库实现的
        // 所以使用已经获取到的 then 方法
        then.call(
          x,
          y => { // 返回值 y 也可能是 promise
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          r => {
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
  } else { // x 为普通值，直接调用 promise 2 的 resolve
    resolve(x);
  }
}
```

## 实现 Promise.prototype.catch

```js
Promise.prototype.catch = function (errFn) {
   // 当 onFulfilled 不为函数时会在内部生成 (value) => value 函数实现透传
  return this.then(null, errFn);
}
```

## 实现 Promise.prototype.finally

- 传入的函数无论 resolve reject 都会执行

```js
Promise.prototype.finally = function (cb) {
  return this.then(data => {
    // 如果 resolve 则传入 data 到下一个的 resolve
    // 如果 cb 返回值为 promise，则需要等待 promise 执行完再把 data 传下去
    return Promise.resolve(cb()).then(() => data);
  }, err => {
    // 同上
    return Promise.resolve(cb()).then(() => { throw err });
  });
}
```

## 实现 Promise.all

- 返回 promise
- 全部 resolve 才 resolve，有一个 reject 就 reject

```js
Promise.all = function (values) {
  return new Promise((resolve, reject) => {
      const result = []; // 存储每一项的结果
      let count = 0; // 记录收集了多少结果

      const processData = (data, i) => { // 收集结果，如果收集完成，则 resolve
        result[i] = data;
        if (++count === values.length) {
          resolve(result);
        }
      };

       // 遍历 values
       // 如果是 promise 就搜集它 resolve 的结果
       // 如果 reject 则 promise.all 也 reject
       // 如果是普通值则直接收集
      for (let i = 0; i < values.length; i++) {
        let curr = values[i];
        if (curr && curr.then && typeof curr.then === 'function') { // 是否为 promise
          curr.then((y) => {
            processData(y, i);
          }, (r) => {
            reject(r);
          });
        } else {
          processData(curr, i);
        }
      }
  });
}
```

## 实现 Promise.race

- 返回 promise
- 如果某一个 resolve 或 reject 了就采用它的结果

```js
Promise.race = function (values) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < values.length; i++) {
      let curr = values[i];
      if (curr && curr.then && typeof curr.then === 'function') { // 是否为 promise
        // 因为 promise 状态改变后不能再 resolve 或 reject
        // 所以某一个第一次 resolve 或 reject 了就会采用它的结果
        curr.then(resolve, reject);
      } else {
        // 如果是普通值则直接 resolve
        resolve(curr);
      }
    }
  });
}
```

## 实现 Promise.allSettled

- 返回 promise
- 所有 resolve 或 reject 的结果都会收集，可以知道每个 promise 的结果

```js
Promise.allSettled = function (values) {
  return new Promise ((resolve, reject) => {
    const result = []; // 存储每一项的结果
    let count = 0;

    const processData = (data, i) => { // 收集结果，如果收集完成，则 resolve
      result[i] = data;
      if (++count === values.length) {
        resolve(result);
      }
    };

    // 遍历 values
    // 如果是 promise 就搜集它 resolve 或 reject 的结果
    // 如果是普通值则直接收集
    for (let i = 0; i < values.length; i++) {
      let curr = values[i];
      if (curr && curr.then && typeof curr.then === 'function') { // 是否为 promise
        curr.then((y) => {
          processData(y, i);
        }, (err) => {
          processData(err, i);
        });
      } else {
        processData(curr, i);
      }
    }
  });
}
```
