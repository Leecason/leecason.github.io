---
title: TypeScript： Type vs Interface
date: 2020-02-21
categories:
  - TypeScript
prev: ./进阶使用.md
---

::: tip
比较 Type 与 Interface 在使用时的相似和不同。
:::

<!-- more -->

## 相似处

### 定义

```ts
interface IAnimal {
  name: string;
}

type Animal = {
  name: string;
};
```

### 泛型

```ts
interface IAnimal<P = string> {
  name: P;
}

type Animal<P = string> = {
  name: P;
};
```

### 合并

```ts
type Robot = {
  power: number;
};

interface IRobot {
  name: string;
}

interface IRoboAnimal1 extends IAnimal, IRobot {}
interface IRoboAnimal2 extends IAnimal, Robot {}
interface IRoboAnimal3 extends Animal, IRobot {}
interface IRoboAnimal4 extends Animal, Robot {}

type RoboAnimal1 = Animal & Robot;
type RoboAnimal2 = Animal & IRobot;
type RoboAnimal3 = IAnimal & Robot;
type RoboAnimal4 = IAnimal & IRobot;
```

### 实现

```ts
class Dog implements IAnimal {
  name: string = "good dog";
}

class Cat implements Animal {
  name: string = "Where is my food, human?";
}
```

### 继承类

```ts
class Control {
  private state: any;
}

interface ISelectableControl extends Control {
  select(): void;
}

type SelectableControl = Control & {
  select: () => void;
};
```

### 定义函数

```ts
type Bark = (x: Animal) => void;

interface iBark {
  (x: Animal): void;
}

// 使用泛型
type Bark = <P = Animal>(x: P) => void;

interface iBark {
  <P = Animal>(x: P): void;
}
```

### 递归定义

```ts
type Tree<P> = {
  node: P;
  leafs: Tree<P>[];
};

interface ITree<P> {
  node: P;
  leafs: ITree<P>[];
}
```

### 精确（形状保持一致）

```ts
type Close = { a: string };
const x: Close = { a: "a", b: "b", c: "c" };
// Type '{ a: string; b: string; c: string; }' is not assignable to type 'Close'.

interface IClose {
  a: string;
}
const y: IClose = { a: "a", b: "b", c: "c" };
// Type '{ a: string; b: string; c: string; }' is not assignable to type 'IClose'.
```

### 任意属性

```ts
type StringRecord = {
  [index: string]: number;
};

interface IStringRecord {
  [index: string]: number;
}
```

## 不同处

### 原始数据类型

你只能用 Type 来给原始数据类型取别名。

```ts
type NewNumber = number;

interface INewNumber extends number {}
// 'number' only refers to a type, but is being used as a value here.

// 可以继承 Number
interface INewNumber extends Number {}
// 但是别忘了 1 instanceof Number === false
```

### 元祖

不能用 Interface 声明元祖。

```ts
type Tuple = [number, number];

interface ITuple {
  0: number;
  1: number;
}

[1, 2, 3] as Tuple; // Conversion of type '[number, number, number]' to type '[number, number]' may be a mistake

[1, 2, 3] as ITuple; // Ok
```

### 联合类型

只有 Type 能使用联合类型。

```ts
type DomesticAnimals = { type: "Dog" } | { type: "Cat" };
```

联合类型不能与 `extends` 一起使用。

```ts
interface IDomesticAnimals extends DomesticAnimals {}
// An interface can only extend an object type or intersection of object types with statically known members
```

### `new`

你可以声明 `new` 的类型

```ts
interface IClassyAnimal {
  new (name: string);
}
```

但是不会像你预期那样工作

```ts
class Parrot implements IClassyAnimal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}
// Class 'Parrot' incorrectly implements interface 'IClassyAnimal'.
//  Type 'Parrot' provides no match for the signature 'new (name: string): void'.
```

`constructor` 也是如此

```ts
interface IClassyAnimal {
  constructor(name: string): void;
}

class Parrot implements IClassyAnimal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}
// Class 'Parrot' incorrectly implements interface 'IClassyAnimal'.
//  Types of property 'constructor' are incompatible.
//    Type 'Function' is not assignable to type '(name: string) => void'.
//      Type 'Function' provides no match for the signature '(name: string): void'.
```

### 在作用域中声明多次

每个作用域内只能声明一次 Type。

```ts
type Once = { a: string };
type Once = { b: string };
// Duplicate identifier 'Once'.
```

可以声明多次 Interface（结果会合并所有的声明）。

```ts
interface IOnce {
  a: string;
}
interface IOnce {
  b: string;
}
```

### 实用类型

大多数情况下，你会使用 Type 而不是 Interface 来创建实用类型。

```ts
export type NonUndefined<A> = A extends undefined ? never : A;
```

## 结尾

在早期的TS版本中，大家习惯了 Interface。但在最新版本的TS，似乎 Type 有着更强大的能力。在 TS 中有很多细微的差别，有些例子可能适合 Interface，但有些情况可能 Type 会更合适，需要自己多做总结。

## 参考

- [DEV -- TypeScript: type vs interface](https://dev.to/stereobooster/typescript-type-vs-interface-2n0c)
- [EDUCBA -- TypeScript Type vs Interface](https://www.educba.com/typescript-type-vs-interface/)
- [MEDIUM -- Interface vs Type alias in TypeScript 2.7](https://medium.com/@martin_hotell/interface-vs-type-alias-in-typescript-2-7-2a8f1777af4c)
