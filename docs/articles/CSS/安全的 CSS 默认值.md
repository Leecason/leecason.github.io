---
title: 安全的 CSS 初始值
date: 2020-02-26
categories:
  - CSS
---

::: tip
如果你希望将某些 CSS 属性重置为其默认值，想要它像你想要的那样“渲染”，但是指定不正确的值可能会注入您意想不到的行为。
本文列举一些将某些 CSS 属性值重置为默认值的安全的值。
:::

<!-- more -->

## 初始值

CSS 规范定义了一个值，当一个属性没有在任何样式表（用户的）中声明时，则该值将为属性的*初始值*。

## 将 CSS 属性重置为初始值

CSS3 有关键字 `initial`，该关键字会将 CSS3 属性设置为规范中定义的初始值，但只有 Firefox(带-moz-前缀)，和 Webkit 的 Safari 和 Chrome 支持。

所以，直到所有浏览器支持此关键字时，或者我们不必支持无法识别此关键字的浏览器时，可以通过以下几种方法将某些 CSS 属性重置为其初始值：

| 属性 | 值 |
| ------ | ------ |
| `background` | `transparent` 或 `none` 或 `0 0` |
| `border` | `none` 或 `0` |
| `border-image` | `none` |
| `border-radius` | `0` |
| `box-shadow` | `none` |
| `clear` | `none` |
| `color` | 没有值，所以最好的办法是用 `inherit` 来使用从父元素传递过来的 `color` |
| `content` | `normal` |
| `display` | `inline` |
| `float` | `none` |
| `font` | `normal` |
| `height` | `auto` |
| `letter-spacing` | `normal` |
| `line-height` | `normal` |
| `max-width` | `none` |
| `max-height` | `height` |
| `min-width` | `0` |
| `min-height` | `0` |
| `opacity` | `1` |
| `overflow` | `visible` |
| `page-break-inside` | `auto` |
| `position` | `static`(不是 `relative`) |
| `text-shadow` | `none` |
| `text-transform` | `none` |
| `transform` | `none` |
| `transition` | `none` |
| `vertical-align` | `baseline` |
| `visibility` | `visible` |
| `white-space` | `normal` |
| `width` | `auto` |
| `word-spacing` | `normal` |
| `z-index` | `auto`(不是 `none` 或 `0`) |

## 参考

- [Safe CSS Defaults](http://nimbupani.com/safe-css-defaults.html)
