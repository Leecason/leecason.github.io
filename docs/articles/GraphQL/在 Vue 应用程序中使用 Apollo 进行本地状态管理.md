---
title: 在 Vue 应用程序中使用 Apollo 进行本地状态管理
date: 2020-02-20
categories:
  - GraphQL
tags:
  - Vue
  - GraphQL
---

::: tip
- 为什么要使用 Apollo 的本地状态管理
- 使用 Apollo 构建一个 ToDo 列表的的 Vue App
:::

<!-- more -->

> 本文假定你已经了解了 GraphQL 和 Apollo 客户端，并且可以通过 Vue CLI 构建 Vue 应用程序。

## 为什么要使用 Apollo 的本地状态管理？

当你使用 Apollo 执行 GraphQL 查询时，API 调用的结果将存储在 Apollo 缓存中。现在想象一下，你还需要存储一些本地应用状态并使之可用于不同的组件。通常，在 Vue 应用中我们可以使用 [Vuex](https://vuex.vuejs.org/) 来实现这一需求。但同时使用 Apollo 和 Vuex 意味着你将数据存储到了两个不同的位置，导致你拥有两个数据源。

好在 Apollo 具有将本地应用数据存储到缓存的机制。以前，它使用了 [apollo-link-state](https://github.com/apollographql/apollo-link-state) 库来实现。在 Apollo 2.5 发布后这个功能被包含在 Apollo 核心中。因此，我们可以简单地管理本地状态，而无需添加任何新的依赖项🎉。

## 目标

使用 Apollo 构建一个 ToDo 列表的的 Vue App。

## 添加 Apollo 到 Vue App

我们使用 [vue-apollo plugin](https://vue-apollo.netlify.com/)，首先，在命令行中安装依赖：

```shell
npm install --save vue-apollo graphql apollo-boost

# or

yarn add vue-apollo graphql apollo-boost
```

接着将 VueApollo 插件和 ApolloClient 添加到 App 中：

```js
// main.js
import VueApollo from 'vue-apollo';
import ApolloClient from 'apollo-boost';

Vue.use(VueApollo); // 安装 VueApollo

const apolloClient = new ApolloClient({}); // 创建一个 Apollo 客户端

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});

new Vue({
  render: h => h(App),
  apolloProvider, //注入到 Vue App 实例中
}).$mount('#app');
```

## 初始化 Apollo 缓存

要在应用中初始化 Apollo 缓存，需要使用 `InMemoryCache` 构造函数。首先，将它导入你的主文件：

```js{3,6,9}
// main.js
import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
// ...

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  cache, // 需要在 Apollo 客户端选项中添加缓存
});
```

到目前为止我们的缓存是空的，我们需要在其中添加一些数据。为此我们需要创建一个本地 schema，如同创建 GraphQL schema 是在服务端定义数据模型的第一步一样，编写本地 schema 是我们在客户端进行的第一步。

## 创建一个本地 schema

让我们创建一个本地 schema 来描述将在 todo 列表中的每个列表项。在这个列表项中应该有一些文本、一些定义它是否已经完成的属性、以及一个 ID 来区分不同的待办事项。所以，它应该是一个具有三个属性的对象：

```json
{
  id: 'uniqueId',
  text: 'some text',
  done: false
}
```

现在我们将 item *type* 添加到本地 GraphQL schema 中，在 `src` 下创建一个 `resolvers.js` 的文件：

```js
// resolvers.js
import gql from 'graphql-tag';

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }
`;
```

这里 `gql` 表示解析 GraphQL 查询字符串的 JavaScript 模板文字标记。

接着在 Apollo 客户端中引入 `typeDefs`：

```js{4,8,9}
// main.js
import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { typeDefs } from './resolvers';

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers: {},
});
```

:::warning
正如你所见，我们在此处添加了一个空的 resolvers 对象：如果我们不将它添加到 Apollo 客户端的选项，它将无法识别对本地状态的查询，并将尝试向远程 URL 发送请求。
:::

现在向缓存添加一些初始数据，我们需要使用 `writeData` 方法：

```js{5-16}
// main.js

// apollo client code

cache.writeData({
  data: {
    todoItems: [
      {
        __typename: 'Item',
        id: 'dqdBHJGgjgjg',
        text: 'test',
        done: true,
      },
    ],
  },
});

// apollo provider code
```

我们刚刚为缓存数据添加了一个 `todoItems` 数组，并定义了其中每项的类型名称为 `Item`（在我们的本地 schema 中指定）。

## 查询本地数据

首先，我们需要创建一个 GraphQL 查询来获取数据。新建一个 `graphql` 文件夹，向其中添加 `queries.js`：

```js
// queries.js
import gql from 'graphql-tag';

export const todoItemsQuery = gql`
  {
    todoItems @client {
      id
      text
      done
    }
  }
`;
```

我们定义了 `todoItems` 的查询 ，`@client` 指令是与发送到远程 API 的查询的主要区别。该指令指定 Apollo 客户端不应在远程 GraphQL API 上执行此查询，而是应该从本地缓存中获取结果。

让我们在 Vue 组件中使用 `todoItemsQuery` 查询：

```vue
<script>
// App.vue
import {
  todoItemsQuery,
} from "./graphql/queries.js";

export default {
  ...

  apollo: {
    todoItems: {
      query: todoItemsQuery
    }
  },

  ...
}
```

查询数据这部分已经完成了！该查询将会获取本地数据并将其存储到 `App.vue` 的 `todoItems` 属性中。

## 修改本地数据

现在我们需要改变缓存中的本地数据：添加 / 删除一个新的待办事项，和改变它的完成状态。

我们有两种不同的方法来修改本地数据：

- 使用 `writeData` 方法直接写入，就像我们在初始化缓存时所做的那样
- 调用一个 GraphQL 变更（mutations）

我们来添加一些变更：

```js{10-14}
// resolvers.js

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }

  type Mutation {
    checkItem(id: ID!): Boolean
    deleteItem(id: ID!): Boolean
    addItem(text: String!): Item
  }
`;
```

我们添加了三个变更：`checkItem` 和 `deleteItem` 需要它们的 ID，`addItem` 需要一段文本来新建待办事项，并且我们会为它生成一个唯一 ID。

### 改变 todo-item 完成状态

在 `queries.js` 中添加：

```js
// queries.js
...
export const checkItemMutation = gql`
  mutation($id: ID!) {
    checkItem(id: $id) @client
  }
`;
```

我们定义了一个本地变更（因为在这里写了一个 `@client` 指令），它将接受一个 ID 作为参数。现在，我们需要一个*解析器（resolver）*：一个解析 schema 中类型或字段的值的函数。

在我们的例子中，解析器将定义当我们执行了变更时会对本地 Apollo 缓存做出哪些更改。本地解析器具有与远程解析器相同的功能签名（`(parent, args, context, info) => data`）。事实上，我们只需要使用 `args`（传递给变更的参数）和 `context`（我们需要它的缓存属性来读写数据）。

在 `resolvers.js` 中添加 `resolvers`：

```js
// resolvers.js

import { todoItemsQuery } from './graphql/queries';

export const resolvers = {
  Mutation: {
    // 使用 ES6 对象解构得到 `args` 中的 id 和 `context` 中的 cache
    checkItem: (_, { id }, { cache }) => {
      // 1.从缓存中读取 todoItemsQuery 以查看我们现在拥有的 todoItems
      const data = cache.readQuery({ query: todoItemsQuery });
      // 2.查找具有给定 id 的待办事项
      const currentItem = data.todoItems.find(item => item.id === id);
      // 3.将找到的事项的 done 属性改为相反的值
      currentItem.done = !currentItem.done;
      // 4.将我们更改的 todoItems 写回缓存
      cache.writeQuery({ query: todoItemsQuery, data });
      // 5.将 done 属性作为变更的结果返回
      return currentItem.done;
    },
  },
};
```

替换之前定义的空对象的 `resolvers`：

```js{3,7}
// main.js

import { typeDefs, resolvers } from './resolvers';

const apolloClient = new ApolloClient({
  typeDefs,
  resolvers,
});
```

现在我们去 Vue 组件（`App.vue`）中调用我们的变更：

```vue
<script>
  import {
    todoItemsQuery,
    checkItemMutation,
  } from "./graphql/queries.js";

  export default {
    ...
    methods: {
      checkItem(id) {
        this.$apollo.mutate({
          mutation: checkItemMutation,
          variables: { id }
        });
      },
    }
  };
</script>
```

我们调用了 `$apollo.mutate`（由 `vue-apollo` 提供），给 `mutation` 属性传递了我们之前在 `queries.js` 中创建的 `checkItemMutation` 和给 `variables` 传递了 `id`，`id` 是由我们在模板中调用此方法时传递进来的：

```html
<ListItem
  v-for="(item, index) in todoItems"
  :key="index"
  :content="item"
  @toggleDone="checkItem(item.id)"
  @delete="deleteItem(item.id)"
/>
```

现在当我们点击复选框，将会发送变更给我们的本地状态。我们可以立即看到，复选框的状态会变为 check/unchecked。

### 删除一个待办事项

```js
// queries.js

export const deleteItemMutation = gql`
  mutation($id: ID!) {
    deleteItem(id: $id) @client
  }
`;
```

与之前的写法非常相似，接着添加解析器：

```js{10-14}
// resolvers.js

export const resolvers = {
  Mutation: {
    // ...

    deleteItem: (_, { id }, { cache }) => {
      const data = cache.readQuery({ query: todoItemsQuery });
      const currentItem = data.todoItems.find(item => item.id === id);
      // 将找到的事项从数组中删除
      data.todoItems.splice(data.todoItems.indexOf(currentItem), 1);
      cache.writeQuery({ query: todoItemsQuery, data });
      // 简单的返回 true 表示请求成功
      return true;
  },
  }
};
```

将其添加到 `App.vue`：

```vue
<script>
  import {
    todoItemsQuery,
    checkItemMutation,
    deleteItemMutation
  } from "./graphql/queries.js";

  export default {
    ...
    methods: {
      deleteItem(id) {
        this.$apollo.mutate({
          mutation: deleteItemMutation,
          variables: { id }
        });
      }
    }
  };
</script>
```

### 新增一个待办事项

与前两个不同，我们将一段文本作为参数，而不是 ID：

```js
// queries.js

export const addItemMutation = gql`
  mutation($text: String!) {
    addItem(text: $text) @client {
      id
      text
      done
    }
  }
`;
```

我们需要以某种方式为新的待办事项生成一个 ID，实际开发中可能会更复杂。在这里，我们使用 [shortid](https://github.com/dylang/shortid)：

```shell
npm install shortid

# or

yarn add shortid
```

接着构建解析器：

```js
// resolvers.js
import shortid from 'shortid';

export const resolvers = {
  Mutation: {
    ...
    addItem: (_, { text }, { cache }) => {
      const data = cache.readQuery({ query: todoItemsQuery });
      const newItem = {
        __typename: 'Item',
        id: shortid.generate(), // 生成唯一 ID
        text,
        done: false,
      };
      // 添加到待办事项数组并返回新的待办事项
      data.todoItems.push(newItem);
      cache.writeQuery({ query: todoItemsQuery, data });
      return newItem;
    },
  }
}
```

添加到 `App.vue`：

```vue
<script>
  import {
    todoItemsQuery,
    checkItemMutation,
    addItemMutation,
    deleteItemMutation
  } from "./graphql/queries.js";

  export default {
    ...

    methods: {
      addItem() {
        if (this.newItem) {
          this.$apollo.mutate({
            mutation: addItemMutation,
            variables: { text: this.newItem }
          });
          this.newItem = "";
        }
      },
    }
  };
</script>
```

这里的 `newItem` 表示在输入框中输入的字符串，只有在有输入的情况下才会发送变更，并且在添加新的事项后清空输入框。

到此，我们的应用程序就完成了！🎉

## 参考

- [Apollo state management in Vue application](https://dev.to/n_tepluhina/apollo-state-management-in-vue-application-8k0)
- [Vue Apollo Local state](https://vue-apollo.netlify.com/guide/local-state.html#why-use-apollo-local-state-management)

## 资源链接
- [Introduction to GraphQL](https://graphql.org/learn/)
- [Apollo documentation](https://www.apollographql.com/docs/react/)
- [Vue Apollo](https://vue-apollo.netlify.com/)
