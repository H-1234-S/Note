# 📑 React-Firebase Chat 项目开发技术文档

## 一、 数据库架构设计 (Firestore Schema)

项目采用 NoSQL 文档型数据库，核心由三个集合（Collections）组成，通过 `uid` 和 `chatId` 实现关联。

### 1. `users` 集合

- **用途**: 存储全站用户信息。
    
- **文档 ID**: 用户的 `uid` (由 Firebase Auth 生成)。
    
- **核心字段**:
    
    - `username` (string): 用户名
        
    - `email` (string): 邮箱
        
    - `avatar` (string): 头像 URL
        
    - `blocked` (array): 存储已屏蔽用户的 `uid`
        

### 2. `chats` 集合

- **用途**: 存储两名用户之间的具体对话记录。
    
- **文档 ID**: 唯一的 `chatId` (通常在建立聊天时生成)。
    
- **核心字段**:
    
    - `createdAt` (timestamp): 创建时间
        
    - `messages` (array of objects):
        
        - `senderId` (string): 发送者 ID
            
        - `text` (string): 文本内容
            
        - `img` (string, optional): 图片 URL
            
        - `createdAt` (timestamp): 发送时间
            

### 3. `userchats` 集合

- **用途**: **索引表**。记录每个用户参与了哪些聊天，用于渲染左侧列表。
    
- **文档 ID**: 用户的 `uid`。
    
- **核心字段**:
    
    - `chats` (array of objects):
        
        - `chatId`: 指向 `chats` 集合
            
        - `lastMessage`: 最后一条消息预览
            
        - `receiverId`: 对方 ID
            
        - `updatedAt`: 排序依据
            
        - `isSeen`: 未读状态标记
            

---

## 二、 数据流动方向 (Data Flow)

理解数据如何在组件、全局状态（Zustand）和 Firebase 之间流动是开发的关键。

### 1. 认证与初始化流 (Auth Flow)

1. **用户操作**: 用户提交登录表单。
    
2. **Firebase Auth**: 调用 `signInWithEmailAndPassword`。
    
3. **状态分发**: `onAuthStateChanged` 监听到登录，通过 **Zustand** 将 `currentUser` 存入全局状态。
    
4. **UI 响应**: `App.jsx` 判断 `currentUser` 存在，渲染主界面。
    

### 2. 消息发送流 (Write Flow)

1. **用户输入**: 用户在 `Chat.jsx` 点击发送。
    
2. **图片处理**: 如果有图片，先调用 `upload.js` 上传至 **Firebase Storage**，获取 URL。
    
3. **更新对话记录**: 使用 `arrayUnion` 将新消息推送到 `chats` 集合对应的文档中。
    
4. **同步索引表**: 同时更新发送者和接收者在 `userchats` 中的 `lastMessage` 和 `updatedAt`。
    

### 3. 实时接收流 (Read/Live Flow)

1. **建立监听**: 组件挂载时，调用 Firestore 的 `onSnapshot()` 订阅当前 `chatId` 的文档。
    
2. **数据推送**: 数据库一旦有新消息写入，Firebase 会主动推送更新后的数据给客户端。
    
3. **状态更新**: React 监听到 `onSnapshot` 回调，更新本地 State。
    
4. **UI 渲染**: 聊天窗口自动渲染新消息，并触发 `useRef` 滚动到底部。
    

---

## 三、 前端逻辑模块拆解

### 1. 状态管理 (Zustand Stores)

- **`useUserStore`**: 管理当前登录用户的个人资料、加载状态。
    
- **`useChatStore`**: 管理当前正在和谁聊天（`chatId`）、是否被屏蔽、对方信息。
    

### 2. 工具函数 (Lib)

- **`firebase.js`**: SDK 初始化，导出 `auth`, `db`, `storage` 实例。
    
- **`upload.js`**: 封装 `uploadBytesResumable` 逻辑，返回一个 Promise，解析为图片的下载链接。
    

---

## 四、 开发避坑指南 (Best Practices)

1. **安全规则 (Security Rules)**: 在 Firebase 后台务必配置 `allow read, write: if request.auth != null;`，防止数据裸奔。
    
2. **清除监听**: 在 `useEffect` 的 return 中必须执行 `unsub()`，否则切换聊天频道时会堆积多个监听器，导致内存泄漏。
    
3. **异步原子性**: 发送消息涉及更新两个集合（`chats` 和 `userchats`），在进阶开发中可以考虑使用 `writeBatch` 来保证操作的原子性。