---
title: 「译」 VueDose Tip 19 - 用 MaxMind 实现地理货币
date: 2020-01-25
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - Nuxt
  - VueDose
  - 文章翻译
prev: ./18-在 Vue.js 中调试模板
next: ./20-Vue.js 中有作用域的 CSS 的重要性
---

有时你需要在你的网站上集成地理定位的内容。在本节 Tip 中我将向你展示使用 VueJS，MaxMind GeoIp 和 Autonumeric 实现起来有多么容易。此示例使用 NuxtJS 编写，用于地理货币的特殊情况。但是同样的原理也适用于普通的 VueJS 应用程序。

地理货币表示，即使你仅以一种语言显示页面，你也要根据访问者所在的国际/地区显示不同的货币。来自美国的访客将看到美元符号`$10000`，来自德国的访客将在同一段话中看到欧元符号`10000€`。你可能也注意到这两种情况下的标点符号的不同。

OK，我假设你的内容可以通过诸如 Storyblok 之类的 headless CMS 的 API 访问，例如我的例子。请记住，货币可以在任意字符串中使用。这就是我定义了可以在任意字符串中用来标记地理位置货币的唯一表达式的原因。我使用了`#{number}#`表达式，这表示字符串`Price: #{10000}#`，在美国，将会被替换为`Price: $10000`，而在德国，将会被替换为`Price: 10000€`。

```json
// API returns
{
  description: "Price: #{10000}#";
}
```

首先，你必须找到并将表达式转换为 HTML 标签。我想用全局的过滤器`filter`执行此操作，但是后来我发现在 `v-html` 和 `v-text` 中它被禁用了。因此，我使用了全局混合`mixin`进行了此操作，它将字符串`#{number}#`转换为字符串`<span data-currency>number</span>`。

```js
// mixins.js
import Vue from "vue";
// Adds global currency method to transform #{}# string to span
Vue.mixin({
  methods: {
    extractCurrency(string) {
      if (!string.includes("#{")) {
        return string;
      }
      const openTag = `<span data-currency>`;
      const closeTag = `</span>`;
      const openRegex = /#{/g;
      const closeRegex = /}#/g;
      string = string.replace(openRegex, openTag);
      string = string.replace(closeRegex, closeTag);
      return string;
    }
  }
});
```

由于这是全局混合`mixin`，因此你可以在每个组件中使用`extractCurrency`函数，例如：

```vue
<template>
  <p v-html="extractCurrency(description)" />
</template>
```

如果你像我一样使用`nuxt generate`生成静态页面，你的静态页面将包含以下内容：

```html
<!-- static-page.html -->
<p>Price: <span data-currency>10000</span></p>
```

现在，你必须使用 MaxMind 的 GeoIP 找出访问者所在的国际/地区，然后调用 Autonumeric 函数来添加正确的货币。你将在 VueJS 的 `mounted()`生命周期来进行此操作，因为这只能在客户端执行。在 NuxtJS 中执行此操作的最佳位置是在布局文件中：

```js
// layouts/default.vue
export default {
  mounted() {
    geoip2.country(
      success => {
        const currencyType =
          success.country.iso_code === "US" ? "NorthAmerican" : "French";
        AutoNumeric.multiple(
          "[data-currency]",
          AutoNumeric.getPredefinedOptions()[currencyType]
        );
      },
      error => {
        console.warn("Error occured by getting geolocation.");
      }
    );
  }
};
```

如果 GeoIP 无法工作或者需要很长的时间才能返回定位，则可以使用CSS`:before`伪元素显示不带货币的数字或者显示默认货币。

```css
// fallback for currency
span[data-currency]:not([value]) {
  &::after {
    content: " €";
  }
}
```

不要忘记了，你还可以使用 NuxtJS 的全局 event bus 根据地理位置来触发组件上的方法。你可以加上这一行

```js
this.$nuxt.$emit("geolocationFound", success.country.iso_code)
```

到你的`mounted`生命周期中。

### [原文链接](https://vuedose.tips/tips/geolocated-currency-with-max-mind)
