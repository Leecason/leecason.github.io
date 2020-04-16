---
title: JS 各种继承方式
date: 2018-08-15
categories:
  - JavaScript
tags:
  - 原型
  - 继承
  - ES6
  - 手写源码系列
---

## 原型链继承

子类原型为父类实例对象

```js
function Parent (name) {
  this.name = name;
}

function Child () {}

Child.prototype = new Parent();
Child.prototype.constructor = Child;

const child = new Child('child');
child.name; // undefined, 无法向父类构造函数传参
// child.__proto__ 访问到 Child.prototype 也就是 parent 实例，就可以获取父类属性和方法
// parent.__proto__ 可以访问到 Parent.prototype 获取原型链上的属性和方法
```

缺点:

- 无法实现多继承
- 所有 Child 实例的原型对象都指向 Parent 实例，Parent 实例属性修改将会影响所有 Child
- 子类实例时无法向父类构造函数传参

## 构造函数继承

子类构造函数中调用父类构造函数

```js
function Parent (name) {
  this.name = name;
}

function Child () {
  Parent.call(this, 'child'); // 让父类的实例属性都挂载到子类
  // 可以多继承，call 多个父类
}
```

缺点:

- 不是父类的实例，只是子类的实例
- 无法使用父类原型对象上的方法
- 无法函数复用，子类都有父类函数调用的副本

## 原型链加构造函数组合继承

调用父类构造函数，继承父类的实例属性，将子类原型改写为父类实例，继承原型上的方法

```js
function Parent (name) {
  this.name = name;
}

function Child (name) {
  Parent.call(this, name);
}

Child.prototype = new Parent();
Child.prototype.constructor = Child;
```

缺点:

- 调用了两次父类构造函数，生成了两份实例

## 寄生式组合继承

为了解决调用了两次父类构造函数的问题，将`指向父类实例`改为`指向父类原型`

```js
function Parent (name) {
  this.name = name;
}

function Child (name) {
  Parent.call(this, name);
}

Child.prototype = Parent.prototype;
Child.prototype.constructor = Child;
```

缺点:

- 无法判断对象是子类还是父类的实例化
- 若给子类添加原型方法也会添加到父类上

所以`浅拷贝父类原型对象`

```js
function Parent (name) {
  this.name = name;
}

function Child (name) {
  Parent.call(this, name);
}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

目前 ES5 下最成熟继承方式，babel 对 ES6 的转化也是使用了这种方式

## ES6 继承

```js
class Parent {
  constructor (name) {
    this.name = name;
  }
}

class Child extends Parent {

}
```

缺点：

- 并不是所有浏览器都支持 class 关键字
