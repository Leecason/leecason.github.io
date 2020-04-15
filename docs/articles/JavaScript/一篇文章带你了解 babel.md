---
title: 一篇文章带你了解 babel
date: 2018-12-27
categories:
  - JavaScript
tags:
  - babel
---

::: tip
1. babel 介绍
2. babel 插件集合
3. babel 配套工具
4. babel 7.x
:::

<!-- more -->

摘录自[一口(很长的)气了解 babel](https://juejin.im/post/5c19c5e0e51d4502a232c1c6)

## 介绍

把 JavaScript 中 es201x 的新语法转化为 es5，让低端运行环境(如浏览器和 node )能够认识并执行。

## 使用方式

> 只有入口不同而已，调用的 babel 内核，处理方式都是一样的

1. 使用单体文件 (standalone script)
2. 命令行 (cli)：多见于 `package.json` 中的 `scripts` 段落中的某条命令
3. 构建工具的插件 (webpack 的 `babel-loader`, rollup 的 `rollup-plugin-babel`)：直接集成到构建工具

## 运行方式

babel 总共分为三个阶段：解析，转换，生成。

babel 本身不具有任何转化功能，它把转化的功能都分解到一个个 plugin 里面。因此当我们不配置任何插件时，经过 babel 的代码和输入是相同的。

## 插件

- **语法插件**: 添加后在解析时 babel 能解析更多语法 （ babel 内部使用的解析类库叫 babylon， 非 babel 自行开发）
- **转译插件**: 在转换时把源码转换并输出，如 `(a) => a` 转换为 `function(a) { return a }`

同一类语法可能同时存在语法插件和转译插件两个版本，**如果使用了转译插件，就不用再使用语法插件了。**

## 配置文件

将插件的名字增加到配置文件中 (根目录下的 `.babelrc` 或者 `package.json` 的 babel)。

## preset

> 插件集合

分为:

1. 官方内容，`env`，`react`，`flow`，`minify` 等。

2. stage-x，最新规范的草案：

    - stage-0 - 稻草人：只是一个提案
    - stage-1 - 提案：初步尝试
    - stage-2 - 初稿：初步规范
    - stage-3 - 候选：完成规范和浏览器初步实现
    - stage-4 - 完成：将被添加到下一年度发布

> 低一级的 stage 会包含所有高级 stage 内容，stage - 1 会包含 stage-2，stage-3 的所有内容

3. es201x, latest

> 已经纳入到标准规范的语法。

因为 `env` 的出现，es2016 和 es2017 已经废弃。经常可以看到 es2015。
latest 是 `env` 的雏形，每年更新的 preset，目的是包含所有 es201x，因为 `env` 的出现，已经废弃。

## 执行顺序

1. plugin 会运行在 preset 之前
2. plugin 从前到后执行
3. preset 从后到前执行 (保证向后兼容)

## env (非常重要！！！)

核心目的是通过配置得知目标环境的特点，然后只做必要的转换。如果目标浏览器支持 es2015，那么 es2015 的 preset 就不需要了。

```json
{
  "presets": [
      ["env", {
        "targets": {
          "browsers": ["last 2 versions", "safari >= 7"]
        }
      }]
   ]
}
```

如果不写 env 配置项，env = latest = es2015 + es2016 + es2017 (不包含 stage-x)。

- [env 包含的插件列表](https://github.com/babel/babel-preset-env/blob/master/data/plugin-features.js)
- [browserslist](https://github.com/browserslist/browserslist)

```json
{
  "presets": [
      ["env", {
        "targets": {
          "node": "9.8"
        }
      }]
   ]
}
```
将目标设为 nodejs 并支持 9.8 及以上版本。也可以使用 `node: 'current'` 来支持最新稳定版本。

还有一个 `modules` 配置项，可选值有 `amd`, `umd`, `systemjs`, `commonjs` 和 `false`。可以让 babel 以特定的模块化格式来输出代码。如果选择 `false` 就不进行模块化处理。

## 配套工具

### `babel-cli`

cli 就是命令行工具。允许命令行使用 babel 命令转译文件。

### `babel-node`

随 `babel-cli` 一起安装
允许命令行使用 `babel-node` 直接转译+执行 node 文件
`babel-node = babel-polyfill + babel-register`

### `babel-register`

`babel-register` 模块改写 require 命令，为它加上一个钩子。此后，每当使用 require 加载 .js、.jsx、.es 和 .es6 后缀名的文件，就会先用 babel 进行转码。
需要注意的是，babel-register 只会对 require 命令加载的文件转码，而**不会对当前文件转码。**
另外，由于它是实时转码，所以**只适用于开发环境。**

### `babel-polyfill`

**为所有 API 增加兼容方法**

babel 默认只转换 js 语法，而不转换新的 API，比如 Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise 等全局对象，以及一些定义在全局对象上的方法(比如 `Object.assign`)都不会转码。

使用时，在所有代码运行之前增加 `require('babel-polyfill')`。或者更常规的操作是在 `webpack.config.js` 中将 `babel-polyfill` 作为第一个 entry。因此必须把 `babel-polyfill` 作为 `dependencies` 而不是 `devDependencies`。

`babel-polyfill` 主要有两个缺点：

- 使用 `babel-polyfill` 会导致打出来的包非常大，因为 `babel-polyfill` 是一个整体，把所有方法都加到原型链上。比如我们只使用了 `Array.from`，但它把 `Object.defineProperty` 也给加上了，这就是一种浪费了。这个问题可以通过单独使用 `core-js` 的某个类库来解决，`core-js` 都是分开的。
- `babel-polyfill` 会污染全局变量，给很多类的原型链上都作了修改，如果我们开发的也是一个类库供其他开发者使用，这种情况就会变得非常不可控。

因此在实际使用中，如果我们无法忍受这两个缺点(尤其是第二个)，通常我们会倾向于使用 `babel-plugin-transform-runtime`。
但如果代码中包含高版本 js 中类型的实例方法 (例如 `[1,2,3].includes(1)`)，这还是要使用 `babel-polyfill`。

### `babel-runtime` 和 `babel-plugin-transform-runtime`

babel 会转换 js 语法，之前已经提过了。
以 async/await 举例，如果不使用这个 plugin (即默认情况)，转换后的代码大概是：

```js
// babel 添加一个方法，把 async 转化为 generator，会在使用的地方都定义一次，导致重复和浪费
function _asyncToGenerator(fn) { return function () {....}}

// 使用这个方法替换 async
var _ref = _asyncToGenerator(function* (arg1, arg2) {
  yield (0, something)(arg1, arg2);
});
```
在使用了 `babel-plugin-transform-runtime` 了之后，转化后的代码会变成

```js
// 从直接定义改为引用，这样就不会重复定义了。
var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');
var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// 使用方式相同
```

上面的 require 里面出现了 `babel-runtime`，它就是这些方法的集合处，也因此，在使用 `babel-plugin-transform-runtime` 的时候。`babel-runtime` 需要安装为依赖，而不是开发依赖。

`babel-runtime`，内部集成了:
- `core-js`: 转换一些内置类(Promise, Symbols 等)和静态方法(`Array.from`等)。自动引入。
- `regenerator`: 作为 `core-js` 的补漏，主要是支持 generator/yield 和 async/await ，代码中有使用时自动引入。
- helpers， 可以查看[babel-helper](https://github.com/babel/babel/blob/6.x/packages/babel-helpers/src/helpers.js)， 上面的 `asyncToGenerator` 是其中之一，其他还有 `jsx`, `classCallCheck` 等，在代码中有内置的 helpers 使用时(如上面的第一段代码)移除定义，并插入引用(于是就变成了第二段代码)。

`babel-plugin-transform-runtime` **不支持**实例方法 (例如 `[1,2,3].includes(1)`)。

### babel-loader
一些大型的项目都会有构建工具 (如 webpack 或 rollup) 来进行代码构建和压缩 (uglify)，为了在 uglify 之前进行 babel 处理，webpack 有 loader 的概念，就有了 `babel-loader`。

和 `babel-cli` 一样， `babel-loader` 也会读取 `.babelrc` 或者 `package.json` 中的 babel 段作为自己的配置，但他需要和 webpack 交互，因此需要在 webpack 这边进行配置。

## Babel 7.x

> 上面部分都是针对 6.x，下面是 7.x 带来的变化

### preset 的变更：淘汰(非删除，不推荐使用) es201x，删除 stage-x，强推 env

**凡是使用 es201x 的开发者，都应当使用 env 进行替换**

stage-x 被删了，但它包含的插件并没有被删除，依然可以显式地声明这些[插件](https://github.com/babel/babel/tree/master/packages/babel-preset-stage-0#babelpreset-stage-0)来获得等价的效果

**npm package 名称变化 ！！！**

将 `babel-x` 重命名为 `@babel/x`。

`babel-preset-env` => `@babel/preset-env` 等于 `@babel/env`。

`babel-plugin-transform-arrow-function` =>` @babel/plugin-transform-arrow-functions` 等于 `@babel/transform-arrow-functions`。

babel 解析语法的内核 `babylon` 重命名为 `@babel/parser`。

### 不再支持低版本 node

不再支持 0.10，0.12，4，5 四个版本，相当于要求 `nodejs >= 6`，在这些低版本环境中不能使用 babel 转译代码，但转译后的代码依然能在这些环境上运行。

### only 和 ignore 匹配规则的变化

babel 6 时，ignore 选项包含 `*.foo.js` 会转换为包括子目录的 `./**/*.foo.js`。

babel 7 时，`*.foo.js` 只作用于当前目录，不作用于子目录。

only 同理

### @babel/node 从 @babel/cli 中独立了

### `babel-upgrade` 工具

目的时帮助用户自动化从 babel 6 升级到 7

1. `package.json`

- 将 `babel-x` 替换为 `@babel/x`
- 把 `@babel/x` 依赖的版本更新为最新版
- 如果 scripts 中有 `babel-node`，自动添加 `@babel/node` 为开发依赖
- 如果有 babel 配置，检查其中的 plugins 和 presets，把短名(`env`) 替换为 (`@babel/preset-env`)

2. `.babelrc`

- 检查其中的 plugins 和 presets，把短名(`env`) 替换为 (`@babel/preset-env`)
- 检查是否包含 `preset-stage-x`， 如有替换为对应的插件并添加到 plugins

使用方式

```bash
// 不安装到本地而是直接运行命令
npx babel-upgrade --write

// 或者

npm i babel-upgrade -g
babel-upgrade --write
```
