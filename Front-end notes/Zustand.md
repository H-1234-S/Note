# Zustand

* **Zustand** 是一个轻量级的 **React 状态管理库**，用于管理应用中的全局状态。


## 语法

~~~typescript
import { create } from "zustand";

// create是一个函数
const useStore = create((set,get) => ({
    
}))

export default useStore
~~~

## 参数

* `create函数`接受一个回调函数作为参数，
* 回调函数有两个参数set、get函数，该回调函数**返回一个对象**
* set函数用来更新状态，接收回调函数作为参数
* get函数用来获取状态

## 返回值

* ​

~~~typescript
import useStore from ''

const { 解构 } = useStore()
~~~

## 案例

创建一个store文件夹在文件下下面创建对应的业务模块比如全局管理price.ts，用来全局管理价格状态。

~~~typescript
import { create } from "zustand";
// 定义一个接口，用于描述状态管理器的状态和操作
interface PriceStore {
    price: number;
    incrementPrice: () => void;
    decrementPrice: () => void;
    resetPrice: () => void;
    getPrice: () => number;
}
// 创建一个状态管理器，使用 create 函数，传入一个函数，返回一个对象
/**
 * 
 * @param set 用于更新状态
 * @param get 用于获取状态
 * @returns 返回一个对象，对象中的方法可以用于更新状态
 */
const usePriceStore = create<PriceStore>((set, get) => ({
    price: 0, // 初始状态
    incrementPrice: () => set((state) => ({ price: state.price + 1 })), // 更新状态
    decrementPrice: () => set((state) => ({ price: state.price - 1 })), // 更新状态
    resetPrice: () => set({ price: 0 }), // 重置状态
    getPrice: () => get().price, // 获取状态
}));

export default usePriceStore;
~~~

* 在组件中使用

~~~typescript
import usePriceStore from './store/price';
export const App = () => {  
    //直接解构使用即可 把他当做一个hook使用
    const { price, incrementPrice, decrementPrice, resetPrice, getPrice } = usePriceStore();
    return (
        <div>
            <p>价格: {price}</p>
            <button onClick={incrementPrice}>增加</button>
            <button onClick={decrementPrice}>减少</button>
            <button onClick={resetPrice}>重置</button>
            <button onClick={getPrice}>获取</button>
        </div>
    )
}
~~~

* zustand的set函数会帮我们合并第一层状态，回想一下`useState`

~~~typescript
import { useState } from 'react'

const [state, setState] = useState({
     name: '张三',
     age: 18,
     price: 0,
})

setState((state) => ({
    // ...state, // 合并第一层状态 这个操作在zustand中会自动完成所以我们就不需要写这行代码了
    price: state.price + 1, // 更新状态
}))
~~~

## 状态处理

* Zustand 会合并第一层的 state，但是对于深层次的状态更新，需要手动合并，如果不手动合并，状态会丢失。

~~~typescript
import { create } from 'zustand'

interface User {
    gourd: {
        oneChild: string,
        twoChild: string,
        threeChild: string,
        fourChild: string,
        fiveChild: string,
        sixChild: string,
        sevenChild: string,
    },
    updateGourd: () => void
}

// 创建 store
const useUserStore = create<User>(((set) => ({
    // 初始化葫芦娃状态
    gourd: {
        oneChild: '大娃',
        twoChild: '二娃',
        threeChild: '三娃',
        fourChild: '四娃',
        fiveChild: '五娃',
        sixChild: '六娃',
        sevenChild: '七娃',
    },
    // 更新方法
    updateGourd: () => set((state) => ({
        gourd: {
            // ...state.gourd,  // 需要手动合并状态，若不手动合并状态，其余状态会丢失
            oneChild: '大娃-超进化',
        }
    }))
})))

export default useUserStore;
~~~

### 使用immer中间件

~~~typescript
npm install immer
~~~

* 基础用法

~~~typescript
import { produce } from 'immer'

const data = {
  user: {
    name: '张三',
    age: 18
  }
}

// 使用 produce 创建新状态
const newData = produce(data, draft => {
  draft.user.age = 20  // 直接修改 draft
})

console.log(newData, data) 
// 输出:
// { user: { name: '张三', age: 20 } } 
// { user: { name: '张三', age: 18 } }
~~~

* 在zustand中用法

~~~typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// 注意：使用 immer 中间件时的特殊结构
const useUserStore = create<User>()(immer((set) => ({
    gourd: {
        oneChild: '大娃',
        twoChild: '二娃',
        threeChild: '三娃',
        fourChild: '四娃',
        fiveChild: '五娃',
        sixChild: '六娃',
        sevenChild: '七娃',
    },
    updateGourd: () => set((state) => {
        // 直接修改状态，无需手动合并
        state.gourd.oneChild = '大娃-超进化'
        state.gourd.twoChild = '二娃-谁来了'
        state.gourd.threeChild = '三娃-我来了'
    })
})))
~~~

为什么要这么写

~~~typescript
const useUserStore = create<User>()()
~~~

第一步

~~~typescript
const createWithType = create<User>()
~~~

第二步

~~~typescript
const useUserStore = createWithType(immer(storeCreator))
~~~

本质是

~~~typescript
create<T>() => 返回一个函数
返回的函数再接收 (set, get) => state
~~~













