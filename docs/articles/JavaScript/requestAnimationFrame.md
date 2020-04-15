---
title: requestAnimationFrame
date: 2019-01-15
categories:
  - JavaScript
tags:
  - requestAnimationFrame
  - 动画
  - polyfill
  - 兼容
---

::: tip
1. 介绍
2. 特点
3. 兼容
4. polyfill
:::

<!-- more -->

## 介绍

与 `setTimeout` 和 `setInterval` 不同，`requestAnimationFrame` 不需要设置时间间隔。

大多数电脑显示器的刷新频率是 60Hz，大概相当于每秒钟重绘 60 次。大多数浏览器都会对重绘操作加以限制，不超过显示器的重绘频率，因为即使超过那个频率用户体验也不会有提升。因此，最平滑动画的最佳循环间隔是 1000ms/60，约等于 16.6ms。

而 `setTimeout` 和 `setInterval` 的问题是，它们都不精确。它们的内在运行机制决定了时间间隔参数实际上只是指定了把动画代码添加到浏览器UI线程队列中以等待执行的时间。如果队列前面已经加入了其他任务，那动画代码就要等前面的任务完成后再执行。

`requestAnimationFrame` 采用系统时间间隔，保持最佳绘制效率，不会因为间隔时间过短，造成过度绘制，增加开销；也不会因为间隔时间太长，使用动画卡顿不流畅，让各种网页动画效果能够有一个统一的刷新机制，从而节省系统资源，提高系统性能，改善视觉效果。

CSS 的 `transition` 和 `animation` 效果优于 JavaScript 实现的动画效果，原因在于 CSS 知道动画什么时候开始，会计算出正确的循环间隔，在适合的时候刷新UI。基于该问题，浏览器为了 JavaScript 动画添加了一个新API，即 `requestAnimationFrame`。

`requestAnimationFrame` 基本思想是利用显示器的刷新机制，与刷新频率保持同步，并利用这个刷新频率进行页面重绘更新。不过需要注意：因为 JavaScript 单线程工作机制，如果主线程一直处于繁忙状态，那么 `requestAnimationFrame` 的动画效果也会受影响的。

## 特点

- `requestAnimationFrame` 会把每一帧中的所有 DOM 操作集中起来，在一次重绘或回流中就完成，并且重绘或回流的时间间隔紧紧跟随浏览器的刷新频率。

- 在隐藏或不可见的元素中，`requestAnimationFrame` 将不会进行重绘或回流，这当然就意味着更少的 CPU、GPU和内存使用量。

- `requestAnimationFrame` 是由浏览器专门为动画提供的 API，在运行时浏览器会自动优化方法的调用，并且如果页面不是激活状态下的话，动画会自动暂停，有效节省了 CPU 开销。

## 兼容

IE9- 浏览器不支持 `requestAnimationFrame`，可以使用 `setTimeout`来兼容。

## polyfill

```js
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
```
