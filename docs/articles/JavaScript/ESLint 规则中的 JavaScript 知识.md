---
title: ESLint 规则中的 JavaScript 知识
date: 2018-07-24
categories:
  - JavaScript
tags:
  - ESLint
---

<!-- more -->

网上关于`ESLint`的介绍，安装，配置和使用等文章已经有很多了，写的都很全面，还不清楚的同学可以先去简单了解一下，本文就不作介绍了。

本文的主要内容是通过`ESLint`的规则（`Rules`），从中学到 `JavaScript` 的基础知识。同时，提前了解这些规则的含义与理由，有助于在以后的开发中提前规避风险，提高代码质量。

> 以下是从官网的 `Rules` 列表中摘取的部分规则，欢迎大家补充，共同学习。

## Possible Errors

**`getter-return`**：强制在 `getter` 属性中出现一个 `return` 语句。每个 `getter` 都期望有返回值。

**`no-compare-neg-zero`**：禁止与 `-0` 进行比较。像 `x === -0` 的代码对于 `+0` 和 `-0` 都有效。你可以使用 `Object.is(x, -0)`。例：
```javascript
// incorrect
if (x === -0) {
    // doSomething()...
}

// correct
if (x === 0) {
    // doSomething()...
}
if (Object.is(x, -0)) {
    // doSomething()...
}
```

**`no-cond-assign`**: 禁止在条件语句中出现赋值操作符。在条件语句中，很容易将一个比较运算符（像 `==`）错写成赋值运算符（如 `=`）。在条件语句中，使用赋值操作符是有效的。然而，很难判断某个特定的赋值是否是有意为之。该规则有两个可选值：

- `except-parens`：默认值，允许条件语句中出现赋值操作符，前提是它们被圆括号括起来。
- `always`: 禁止条件语句中出现赋值语句。

**`no-console`**：禁止调用 `console` 对象的方法。`console` 这样的消息被认为是用于调试的，生产环境中不应该有关于`console` 的语句。同时，被`console.log`的变量是不会被垃圾回收的，一旦多起来会导致内存泄漏。该规则有可配置选项`allow`，它的值是个字符串数组，包含允许使用的`console`对象的方法。例如: `allow: ["warn", "error"]`允许使用`console`对象上的`warn`，`error`方法。

**`no-constant-condition`**：禁止在条件中使用常量表达式。

**`no-dupe-args`**: 禁止在 `function` 定义中出现重复的参数。

**`no-dupe-keys`**: 禁止在对象字面量中出现重复的键。

**`no-duplicate-case`**: 禁止在 switch 语句中的 case 子句中出现重复的测试表达式。

**`no-empty`**: 禁止空语句块出现，该规则会忽略包含一个注释的语句块。例如，在 `try` 语句中，一个空的 `catch` 或 `finally` 语句块意味着程序应该继续执行，无论是否出现错误。该规则有个可配置的选项 `allowEmptyCatch: true` 允许出现空的 `catch` 子句。

**`no-ex-assign`**：禁止对 `catch` 子句中的异常重新赋值。如果意外地（或故意地）给异常参数赋值，是不可能引用那个位置的错误的。由于没有 `arguments` 对象提供额外的方式访问这个异常，对它进行赋值绝对是毁灭性的。

**`no-func-assign`**：禁止对 function 声明重新赋值。例如：
 ```javascript
// incorrect
function foo() {}
foo = bar;

function foo() {
  foo = bar;
}
```
`JavaScript` 函数有两种形式：函数声明 `function foo() { ... }` 或者函数表达式 `var foo = function() { ... }` 。虽然 `JavaScript` 解释器可以容忍对函数声明进行覆盖或重新赋值，但通常这是个错误，应该避免。

**`no-inner-declarations`**：禁止在嵌套的块中出现变量声明或 `function` 声明。可选值(`string`)：`functions(默认)`，`both（禁止 function 和 var 声明出现在嵌套的语句块中）`。这只适用于函数声明，命名的或匿名的函数表达式是可以出现在任何允许的地方。在 `ES6` 之前的 `JavaScript` 中，函数声明只能在程序或另一个函数体的顶层。由于变量声明提升，把声明放在程序或函数体的顶部会使代码更清晰，在任何地方随意声明变量的做法通常是不可取的。因为在`ES6`中的 `let` 和 `const` 不会被提升，因此它们不受此规则影响。

**`no-irregular-whitespace`**：禁止在字符串和注释之外不规则的空白。无效的或不规则的空白会导致 `ECMAScript 5` 解析问题，也会使代码难以调试（类似于混合 `tab` 和空格的情况）。 [引起的问题以及禁止出现的不正常字符](https://eslint.org/docs/rules/no-irregular-whitespace)

**`no-obj-calls`**：禁止把全局对象作为函数调用，如 `Math`、`JSON` 和 `Reflect`等。

**`no-sparse-arrays`**：禁用稀疏数组，也就是逗号之前没有任何元素的数组。该规则不适用于紧随最后一个元素的拖尾逗号的情况。例如：
```javascript
// incorrect
var arr = [,,];
var colors = [ "red",, "blue" ];

// correct
var arr = [];
var arr = new Array(23);
var colors = [ "red", "blue", ];
```

**`no-unexpected-multiline`**：禁止使用令人困惑的多行表达式。在 `JavaScript` 中，分号通常是可选的，因为会自动插入分号（`ASI`)。换行不结束语句，书写错误遗漏了分号，这些异常会导致两个不相干的连续的行被解释为一个表达式。特别是对于一个没有分号的代码风格，读者可能会忽略这些错误。尽管语法上是正确的，代码执行时可能会抛出异常。

**`no-unreachable`**：禁止在 `return`、`throw`、`continue` 和 `break` 语句后出现不可达代码。因为这些语句无条件地退出代码块，其之后的任何语句都不会被执行。

**`use-isnan`**：禁止与 `NaN` 的比较，要求调用 `isNaN()`检查 `NaN`。在 `JavaScript` 中，`NaN` 是 `Number` 类型的一个特殊值。它被用来表示非数值(`Not A Number`)，这里的数值是指在 `IEEE` 浮点数算术标准中定义的双精度64位格式的值。
```javascript
console.log(typeof NaN); // "number"
```
因为在 `JavaScript` 中 `NaN` 独特之处在于它不等于任何值，包括它本身，与 `NaN` 进行比较的结果也令人困惑：
```javascript
console.log(NaN !== NaN); // true
console.log(NaN === NaN); // false
```
因此，使用 `Number.isNaN()` 或 全局的 `isNaN()` 函数来测试一个值是否是 `NaN`。

**`valid-typeof`**：强制 `typeof` 表达式与有效的字符串进行比较。对于绝大多数用例而言，`typeof` 操作符的结果是以下字符串字面量中的一个：`"undefined"`、`"object"`、`"boolean"`、`"number"`、`"string"`、`"function"` 和 `"symbol"`。把 `typeof` 操作符的结果与其它字符串进行比较，通常是个书写错误。例：
```javascript
// incorrect
typeof foo === "strnig"
typeof foo == "undefimed"
typeof bar != "nunber"
typeof bar !== "function"

// correct
typeof foo === "string"
typeof bar == "undefined"
typeof foo === baz
typeof bar === typeof qux
```

## Best Practices

**`accessor-pairs`**：强制`getter/setter`成对出现在对象中。该规则强制一种编码风格：对于每个属性，如果定义了`setter`，也必须定义相应的 `getter`。没有 `getter` ，你不能读取这个属性，该属性也就不会被用到。

**`array-callback-return`**：强制数组某些方法的回调函数中有 `return` 语句。 `Array` 有一些方法用来过滤、映射和折叠。如果你忘记了在它们的回调函数中写 `return` 语句，这种情况可能是个错误。需要 `return` 语句的方法有：

- `Array.from`
- `Array.prototype.every`
- `Array.prototype.filter`
- `Array.prototype.find`
- `Array.prototype.findIndex`
- `Array.prototype.map`
- `Array.prototype.reduce`
- `Array.prototype.reduceRight`
- `Array.prototype.some`
- `Array.prototype.sort`

**`default-case`**：要求 `wwitch` 语句中有 `default` 分支，即使默认分支中没有任何代码。开发人员可能忘记定义默认分支而导致程序发生错误，所以明确规定定义默认分支是很好的选择。或者也可以在最后一个 `case` 分支下，使用 `// no default` 来表明此处不需要 `default` 分支。

**`eqeqeq`**：要求使用 `===` 和 `!==` 代替 `==` 和 `!=` 操作符。原因是 `==` 和 `!=` 在比较时会作强制转型，有时会产生副作用甚至异常。 有两个可选值：
- `always` : 强制在任何情况下都使用 `===` 和 `!==`
- `smart`： 除了以下这些情况外，强制使用 `===` 和 `!==` ：
  - 比较两个字面量的值
  - 比较 `typeof` 的值
  - 与 `null` 进行比较

**`no-alert`**：禁用 `alert`、`confirm` 和 `prompt`。`JavaScript` 的 `alert`、`confirm` 和 `prompt` 被广泛认为是突兀的 UI 元素，应该被一个更合适的自定义的 UI 界面代替。此外, `alert` 经常被用于调试代码，部署到生产环境之前应该删除。因此，当遇到 `alert`、`prompt` 和 `confirm` 时，该规则将发出警告。

**`no-caller`**：禁用 `arguments.caller` 或 `arguments.callee`。它们的使用使一些代码优化变得不可能。在 `JavaScript` 的新版本中它们已被弃用，同时在 `ECMAScript 5` 的严格模式下，它们也是被禁用的。

**`no-case-declarations`**：禁止词法声明 (`let`、`const`、`function` 和 `class`) 出现在 `case` 或 `default` 子句中。词法声明在整个 `switch` 语句块中是可见的，但是它只有在运行到它定义的 `case` 语句时，才会进行初始化操作。
为了保证词法声明语句只在当前 `case` 语句中有效，将你子句包裹在块中。例：
```javascript
// incorrect
switch (foo) {
    case 1:
        let x = 1;
        break;
    case 2:
        const y = 2;
        break;
    case 3:
        function f() {}
        break;
    default:
        class C {}
}

// correct
switch (foo) {
    // 下面的 case 子句使用括号包裹在了块中
    case 1: {
        let x = 1;
        break;
    }
    case 2: {
        const y = 2;
        break;
    }
    case 3: {
        function f() {}
        break;
    }
    case 4:
        // 因为函数作用域提升，使用 var 声明而不使用括号包裹是合法的。
        var z = 4;
        break;
    default: {
        class C {}
    }
}
```

**`no-else-return`**：禁止 `if` 语句中 `return` 语句之后有 `else` 块。如果 `if` 块中包含了一个 `return` 语句，`else` 块就成了多余的了。可以将其内容移至块外。例：
```javascript
// incorrect
function foo() {
    if (x) {
        return y;
    } else {
        return z;
    }
}

// correct
function foo() {
    if (x) {
        return y;
    }

    return z;
}
```

**`no-empty-function`**：禁止出现空函数。空函数能降低代码的可读性，如果一个函数包含了一条注释，它将不会被认为有问题。该规则有一个选项，配置所允许的空函数列表，默认为空数组。

**`no-empty-pattern`**：禁止使用空解构模式。当使用解构赋值时，可能创建了一个不起作用的模式。把空的花括号放在嵌入的对象的解构模式右边时，就会产生这种情况。例：
```javascript
// incorrect
var {} = foo;
var [] = foo;
var {a: {}} = foo;
var {a: []} = foo;
function foo({}) {}
function foo([]) {}
function foo({a: {}}) {}
function foo({a: []}) {}

// correct
var {a = {}} = foo;
var {a = []} = foo;
function foo({a = {}}) {}
function foo({a = []}) {}
```

**`no-eq-null`**：禁止使用 `==` 和 `!=` 操作符与 `null` 进行比较。当你进行比较时可能得意想不到的的结果，因为 `null` 和 `null` 与 `undefined` 的比较结果都为 `true`。

**`no-eval`**：禁用 `eval()`。`JavaScript` 中的 `eval()` 函数是有潜在危险的，而且经常被误用。`eval()` 在大多数情况下可以被更好的解决问题的方法代替。

**`no-global-assign`**：禁止对原生对象或只读的全局对象进行赋值。`JavaScript` 环境包含很多内置的全局变量，比如浏览器环境的 `window` 和 `Node.js` 中的 `process`。在几乎所有情况下，你都不应该给全局变量赋值，因为这样做可能会到导致无法访问到重要的功能。

**`no-implicit-globals`**：禁止在全局范围下使用 `var` 和命名的 `function` 声明。因为这样，会作为 `window` 对象的一个属性或方法存在。全局变量应该显式地赋值给 `window` 或 `self`。否则，局部变量应该包裹在 `IIFE` 中。该规则不适用于 `ES` 和 `CommonJS` 的模块，因为它们有自己的模块作用域。

**`no-invalid-this`**：禁止 `this` 关键字在类或类对象之外出现。该规则 **只** 在严格模式下生效，在严格模式下，类或者类对象之外的 `this` 关键字可能是 `undefined` 并且引发 `TypeError`。

**`no-iterator`**：禁用 `__iterator__` 属性。这个属性现在废弃了，所以不应再使用它。现在，应该使用 `ES6` 迭代器和生成器。

**`no-lone-blocks`**：禁用不必要的嵌套块。在 `ES6` 之前，由花括号分隔开的独立代码块不会创建新的作用域，也就不起什么作用，代码块是多余的。例：
```javascript
{ // 该括号对 foo 不起任何作用
    var foo = bar();
}
```
在 `ES6` 中，如果出现一个块级绑定 (`let` 和 `const`)，类声明或函数声明（在严格模式下），代码块就会创建一个新的作用域。在这些情况下，代码块不会被认为是多余的。

**`no-multi-spaces`**：禁止在逻辑表达式、条件表达式、声明、数组元素、对象属性、序列和函数参数周围使用多个空格。

**`no-new`**：禁止使用 `new` 关键字调用构造函数但却不将结果赋值给一个变量。比如 `new Thing()` 创建的对象会被销毁因为它的引用没有被存储在任何地方。

**`no-new-func`**：禁止对 `Function` 对象使用 `new` 操作符。`JavaScript` 中可以使用 `Function` 构造函数创建一个函数，如 `var x = new Function("a", "b", "return a + b");`，把一个字符串传给 `Function` 构造函数，你需要引擎解析该字符串，这一点同调用 `eval` 函数一样，应该避免这样使用。

**`no-new-wrappers`**：禁止对 `String`，`Number` 和 `Boolean` 使用 `new` 操作符。在 `JavaScript` 中有3种原始类型包装对象：字符串，数字和布尔值。它们所代表的构造器分别为 `String`、`Number` 和 `Boolean`。
下面的例子使用 `new` 操作符后使用 `typeof` 将返回 `"object"`，而不是 `"string"`, `"number"` 和 `“boolean”`，这意味着可能与预期不符。
```javascript
var stringObject = new String("Hello world");
var numberObject = new Number(33);
var booleanObject = new Boolean(false);
```
而且，每个对象的判断都是真，这意味着每个 `Boolean` 的实例都会返回 `true`，即使它们实际的值是 `false`。所以，应该避免使用 `new` 来使用原始包装类型。一般情况下，下面这样使用即可。
```javascript
var text = String(someValue);
var num = Number(someValue);
var bol = Boolean(someValue);
```

**`no-param-reassign`**：禁止对 `function` 的参数进行重新赋值。比如：`function f(arg) { arg = 1; }` 或 `function f(obj) { obj.num = 1; }`。对函数参数中的变量进行赋值可能会误导读者，导致混乱，也会改变 `arguments` 对象。如果参数是引用类型，比如对象，修改对象的属性会影响到传入函数的那个原始对象。如果需要修改可以复制一份数据再改。

**`no-proto`**：禁用 `__proto__` 属性。`__proto__` 属性在 `ECMAScript 3.1` 中已经被弃用，并且不应该在代码中使用。应该使用 `getPrototypeOf` 方法替代 `__proto__`。`getPrototypeOf`是获取原型的首选方法。

**`no-redeclare`**：禁止多次声明同一变量。这会使变量实际声明和定义的位置混乱不堪。

**`no-return-assign`**：禁止在 `return` 语句中使用赋值语句。因为很难断定 `return` 语句的意图。可能是赋值，但赋值的意图也可能不明确，也可能是比较。

**`no-self-assign`**：禁止自身赋值。自身赋值不起任何作用。

**`no-self-compare`**：禁止自身比较。几乎没有场景需要你比较变量本身。

**`no-unmodified-loop-condition`**：禁用一成不变的循环条件。循环条件中的变量在循环中是要经常改变的。如果不是这样，那么可能是个错误。

**`no-useless-call`**：禁止不必要的 `.call()` 和 `.apply()`。例如下面的代码与 `foo(1, 2, 3)`效果相同：
```javascript
foo.call(undefined, 1, 2, 3);
foo.apply(undefined, [1, 2, 3]);
foo.call(null, 1, 2, 3);
foo.apply(null, [1, 2, 3]);
```
函数的调用可以写成 `Function.prototype.call()` 和 `Function.prototype.apply()`，但是 `Function.prototype.call()` 和 `Function.prototype.apply()` 比正常的函数调用效率低。

**`no-useless-concat`**：禁止不必要的字符串字面量或模板字面量的连接。把两个字符拼接在一起是没有必要的，比如：
`var foo = "a" + "b";` 直接写作 `var foo = "ab";` 即可。

**`no-useless-escape`**：禁用不必要的转义字符。对字符串、模板字面量和正则表达式中的常规字符进行转义，不会对结果产生任何影响，但它是多余的。
```javascript
// 不必要使用转义符
"\'";
'\"';
"\#";
"\e";
`\"`;
`\"${foo}\"`;
`\#{foo}`;
/\!/;
/\@/;

// 需要使用转义符
"\"";
'\'';
"\x12";
"\u00a9";
"\371";
"xs\u2111";
`\``;
`\${${foo}}`;
`$\{${foo}}`;
/\\/g;
/\t/g;
/\w\$\*\^\./;
```

**`prefer-promise-reject-errors`**：要求使用 `Error` 对象作为 `Promise` 拒绝的原因。`Error` 对象会自动存储堆栈跟踪，在调试时，通过它可以用来确定错误是从哪里来的。如果 `Promise` 使用了非 `Error` 的值作为拒绝原因，那么就很难确定 `reject` 在哪里产生。

**`require-await`**：禁止使用不带 `await` 表达式的 `async` 函数。`async` 函数不包含 `await` 函数可能不是重构想要的结果。

**`vars-on-top`**：要求所有的 `var` 声明出现在它们所在的作用域顶部。默认的，`JavaScript` 的解析器会隐式的将变量的声明移到它们所在作用域的顶部（"变量提升"）。这个规则迫使程序员通过手动移动变量声明到其作用域的顶部来实现这个行为，有助于提高可维护性。

**`wrap-iife`**：要求 `IIFE` 使用括号括起来。你可以立即调用函数表达式，而不是函数声明。创建一个立即执行函数 (`IIFE`) 的一个通用技术是用括号包裹一个函数声明。括号内的函数被解析为一个表达式，而不是一个声明。

## Variable Declarations

**`no-delete-var`**：禁止删除变量。`delete` 的目的是删除对象的属性。使用 `delete` 操作删除一个变量可能会导致意外情况发生。

**`no-label-var`**：不允许标签与变量同名。

**`no-shadow`**：禁止变量声明与外层作用域的变量同名。例：
```javascript
var a = 3;
function b() {
    var a = 10;
}
```
`b()` 作用域中的 `a` 覆盖了全局环境中的 `a`。这会混淆读者并且在 `b` 中不能获取全局变量。

**`no-shadow-restricted-names`**：禁止重定义遮蔽关键字。全局对象的属性值 (`NaN`、`Infinity`、`undefined`)和严格模式下被限定的标识符 `eval`、`arguments` 也被认为是关键字。重定义关键字会产生意想不到的后果且易迷惑其他读者。

**`no-undef-init`**：禁止将变量初始化为 `undefined`。在 `JavaScript` 中，声明一个变量但未初始化，变量会自动获得 `undefined` 作为初始值，因此，初始化变量值为 `undefined` 是多余的。

**`no-unused-vars`**：禁止出现未使用过的变量。已声明的变量在代码里未被使用过，就像是由于不完整的重构而导致的遗漏错误。这样的变量增加了代码量，并且混淆读者。

**`no-use-before-define`**：禁止在变量定义之前使用它们。在 `ES6` 标准之前的 `JavaScript` 中，某个作用域中变量和函数的声明会被提前到作用域顶部（"变量提升"），所以可能存在这种情况：此变量在声明前被使用。这会扰乱读者。在 `ES6` 中，块级绑定 (`let` 和 `const`) 引入"暂时性死区"，当企图使用未声明的变量会抛出 `ReferenceError`。

## Node.js and CommonJS

**`global-require`**：要求 `require()` 出现在顶层模块作用域中。在 `Node.js` 中，使用 `require()` 函数引入依赖的模块，它在模块顶层被调用，这样更容易识别依赖关系。当它们在深层次嵌套在函数和其它语句时，就很难识别依赖。因为 `require()` 是同步加载的，在其它地方使用时，会导致性能问题。此外，`ES6` 模块要求 `import` 和 `export` 语句只能放在模块顶部。

**`handle-callback-err`**：要求回调函数中有容错处理。在 `Node.js` 中，最普遍的处理异步行为是回调模式。这个模式期望一个 `Error` 对象或 `null` 作为回调的第一个参数。如果忘记处理这些错误会导致你的应用程序出现一些非常奇怪的行为。

**`no-buffer-constructor`**：禁用 `Buffer()` 构造函数。在 `Node.js` 中，`Buffer` 构造函数的行为取决于其参数的类型。将用户输入的参数传递给 `Buffer()`，而不验证其类型，会导致安全漏洞，比如远程内存泄漏和拒绝服务。因此，`Buffer` 构造函数已经被弃用，不应该再使用。使用 `Buffer.from`、`Buffer.alloc` 和 `Buffer.allocUnsafe` 生成器方法代替。

**`no-new-require`**：禁止调用 `require` 时使用 `new` 操作符。`require` 方法被用来引入不同文件中模块。某些模块可能返回一个构造函数，会出现 `var app = new (require(moduleName));` 的情况，这样可能会引起潜在的混乱，应该避免这样的情况，分成多行写会使你的代码更清晰。

## Stylistic Issues

关于空格，换行，声明，标点符号等风格规则，非常主观，依据个人或团队编码风格自定义，这里不作介绍。

## ECMAScript 6
> 这些规则只与 `ES6` 有关，即通常所说的 `ES2015`

**`arrow-body-style`**：要求箭头函数体使用大括号。为了规避箭头函数语法可能带来的错误，当函数体只有一行的时候，若不加大括号，会默认把这行代码的返回结果给隐式 `return`。当函数体有多行的时候，必须使用大括号，并且需要自己写 `return` 语句。可选值有：
- `always`--强制始终用大括号
- `as-needed`--当大括号是可以省略的，强制不使用它们
- `never`--禁止在函数体周围出现大括号

**`arrow-parens`**：要求箭头函数的参数使用圆括号。箭头函数体只有一个参数时，可以省略圆括号。其它任何情况，参数都应被圆括号括起来。该规则强制箭头函数中圆括号的使用的一致性。可选值有：
- `always`--要求在所有情况下使用圆括号将参数括起来。
- `as-needed`--当只有一个参数时允许省略圆括号。

**`constructor-super`**：要求在构造函数中有 `super()` 的调用。派生类中的构造函数必须调用 `super()`。非派生类的构造函数不能调用 `super()`, 否则 `JavaScript` 引擎将引发一个运行时错误。

**`no-class-assign`**：禁止修改类声明的变量。大多数情况下，`class A {};  A = 0;`这样的修改是个错误。

**`no-const-assign`**：禁止修改 `const` 声明的变量。

**`no-dupe-class-members`**：禁止类成员中出现重复的名称。如果类成员中有同名的声明，最后一个声明将会默默地覆盖其它声明，它可能导致意外的行为。

**`no-duplicate-imports`**：禁止重复模块导入。为每个模块使用单一的 `import` 语句会是代码更加清新，因为你会看到从该模块导入的所有内容都在同一行。`import { A } from 'module';
import { B } from 'module';` 应该合并为 `import { A, B } from 'module';` 会使导入列表更加简洁。

**`no-new-symbol`**：禁止 `Symbol` 和 `new` 一起使用。`Symbol` 应该作为函数调用。

**`no-this-before-super`**：禁止在构造函数中，在调用 `super()` 之前使用 `this` 或 `super`。在派生类的构造函数中，如果在调用 `super()` 之前使用 `this` 或 `super`，它将会引发一个引用错误。

**`no-useless-rename`**：禁止在 `import` 和 `export` 和解构赋值时将引用重命名为相同的名字。`ES2015` 允许在 `import` ，`export` 和解构赋值时对引用进行重命名。引用有可能被重命名成相同的名字。`import { foo as foo } from "bar";` 这和没有重命名是等价的，因此这种操作完全冗余。

**`no-var`**：要求使用 `let` 或 `const` 而不是 `var`。块级作用域在很多其他编程语言中很普遍，能帮助程序员避免错误。

**`object-shorthand`**：要求或禁止对象字面量中方法和属性使用简写语法。`ECMAScript 6` 提供了简写的形式去定义对象中的方法和属性。你可以配置该规则来要求或禁止简写。
```javascript
// 属性
var foo = {
    x: x,
    y: y,
    z: z,
};
// 等效于
var foo = { x, y, z }

// 方法
var foo = {
    a: function() {},
    b: function() {}
};

//等效于
var foo = {
    a() {},
    b() {}
}
```

**`prefer-const`**：要求使用 `const` 声明那些声明后不再被修改的变量。如果一个变量不会被重新赋值，最好使用 `const` 进行声明。从而减少认知负荷，提高可维护性。

**`prefer-rest-params`**：要求使用剩余参数而不是 `arguments`。剩余参数得到的是真正的数组，而 `arguments`是类数组，没有 `Array.prototype` 方法，有时候还需要再转化一步。剩余参数的语义更明确，即声明的形参之外的实参会被归进数组。

**`prefer-spread`**：要求使用扩展运算符而非 `.apply()`。在 `ES2015` 之前，必须使用 `Function.prototype.apply()` 调用可变参数函数。如 `var args = [1, 2, 3, 4];
Math.max.apply(Math, args);`，在 `ES2015` 中，可以使用扩展运算符调用可变参数函数。`var args = [1, 2, 3, 4];
Math.max(...args);`

**`prefer-template`**：要求使用模板字面量而非字符串连接。

**`require-yield`**：要求 `generator` 函数内有 `yield`。

**`import/no-mutable-exports`**：禁止 `export` 暴露可更改的数据。也就是说 `export` 出的必须用 `const` 定义，如：`const name = 'a';  export default name;`

### 未完待续 欢迎大家补充……
