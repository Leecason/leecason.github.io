---
title: 「译」 VueDose Tip 22 - 在 Vue.js 中使用快照进行快速内容测试
date: 2020-01-28
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - Jest
  - 测试
  - Snapshot Testing
  - VueDose
  - 文章翻译
prev: ./21-在 Vue.js 有作用域的 CSS 中使用 deep 选择器来设置内部元素的样式
next: ./23-在 Vue.js 中使用作用域插槽
---

你是否听说过快照（Snapshots）是*恶魔*？关于它们有多**坑**以及如何避免它们？这是真的！你应该非常小心，因为它们会将内容作为文本进行*精确*比较，也就是说，如果你快照一个组件，实际上是在快照它的 HTML 内容，那么任何更改 HTML 的操作都会破坏快照，并且重复的次数太频繁的话，你最终可能意外地在应用程序中接受快照的更新和缺失回归😱。

但是你不必快照整个 HTML！你甚至可以提供*标示*来识别快照，这可以用于以非常方便的方式在流程中生成测试装置，**特别是对于非常大的内容集**。

假设你有很大的一个表，并且你想测试给定一些 prop，该表将显示正确的内容：

```html
<table>
  <thead>
    <tr>
      <th v-for="column in columns">{{ column.name }}</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in items">
      <td v-for="column in columns">
        <span class="label">{{ column.name }}: </span>
        <span class="value">{{ item[column.key] }}</span>
      </td>
    </tr>
  </tbody>
</table>
```

这里的 `columns` 是表中所有列的数组，`items`是所有显示行的数组。你可以说两者都是 prop。如果要在这些给定 prop 的情况下测试表的内容，则必须测试每一行。

```js
test('contains the right information', () => {
  // columns and items are defined above
  const wrapper = shallowMount(MyTable { props: { columns, items }})
  // first cell in the header
  expect(wrapper.find('thead th:nth-of-type(1)').text()).toBe('Product')
  // first row in the tbody
  expect(wrapper.find('tbody tr:nth-of-type(1) .value').text()).toBe('Dinner plates set of 8')
  // repeat for EVERY row 🤯
})
```

有多种选择表里单元格的方法，例如[使用`data-test`属性](https://github.com/LinusBorg/vue-cli-plugin-test-attrs)，但这不是问题所在。我们编写此类测试的时候，可以更快吗？如果我们编写组件，手动检查，然后添加一个可以快照当前状态的测试，会怎么样呢？

```js
test('contains the right information', () => {
  // columns and items are defined above
  const wrapper = shallowMount(MyTable { props: { columns, items }})

  const cells = wrapper.findAll("td");
  for (let i = 0; i < cells.length; ++i) {
    const cell = cells.at(i);
    // use label as the hint for the snapshot
    const label = cell.find(".label");
    if (!label.exists()) continue;    // filter out cells that do not have a label
    expect(cell.find(".value").text()).toMatchSnapshot(label.text());
  }
})
```

编写此测试将会在首次运行时生成快照：

```shell
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`MyTable contains the right information: Product Name 1`] = `"Dinner plates set of 8"`;

exports[`MyTable contains the right information: Sells 1`] = `"23"`;

exports[`MyTable contains the right information: Stock 1`] = `"3"`;

// more and more cells
```

此解决方案的优点是，添加新列将创建一个新快照，而不会使其他快照无效，而删除现有列将使某些快照**过期**，而更改任何单元格`.value`的内容将使快照测试**失败**。

如果你不喜欢这样创建数十个快照，你可以创建一些自定义文本值并创建**一个单一的快照**：

```js
test('contains the right information', () => {
  // columns and items are defined above
  const wrapper = shallowMount(MyTable { props: { columns, items }})

  const cells = wrapper.findAll("td");
  let content = ''
  for (let i = 0; i < cells.length; ++i) {
    const cell = cells.at(i);
    // use label as the hint for the snapshot
    const label = cell.find(".label");
    if (!label.exists()) continue; // filter out cells that do not have a label
    content += `${label.text()}: ${cell.find(".value").text()} \n`
  }

  expect(content).toMatchSnapshot()
})
```

你将获得一个快照：

```shell
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`MyTable contains the right information 1`] = `
Product Name: Dinner plates set of 8
Sells: 23
Stock: 3
etc.
`;
```

因此请记住：快照也可以用于生成带有文本的测试装置！

测试愉快！

### [原文链接](https://vuedose.tips/tips/quick-content-testing-using-snapshots-in-vue-js)
