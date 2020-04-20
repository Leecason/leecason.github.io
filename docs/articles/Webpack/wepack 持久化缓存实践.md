---
title: Webpack 持久化缓存实践
date: 2019-08-31
categories:
  - Webpack
tags:
  - 部署
  - 性能优化
  - webpack
---

::: tip
1. 什么是持久化缓存
2. 为什么做持久化缓存
3. webpack 如何做持久化缓存
4. webpack 做持久化缓存有什么需要注意的点
:::

<!-- more -->

## 持久化缓存

在现在前后端分离的应用大行其道的背景下，前端 html，css，js 往往是以一种静态资源文件的形式存在于服务器，通过接口来获取数据来展示动态内容。这就涉及到公司如何去部署前端代码的问题，所以就涉及到一个更新部署的问题，是先部署页面，还是先部署资源？

- 先部署页面，再部署资源：在二者部署的时间间隔内，如果有用户访问页面，就会在新的页面结构中加载旧的资源，并且把这个旧版本资源当做新版本缓存起来，其结果就是：用户访问到一个样式错乱的页面，除非手动去刷新，否则在资源缓存过期之前，页面会一直处于错乱的状态。
- 先部署资源，再部署页面：在部署时间间隔内，有旧版本的资源本地缓存的用户访问网站，由于请求的页面是旧版本，资源引用没有改变，浏览器将直接使用本地缓存，这样属于正常情况，但没有本地缓存或者缓存过期的用户在访问网站的时候，就会出现旧版本页面加载新版本资源的情况，导致页面执行错误。

所以我们需要一种部署策略来保证在更新我们线上的代码的时候，线上用户也能平滑地过渡并且正确打开我们的网站。

推荐先看这个回答：[大公司里怎样开发和部署前端代码？](https://www.zhihu.com/question/20790576/answer/32602154)

当你读完上面的回答，大致就会明白，现在比较成熟的持久化缓存方案就是在静态资源的名字后面加 hash 值，因为每次修改文件生成的 hash 值不一样，这样做的好处在于增量式发布文件，避免覆盖掉之前文件从而导致线上的用户访问失效。

因为只要做到每次发布的静态资源(css, js, img)的名称都是独一无二的，那么我就可以：

- 针对 html 文件：不开启缓存，把 html 放到自己的服务器上，关闭服务器的缓存，自己的服务器只提供 html 文件和数据接口
- 针对静态的 js，css，图片等文件：开启 cdn 和缓存，将静态资源上传到 cdn 服务商，我们可以对资源开启长期缓存，因为每个资源的路径都是独一无二的，所以不会导致资源被覆盖，保证线上用户访问的稳定性。

每次发布更新的时候，先将静态资源(js, css, img) 传到 cdn 服务上，然后再上传 html 文件，这样既保证了老用户能否正常访问，又能让新用户看到新的页面。

上面大致介绍了下主流的前端持久化缓存方案，那么我们为什么需要做持久化缓存呢？

- 用户使用浏览器第一次访问我们的站点时，该页面引入了各式各样的静态资源，如果我们能做到持久化缓存的话，可以在 http 响应头加上 Cache-control 或 Expires 字段来设置缓存，浏览器可以将这些资源一一缓存到本地。
- 用户在后续访问的时候，如果需要再次请求同样的静态资源，且静态资源没有过期，那么浏览器可以直接走本地缓存而不用再通过网络请求资源。

## 如何基于 webpack 解决持久化缓存

我们需要做到以下两点：

- 保证 hash 值的唯一性，即为每个打包后的资源生成一个独一无二的 hash 值，只要打包内容不一致，那么 hash 值就不一致。
- 保证 hash 值的稳定性，我们需要做到修改某个模块的时候，只有受影响的打包后文件 hash 值改变，与该模块无关的打包文件 hash 值不变。

## 实践出真知

> 下面的 10 个 demo 请按顺序阅读，一步一步实践出最理想的方案

### demo01: 简单的 hash

**入口文件 `index.js`**

```js
// index.js
console.log('hello world');
```

**webpack 配置文件**

```js
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[hash:8].js',
  },
};
```

**打包结果 Output**

```shell
            Asset       Size  Chunks             Chunk Names
index_cb736c3b.js  956 bytes       0  [emitted]  index
```

文件命名方式使用 `name + hash`。webpack 官网中对 `hash` 的描述是 `The hash of the module identifier`，那我们现在稍微改动一下入口文件，看看输出会发生什么变化。

### demo02: 增加一个 vendors

**在入口文件新增一个 `a.js` 模块**

```js
// index.js
import './a';

console.log('hello world');
```

**a.js 中使用 lodash 的 add 函数**

```js
// a.js
import { add } from 'lodash';

add(1, 1);
```

**webpack 配置文件中使用 splitChunk 进行分包，抽出 vendors 以及 runtime 文件。**

> 不太了解的可以去 webpack 官网翻阅一下文档。

```js
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[hash:8].js',
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all'
    },
  },
};
```

**打包结果 Output**

```shell
                    Asset       Size  Chunks             Chunk Names
        index_61b135b8.js  168 bytes       0  [emitted]  index
runtime~index_61b135b8.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_61b135b8.js   69.7 KiB       2  [emitted]  vendors~index
```

打包后发现所有的文件都带有相同的 `hash` 值，意味着每有一次版本迭代需要打包的时候，都会出现新的 `hash` 值，客户端对之前资源文件的缓存都会失效，所以淘汰 `[hash]`。

### demo03: 使用 chunkhash

**webpack 配置文件中将 `[hash]` 替换为 `[chunkhash]`**

```js
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[chunkhash:8].js',
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all'
    },
  },
};
```

**打包结果 Output**

```shell
                    Asset       Size  Chunks             Chunk Names
        index_201f4e93.js  168 bytes       0  [emitted]  index
runtime~index_2f124e9a.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_07bff0e7.js   69.7 KiB       2  [emitted]  vendors~index
```

打包后3个文件都带有不同的 hash 值。

### demo04: 增加新模块

**在入口文件新增一个 `b.js` 模块**

```js
// index.js
import './b'; // 在 a.js 上面
import './a';

console.log('hello world');
```

**b.js 随便写入一点内容**

```js
// b.js
console.log('this is from b');
```

**打包结果 Output**

> 无 `b.js` 模块时

```shell
                    Asset       Size  Chunks             Chunk Names
        index_0174c3e5.js  168 bytes       0  [emitted]  index
runtime~index_2f124e9a.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_07bff0e7.js   69.7 KiB       2  [emitted]  vendors~index
```

> 添加 `b.js` 模块

```shell
                    Asset       Size  Chunks             Chunk Names
        index_367a4665.js  219 bytes       0  [emitted]  index
runtime~index_2f124e9a.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_210f8b90.js   69.7 KiB       2  [emitted]  vendors~index
```

可以看到 index 文件的 `hash` 变动了，符合预期。但是 vendors 文件按照期望 `hash` 并不应该发生变化，因为是打包的 lodash 库，与 b 模块无关。
原因是 webpack4 默认按照 `resolving order` 使用自增 `module id` 进行模块标识。将 `b.js` 的引入放到 `a.js` 上面后，`a.js` 的 resolve 顺序在 `b.js` 之后，所以 `module id` 改变导致 `hash` 改变，所以我们要想办法稳定 `module id`。

### demo05: 稳定 `module id`

**方案1: 使用内置插件 HashedModuleIdsPlugin**

```js
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[hash:8].js',
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins：[
    new webpack.HashedModuleIdsPlugin({
      hashFunction: 'sha256',
      hashDigest: 'hex',
      hashDigestLength: 20
    });
  ],
};
```

**方案2: 使用 optimization.moduleIds**

> webpack@4.16.0+

```js
// webpack.config.js
module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[chunkhash:8].js',
  },
  optimization: {
    moduleIds: 'hashed',
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

两种方案都会根据模块的相对路径生成一个 `hash` 作为 `module id`，而不是以 `resolving order` 作为 `module id`，这里使用 webpack@4.16.0 新特性 `optimization.moduleIds`。

**打包结果 Output**

> 无 `b.js` 模块时

```shell
                    Asset       Size  Chunks             Chunk Names
        index_af7c6890.js  181 bytes       0  [emitted]  index
runtime~index_2f124e9a.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_c2408a59.js   69.7 KiB       2  [emitted]  vendors~index
```

> 添加 `b.js` 模块

```shell
                    Asset       Size  Chunks             Chunk Names
        index_7e785a12.js  241 bytes       0  [emitted]  index
runtime~index_2f124e9a.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_c2408a59.js   69.7 KiB       2  [emitted]  vendors~index
```

可以看到只有 index 文件的 `hash` 变动了，符合预期。

### demo06: 增加 CSS 模块

**入口文件新增一个 CSS 文件**

```js
// index.js
import './c.css';
import './b';
import './a';

console.log('hello world');
```

**`c.css` 随便写入一点内容**

```css
// c.css
body {
  color: red;
}
```

使用 `mini-css-extract-plugin` 将这个 CSS 模块单独抽离成一个文件

```js
// webpack.config.js
module.exports = {
  ...
  module: {
    rules: [{
      test: /\.css$/,
      include: [
        path.resolve(__dirname, 'src'),
      ],
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
        },
      ],
    }],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[name].[contenthash:8].css',
    }),
  ],
};
```

然后打包，再随意修改一点 CSS 内容，再次打包。

**打包结果 Output**

> 修改 CSS 文件前

```shell
                    Asset       Size  Chunks             Chunk Names
       index.da7f9913.css   24 bytes       0  [emitted]  index
        index_4e52e374.js  274 bytes       0  [emitted]  index
runtime~index_551621ef.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_c2408a59.js   69.7 KiB       2  [emitted]  vendors~index
```

> 修改 CSS 文件后

```shell
                    Asset       Size  Chunks             Chunk Names
       index.b320a09b.css   62 bytes       0  [emitted]  index
        index_4ee472a6.js  274 bytes       0  [emitted]  index
runtime~index_551621ef.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_c2408a59.js   69.7 KiB       2  [emitted]  vendors~index
```

两次打包我们只对 CSS 文件进行了修改，所以预期一定是只希望 CSS 文件的 `hash` 值发生变化，但是不幸打包结果显示是入口文件的 index.js 的 `hash` 值也发生了变化。

### demo07: `contenthash` 解决 CSS 模块修改后 JS 文件 `hash` 变动问题

**修改配置文件 `contenthash` 替换 `chunkhash`**

```js
// webpack.config.js
module.exports = {
  ...
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[contenthash:8].js',
  },
  ...
};
```

再次进行 Demo06 的操作，先打包，再随意修改一点 CSS 内容，再次打包。

**打包结果 Output**

> 修改 CSS 文件前

```shell
                    Asset       Size  Chunks             Chunk Names
       index.da7f9913.css   24 bytes       0  [emitted]  index
        index_5c33384b.js  274 bytes       0  [emitted]  index
runtime~index_0ef176c0.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_e1005034.js   69.7 KiB       2  [emitted]  vendors~index
```

> 修改 CSS 文件后

```shell
                    Asset       Size  Chunks             Chunk Names
       index.b320a09b.css   62 bytes       0  [emitted]  index
        index_5c33384b.js  274 bytes       0  [emitted]  index
runtime~index_0ef176c0.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_e1005034.js   69.7 KiB       2  [emitted]  vendors~index
```

可以看到入口文件 `index.js` 的 `hash` 值并没有随着 CSS 文件的修改发生改变，符合预期。

### Demo08: 增加异步模块

**入口文件新增一个异步模块**

```js
// index.js
import './c.css';
import './b';
import './a';

import('./async_module').then(content => console.log(content));

console.log('hello-world');
```

异步模块内容随意

```js
// async_module.js
export default {
  content: 'async',
};
```

**打包结果 Output**

> 没有异步模块时

```shell
                    Asset       Size  Chunks             Chunk Names
       index.b320a09b.css   62 bytes       0  [emitted]  index
        index_5c33384b.js  274 bytes       0  [emitted]  index
runtime~index_0ef176c0.js   1.46 KiB       1  [emitted]  runtime~index
vendors~index_e1005034.js   69.7 KiB       2  [emitted]  vendors~index
```

> 添加异步模块后

```shell
                    Asset       Size  Chunks             Chunk Names
            3_614a07a2.js  130 bytes       3  [emitted]
       index.b320a09b.css   62 bytes       0  [emitted]  index
        index_0273e7fa.js  331 bytes       0  [emitted]  index
runtime~index_57589e3f.js   2.22 KiB       1  [emitted]  runtime~index
vendors~index_e1005034.js   69.7 KiB       2  [emitted]  vendors~index
```

可以看到新增了一个文件，同时入口文件 `index.js` 和 `runtime` 的 `hash` 值发生了改变， CSS 文件和 vendors 的 `hash` 值未变，符合预期。

### Demo09: 增加第二个入口文件

**新增第二个入口文件 内容随意**

```js
// index2.js
console.log('this is from index2');
```

```js
// webpack.config.js

...
entry: {
  index: './src/index.js',
  index2: './src/index2.js',
},
```

**打包结果 Output**

> 未添加 index2 时

```shell
                    Asset       Size  Chunks             Chunk Names
            3_614a07a2.js  130 bytes       3  [emitted]
       index.b320a09b.css   62 bytes       0  [emitted]  index
        index_0273e7fa.js  331 bytes       0  [emitted]  index
runtime~index_57589e3f.js   2.22 KiB       1  [emitted]  runtime~index
vendors~index_e1005034.js   69.7 KiB       2  [emitted]  vendors~index
```

> 添加 index2 后

```shell
                     Asset       Size  Chunks             Chunk Names
             5_8669c06c.js  130 bytes       5  [emitted]
        index.b320a09b.css   62 bytes       0  [emitted]  index
        index2_6447342f.js  128 bytes       1  [emitted]  index2
         index_56b87637.js  331 bytes       0  [emitted]  index
runtime~index2_a321ef2b.js   1.46 KiB       3  [emitted]  runtime~index2
 runtime~index_f6b3525d.js   2.22 KiB       2  [emitted]  runtime~index
 vendors~index_aa1cd9d9.js   69.7 KiB       4  [emitted]  vendors~index
 ```

可以看到新增了一个入口文件后，除了添加了 `index2.js` 和 `runtime~index2.js` 这两个文件外，CSS 文件 hash 值没变，其余文件的 hash 值都发生了改变，这对于我们要达到的持久缓存来说是毁灭性的。原因是我们虽然稳定了 `module id`，但是没有稳定 `chunk id`，而且这里异步模块由于没有 `chunk name`，所以又使用了自增的 `chunk id` 进行命名。与之前的自增 `module id` 的情况相类似，所以我们要想办法稳定 `chunk id`。

### demo10: 稳定 `chunk id`

**使用内置插件 webpack.NamedChunksPlugin**

```js
// webpack.config.js
...
plugins: [
  ...
  new webpack.NamedChunksPlugin(chunk => {
    if (chunk.name) {
      return chunk.name;
    }
    return Array.from(chunk.modulesIterable, m => m.id).join("_");
  }),
]
...
```

如果有 `chunk name` 则使用 `chunk name` 命名，否则使用 chunk 中包含的 `module id` 并用 `_` 连接进行命名。

**打包结果 Output**

> 未添加 index2 时

```shell
                    Asset       Size         Chunks             Chunk Names
       index.b320a09b.css   62 bytes          index  [emitted]  index
        index_93fea262.js  370 bytes          index  [emitted]  index
runtime~index_1ae1d096.js   2.24 KiB  runtime~index  [emitted]  runtime~index
vendors~index_9f3b7952.js   69.8 KiB  vendors~index  [emitted]  vendors~index
         z6lC_072b1460.js  135 bytes           z6lC  [emitted]
```

> 添加 index2 后

```shell
                     Asset       Size          Chunks             Chunk Names
        index.b320a09b.css   62 bytes           index  [emitted]  index
        index2_864fb9c1.js  150 bytes          index2  [emitted]  index2
         index_93fea262.js  370 bytes           index  [emitted]  index
runtime~index2_74b91b67.js   1.47 KiB  runtime~index2  [emitted]  runtime~index2
 runtime~index_1ae1d096.js   2.24 KiB   runtime~index  [emitted]  runtime~index
 vendors~index_9f3b7952.js   69.8 KiB   vendors~index  [emitted]  vendors~index
          z6lC_072b1460.js  135 bytes            z6lC  [emitted]
```

可以看到除了添加了 `index2.js` 及 `runtime~index2.js` 这两个文件外，其余文件 hash 值都未发生变化。

## 结语

以上的实践都是很简单的例子，希望大家能从文章中有所收获，然后实践出更佳的方案来应对工作中更复杂的情况。

附上以上 demo 的 [github 链接](https://github.com/Leecason/webpack-long-term-caching-demos)。打包后的文件和配置都在里面。

## 参考链接

- [webpack 持久化缓存实践](https://github.com/happylindz/blog/issues/7)
- [基于webpack解决持久化缓存](https://zhuanlan.zhihu.com/p/53248744)
- [Webpack中hash与chunkhash的区别，以及js与css的hash指纹解耦方案](http://www.cnblogs.com/ihardcoder/p/5623411.html)
- [webpack多页应用架构系列（十六）：善用浏览器缓存，该去则去，该留则留](https://segmentfault.com/a/1190000010317802)
- [用 webpack 实现持久化缓存](https://sebastianblade.com/using-webpack-to-achieve-long-term-cache/)
- [Webpack 真正的持久缓存实现](http://blog.yunfei.me/blog/webpack_long_term_caching.html)
