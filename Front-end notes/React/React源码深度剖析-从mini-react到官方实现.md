# React 源码深度剖析：从 mini-react 到官方实现

> 本文面向已实现过 mini-react 的开发者，系统讲解 React 官方实现相比 mini-react 多了什么，为什么必须这样设计

## 阅读指南

本文采用"问题驱动"的方式，每个知识点都会回答：
1. **要解决什么问题？**
2. **mini-react 为什么做不到？**
3. **React 官方是如何解决的？**
4. **这样设计的 trade-off 是什么？**

---

## 第一部分：从递归 Diff 到 Fiber 架构

### 1.1 mini-react 的实现方式

在你实现的 mini-react 中，协调过程可能是这样的：

```javascript
function reconcile(parentDom, element, oldFiber) {
  // 创建新 Fiber
  const newFiber = {
    type: element.type,
    props: element.props,
    dom: oldFiber ? oldFiber.dom : null,
    parent: parentFiber,
    alternate: oldFiber,
  };
  
  // 递归处理子节点
  reconcileChildren(newFiber, element.props.children);
  
  return newFiber;
}
```

**这种实现的问题：**

```
用户操作（点击按钮）
    ↓
触发 setState
    ↓
开始递归 reconcile
    ↓
处理 1000 个组件（假设需要 100ms）
    ↓
期间无法响应用户输入
    ↓
用户感觉卡顿
```

**核心问题：JavaScript 是单线程的**

```javascript
// 浏览器的事件循环
while (true) {
  // 1. 执行一个宏任务（script、setTimeout、事件回调等）
  task = taskQueue.shift();
  execute(task);
  
  // 2. 执行所有微任务
  while (microtaskQueue.length > 0) {
    microtask = microtaskQueue.shift();
    execute(microtask);
  }
  
  // 3. 渲染（如果需要）
  if (shouldRender()) {
    render();  // 样式计算、布局、绘制
  }
}
```

**问题的本质：**

如果 JS 执行时间超过 16.6ms（60fps），就会导致掉帧：

```
帧 1: JS(10ms) + 渲染(6ms) = 16ms ✅ 流畅
帧 2: JS(20ms) + 渲染(6ms) = 26ms ❌ 掉帧
帧 3: JS(5ms) + 渲染(6ms) = 11ms ✅ 流畅
```

**mini-react 为什么做不到优化？**

因为递归是同步的、不可中断的：

```javascript
function reconcileChildren(fiber, children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const newFiber = createFiber(child);
    
    // 递归调用，无法中断
    reconcileChildren(newFiber, child.props.children);
  }
}

// 一旦开始，必须处理完所有节点才能返回
// 调用栈：reconcile → reconcile → reconcile → ...
```

### 1.2 React 的解决方案：Fiber 架构

**核心思想：将递归改为循环 + 链表**

```javascript
// mini-react：递归（调用栈）
function reconcile(fiber) {
  reconcile(fiber.child);      // 递归调用
  reconcile(fiber.sibling);    // 递归调用
}

// React：循环（链表遍历）
function workLoop() {
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

**为什么链表可以中断？**

```javascript
// 递归：状态在调用栈中
function recursiveWork(node) {
  // 处理当前节点
  process(node);
  
  // 递归处理子节点
  if (node.child) {
    recursiveWork(node.child);  // 状态保存在调用栈
  }
  
  // 中断后无法恢复：调用栈已经展开
}

// 链表：状态在数据结构中
function iterativeWork() {
  let current = workInProgress;
  
  while (current !== null) {
    // 处理当前节点
    process(current);
    
    // 移动到下一个节点
    current = getNextFiber(current);  // 状态保存在 Fiber 节点
    
    // 可以随时中断
    if (shouldYield()) {
      workInProgress = current;  // 保存进度
      return;  // 中断
    }
  }
}
```

**图解：递归 vs 链表**

```
递归（调用栈）：
┌─────────────┐
│ reconcile(A)│ ← 栈顶
├─────────────┤
│ reconcile(B)│
├─────────────┤
│ reconcile(C)│
└─────────────┘
中断后，栈被清空，无法恢复

链表（Fiber 树）：
    A
   ↓ child
    B → sibling → C
   ↓ child
    D

workInProgress = B  ← 保存在变量中
中断后，下次从 B 继续
```

### 1.3 Fiber 节点的完整结构

**mini-react 的 Fiber 可能只有这些字段：**

```javascript
const fiber = {
  type: 'div',
  props: { children: [] },
  dom: domNode,
  parent: parentFiber,
  child: childFiber,
  sibling: siblingFiber,
  alternate: oldFiber,
  effectTag: 'PLACEMENT',  // 'UPDATE' | 'DELETION'
};
```

**React 官方的 Fiber 有 30+ 个字段，为什么？**

让我们按职责分类理解：

#### 1.3.1 树结构字段（你已经实现的）

```javascript
{
  // 指针：构成 Fiber 树
  return: parentFiber,    // 父节点（向上）
  child: firstChild,      // 第一个子节点（向下）
  sibling: nextSibling,   // 下一个兄弟节点（向右）
  index: 0,               // 在父节点中的位置
}
```

**为什么用 return 而不是 parent？**

因为 Fiber 的遍历是"工作完成后返回"，return 更准确地表达了这个语义。

#### 1.3.2 工作单元字段（mini-react 简化了）

```javascript
{
  // 节点类型
  tag: FunctionComponent,  // 0=函数组件, 1=类组件, 5=DOM节点...
  type: App,               // 函数本身 / 类 / 'div'
  elementType: App,        // 通常和 type 相同，memo/lazy 时不同
  
  // 关联的实例
  stateNode: domNode,      // DOM节点 / 类组件实例 / null
  
  // Props 和 State
  pendingProps: newProps,  // 新传入的 props
  memoizedProps: oldProps, // 上次渲染的 props
  memoizedState: state,    // 上次渲染的 state（函数组件存 hooks 链表）
  
  // 更新队列
  updateQueue: {           // setState 产生的更新
    pending: update,       // 环形链表
  },
}
```

**为什么需要 pendingProps 和 memoizedProps？**

```javascript
// 场景：判断 props 是否变化，决定是否 bailout
function beginWork(current, workInProgress) {
  const oldProps = current.memoizedProps;
  const newProps = workInProgress.pendingProps;
  
  if (oldProps === newProps) {
    // props 没变，可以跳过
    return bailout(workInProgress);
  }
  
  // props 变了，需要重新渲染
  // ...
}
```

**为什么 memoizedState 在函数组件中存 hooks 链表？**

```javascript
// 类组件：memoizedState 就是 state 对象
class App {
  state = { count: 0 };  // ← 存在这里
}

// 函数组件：没有实例，state 存在哪？
function App() {
  const [count, setCount] = useState(0);  // ← 存在 Fiber.memoizedState
  const [name, setName] = useState('');   // ← 链表的下一个节点
}

// Fiber.memoizedState 结构：
{
  memoizedState: {
    memoizedState: 0,      // count 的值
    next: {
      memoizedState: '',   // name 的值
      next: null,
    }
  }
}
```

#### 1.3.3 副作用字段（mini-react 只有 effectTag）

```javascript
{
  // 副作用标记（位运算）
  flags: 0b000000000000000000000100,  // Update
  subtreeFlags: 0b000000000000010000000100,  // 子树的副作用
  deletions: [fiber1, fiber2],  // 需要删除的子节点
}
```

**为什么用位运算？**

```javascript
// mini-react：字符串
fiber.effectTag = 'UPDATE';
if (fiber.effectTag === 'UPDATE') { /* ... */ }

// React：位运算（更高效）
export const Update = 0b000000000000000000000100;
export const Placement = 0b000000000000000000000010;
export const Deletion = 0b000000000000000000001000;

fiber.flags |= Update;                    // 添加标记
fiber.flags &= ~Update;                   // 移除标记
if (fiber.flags & Update) { /* ... */ }   // 检查标记

// 可以同时标记多个副作用
fiber.flags = Placement | Update;  // 0b000000000000000000000110
```

**为什么需要 subtreeFlags？**

这是 React 18 的优化，用于快速跳过没有副作用的子树：

```javascript
// React 17：需要遍历整棵树
function commitMutationEffects(root) {
  let fiber = root;
  while (fiber !== null) {
    if (fiber.flags & Update) {
      commitUpdate(fiber);
    }
    // 必须遍历所有子节点
    fiber = getNextFiber(fiber);
  }
}

// React 18：可以跳过子树
function commitMutationEffects(root) {
  let fiber = root;
  while (fiber !== null) {
    // 子树没有副作用，直接跳过
    if ((fiber.subtreeFlags & MutationMask) === NoFlags) {
      fiber = getNextSibling(fiber);  // 跳过整个子树
      continue;
    }
    
    if (fiber.flags & Update) {
      commitUpdate(fiber);
    }
    fiber = getNextFiber(fiber);
  }
}
```

**图解 subtreeFlags 的作用：**

```
        A (subtreeFlags: Update)
       / \
      B   C (flags: Update)
     /
    D

遍历 A：检查 subtreeFlags，发现子树有 Update
遍历 B：检查 subtreeFlags，发现子树没有副作用 → 跳过 D
遍历 C：执行 Update

节省了遍历 D 的开销
```

#### 1.3.4 优先级字段（mini-react 没有）

```javascript
{
  lanes: 0b0000000000000000000000000010000,      // 本节点的优先级
  childLanes: 0b0000000000000000000000000010000, // 子树的优先级
}
```

**为什么需要优先级？**

```javascript
// 场景：用户正在输入，同时有一个低优先级的列表更新
用户输入 → 高优先级更新（SyncLane）
列表更新 → 低优先级更新（DefaultLane）

// 没有优先级：按顺序执行
1. 处理列表更新（耗时 100ms）
2. 处理输入更新
→ 用户感觉输入卡顿

// 有优先级：高优先级打断低优先级
1. 开始处理列表更新
2. 用户输入，打断列表更新
3. 立即处理输入更新
4. 继续处理列表更新
→ 用户感觉流畅
```

**为什么需要 childLanes？**

用于快速判断子树是否需要更新：

```javascript
function beginWork(current, workInProgress, renderLanes) {
  // 检查子树是否有当前优先级的更新
  if (!includesSomeLane(workInProgress.childLanes, renderLanes)) {
    // 子树没有更新，直接跳过
    return bailoutOnAlreadyFinishedWork(workInProgress);
  }
  
  // 子树有更新，继续处理
  // ...
}
```

// __CONTINUE_HERE__