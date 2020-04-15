---
title: 「译」 VueDose Tip 27 - 在 Vue.js 中使用 CSS 变量进行主题化
date: 2020-02-02
sidebar: false
categories:
  - Vue
tags:
  - Vue 2
  - VueDose
  - 文章翻译
prev: ./26-使用 CSS Conic Gradient 和 Vue.js 的最现代的饼图组件
next: ./28-轻松切换到 Vue.js 3 Composition API
---

这期 VueDose Tip 的主题是创建**超级通用，灵活**又健壮的组件，让我们开始吧！

让我们从一个简单的按钮开始这个 Tip：

```vue
<template>
  <button><slot/></button>
</template>

<script>
export default {
  name: "AppButton",
};
</script>

<style scoped>
button {
  border: 4px solid #41b883;
  padding: 12px 24px;
  transition: 0.25s ease-in-out all;
}

button:hover {
  color: white;
  background-color: #41b883;
}
</style>
```

我们希望组件尽可能通用，以至于我们可以在具有不同品牌的不同网站中重复使用它。但是我们该怎么做呢？

首先，我们不会假设我们总是将文本作为内容。如果我们想传递像`<strong></strong>`这样不同的标记或者是一个 icon，该怎么办？克服此问题的最佳方法，是使用[插槽](https://vuejs.org/v2/guide/components-slots.html)。

我们现在来处理样式。通常，一个好的经验法则是使用有作用域的 CSS，这可以使我们的样式本地化。但是，我们想要一些全局的东西，对吗？例如品牌的颜色。现在，我们通过复制主色的概念来打破 [DRY](https://www.notion.so/%5B%3Chttps://en.wikipedia.org/wiki/Don%27t_repeat_yourself%3E%5D(%3Chttps://en.wikipedia.org/wiki/Don't_repeat_yourself%3E)) 规则。如果需要改变主色，则不得不在每个地方改变它的硬编码。有解决方法吗？使用 [CSS 变量](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)。

```vue
<style scoped>
:root {
  --primary-color: #41b883;
  --on-primary-color: white;

  --small-spacing: 12px;
  --normal-spacing: calc(var(--small-spacing) * 2);
}

button {
  border: 4px solid var(--primary-color);
  padding: var(--small-spacing) var(--normal-spacing);
  transition: 0.25s ease-in-out all;
}

button:hover {
  color: var(--on-primary-color);
  background-color: var(--primary-color);
}
</style>
```

通常，我们将在另一个文件中定义变量，然后通过 `:root` 选择器定位到目标而不是直接写在组件中，但是对于这个示例，我们将在组件中这样做。

颜色和间距往往是网页中变化最大的部分，因此我们必须确保自己免受这些变化的影响。

这使得组件非常灵活，因为我们可以更改这些属性，它将影响使用它们的所有元素。

但是，我们如何解决主题问题？我们可以使用未声明的变量。等等，What？让我用代码解释一下：

```vue
<style scoped>
button {
  border: 4px solid var(--button-border-color, var(--primary-color));
  padding: var(--small-spacing) var(--normal-spacing);
  transition: 0.25s ease-in-out all;
}

button:hover {
  color: var(--button-hover-text-color, var(--on-primary-color));
  background-color: var(--button-hover-background-color, var(--primary-color));
}
</style>
```

我们并没有声明 `--button-border-color`，`--button-hover-text-color` 和 `--button-hover-background-color`，但可以使用这些变量。

我们使用的是未定义的 CSS 变量。但给了它一个默认值。因此，如果这些属性之一在运行时不存在，它将回退到默认值。

这意味着我们可以在外部做类似这样的事情：

```vue
<template>
  <AppButton class="custom-theme">Hello VueDose!</AppButton>
</template>

<style scoped>
.custom-theme {
  --button-border-color: pink;
  --button-hover-background-color: rgb(206, 161, 195);
}
</style>
```

这是超级灵活的，但也许太灵活了。我们不想向客户端暴露太多的信息。客户端可能仅仅是想要把主色按钮设置为辅助色按钮。并且该按钮应该知道它必须设置什么才能具有辅助按钮的外观。让我们**混合使用 CSS 变量和主题**！

```vue
<template>
  <button :style="getTheme"><slot/></button>
</template>

<script>
export default {
  name: "AppButton6",
  props: {
    theme: String,
    validator: (theme) => ['primary', 'secondary'].includes(theme)
  },
  computed: {
    getTheme() {
      const createButtonTheme = ({
        borderColor,
        hoverTextColor,
        hoverBackgroundColor
      }) => ({
        '--button-border-color': borderColor,
        '--button-hover-text-color': hoverTextColor,
        '--button-hover-background-color': hoverBackgroundColor
      })

      const primary = createButtonTheme({
        borderColor: 'var(--primary-color)',
        hoverTextColor: 'var(--on-primary-color)',
        hoverBackgroundColor: 'var(--primary-color)'
      })

      const secondary = createButtonTheme({
        borderColor: 'var(--secondary-color)',
        hoverTextColor: 'var(--on-secondary-color)',
        hoverBackgroundColor: 'var(--secondary-color)'
      })

      const themes = {
        primary,
        secondary
      }

      return themes[this.theme]
    }
  }
};
</script>
```

因此我们可以轻松做到这一点：

```html
<AppButton theme="secondary">Hello VueDose!</AppButton>
```

最后。如今，所有 cool kid 都在做暗色主题，对不对？

```vue
<template>
  <main class="wrapper" :class="mode">
    <AppButton @click.native="toggleTheme" theme="secondary">
      Click me to change to dark mode!
    </AppButton>
  </main>
</template>

<script>
import AppButton from "./components/AppButton";

export default {
  name: "App",
  data: () => ({
    mode: 'light'
  }),
  components: {
    AppButton
  },
  methods: {
    toggleTheme() {
      this.mode = this.mode === 'light' ? 'dark' : 'light'
    }
  }
};
</script>
<style scoped>
.light {
  --background-color: white;
  --on-background-color: #222;
}

.dark {
  --background-color: #222;
  --on-background-color: white;
}

.wrapper {
  transition: 1s ease-in-out background-color;
  background-color: var(--background-color);
  color: var(--on-background-color);
}
</style>
```

我们可以切换 `--background-color` 和 `--on-background-color` 来创建新的主题！仅此而已。感谢你的通读！

### [CodeSandbox](https://codesandbox.io/s/vuedose-84yg5)

### [原文链接](https://vuedose.tips/tips/theming-using-custom-properties-in-vuejs-components)
