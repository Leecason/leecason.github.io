---
title: ProseMirror - 模块化的富文本编辑框架
date: 2018-07-19
categories:
  - JavaScript
tags:
  - ProseMirror
  - 富文本编辑器
---

::: tip
- 简单介绍 ProseMirror, 了解 ProseMirror 的相关概念
- ProseMirror 数据结构
- ProseMirror 运作原理
:::

<!-- more -->

关于富文本编辑器，很多同学没用过也听过了。是大家都不想去踩的坑。到底有多坑呢？

我这里摘了一部分一位大哥在知乎上的[回答](https://www.zhihu.com/question/26739121)，如果有兴趣，可以去看看。
要让一款编辑器达到商业级质量，从目前接触到主要的例子来看，独立开发时间太长：
- **Quill编辑器**，`Quill` 从 2012 年收到第一个 Issue 到 2016 年发布 1.0 版本，已经过去了四年。
- **Prosemirror编辑器**，`Prosemirror` 作者在 2015 年正式开源前筹款维护时已经开发了半年，而到发布 1.0 版本时，已经过去了接近三年。
- **Slate** 从开源到接近两年时，仍然有一堆边边角角用起来莫名其妙的 bug 。

上面这几个单人主导的编辑器项目要达到稳定质量，时间是以年为单位来计算的。考虑到目前互联网“下周上线”的节奏，动辄几年的时间是不划算的。所以在人力，时间合理性各方面的约束下，使用开源框架是最好的选择。

想要一款配置性强，模块化的编辑器，这就决定了这不是一个开箱即用的应用，而`Quill`集成了许多样式和交互逻辑，已经算是一个应用了，有时一些制定需求不能完全满足。`Slate`是基于的`React`视图层的，我们的技术栈是`Vue`，就不做考虑了，以后有机会可以研究一下，所以最后选择了`prosemirror`，但另外两款依然是很强大值得去学习的编辑器框架。

由于`prosemirror`目前使用搜索引擎能搜出来的中文资料几乎没有，遇到问题也只能去`论坛`，`issue`里面搜，或者向作者提问。以下的内容是从官网，加上自己在使用过程中对它的理解简化出来的。希望看完后，能让你对`prosemirror`产生兴趣，并从作者的设计思路中，学到东西，一起分享。

## ProseMirror 简介

>	A toolkit for building rich-text editors on the web

`prosemirror` 的作者 **Marijn** 是 `codemirror` 编辑器和 `acorn` 解释器的作者，前者已经在 `Chrome` 和 `Firefox` 自带的调试工具里使用了，后者则是 `babel` 的依赖。

`prosemirror`不是一个大而全的框架,  它是由无数个小的模块组成，它就像乐高一样是一个堆叠出来的编辑器。

它的核心库有:
- `prosemirror-model`: 定义编辑器的文档模型，用来描述编辑器内容的数据结构
- `prosemirror-state`: 提供描述编辑器整个状态的数据结构，包括`selection`(选择)，以及从一个状态到下一个状态的`transaction`(事务)
- `prosemirror-view`: 实现一个在浏览器中将给定编辑器状态显示为可编辑元素，并且处理用户交互的用户界面组件
- `prosemirror-transform`: 包括以记录和重放的方式修改文档的功能，这是`state`模块中`transaction`(事务)的基础，并且它使得撤销和协作编辑成为可能。

此外，`prosemirror`还提供了许多的模块，如`prosemirror-commands`基本编辑命令，`prosemirror-keymap`键绑定，`prosemirror-history`历史记录，`prosemirror-inputrules`输入宏，`prosemirror-collab`协作编辑，`prosemirror-schema-basic`简单文档模式等。

现在你应该大概了解了它们各自的作用，它们是整个编辑器的基础。

## 实现一个编辑器 demo

```javascript
import { schema } from "prosemirror-schema-basic"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"

let state = EditorState.create({ schema })
let view = new EditorView(document.body, { state })
```
我们来看看上面的代码干了什么事，从第一行开始。`prosemirror`要求指定一个文档符合的模式。所以从`prosemirror-schema-basic`引入了一个基本的`schema`。那么这个`schema`是什么呢？

因为`prosemirror`定义了自己的数据结构来表示文档内容。在`prosemirror结构`与`HTML的Dom结构`之间，需要一次解析与转化，这两者间相互转化的**桥梁**，就是我们的`schema`，所以要先了解一下`prosemirror`的文档结构。

## prosemirror 文档结构

`prosemirror`的文档是一个`Node`,它包含零个或多个`child Nodes`的`Fragment(片段)`。

有点类似浏览器`DOM`的递归和树形的结构。但它在存储内联内容方式上有所不一样。
```
<p>This is <strong>strong text with <em>emphasis</em></strong></p>
```
在`HTML`中，是这样的树结构：
```javascript
p //"this is "
  strong //"strong text with "
	em //"emphasis"
```
 在`prosemirror`中，内联内容被建模为平面的序列，`strong、em(Mark)`作为`paragraph(Node)`的附加数据：
```javascript
"paragraph(Node)"
// "this is "    | "strong text with" | "emphasis"
                    "strong(Mark)"       "strong(Mark)", "em(Mark)"
```
`prosemirror`的文档的对象结构如下
```javascript
Node:
  type: NodeType //包含了Node的名字与属性等
  content: Fragment //包含多个Node
  attrs: Object //自定义属性，image可以用来存储src等。
  marks: [Mark, Mark...] // 包含一组Mark实例的数组，例如em和strong
```

```	javascript
Mark:
  type: MarkType //包含Mark的名字与属性等
  attrs: Object //自定义属性
```
`prosemirror`提供了两种类型的索引
- 树类型，这个和`dom结构`相似，你可以利用`child`或者`childCount`等方法直接访问到子节点
- 平坦的标记序列，它将标记序列中的索引作为文档的位置，它们是一种计数约定
	- 在整个文档开头，索引位置为0
	- 进入或离开一个不是叶节点的节点记为一个标记
	- 文本节点中的每个节点都算一个标记
	- 没有内容的叶节点(例如`image`)也算一个标记

例如有一个`HTML`片段为
```
<p>One</p>
<blockquote><p>Two<img src="..."></p></blockquote>
```
则计数标记为
```
0   1 2 3 4    5
 <p> O n e </p>

5            6   7 8 9 10    11   12            13
 <blockquote> <p> T w o <img> </p> </blockquote>
```
每个节点都有一个`nodeSize`属性表示整个节点的大小。手动解析这些位置涉及到相当多的计数，`prosemirror`为我们提供了`Node.resolve`方法来解析这些位置，并且能够获取关于这个位置更多的信息，例如父节点是什么，与父节点的偏移量，父节点的祖先是什么等一些其它信息。

了解了`prosemirror`的数据结构，知道了`schema`是两种文档间转化的模式，回到刚才的地方，我们从`prosemirror-schema-basic`中引入了一个基本的`schema`，那么这个基本的`schema`长什么样呢？通过查看[源码](https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js)最后一行

```
export const schema = new Schema({nodes, marks})
```
`schema`是`Schema`通过传入的`nodes`, `marks`生成的实例。
而在实例之前的代码，都是在定义`nodes`和`marks`，将代码折叠一下，发现`nodes`是

```javascript
{
  doc: {...} // 顶级文档
  blockquote: {...} //<blockquote>
  code_block: {...} //<pre>
  hard_break: {...} //<br>
  heading: {...} //<h1>..<h6>
  horizontal_rule: {...} //<hr>
  image: {...} //<img>
  paragraph: {...} //<p>
  text: {...} //文本
}
```
`marks`是
```javascript
{
  em: {...} //<em>
  link: {...} //<a>
  strong: {...} //<strong>
  code: {...} //<code>
}
```
它们表示编辑器中可能会出现的节点类型以及它们嵌套的方式。它们每个都包含着一套规则，用来描述`prosemirror文档`和`Dom文档`之间的关联，如何把`Dom`转化为`Node`或者`Node`转化为`Dom`。文档中的每个节点都有一个对应的类型。
从最上面开始`doc`开始看:
```javascript
doc: {
  content: "block+"
}
```
每个`schema`必须定义一个顶层节点，即`doc`。`content`控制子节点的哪些序列对此节点类型有效。
例如`"paragraph"`表示一个段落，`"paragraph+"`表示一个或多个段落，`"paragraph*"`表示零个或多个段落，你可以在名称后使用类似正则表达式的范围。同时你也可以用组合表达式例如`"heading paragraph+"`，`"{paragraph | blockquote}+"`。这里`"block+"`表示`"(paragraph | blockquote)+"`。
接着看看`em`:
```javascript
em: {
  parseDOM: [
    { tag: "i" },
    { tag: "em" },
    { style: "font-style=italic" }
  ],
  toDOM: function() {
    return ["em"]
  }
}
```
`parseDOM`与`toDOM`表示文档间的相互转化，上面的代码有三条解析规则：
- `<i>`标签
- `<em>`标签
- `font-style=italic`的样式

当匹配到一条规则时，就呈现为`HTML`的`<em>`结构。

同理，我们可以实现一个下划线的`mark`：
```javascript
underline: {
  parseDOM: [
    { tag: 'u' },
    { style: 'text-decoration:underline' }
  ],
  toDOM: function() {
    return ['span', { style: 'text-decoration:underline' }]
  }
}
```
`Node`和`Mark`都可以使用`attrs`来存储自定义属性，比如`image`，可以在`attrs`中存储`src`，`alt`， `title`。

回到刚才
```javascript
import { schema } from "prosemirror-schema-basic"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"

let state = EditorState.create({ schema })
let view = new EditorView(document.body, { state })
```
我们使用`EditorState.create`通过基础规则`schema`创建了编辑器的状态`state`。接着，为状态`state`创建了编辑器的视图，并附加到了`document.body`。这会将我们的状态`state`呈现为可编辑的`dom节点`，并在用户键入时产生` transaction`。

## Transaction

当用户键入或者其他方式与视图交互时，都会产生`transaction`。描述对`state`所做的更改，并且可以用来创建新的`state`，然后更新视图。

下图是`prosemirror`简单的循环数据流`data flow`：编辑器视图显示给定的`state`，当发生某些`event`时，它会创建一个`transaction`并`broadcast`它。然后，此`transaction`通常用于创建新`state`，该`state`使用`updateState`方法提供给视图 。
```javascript
           DOM event
        ↗            ↘
EditorView           Transaction
        ↖            ↙
        new EditorState
```
默认情况下，`state`的更新都发生在底层，但是，你可以编写插件`plugin`或者配置视图来实现。例如我们修改下上面创建视图的代码：
```javascript
// (Imports omitted)
let state = EditorState.create({schema})
let view = new EditorView(document.body, {
  state,
  dispatchTransaction(transaction) {
    console.log("create new transaction")
    let newState = view.state.apply(transaction)
    view.updateState(newState)
  }
})
```
为`EditorView`添加了一个`dispatchTransaction`的`prop`，每次创建了一个`transaction`，就会调用该函数。
这样写的话，每个`state`更新都必须手动调用`updateState`。

## Immutable

`prosemirror`的数据结构是`immutable`的，不可变的，你不能直接去赋值它，你只能通过相应的`API`去创建新的引用。但是在不同的引用之间，相同的部分是共享的。这就好比，有一颗基于`immutable`的嵌套复杂很深的文档树，即使你只改变了某个地方的叶子节点，也会生成一棵新树，但这棵新树，除了刚才更改的叶子节点外，其余部分和原有树是共享的。有了`immutable`，当每次键入编辑器都会产生新的`state`，你在每种不同的`state`之间来回切换，就能实现撤销重做操作。同时，更新`state`重绘文档也变得更高效了。


## State

是什么构成了`prosemirror`的`state`呢？`state`有三个主要组成部分：你的文档`doc`， 当前选择`selection`和当前存储的`mark`集`storedMarks`。

初始化`state`时，你可以通过`doc`属性为其提供要使用的初始文档。这里我们可以使用`id`为`content`下的 `dom结构`作为编辑器的初始文档。`Dom解析器`将`Dom结构`通过我们的解析模式`schema`将其转化为`prosemirror结构`。
```javascript
import { DOMParser } from "prosemirror-model"
import { EditorState } from "prosemirror-state"
import { schema } from "prosemirror-schema-basic"

let state = EditorState.create({
  doc: DOMParser.fromSchema(schema).parse(document.querySelector("#content"))
})
```
`prosemirror`支持多种类型的`selection`（并允许第三方代码定义新的选择类型，注：任何一个新的类型都需要继承自`Selection`）。`selection`与文档和其他与`state`相关的值一样，也是`immutable`的 ，更改`selection`，就要创建新的`selection`和保持它的新`state`。`selection`至少具有`from`和`to`指向当前文档的位置来表示选择的范围。最常见的选择类型是`TextSelection`，用于游标或选定文本。`prosemirror`还支持`NodeSelection`，例如，当你按`ctrl / cmd`单击某个`Node`时。会选择范围从节点之前的位置到其后的位置。
`storedMarks`则表示需要应用于下一次输入时的一组`Mark`。

## Plugins

`plugin`以各种方式扩展编辑器和编辑器`state`。当创建一个新的`state`，你可以向其提供一系列的`plugin`，这些将会保存在此`state`和由此`state`派生的任何`state`中。并且可以影响`transaction`的应用方式以及基于此`state`的编辑器的行为方式。
创建`plugin`时，会向其传递一个指定其行为的对象。
```javascript
let myPlugin = new Plugin({
  props: {
    handleKeyDown(view, event) {
      //当收到keydown事件时调用
      console.log("A key was pressed!")
      return false // We did not handle this
    }
  }
})

let state = EditorState.create({schema, plugins: [myPlugin]})
```
当插件需要自己的`plugin state`时，可以通过`state`属性来定义。
```javascript
let transactionCounter = new Plugin({
  state: {
    init() { return 0 },
    apply(tr, value) { return value + 1 }
  }
})

function getTransactionCount(state) {
  return transactionCounter.getState(state)
}
```
上面这个插件定义了一个简单的`plugin state`，它对已经应用于`state`的`transaction`进行计数。
下面有个辅助函数，它调用了`plugin`的`getState`方法，从完整的编辑器的`state`中获取了`plugin`的`state`。

因为编辑器的`state`是`immutable`的，而且`plugin state`是该`state`的一部分，所以`plugin state`也是`immutable`的，即它们的`apply`方法必须返回一个新值，而不是修改旧值。
`plugin`通常可以给`transaction`添加一些额外信息`metadata`。例如，在撤销历史操作时，会标记生成的`transaction`，当`plugin`看到时，他不会向普通的`transaction`一样处理它，它会特殊处理它：从撤销堆栈顶部删除，将该`transaction`放入重做堆栈。

回到最初的例子，我们可以将`command`绑定到键盘输入的`keymap plugin`，同时还有`history plugin`，其通过观察`transaction`来实现撤销和重做。
```javascript
// (Omitted repeated imports)
import { undo, redo, history } from "prosemirror-history"
import { keymap } from "prosemirror-keymap"

let state = EditorState.create({
  schema,
  plugins: [
    history(),
    keymap({"Mod-z": undo, "Mod-y": redo})
  ]
})
let view = new EditorView(document.body, {state})
```
创建`state`时会注册`plugin`，通过这个`state`创建的视图你将能够按`Ctrl-Z`（或`OS X`上的`Cmd-Z`）来撤消上次更改。

## Commands

上面的`undo`, `redo`是一种`command`，大多数的编辑操作都被视为`command`。它可以绑定到菜单或者键上，或者其他方式暴露给用户。在`prosemirror`中，`command`是实现编辑操作的功能，它们大多是采用编辑器`state`和`dispatch`函数(`EditorView.dispatch`或者一些其他采用了`transaction`的函数)完成的。下面是一个简单的例子:
```javascript
function deleteSelection(state, dispatch) {
  if (state.selection.empty) return false
  if (dispatch) dispatch(state.tr.deleteSelection())
  return true
}
```
当`command`不适用时，应该返回`false`或者什么也不做。如果适用，则需要`dispatch`一个`transaction`然后返回`true`，为了能够查询`command`是否适用于给定`state`而不实际执行它，`dispatch`参数是可选的，当没有传入`dispatch`时，`command`应该只返回`true`，而不执行任何操作，这个可以用来使你的菜单栏变灰来表示当前`command`不可执行。
一些`command`可能需要与`dom`交互，你可以为他传递第三个参数`view`，即整个编辑器的视图。
`prosemirror-commands`提供了许多的编辑`command`，从简单到复杂。还同时附带一个基础的`keymap`， 能够给编辑器使用的键绑定来使编辑器能够执行输入与删除等操作，它将许多与`schema`无关的`command`绑定到通常用于它们的键。它还导出了许多`command`的构造函数，例如`toggleMark`,它传入一个`mark`类型和自定义属性`attrs`，返回一个`command`函数，用于切换当前`selection`上的该`mark`类型。
要自定义编辑器，或允许用户与`Node`进行交互，你可以编写自己的`command`。
例如一个简单的清除样式的格式刷`command`：
```javascript
function clear(state, dispatch) {
  if (state.selection.empty) return false;
  const { $from, $to } = state.selection;
  if (dispatch) dispatch(state.tr.removeMark($from.pos, $to.pos, null));
  return true
}
```

## 总结

上述介绍可以作为对`prosemirror`的一个简单的认识，了解了它的运作原理，避免你第一次接触它的时候，看到它的这么多库，不知道从哪上手。`prosemirror`除了上面介绍的概念以外，还有`Decorations`，`NodeViews`等，它们使你可以控制视图绘制文档的方式。如果你还想继续深入的了解`prosemirror`，可以前往它的[官网](http://prosemirror.net/)和[论坛](https://discuss.prosemirror.net/)，希望你能成为它的贡献者。
