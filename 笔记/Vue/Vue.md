# 模板语法

## 文本插值

## HTML

## 属性绑定

## 使用 JavaScript 表达式

## 指令

### 动态参数

### 修饰符

# 响应式基础

## ref()

### 类型标注

``` js
import type { Ref } form 'vue'
```
## script setup

## 为什么要使用 ref？

当组件首次渲染时，会追踪组件中使用的 ref，当 ref发生变化时，会触发一次组件的重新渲染

## 深层响应式

`shallowRef` 监听 `value`
## DOM 更新时机

Vue 种 DOM 更新不是同步更新的，做了**批处理**