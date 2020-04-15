---
title: 谈 HTTP 缓存
date: 2019-01-11
categories:
  - JavaScript
tags:
  - HTTP
---

::: tip
1. 强缓存
2. 协商缓存
3. 两者共同点与不同点
:::

<!-- more -->

## 强缓存

当浏览器请求一份资源时，根据 `Expires` 或者 `Cache-Control` 来判断是否从本地缓存中读取资源，这就是强缓存。

强缓存主要是通过指定 header 里的两个参数来使用，一个是 HTTP/1.0 版本的 `Expires` ，另一个就是HTTP/1.1版本的 `Cache-Control`。

### 1、`Expires`

这个 header 字段是 HTTP/1.0 时候所使用的，用于描述一个绝对时间，由服务器返回，但是该字段受限于本地时间，假如本地时间被修改，那么缓存就会失效。所以才有了下面的 `Cache-Control`。

### 2、`Cache-Control`

`Cache-Control` 是 HTTP/1.1 出现的，在 HTTP/1.1 版本的服务器中优先级要高于 `Expires`，反之亦然。用来描述的是一个相对时间。

```shell
Cache-Control: max-age=604800
// 表示能缓存的最大时间，max-age是距离请求发起的时间的秒数

Cache-Control: no-cache
// 表示强制确认缓存，即我们请求资源的时候每次都需要向服务器确认是否能使用缓存，**这个并不是完全不能使用缓存的含义**

Cache-Control: no-store
// 表示禁止进行缓存，这个表示客户端不能使用缓存，每次都需要向服务器请求资源，**这个是真正意义上的不能使用缓存**

Cache-Control: public
// 表示所有用户都能使用缓存，包括缓存服务器，CDN等

Cache-Control: private
// 表示只有指定用户才能使用缓存
```

## 协商缓存

当浏览器请求一份资源时，当没有命中强缓存的时候，浏览器就会发一个请求去服务器，这时候浏览器根据 `if-Modified-Since` 和 `last-Modified` 或者 `if-None-Match` 和 `ETag` 这两对 header 指令来确定是否使用缓存，这种方式就是协商缓存。

### 1、`if-Modified-Since` 和 `last-Modified`

客户端请求资源时会带上 `if-Modified-Since`, 假如该时间小于 `last-Modified`，则说明资源已经更新，此时服务器就会返回更新后的资源，并且更新 `if-Modified-Since`，如果等于 `last-Modified`，则说明未更新，状态码返回 304。

但是由于该指令只能精确到秒，所以当短时间内频繁更新的时候就会出现问题，此时就需要借助 `ETag`。

2、`if-None-Match` 和 `ETag`

`ETag`是用来标示文件更改状态的一串随机值，跟文件修改时间无关，只跟文件本身有关，所以是唯一的。
`if-None-Match` 会将上次返回的 `ETag` 作为值发送给服务器。服务器会将资源当前的 `ETag` 与其比对，如果相同，则返回 304 状态码，否则就返回更新后的资源，并同时将`ETag`发送给客户端。

## 强缓存与协商缓存

### 共同点

当命中缓存之后，均是从本地缓存中读取资源。

### 不同点

强缓存不会发起浏览器请求。协商缓存则会发起一次请求，以确定是否命中缓存，如果命中则返回 304 Not Modified。
