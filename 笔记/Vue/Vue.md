# 模板语法

``` vue
<script>
export default {
    setup() {
        const a = 1
        return {
            a
        }
    }
}
</script>
  
<template>
    <div>
        {{ a }}
    </div>
</template>
```

> 等同于

双大括号 `{{ }}` 会将数据解释为纯文本

``` vue
<script setup lang="ts">
    const a:number = 1
</script>
  
<template>
    <div>
        container {{a}}
    </div>
</template>
```

> 支持运算、支持三元表达式

> textarea 不支持插值 {{ }}

# 指令

vue中指令是vue提供的一组特殊的 HTML 属性，用来让 DOM 执行特殊操作

## v-text

`v-text` 通过设置元素的 [textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) 属性来工作，因此它将覆盖元素中所有现有的内容。

``` vue
<script setup lang="ts">
    const a:number = 1
</script>
  
<template>
    <div v-text="a">
    </div>
</template>
```

``` vue
<span v-text="msg"></span>
<!-- 等同于 -->
<span>{{msg}}</span>
```

> 该指令效果同**双大括号语法**
## v-html

``` vue
<script setup lang="ts">
    const a:string = '<a href="www.baidu.com">百度</a>'
</script>
  
<template>
    <div v-html="a">
    </div>
</template>
```

`v-html` 同样可以显示文本，但是也可以**解析标签**

## v-if

``` vue
<script setup lang="ts">
    const a:boolean = true
</script>
  
<template>
    <div v-if="a">
        true
    </div>
</template>
```

false 时，则是将该 DOM 注释掉

###  v-else

``` vue
<script setup lang="ts">
    const a:boolean = true
</script>
  
<template>
    <div v-if="a">
        true
    </div>
    <div v-else>
        false
    </div>
</template>
```

### v-else-if

``` vue
<script setup lang="ts">
    const a:string = "A"
</script>
  
<template>
    <div v-if=" a == 'B' ">
        B
    </div>
    <div v-else-if=" a == 'A' ">
        A
    </div>
    <div v-else>
        false
    </div>
</template>
```

> 注意**顺序问题**
## v-show

接收一个布尔值

``` vue
<script setup lang="ts">
    const a:boolean = false
</script>
  
<template>
    <div v-show="a">
        true
    </div>
</template>
```

false 时则是添加了样式 `display:none`，性能要好一点

## v-on

通过 `v-on` 给元素绑定事件；`v-on:事件名="方法名"`  

``` vue
<script setup lang="ts">
    const handleClcik = ()=> {
        console.log('click')
    }
</script>

<template>
    <button v-on:click="handleClcik">click</button>
</template>
```

> 等价于

``` vue
<script setup lang="ts">
    const handleClcik = ()=> {
        console.log('click')
    }
</script>

<template>
    <button @click="handleClcik">click</button>
</template>
```

### 动态

通过 `[]` 解析变量

```vue
<script setup lang="ts">
    const handleClcik = ()=> {
        console.log('click')
    }
  
    const event = 'click'
</script>
  
<template>
    <button @[event]="handleClcik">click</button>
    <button v-on:[event]="handleClcik">click me</button>
</template>
```

### 全部用法
``` vue
<!-- 方法处理函数 -->
<button v-on:click="doThis"></button>

<!-- 动态事件 -->
<button v-on:[event]="doThis"></button>

<!-- 内联声明 -->
<button v-on:click="doThat('hello', $event)"></button>

<!-- 缩写 -->
<button @click="doThis"></button>

<!-- 使用缩写的动态事件 -->
<button @[event]="doThis"></button>

<!-- 停止传播 -->
<!-- 通常会触发parent事件，stop阻止冒泡 -->
<button @click.stop="doThis"></button>

<!-- 阻止默认事件 -->
<button @click.prevent="doThis"></button>

<!-- 不带表达式地阻止默认事件 -->
<form @submit.prevent></form>

<!-- 链式调用修饰符 -->
<button @click.stop.prevent="doThis"></button>

<!-- 按键用于 keyAlias 修饰符-->
<input @keyup.enter="onEnter" />

<!-- 点击事件将最多触发一次 -->
<button v-on:click.once="doThis"></button>

<!-- 对象语法 -->
<button v-on="{ mousedown: doThis, mouseup: doThat }"></button>
```

## v-bind

``` html
<div id="box">
  内容
</div>
```

用于动态绑定 HTML 属性或者组件 props；`v-bind` 等价于 `:` 

``` vue
<script setup lang="ts">
const id: string = '123'
const style = {
    color: 'red'
}
</script>
  
<template>
    <div v-bind:id="id">演示bind</div>
    <div :id="id">演示</div>
    <div :style="style">red</div>
</template>
  
<style scoped lang="less">

</style>
```

### 例如

> 动态绑定 class

``` vue
<script setup lang="ts">

</script>

<template>
    <div :class="['a', 'b']">
        is div
    </div>
</template>

<style scoped lang="less">
.a {
    color: red;
}
  
.b {
    border: 1px solid chocolate;
}
</style>
```

> 动态控制 HTML 属性

``` vue
<script setup>

const disabled = true

</script>


<template>

<button :disabled="disabled">
提交
</button>

</template>
```

## v-model

用于 vue 中双向数据绑定，也就是让表单中的数据跟vue中数据一致

注意：

``` vue
<script setup lang="ts">
import { ref } from 'vue';
const usename = ref('')
</script>

<template>
    <input v-model="usename" type="text">
  
    <div>
        {{ usename }}
    </div>
  
</template>
```

## v-for

`v-for` 主要用于遍历数组、对象

> 可以访问外层作用域中的变量

``` vue
<script setup lang="ts">
  
const array:string[] = ['1','2','3','4']
  
</script>
  
<template>
  <div>
    <div v-for="item in array">
        {{ item }}
    </div>
  </div>
</template>
```

也可以为索引指定别名 (如果用在对象，则是键值)

``` vue
<div v-for="(item, index) in items"></div>
<div v-for="(value, key) in object"></div>
<div v-for="(value, name, index) in object"></div>
```

> v-for 通常配合 ：key使用

### 注意

`v-if` 和 `v-for` 作用在同一节点；`v-if` 比 `v-for` 的优先级更高

## v-once

仅渲染元素和组件一次，并跳过之后的更新。

``` vue
<script setup lang="ts">
import { ref } from 'vue'
const msg = ref(1)
setInterval(() => {
  msg.value++
}, 1000)
</script>
  
<template>
<!-- 没有 v-once -->
<div>
  普通渲染：{{ msg }}
</div>
  
<!-- 有 v-once -->
<div v-once>
  v-once渲染：{{ msg }}
</div>

</template>
```

用于性能优化

## v-memo

接收一个依赖数组；如果数组里的每个值都与最后一次的渲染相同，那么整个子树的更新将被跳过。

`v-memo` 传入空依赖数组 (`v-memo="[]"`) 将与 `v-once` 效果相同。

# 响应式

## ref()

使用 ref() 函数声明响应式状态

`ref()` 接收参数，并将其包裹在一个带有 `.value` 属性的 ref 对象中返回

**注意**，在模板中使用 ref 时，我们**不**需要附加 `.value`；会自动解包；**只有顶级属性才会解包**

### 类型限定

> 让 `TS` 根据上下文自动推导

> 给 `ref` 传递个泛型；也可以引入 `Ref` 

``` vue
<template>
    <div>
        {{ obj }}
    </div>
    <hr>
    <button @click="handleChange">
        change
    </button>
</template>
  
<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Ref } from 'vue'
  
type User = {
    name:string
}
  
// const obj:Ref<User> = ref(
//     {
//         name: 'Jo'
//     }
// )
  
const obj = ref<User>({
    name:'Jo'
})
  
const handleChange = () => {
    console.log(obj.value.name)
    obj.value.name = '111'
    console.log(obj.value.name)
}
</script>
  
<style scoped lang="less"></style>
```

## isRef

判断是否为 ref 对象

## shallowRef

ref 会递归转换内部对象为响应式；shallowRef 只监听 `.value` 这一层，不处理内部对象。

意思是：
``` vue
<template>
    <div>
        {{ obj2 }}
    </div>
    <hr>
    <button @click="handleChange">
        change
    </button>
</template>
  
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
  
type User = {
    name: string
}
  
const obj = ref<User>({
    name: 'Jo'
})
  
const obj2 = shallowRef({
    name: 'Jo2'
})
  
const handleChange = () => {
    obj2.value = {
        name: 'Jo3'
    }
}
</script>

<style scoped lang="less"></style>
```

更改 `.value` 的引用才可以捕捉到变化；也就是 `vue` 只监听到 `obj.value`

虽然值会发生改变，但是不会改变渲染

`shallowRef` 主要用于保存大型对象或者第三方库实例，避免 `Vue` 深度代理带来的性能开销。

#### 注意

> `ref` 变化会影响到 `shallowRef`，因此不可以一起写

## triggerRef

`triggerRef()` 用于强制触发依赖于一个[浅层 ref](https://cn.vuejs.org/api/reactivity-advanced.html#shallowref) 的副作用

``` ts
function triggerRef(ref: ShallowRef): void
```

## customRef

# 响应式基础
## ref()

#### 类型标注

``` js

import type { Ref } form 'vue'

```
### script setup

### 为什么要使用 ref？
  
当组件首次渲染时，会追踪组件中使用的 ref，当 ref发生变化时，会触发一次组件的重新渲染

### 深层响应式

`shallowRef` 监听 `value`

### DOM 更新时机


Vue 种 DOM 更新不是同步更新的，做了**批处理**

## reactive

将一个**对象**变为响应式对象，vue可以追踪并更新；reactive 返回的是原始对象的 proxy

### 问题

- 只适用于对象
- 不能解构
- 必须始终保持对响应式对象的相同引用

# 计算属性

`computed` 接收一个回调函数，返回一个计算属性 `ref`，该 `ref` 同一般 `ref`

计算属性是用来描述**依赖响应式数据变化的逻辑**
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

# 类与样式的绑定

绑定对象：相当于动态的切换类；active 类只有在 isActive 为 true 时才显示

``` jsx
<div v-bind:class="{ active: isActive }">isActive</div>

// vue
const isActive = ref(false);
```

绑定计算属性

绑定数组

``` vue
<div :class="[activeClass, errorClass]"></div>
```

---

> 对于**只有一个根节点**的子组件，直接在子节点上设置class会作用于子组件根节点的class上

> 对于有多个节点的子组件，需要借助 `$attrs` 属性来指定接收的元素
# 侦听器

watch 当依赖发生变化时执行副作用

侦听的内容可以是一个ref对象(计算属性)、一个函数/返回值、多个数据源组成的数组

**注意：** 不能直接侦听响应式对象的属性值

``` js
const obj = reactive({ count: 0 })

// 错误，因为 watch() 得到的参数是一个 number
watch(obj.count, (count) => {
  console.log(`Count is: ${count}`)
})
```

这里需要用一个返回该属性的 getter 函数：

``` js
// 提供一个 getter 函数
watch(
  () => obj.count,
  (count) => {
    console.log(`Count is: ${count}`)
  }
)
```

如果传递一个**响应式对象**，那么会创建一个**深层侦听器**；可以用 `getter` 函数依赖具体一属性

只有在返回不同的对象时，才会触发回调：

``` js
watch(
  () => state.someObject,
  () => {
    // 仅当 state.someObject 被替换时触发
  }
)
```

你也可以给上面这个例子显式地加上 `deep` 选项，强制转成深层侦听器：

``` js
watch(
  () => state.someObject,
  (newValue, oldValue) => {
    // 注意：`newValue` 此处和 `oldValue` 是相等的
    // *除非* state.someObject 被整个替换了
  },
  { deep: true }  // 还可以接收一个数字，表示最大遍历深度
)
```

---

`watch` 默认是懒执行的：仅当数据源变化时，才会执行回调

``` js
watch(
  source,
  (newValue, oldValue) => {
    // 立即执行，且当 `source` 改变时再次执行
  },
  { immediate: true } // 创建时就执行一次
)
```

直接给 `watch()` 传入一个响应式对象，会隐式地创建一个深层侦听器

## `watchEffect()`

`watchEffect` 会自动跟踪回调中的响应式依赖

``` js
const todoId = ref(1)
const data = ref(null)

watch(
  todoId,
  async () => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
    )
    data.value = await response.json()
  },
  { immediate: true }
)
```
重写
``` js
watchEffect(async () => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
  )
  data.value = await response.json()
})
```

对于嵌套结构中的数据，watchEffect 只跟踪**回调中被使用到的属性**，而不是递归地跟踪所有的属性。

## onWatcherCleanup

相当于 useEffect 中的清理函数

必须在 `watchEffect` 效果函数或 `watch` 回调函数的**同步执行期间调用**：你不能在异步函数的 `await` 语句之后调用它。

> 作为替代，`onCleanup` 函数还作为第三个参数传递给侦听器回调，以及 `watchEffect` 作用函数的第一个参数：

``` js
watch(id, (newId, oldId, onCleanup) => {
  // ...
  onCleanup(() => {
    // 清理逻辑
  })
})

watchEffect((onCleanup) => {
  // ...
  onCleanup(() => {
    // 清理逻辑
  })
})
```

## 回调的触发时机

默认情况下，侦听器回调会在父组件更新 (如有) **之后**、所属组件的 DOM 更新**之前**被调用

> 类似于组件更新，用户创建的侦听器回调函数也会被批量处理以避免重复调用

如果想在侦听器回调中能访问被 Vue 更新**之后**的所属组件的 DOM，需要指明 `flush: 'post'` 选项

# 模板引用

## 组件上的 ref

模板引用也可以被用在一个子组件上。这种情况下引用中获得的值是**组件实例**：

``` vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'
import Child from './Child.vue'

const childRef = useTemplateRef('child')

onMounted(() => {
  // childRef.value 将持有 <Child /> 的实例
})
</script>

<template>
  <Child ref="child" />
</template>
```

> **注意：** 使用了 `<script setup>` 的组件是**默认私有**的；子组件需要通过 `defineExpose` 宏显示暴露

# 组件基础

## 监听事件

