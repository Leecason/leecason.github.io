---
title: 使用 TypeScript 高级技巧实现 Vue3 Ref 类型
date: 2020-08-28
categories:
  - TypeScript
  - Vue
tags:
  - 手写源码系列
  - Vue3
---

::: tip
1. TS 高级技巧：范型反向推导、索引签名、条件类型、keyof、infer
2. 实现 Ref 类型
3. 源码
:::

<!-- more -->

## TS 高级技巧

### 范型反向推导

```ts

// 正向推导
type value<T> = T;
type numberVal = value<number> // number
type stringVal = value<string> // string

// 反向推导
declare function add<T> (val: T): T
let n:string;
add(n) // add<string> (val: string): string
```

### 索引签名

```ts
type Person = {
  name: string
  age: number
};

type personAge = Person['age'] // number
```

### 条件类型

```ts
type isString<T> = T extends string ? true : false
type A = isString<'1'> // true

type typeName<T> = T extends string
  ? 'string'
  : T extends number
    ? 'number'
    : 'object';

type B = typeName<'1'> // 'string'
type C = typeName<2> // 'number'
type D = typeName<true> // 'object'
```

### keyof

```ts
type Keys = keyof Person // 'name | age'
type copyPerson = { // 拷贝 Person 的类型
  [k in keyof Person]: Person[k]
}
type partialPerson = { // 实现 Partial<Person>
  [k in keyof Person]?: Person[k]
}
```

### infer

> 只能用在条件类型中

```ts
type Flatten<T> = T extends Array<infer R> ? R : T; // 获取数组成员类型
type Unpromisify<T> = T extends Promise<infer R> ? R : T; // 获取 Promise 的值
type ParamType<T> = T extends (param: infer P) => any ? P : T; // 获取函数参数类型
type ReturnType<T> = T extends (...args: any[]) => infer P ? P : any; // 获取函数返回值类型
```

## 实现 Ref 类型

### `Ref` 类型定义为：

```ts
type Ref<T> = {
  value: T
}
```

### `ref` 函数定义为：

```ts
declare function ref<T>(value: T): Ref<T>
```

用例：

```ts
ref(2) // Ref<number>

ref(ref(ref(ref(ref(2))))) // Ref<number>

ref({ a: ref('1'), b: ref(2) }) // Ref<{ a: string, b: number }>
```

### UnwrapRef

如果 `T` 是 `object` 类型且内部字段也有 `Ref` 类型，也会被解包，所以再被 `Ref` 包裹前对内部进行解包：

```ts
declare function ref<T>(value: T): Ref<UnwrapRef<T>> // 解包 T
```

目标为实现这个 `UnwrapRef` 类型。

使用 infer 进行一层解包：

```ts
type UnwrapRef<T> = T extends Ref<infer R> ? R : T

UnwrapRef<Ref<number>> // number
```

如果 `R` 还是 `Ref` 类型则递归使用 `UnwrapRef` 进行解包：

```ts
// ❌ Type alias 'UnwrapRef' circularly references itself.ts(2456)
type UnwrapRef<T> = T extends Ref<infer R>
  ? UnwrapRef<R>
  : T
```

报错了，不允许循环引用自己。

可以使用笨方法，定义多个 `UnwrapRef`：

```ts
type UnwrapRef<T> = T extends Ref<infer R>
  ? UnwrapRef2<R>
  : T

type UnwrapRef2<T> = T extends Ref<infer R>
  ? UnwrapRef3<R>
  : T

type UnwrapRef3<T> = T extends Ref<infer R>
  ? UnwrapRef4<R>
  : T

...
```

这样会写很多同样的代码，代码不够优雅，也无法覆盖所有的嵌套情况，因为无法确定用户会嵌套多少层。

### 递归 UnwrapRef

但是对象的属性类型引用对象自身的类型在 TS 中是可以的：

```ts
// ✅
type Person = {
  name: string
  age: number
  child: Person
}
```

所以我们可以使用对象不同的键来对应不同的解包逻辑，使用条件类型加索引签名决定逻辑分支，重写 `UnwrapRef`:

```ts
type UnwrapRef<T> = {
  ref: T extends Ref<infer R> ? UnwrapRef<R> : T,
  other: T
}[T extends Ref<any> ? 'ref' : 'other']
```

## 支持对象

新增 `object` 类型的解包逻辑分支：

```ts{2, 5-9}
type UnwrapRef<T> = {
  ref: T extends Ref<infer R> ? UnwrapRef<R> : T,
  object: object: { [k in keyof T]: UnwrapRef<T[k]>},
  other: T,
}[T extends Ref<any>
  ? 'ref'
  : T extends object
      ? 'object'
      : 'other']
```

后续要新增其它的逻辑分支（如数组，计算属性等）也会变得很容易。

### 完整代码

```ts
type Ref<T> = {
  value: T
}

type UnwrapRef<T> = {
  ref: T extends Ref<infer R> ? UnwrapRef<R> : T,
  object: object: { [k in keyof T]: UnwrapRef<T[k]>},
  other: T,
}[T extends Ref<any>
  ? 'ref'
  : T extends object
      ? 'object'
      : 'other']

declare function ref<T>(value: T): T extends Ref<any> ? T : Ref<UnwrapRef<T>> // 此处优化：如果 T 已经是 Ref 类型，则不需要解包，直接返回即可
```

### 源码

[ref](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/ref.ts)

[递归 UnwrapRef 的 commit](https://github.com/vuejs/vue-next/commit/c6b7afcc23faefd8c504c3c5705ecb5b0f4be0fd#diff-2751769c8b46d7bef1f06b254c0257f1)

## 参考

- [Vue3 跟着尤雨溪学 TypeScript 之 Ref 类型从零实现](https://juejin.im/post/6844904126283776014#heading-12)
- [typescript高级：infer关键字](https://juejin.im/post/6844904068083613704)
