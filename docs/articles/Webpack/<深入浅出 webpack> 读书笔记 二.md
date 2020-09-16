---
title: 《深入浅出 webpack》 读书笔记 二
date: 2019-04-08
categories:
  - Webpack
tags:
  - webpack
prev: ./<深入浅出 webpack> 读书笔记 一.md
next: ./<深入浅出 webpack> 读书笔记 三.md
---

::: tip
1. webpack 流程细节
2. webpack 在构建流程中广播的事件
3. bundle.js 分析
4. 手写 loader
5. 手写 plugin
:::

<!-- more -->

## 基本概念

- **Entry** 入口文件，第一步将从 Entry 开始
- **Module** 模块，webpack 一切皆模块，一个模块对应一个文件，webpack 会从配置的 Entry 开始递归找出依赖的所有模块
- **Chunk** 代码块，多个 module 组成，用于代码分割与合并
- **Loader** 模块转换器，将模块从原内容按照需求转换成新内容
- **Plugin** 扩展插件，webpack 在构建流程中的特定时机会广播出对应的事件，插件可以监听这些事件的发生，在特定时机做对应的事

## 流程概括

串行过程

1. 初始化参数：从配置文件和 shell 语句中读取合并参数，得出最终参数
2. 开始编译：用上一部得到的参数初始化 Complier 对象，加载所有配置的插件，执行对象的 run 方法开始编译
3. 确定入口： 根据 Entry 找出所有入口文件
4. 编译模块： 从入口文件出发，调用所有配置的 loader 对模块进行翻译，再找模块的依赖，再递归本步直到所有入口的依赖文件都执行本步的处理
5. 完成模块编译：在经过 4 的模块翻译后，得到了所有模块的内容以及依赖关系
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个一个的 chunk，再把每个 chunk 转换成一个单独的文件加入输出列表，这是可以改变输出内容的最后机会
7. 输出完成：确定好输出内容后，根据配置定义好的文件名和文件路径，把文件内容写入到文件

在以上的过程中，webpack 会在特定时间点，广播出特定的事件，插件监听自己感兴趣的事件并执行对应的逻辑，并且插件也可以调用 webpack 的 API 改变 webpack 的运行结果。

## 流程细节

三大阶段：

1. 初始化：启动构建，读取合并配置参数，加载 Plugin，实例化 Complier
2. 编译： 从 Entry 出发，针对每个 module 串行的调用 Loader 进行转换，再找到该 module 所依赖的 module，递归地进行编译
3. 输出： 对编译后的 module 组合成 chunk，把 chunk 转换成文件，写入文件系统

初始化阶段：读取合并参数，得出最终参数，实例化 Plugin

实例化 Complier：负责文件监听和启动编译，包含了完整的 webpack 配置，全局只有一个 Complier 实例

加载插件：依次调用插件的 apply，让插件可以监听后续的事件节点，传入 Complier 实例，以方便调用 webpack API

```js
const path = require('path');

class TestPlugin {
  constructor () {
    console.log('@plugin constructor');
  }

  apply (compiler) {
    // 初始化
    console.log('@plugin apply');

    // 开始应用 Node.js 风格的文件系统到 compiler 对象，以方便后续的文件寻找和读取。
    compiler.plugin('environment', (options) => {
      console.log('@environment');
    });

    compiler.plugin('after-environment', (options) => {
      console.log('@after-environment');
    });

    // 读取 Entry，为每个 Entry 实例化对应的 EntryPlugin，方便后续的文件读取和查找
    compiler.plugin('entry-option', (options) => {
      console.log('@entry-option');
    });

    // 调用完所有内置的和配置的 Plugin 的 apply
    compiler.plugin('after-plugins', (options) => {
      console.log('@after-plugins');
    });

    // 根据配置初始化完 resolver，负责在文件系统中寻找指定路径的文件
    compiler.plugin('after-resolvers', (options) => {
      console.log('@after-resolvers');
    });

    // 编译阶段

    compiler.plugin('before-run', (options, callback) => {
      console.log('@before-run');
      callback();
    });

    // 启动一次新的编译
    compiler.plugin('run', (options, callback) => {
      console.log('@run');
      callback();
    });

    // 同 run，监听模式下启动，在事件中可以获取到是哪些文件发生了变化引起了重新编译
    compiler.plugin('watch-run', (options, callback) => {
      console.log('@watch-run');
      callback();
    });

    compiler.plugin('normal-module-factory', (options) => {
      console.log('@normal-module-factory');
    });

    compiler.plugin('context-module-factory', (options) => {
      console.log('@context-module-factory');
    });

    compiler.plugin('before-compile', (options, callback) => {
      console.log('@before-compile');
      callback();
    });

    // 一次新的编译将启动
    compiler.plugin('compile', (options) => {
      console.log('@compile');
    });

    compiler.plugin('this-compilation', (options) => {
      console.log('@this-compilation');
    });

    // 当 webpack 以开发模式运行，检测到文件变化后，一次新的 Compilation 将创建
    // 一个 Compilation 对象包含了当前的模块资源，编译生成资源，变化的文件等
    // Compilation 也提供了许多事件回调供插件使用
    compiler.plugin('compilation', (options) => {
      console.log('@compilation');
    });

    // 一个新的 compilation 创建完成，即将从 Entry 读取文件
    // 根据文件类型和配置的 Loader 对文件进行编译，编译完再找出依赖的文件，递归执行编译
    compiler.plugin('make', (options, callback) => {
      console.log('@make');
      callback();
    });

    // 编译阶段最重要的事件，调用了每个 Loader 来对文件进行编译转换
    compiler.plugin('compilation', (compilation) => {
      // 使用对应的 Loader 去转换一个 module
      compilation.plugin('build-module', (options) => {
        console.log('@build-module');
      });

      // 在使用 Loader 转换完成后，使用 acorn 解析转换的内容，输出 AST，以方便 webpack 后面对代码的分析
      compilation.plugin('normal-module-loader', (options) => {
        console.log('@normal-module-loader');
      });

      // 从配置的入口文件开始，分析其 AST，遇到 require 等其它依赖时，将其加入到依赖列表
      // 同时找出新的 AST，递归进行分析，最终搞清楚所有模块的依赖关系
      compilation.plugin('program', (options, callback) => {
        console.log('@program');
        callback();
      });

      // 所有模块和模块的依赖都通过 Loader 转换完成后，根据依赖关系生成 chunk
      compilation.plugin('seal', (options) => {
        console.log('@seal');
      });
    });

    // 一次 compilation 完成
    compiler.plugin('after-compile', (options, callback) => {
      console.log('@after-compile');
      callback();
    });

    // 输出阶段
    // 所有需要输出的文件已经生成好，询问插件哪些文件需要输出
    compiler.plugin('should-emit', (options) => {
      console.log('@should-emit');
    });

    // 确定好需要输出的文件，执行文件输出，在这里可以获取输出的内容和改变输出的内容
    compiler.plugin('emit', (options, callback) => {
      console.log('@emit');
      callback();
    });

    // 文件输出完毕
    compiler.plugin('after-emit', (options, callback) => {
      console.log('@after-emit');
      callback();
    });

    // 完成一次编译和输出流程
    compiler.plugin('done', (options) => {
      console.log('@done');
    });

    // 在编译和输出过程中遇到异常导致了 webpack 退出，会立即进入此流程，插件可以在此获取到错误的原因
    compiler.plugin('failed', (options, callback) => {
      console.log('@failed');
      callback();
    });

    // 当遇到文件不存在，文件编译错误时会触发，不会导致 webpack 退出
    compiler.plugin('invalid', (options) => {
      console.log('@invalid');
    });

  }
}

module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [
    new TestPlugin(),
  ],
};
```

## bundle.js 文件

`installedModules`: 内存中缓存已经加载安装过的模块，提升性能

`function __webpack__require__(moduleId)`: 加载一个模块，如果模块已经被安装，则直接从内存缓存中返回，如果不存在，则新建一个模块

```js
var module = installedModules[moduleId] = {
  i: moduleId,
  l: false, // 是否加载安装完成
  exports: {}, // 导出值
}
```

之后从 modules 中找到这个 id 对应模块的函数，之后调用此函数，传入参数

`modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)`;

并返回这个模块导出值 `return module.exports`;

`__webpack__require.p`: 表示配置中的 publicPath，用于加载被分割出去的异步代码

接着去加载 index 为 0 的模块，并返回模块的导出值

`__webpack__require.s`: 表示启动模块对应的 index

```js
// 简写
(
  function (modules) {
    function __module__require__ (chunkId) {

    }

    return __module__require__(0);
  }
)(
  [
    // 模块的数组
  ]
)
```

能够直接运行在浏览器的原因输出文件中定义了一个 `__module__require__` 函数，可以在浏览器中执行的加载函数模拟 Node.js 的 `require`

原来一个个独立的模块，被合并到了 bundle.js 的原因是浏览器不能像 Node.js 快速的去加载一个个本地的文件，必须通过网络加载未得到的文件，模块很多加载时间会很长，因此存在数组中，执行一次网络加载

## 分割代码时的输出

使用按需加载优化后：执行入口文件 `bundle.js` 和 异步加载文件 `0.bundle.js`

```js
// 0.bundle.js
webpackJsonp(
  [0], // 其他文件中存的 moduleId
  [
    // 本文件包含的模块
  ]
)
```

```js
// bundle.js
(
  function (modules) {
    // 挂在全局方便其它文件中调用
    window["webpackJsonp"] = function webpackJsonpCallback (
      chunkIds, // 异步加载的文件中需要安装的模块 id
      moreModules, // 异步加载的文件中存放的需要安装的模块列表
      executeModules // 异步加载的文件中存放的模块都安装完毕后，需要执行的模块 index
    ) {
      // 将 moreModules 添加到 modules 中，把所有 chunkIds 标记为已加载成功

    }

    // 已经安装的 chunk，键为 chunkId，0 表示加载成功
    var installedChunks = {
      1: 0
    }

    // 用于加载被分割出去，需要异步加载的 chunk 对应的文件
    // 返回 promise
    __webpack__require__.e = function requireEnsure (chunkId) {
      var installedChunkData = installedChunks[chunkId];

      // 如果值为 0 表示已经加载成功了，直接返回 resolve Promise

      // 如果不为空也不为 0 表示正在加载中，返回 installedChunkData[2]，为 promise 对象

      // 如果为空，则表示第一次加载，去加载 chunk 的内容

      var promise = new Promise((resolve, reject) => {
        installChunkData = installedChunks[chunkId] = [resolve, reject];
      });

      installChunks[2] = promise;

      // 通过 dom 操作在 head 中插入添加一个 script 标签去异步加载 chunk 文件
      var head = document.getElementsByTagName(head)[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.timeout = 12000;

      script.src = __webpack__require__.p + '' + chunkId + '.bundle.js';

      var timeout = setTimeout(onScriptComplete, 120000);
      script.onload = script.onerror = onScriptComplete;

      function onScriptComplete () {
        script.onerror = script.onload = null; // 防止内存泄露
        clearTimeout(timeout);

        // 去检查 installChunks[chunkId] 是否安装成功
        // 安装成功才会添加到 installChunks 中
      }

      head.append(script);

      return promise;
    }
  }
)(
  [
    (function (module, exports, __webpack__require__) {
      // 通过 __webpack__require__.e 去异步加载 chunk
      __webpack__require__.e(0).then(__webpack__require__.bind(null, 1)).then(() => {

      });
    })
  ]
)
```

异步加载：

- 多一个 `__webpack__require__.e` 用于加载分割出去的，需要异步加载的 chunk 对应的文件
- 多一个 `webpackJsonp` 用于从异步加载的文件中安装模块

使用 CommonChunkPlugin 去提取公共代码时的输出文件和使用了异步加载时输出的文件是一样的，本质上都是代码分割

## 编写 Loader

翻译官，能把文件经过转换后输出结果，可以链式翻译

职责单一，只完成一种转换，开发 Loader 时，只关心输入和输出

webpack 运行在 Node.js 上，一个 Loader 就是一个 Node.js 模块，需要导出一个函数

```js
const sass = require('node-sass'); // 可以使用 node API 或者第三方库
const loaderUtils = require('loader-utils');

module.exports = function (source) {
  // source 为 complier 传递给 loader 的文件的原内容

  const options = loaderUtils.getOptions(this); // 获取传给 loader 的参数
  return source;

  // 也可以通过 this.callback 返回其他结果
  this.callback(
    err, // Error | null，无法转换时，返回一个 error
    content, // string | Buffer，转换后的内容
    sourceMap?, // 方便调试
    abstractSyntaxTree?, // 如果本次生成了 AST，可以返回，方便其它 Loader 复用，避免重新生成
  );

  return; // 此时必须返回 undefined
}
```

```js
// 异步 Loader
module.exports = function (source) {
  var callback = this.async(); // 告诉 webpack 此次为异步

  someAsync(source, function (err, result, sourceMap, ast) {
    callback(err, result, sourceMap, ast);
  });
}
```

```js
// 默认情况下为 utf-8 编码的字符串
// 处理二进制
module.exports = function (source) {
  // 此时 source 是二进制数据，如 file-loader
};

module.exports.raw = true; // 告诉 webpack 该 loader 是否需要二进制数据
```

```js
// 缓存加速
// 有些时候有些计算非常耗时，每次构建都会重复转换
// webpack 默认缓存了所有 loader 的处理结果，若被处理的文件和依赖没有变化时，不回重新调用 loader 去转换

module.exports = function (source) {
  this.cacheable(false); //关闭缓存
  return source;
};
```

加载本地 Loader：

- **Npm link** 专门用于调试本地开发模块，把本地一个正在开发的模块链接到 node_modules 下，让项目可以使用该模块，软链接方式实现
  - 需配置 package.json
  - 根目录执行 `npm link`
  - 根目录执行 `npm link loader-name`

- ResolveLoader

```js
// webpack.config.js
module.exports = {
  resolveLoader: {
    modules: ['node_modules', './loaders/'], // 有先后顺序，先找 node_modules，若找不到则去 ./loaders/ 下找
  },
};
```

## 编写 Plugin

让 webpack 更灵活，webpack 会在运行的生命周期中的特定时机广播出事件，plugin 可以监听这些事件来参与到构建流程中，也可以通过调用 webpack 的 API 来改变构建结果

在构造函数中获取用户配置的参数

webpack 启动后在读取配置的过程中实例 Plugin，在初始化 Compiler 对象后执行 plugin.apply(compiler) 给插件传递 compiler 对象，插件获取 compiler 对象后可以通过 `compiler.plugin(事件名, 回调函数)` 监听 webpack 广播出的事件，并通过 compiler 操作 webpack

### Compiler 和 Compilation

- Compiler 包含了 webpack 所有配置，包括 options， loaders， plugins，这个对象在 webpack 启动后实例化，全局唯一的，可以理解为 webpack 实例
- Compilation 包含了当前模块资源，编译生成资源，变化的文件等。当 webpack 以开发模式运行时，每当检测到文件变化，一次新的 Compilation 会被创建，也提供了许多事件回调给 plugin 使用。也可以读取到 compiler

Compiler 代表了 webpack 从开启到关闭等整个生命周期，而 Compilation 只代表一次新的编译

### 事件流

生产线，一系列流程以后 源文件 -> 输出结果，每个流程都是单一，多个流程有依赖关系，只有完成了当前处理才能传给下一个流程，插件就插入到生产线中，在特定的时机对资源做处理。

webpack 事件流机制保证了插件的有序，使得扩展性很好

```js
// 广播出事件
compiler.apply('event-name', params);

// 监听事件
compiler.plugin('event-name', function (params) {

});
```

- 只要能拿到 compiler 和 compilation 就能广播事件，插件中也能广播出事件给其它插件

- compiler 和 compilation 都是一个引用，一个插件将其修改了将会影响后面的插件

- 异步事件，插件处理完后需要调用回调函数

```js
compiler.plugin('emit', function (compilation, callback) {
  ...

  callback(); // 如果不执行将会卡住
});
```

### 常用 API

插件可以修改输出文件，增加输出文件，提升性能

**读取输出资源，代码块，模块，依赖**

emit 事件发生时，表示源文件的转换和组装已完成，从这里可以读到最终输出的资源，代码块，模块和依赖，也可以修改输出内容

```js
compiler.plugin('emit', function (compilation, callback) {
  // compilation.chunks 存放所有代码块 是个数组
  compilation.chunks.forEach(function (chunk) {
    // 读到组成代码块的模块
    chunk.forEachModule(function(module) {
      // 代表所有的依赖文件路径，为数组
      module.fileDependencies.forEach(function (filePath) {

      });
    });
    // 每个 chunk 对应一个及以上的输出文件
    chunk.files.forEach((function (filename) {
      let source = compilation.assets[filename].source(); // 获取输出的资源
    }));

    callback();
  });
});
```

**监听文件变化**

webpack 会从配置文件入口出发，找到其依赖的模块，入口模块或者依赖模块发生变化时，触发一次新的 compilation

```js
compiler.plugin('watch-run', (watching, callback) => {
  // 获取发生变化的文件列表，键值对，键为发生变化的文件路径
  const changedFiles = watching.compiler.watchFileSystem.watcher.mtimes;
});
```

默认情况只会监视入口文件和其依赖的文件是否变化，JS 不会导入 HTML，HTML 发生变化就不会触发新的 compilation，为了监听 HTML 变化，可以加入到依赖列表

```js
compiler.plugin('after-compile', (compilation, callback) => {
  compilation.fileDependencies.push(filePath); // 加入 HTML 文件到依赖列表

  callback();
});
```

**修改输出资源**

监听 emit 事件，emit 事件时所有的模块的转换和代码块对应的文件已经生成好，需要输出的资源即将输出，这是改变输出资源的最后时机

```js
compiler.plugin('emit', (compilation, callback) => {
  // 所有输出的资源在 compilation.assets，key 为文件名称，value 为文件内容
  compilation.assets[filename] = {
    source: () => { // 输出文件，可以是字符串，也可以是二进制 buffer
      return fileContent;
    },
    size: () => { // 输出文件大小
      return Buffer.byteLength(fileContent, 'utf8');
    },
  };

  callback();
});
```

**判断使用了哪些插件**

开发插件时可能需要判断是否使用了某个插件而做下一步决定

```js
function hasExtractTextPlugin(compiler) {
  // 当前配置所有使用的插件列表
  const plugins = compiler.options.plugins;
  // 去 plugins 中寻找有没有 ExtractTextPlugin 的实例
  return plugins.find(plugin => plugin.__proto__.constructor === ExtractTextPlugin) != null;
}
```
