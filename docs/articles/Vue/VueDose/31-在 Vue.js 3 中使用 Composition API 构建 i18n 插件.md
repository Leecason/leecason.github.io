---
title: 「译」 VueDose Tip 31 - 在 Vue.js 3 中使用 Composition API 构建 i18n 插件
date: 2020-02-18
sidebar: false
categories:
  - Vue
tags:
  - Vue 3
  - VueDose
  - 文章翻译
prev: ./30-在 Vue.js 3 Composition API 中访问模板中的 ref
next: ./32-Vue.js 测试中的深层渲染 VS 浅层渲染
---

在 Vue.js 3 中使用 Composition API 编写插件的方式与之前的不同。之前的插件通过 `Vue.use(plugin)` 调用 `install` 函数来使用。它们通常会在 Vue 原型上进行操作和扩展。

但是，在 Composition API 中，插件是不能这样操作的，而且是通过 inject-provide 模式进行开发的。例如，你可以这样创建一个 i18n 插件：

```js
// i18nPlugin.js
import { ref, provide, inject } from "@vue/composition-api";

const createI18n = config => ({
  locale: ref(config.locale),
  messages: config.messages,
  $t(key) {
    return this.messages[this.locale.value][key];
  }
});

const i18nSymbol = Symbol();

export function provideI18n(i18nConfig) {
  const i18n = createI18n(i18nConfig);
  provide(i18nSymbol, i18n);
}

export function useI18n() {
  const i18n = inject(i18nSymbol);
  if (!i18n) throw new Error("No i18n provided!!!");

  return i18n;
}
```

函数 `provide` 和 `inject` 用于创建插件实例，并将其保存在要注入的依赖项中。

你可以看到我对 `locale` 使用了 `ref`，因为我们需要让它变成响应式的。

如果你还对 Composition API 不太熟悉，可以阅读 [轻松切换到 Vue.js 3 Composition API](/articles/Vue/VueDose/28-轻松切换到%20Vue.js%203%20Composition%20API) 和 [在 Vue.js 3 Composition API 中访问实例属性](/articles/Vue/VueDose/29-在%20Vue.js%203%20Composition%20API%20中访问实例属性) 来了解有关它的更多内容。

接着，在应用程序中，你需要使用 `provideI18n` 函数和正确的配置来初始化插件。这通常在顶层 `App.vue` 组件中完成：

```vue
<script>
  import { provideI18n } from "./i18nPlugin";
  import HelloWorld from "./HelloWorld";

  export default {
    components: { HelloWorld },
    setup() {
      provideI18n({
        locale: "en",
        messages: {
          en: {
            hello_world: "Hello world"
          },
          es: {
            hello_world: "Hola mundo"
          }
        }
      });
    }
  };
</script>
```

最后，在我们要使用该插件的组件的 `setup` 函数中，使用 `useIi18n` 将其注入。例如一个 `HelloWorld.vue` 组件：

```vue
<template>
  <div>
    <h2>{{ i18n.$t('hello_world') }}</h2>
  </div>
</template>

<script>
  import { useI18n } from "./i18nPlugin";

  export default {
    setup() {
      const i18n = useI18n();

      return { i18n };
    }
  };
</script>
```

但是如果我们不能改变语种的话，就没有意义了。让我们在上面的代码中添加改变语种的功能：

```vue
<template>
  <div>
    <h2>{{ i18n.$t('hello_world') }}</h2>
    <button @click="switchLanguage">Switch language</button>
  </div>
</template>

<script>
  import { useI18n } from "./i18nPlugin";

  export default {
    setup() {
      const i18n = useI18n();

      const switchLanguage = () => {
        const locale = i18n.locale.value === "en" ? "es" : "en";
        i18n.locale.value = locale;
      };

      return {
        i18n,
        switchLanguage
      };
    }
  };
</script>
```

只需添加按钮和 `switchLanguage` 函数就可以了。

以上！我最喜欢 Composition API 的地方在于，通过简洁的模式来开发出可预计、易于维护的代码。

### [CodeSandbox](https://codesandbox.io/s/i18n-plugin-composition-api-mbe0b)

### [原文链接](https://vuedose.tips/tips/create-a-i18n-plugin-with-composition-api-in-vuejs-3)
