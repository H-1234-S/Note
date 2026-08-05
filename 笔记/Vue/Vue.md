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

#### 类型标注

``` js
import type { Ref } form 'vue'
```

或者

``` js

```
### script setup

### 为什么要使用 ref？

当组件首次渲染时，会追踪组件中使用的 ref，当 ref发生变化时，会触发一次组件的重新渲染

### 深层响应式

`shallowRef` 监听 `value`
### DOM 更新时机

Vue 种 DOM 更新不是同步更新的，做了**批处理**

## reactive

# 计算属性

`computed` 接收一个回调函数，返回一个计算属性 `ref`，该 `ref` 同一般 `ref`

## 计算属性 vs 方法

虽然两种方式在得到的结果完全相同，但是过程是不同的

对于**计算属性**，**计算属性值会基于其响应式依赖被缓存**；一个计算属性仅会在其**响应式依赖更新时**才重新计算

计算属性默认是只读的

## 可写计算属性

computed 接收一个对象，抛出 get 和 set 方法

``` vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  // getter
  get() {
    return firstName.value + ' ' + lastName.value
  },
  // setter
  set(newValue) {
    // 注意：我们这里使用的是解构赋值语法
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
</script>
```

`fullName.value` 会触发 `get()` 函数

为 `fullName.value` 赋值则是调用 `set()` 函数；之后运行 `newValue.split(' ')` 解构赋值

# 类与样式绑定

可以绑定对象

可以绑定计算属性

# 表单输入绑定

v-bind 动态的绑定属性

v-model 在表单输入元素或组件上创建双向绑定。