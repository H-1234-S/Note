## Change: ep2-03-dashboard-page

## 元信息

| 属性 | 内容 |
|------|------|
| **Change ID** | `ep2-03-dashboard-page` |
| **所属 Epic** | Epic 2: 项目管理与 Dashboard |
| **优先级** | P0 |
| **预估规模** | M（~750 LOC） |
| **预估工期** | 2 天 |
| **前置 Change** | `ep2-02-project-list-detail-api`（`project.list` / `project.getById` API 就绪） |
| **并行 Change** | `ep2-05-cancel-retry-delete-api`（本 Change 含轻量 delete/retry stub；ep2-05 增强为完整级联/resume 逻辑） |
| **目标代码库** | `E:\A\Ai\convert documents to videos` |
| **实施日期** | 2026-06-13 |
| **实施状态** | ✅ 已完成 |

---

## Goal

实现**首页双模式**——未登录展示 Landing 首屏（Aceternity WavyBackground），登录后展示三 Tab 极简主页（生成视频 / 历史记录 / 订阅升级），并集成 Aceternity FocusCards 展示历史视频截图。

---

## Scope

### ✅ 包含内容

1. **Landing 首屏**（未登录状态）
   - Aceternity UI `WavyBackground` 全屏波浪背景
   - 右上角登录 / 注册按钮 + 主题切换器
   - 极简设计，无其他元素
   - 响应式主题切换（亮/暗模式）

2. **Main App 导航栏**（登录后状态）
   - 顶部居中三 Tab：`生成视频` / `历史记录` / `订阅升级`
   - 顶部右侧用户中心按钮（头像 + 下拉菜单）
   - **Tab 切换滑块动画**（Framer Motion layoutId）
   - 当前激活 Tab 高亮指示

3. **Tab 1：生成视频**
   - 屏幕正中文本框（Textarea）
   - 文本框右下角"生成"按钮
   - 提交 → 调 `project.createAndGenerate` → **成功后自动切换到"历史记录"Tab**（用户立即看到生成中的项目卡片，验证提交已生效）
   - 防重复提交（`isPending` 时按钮 disabled + spinner）

4. **Tab 2：历史记录**
   - 使用**极简列表布局**展示所有有效项目（排除 `deleted` 状态）
   - 每个列表项 = 标题 + 状态标签 + 时长 + 创建日期
   - 已完成的项目：正常状态显示
   - 生成中的项目：显示"生成中…"标签
   - 失败的项目：显示红色"生成失败"标签 + 重试按钮
   - 点击列表项 → 跳转视频播放页 `/projects/[id]/play`
   - 数据源：`project.list` API，**不传 `status` 参数**（拉取全部，客户端过滤 `deleted`）
   - 自动轮询（`refetchInterval: 10_000`）——追踪生成中→已完成的转变
   - 空状态："还没有生成视频" + CTA

5. **Tab 3：订阅升级**
   - 简单占位页面（标题 + 几个定价卡片，纯 UI）
   - 无实际支付逻辑

6. **首页路由分流**
   - `src/app/page.tsx`：根据 `useSession()` 状态分流
   - `isPending` → 全屏 Loading（防止闪屏）
   - 未登录 → Landing 首屏
   - 已登录 → Main App（三 Tab）

7. **轻量 mutation 端点**
   - `project.delete` mutation：权限校验 + 软删除
   - `generation.retry` mutation：权限校验 + 重建 Job + 发送 Inngest 事件
   - 注：ep2-05 增强为完整级联删除 / resume 重试 / 取消检查点

8. **视频播放占位页**
   - `src/app/(protected)/projects/[id]/play/page.tsx`：极简 stub
   - 显示项目标题 + "视频播放功能即将推出"

### ❌ 不包含内容

- ❌ 完整 Landing 页（Footer、Feature 区、动画）→ `ep6-04`
- ❌ 实际视频播放器（`ep6-03`）
- ❌ 创建项目独立页面（已融入"生成视频"Tab）→ `ep2-04` 精简或取消
- ❌ 视频截图真实图片（依赖 `ep5-07` renderStill）
- ❌ 项目详情页（`ep2-04` 或独立 Change）
- ❌ 完整级联删除 / resume 重试 / 取消 API（`ep2-05`）
- ❌ 实际支付 / 订阅逻辑
- ❌ 全文搜索
- ❌ 全局导航栏重构（`ep6-04`）

---

## 实施完成情况

### ✅ 已实现功能

#### 1. 设计系统优化（基于 tasteskill v2）

**主题切换联动修复**
- `WavyBackground` 组件添加 `isDark` 状态监听
- 动态切换背景色和波浪颜色：
  - 亮模式：`rgb(250,250,250)` 背景 + `#cccccc` 系列波浪
  - 暗模式：`rgb(10,10,10)` 背景 + `#404040` 系列波浪
- Canvas 自动响应主题变化重绘

**波浪背景强度提升**
- 不透明度：`0.15` → **`0.4`**（提升可见度）
- 模糊度：`6` → **`8`**（更柔和过渡）
- 线条宽度：`50` → **`80`**（更明显的条纹）
- 形成三层视觉层级：背景 → 波浪 → 文字

**Tab 导航滑块动画**
- 使用 Framer Motion `layoutId="activeTab"`
- Spring 物理动效：`stiffness: 380, damping: 30`
- 流畅的共享元素过渡

**字体系统优化**
- 从 `next/font/google` 切换到 `geist` npm 包本地字体
- 加载完整字重系列（100-900）
- 标题字体：`font-bold` (700) + `tracking-tighter`
- 副标题：`font-light` (300) + `tracking-wide`

**颜色响应式优化**
- 首屏文字：
  - 亮模式：`text-black` 标题 + `text-black/70` 副标题
  - 暗模式：`dark:text-white` 标题 + `dark:text-white/70` 副标题
- 主题切换器图标：
  - 亮模式：`text-black`（黑色图标可见）
  - 暗模式：`dark:text-white`（白色图标可见）
- 按钮配色：
  - 登录按钮：亮模式 `text-black/90`，暗模式 `dark:text-white/90`
  - 注册按钮：亮模式 `bg-black text-white`，暗模式 `dark:bg-white dark:text-black`

**交互细节优化**
- 主题切换器：添加 `p-2` padding + hover 效果 + `rounded-lg`
- 首屏按钮间距：`gap-3` → `gap-4`（16px，符合 4pt 网格）
- 标题阴影：添加 `drop-shadow-sm` 增加层次感

#### 2. 极简布局调整

**历史记录 Tab 布局改为列表**
- 从 FocusCards 网格布局改为**极简列表布局**
- 每行显示：标题 + 状态 + 时长 + 日期
- Hover 显示操作按钮（播放/删除/重试）
- 底部细边框分隔（`border-b border-border`）
- 状态颜色：
  - 已完成：`#171717` 黑色
  - 生成中：`#737373` 中灰
  - 失败/取消：深灰/浅灰

**空态/错误态极简化**
- 移除所有图标和装饰
- 仅保留：单行文字 + 一个按钮
- 大量留白

#### 3. 色彩系统完整性

**全局色彩 tokens（保持不变）**
- Primary: `oklch(0.09 0 0)` 纯黑
- Background: `oklch(1 0 0)` 纯白（Light）/ `oklch(0.09 0 0)` 纯黑（Dark）
- 完全 achromatic 设计（无色相）

**深色模式完整支持**
- 所有组件都支持 `dark:` 变体
- 波浪背景、文字、按钮、导航栏均响应主题

---

## Files Actually Modified

### 新建文件

| 文件路径 | 说明 |
|---------|------|
| `src/components/landing/LandingHero.tsx` | Landing 首屏组件（WavyBackground + Auth 按钮 + ThemeToggler） |
| `src/components/main-app/MainApp.tsx` | 主应用容器（Tab 切换逻辑） |
| `src/components/main-app/AppNavbar.tsx` | 三 Tab 导航栏 + 滑块动画 |
| `src/components/main-app/UserMenu.tsx` | 用户头像下拉菜单 |
| `src/components/main-app/GenerateTab.tsx` | 生成视频 Tab |
| `src/components/main-app/HistoryTab.tsx` | 历史记录 Tab（列表布局） |
| `src/components/main-app/HistoryCardActions.tsx` | 历史项操作栏 |
| `src/components/main-app/SubscribeTab.tsx` | 订阅升级 Tab |
| `src/components/main-app/VideoCardSkeleton.tsx` | 加载骨架 |
| `src/components/main-app/EmptyState.tsx` | 空状态组件 |
| `src/components/main-app/ErrorState.tsx` | 错误状态组件 |

### 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `src/app/page.tsx` | 根据登录态分流（Landing / MainApp） |
| `src/app/layout.tsx` | 切换到 `geist` 本地字体，加载完整字重系列 |
| `src/components/ui/wavy-background.tsx` | 添加主题响应逻辑（isDark 监听 + 动态颜色） |
| `src/components/ui/animated-theme-toggler.tsx` | 无修改（已有组件直接使用） |
| `src/app/globals.css` | 保持黑白色系不变 |

---

## Key Design Decisions (Updated)

| # | 决策点 | 决策 | 理由 |
|---|--------|------|------|
| 1 | **路由结构** | `/` 单路由 + 条件渲染（非 `/dashboard` 子路由） | 避免 302 重定向闪烁；用户感知"一个首页，两种面貌" |
| 2 | **闪屏防护** | `isPending` 阶段渲染 Loader，不渲染任何内容 | 防止 session 缓存恢复时 Landing→MainApp 闪屏，以及 session 过期时 MainApp→Landing 闪屏 |
| 3 | **Landing 内容** | WavyBackground + 登录/注册按钮 + 主题切换器 | 极简；响应式主题切换 |
| 4 | **导航栏布局** | 居中三 Tab + 右侧用户中心（flex + 左侧占位） | 纯 CSS 居中比 `position: absolute` 更健壮 |
| 5 | **Tab 状态** | `useState`，不写入 URL search params | v1 不需要 bookmark 特定 Tab；后续若需要可改 `useSearchParams` |
| 6 | **历史记录布局** | ✅ **已改为极简列表**（非 FocusCards 网格） | 更符合黑白极简设计语言，减少视觉噪音 |
| 7 | **Tab 切换动画** | ✅ **Framer Motion layoutId 滑块动画** | Spring 物理动效，提升交互流畅度 |
| 8 | **主题切换联动** | ✅ **WavyBackground 响应 `.dark` class** | 首屏背景和波浪颜色同步切换主题 |
| 9 | **字体系统** | ✅ **geist npm 包本地字体（100-900 全字重）** | 更专业的字重控制，标题使用 Bold (700) |
| 10 | **波浪强度** | ✅ **不透明度 0.4 + 线宽 80px** | 更明显的波浪条纹，增强视觉层次 |
| 11 | **颜色响应式** | ✅ **所有文字/按钮/图标均支持亮暗模式** | 亮模式黑色元素，暗模式白色元素 |
| 12 | **视觉层次** | ✅ **背景 → 波浪 → 文字三层** | drop-shadow + 不同不透明度形成深度感 |
| 13 | **移动端导航** | 3 Tab 不溢出（≈240px < 375px），无需横向滚动 | 若未来 >3 Tab → `overflow-x: auto` + `scrollbar-hide` |
| 14 | **订阅页范围** | 纯 UI 占位，无支付逻辑 | 避免范围膨胀；支付/订阅体系需独立规划和 PRD |

---

## tasteskill v2 审计总结

### ✅ 通过的检查项

**Em-dash 审计**  
无 em-dash 使用

**Accessibility**  
- ThemeToggler: `sr-only` "Toggle theme" 标签
- Tab 导航: `role="tab"` + `aria-selected`

**Preservation**  
所有 URL、导航文案、品牌元素保持不变：
- URL: `/`, `/login`, `/signup`, `/projects/[id]/play`
- 导航标签: 生成视频、历史记录、订阅升级
- Logo: "Volcano"
- 表单字段: email, password 等

**Brand Fidelity**  
- 色系: 黑白灰 achromatic ✅
- 字体: Geist (本地全字重) ✅
- 圆角: `--radius: 0.5rem` ✅

---

## 优化前后对比

### 主题切换

**优化前**
- 首屏背景硬编码黑色 `rgb(0,0,0)`
- 波浪颜色硬编码灰色系
- 点击主题切换器后，首屏不响应

**优化后**
- Canvas 动态监听 `.dark` class
- 亮模式：白色背景 + 浅灰波浪
- 暗模式：黑色背景 + 深灰波浪
- 文字、按钮、图标全部响应主题

### Tab 导航

**优化前**
- Active 下划线瞬间切换（无动画）

**优化后**
- Framer Motion layoutId 滑块动画
- Spring 物理效果（stiffness 380, damping 30）
- 150-200ms 流畅过渡

### 字体效果

**优化前**
- 使用 `next/font/google` Geist
- 标题 `font-light` (300) 较细
- 字距 `tracking-tight`

**优化后**
- 本地 `geist` npm 包（完整字重）
- 标题 `font-bold` (700) 更有力
- 字距 `tracking-tighter` 更紧凑现代

### 波浪强度

**优化前**
- 不透明度 0.15（较淡）
- 模糊度 6px
- 线宽 50px（默认）

**优化后**
- 不透明度 0.4（明显可见）
- 模糊度 8px（更柔和）
- 线宽 80px（更粗条纹）
- 三层视觉层级清晰

### 颜色系统

**优化前**
- 首屏文字硬编码白色
- 主题切换器白色图标（亮模式不可见）
- 按钮颜色单一

**优化后**
- 亮模式：黑色文字 + 黑色图标
- 暗模式：白色文字 + 白色图标
- 按钮亮暗配色完整

---

## Technical Highlights

### 1. 主题切换实现

```typescript
// WavyBackground 监听 dark class
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  const checkTheme = () => {
    setIsDark(document.documentElement.classList.contains("dark"));
  };
  checkTheme();

  const observer = new MutationObserver(checkTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}, []);

// 动态颜色函数
const getWaveColors = () => {
  return isDark
    ? ["#404040", "#333333", "#4d4d4d", "#3a3a3a", "#474747"]  // 深灰系
    : ["#cccccc", "#d9d9d9", "#bfbfbf", "#d4d4d4", "#c7c7c7"];  // 浅灰系
};

const getBackgroundFill = () => {
  return isDark ? "rgb(10, 10, 10)" : "rgb(250, 250, 250)";
};
```

### 2. Tab 滑块动画

```typescript
{activeTab === tab.key && (
  <motion.div
    layoutId="activeTab"
    className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
    transition={{
      type: "spring",
      stiffness: 380,
      damping: 30,
    }}
  />
)}
```

### 3. 本地字体加载

```typescript
const geistSans = localFont({
  src: [
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Thin.woff2", weight: "100" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-UltraLight.woff2", weight: "200" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Light.woff2", weight: "300" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.woff2", weight: "400" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Medium.woff2", weight: "500" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.woff2", weight: "600" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Bold.woff2", weight: "700" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Black.woff2", weight: "900" },
  ],
  variable: "--font-geist-sans",
});
```

---

## Performance Impact

- **构建成功**：Exit code 0
- **所有路由正常生成**：`/`, `/login`, `/signup`, `/projects/[id]/play`
- **无 TypeScript 错误**
- **无 ESLint 警告**

---

## Next Steps

1. **用户验收测试**
   - 在 Chrome/Firefox/Safari 测试主题切换效果
   - 验证 Tab 滑块动画流畅度
   - 确认亮暗模式下所有元素可见性

2. **响应式测试**
   - 375px 移动端布局验证
   - 平板尺寸（768px-1024px）验证
   - 桌面尺寸（>1024px）验证

3. **后续优化方向**（可选）
   - 考虑添加过渡动画到 Landing → MainApp 切换
   - 为历史记录列表添加虚拟滚动（如果项目数 >100）
   - 完善无障碍支持（键盘导航优化）

---

## Lessons Learned

1. **主题系统的完整性至关重要**
   - 初版遗漏了亮模式下的颜色适配
   - 需要在设计时就考虑 Light/Dark 两套完整方案

2. **Canvas 动画与主题联动需要特殊处理**
   - 普通 CSS `dark:` 变体不适用于 Canvas
   - 需要监听 class 变化并手动重绘

3. **字体选择对品牌感知影响巨大**
   - 从 Light (300) 到 Bold (700) 的字重调整，显著提升标题冲击力
   - 本地字体提供更好的字重控制

4. **视觉层次需要多维度设计**
   - 单纯的颜色区分不够
   - 需要叠加：明度 + 不透明度 + 阴影 + 模糊

5. **tasteskill v2 流程的价值**
   - 系统化的审计流程避免遗漏
   - Pre-Flight Check 和 Preservation Audit 确保不破坏现有功能

---

## References

- **tasteskill v2**：设计审计和优化流程
- **ui-ux-pro-max**：UI/UX 最佳实践规则库
- **Aceternity UI**：WavyBackground 组件文档
- **Magic UI**：AnimatedThemeToggler 组件文档
- **Geist Font**：npm 包文档
- **Framer Motion**：layoutId 共享布局动画

---

**文档版本**：v2.0  
**最后更新**：2026-06-13  
**更新内容**：补充实施完成情况、设计优化细节、技术实现方案
