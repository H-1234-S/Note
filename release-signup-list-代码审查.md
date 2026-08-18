# release-signup-list 页面代码审查报告

> 审查范围：`apps/miniprogram/src/release/pages/release-signup-list` 下 `index.ts`、`index.wxml`、`index.scss`、`index.json` 四个文件。
> 视角：前端开发 / 微信小程序 / 前端架构。

---

## 一、总体评价

页面功能骨架完整：名单/编号解析、设置弹窗、展示方式切换、详情弹窗预览都已具备，整体结构可用。但目前处于「能跑通但不够健壮」的阶段，主要问题集中在三类：

1. **命名与规范**：枚举命名、魔法数字、遗留 TODO 与死字段较多，不符合团队 `PascalCase` / 单引号 / 注释规范。
2. **状态一致性**：编辑-确认-取消缺少回滚、解析失败时残留旧数据、清空只处理一半字段，存在「数据与界面不一致」的隐患。
3. **健壮性与可维护性**：解析逻辑内嵌 UI 副作用、未实现的「进度条式」仍可被选中、非法输入静默忽略、高频 `setData`。

以下按严重程度分级：**P0（功能/数据错误）→ P1（逻辑隐患）→ P2（规范）→ P3（体验优化）**。

---

## 二、问题清单

### P0-1 「设置手机号 / 分组+名单」点击后弹窗不关闭、无反馈

`index.ts` `handleSetting` 里，只有 `SetList(2)`、`SetNumber(3)` 会继续执行，`1/4/5` 直接 `return`。此时 `showSettingPopup` 仍为 `true`，弹窗不关、无任何提示，用户会以为点按无效。

```ts
// 现状
handleSetting(settingItem: PopupSetting) {
  if (
    settingItem.value !== settingActionTypeEnum.SetList &&
    settingItem.value !== settingActionTypeEnum.SetNumber
  )
    return
  ...
}
```

**建议**：对暂不支持的项，先关闭弹窗并 `wx.showToast({ title: '暂未支持', icon: 'none' })`；或从 `POPUP_SETTINGS` 里移除不可用项并加 `disabled` 标记。

### P0-2 解析失败时残留旧名单，界面与输入不一致

`handleTextAreaInput` 里，名单解析失败（`handleNameList` 返回 `null`）时直接 `return`，**没有清空上一次的 `names`**：

```ts
if (this.data.settingCurrentActionType === settingActionTypeEnum.SetList) {
  const names = this.handleNameList(value)
  if(!names) return   // 解析失败，但旧 names 仍保留
  this.setData({ names })
}
```

用户在预览区会看到「旧名单 + 新文本」的错位状态。

**建议**：解析失败时同步清空 `names`（或 `numbers`），保证预览与文本域一致：

```ts
const names = this.handleNameList(value)
if (!names) {
  this.setData({ names: [] })
  return
}
this.setData({ names })
```

### P0-3 确认弹窗只校验文本域，不校验解析结果

`onConfirmDetailsPopup` 只判断 `textAreaValue` 非空，但文本非空不代表解析成功。例如输入 `张三&1&2`（格式错误）时，`names` 为空或为旧值，仍会关闭弹窗「确认成功」。

**建议**：确认时校验当前模式对应的 `names.length` / `numbers.length`，并按模式区分 toast 文案（名单 / 编号）。

### P0-4 无效输入在编号解析里被静默忽略

`handleParseNumbers` 对无法识别的项（如 `abc`、`1-2-3`）不提示直接跳过；区间 `26-1`（`start > end`）也静默 `continue`。用户输入了内容却看不到任何反馈，也不清楚哪些被丢弃了。

**建议**：收集所有非法项，统一 toast 提示；区间倒置给出明确错误而非静默。

---

### P1-1 枚举命名违反 PascalCase

`settingActionTypeEnum` 以小写开头，违反团队「枚举使用 PascalCase」规范：

```ts
enum settingActionTypeEnum { ... }   // 现状
enum SettingActionType { ... }       // 建议
```

由于 wxml 里用的是 `data` 字段 `settingActionType`（值为该枚举对象），改名只影响 TS 内部，不影响模板。

### P1-2 `NameRangeModeEnum` 成员命名与语义易混淆

`Little=10`（注释「最小列数即每行3个」）、`Large=20`（「最大列数即每行6个」）。命名自洽（列少=3 个、列多=6 个），但「Little/Large」对业务阅读不够直观，且 `0/10/20/30` 值来源未说明。

**建议**：若值是后端协议约定，加注释说明「值为协议约定，勿改」；成员名可改为语义化 `ThreePerRow` / `SixPerRow`（仅改成员名，不改值）。

### P1-3 魔法数字与重复定义

`POPUP_SETTINGS` 里 `value` 用字面量 `1/2/3/4/5`，与 `settingActionTypeEnum`（`Disabled=1/SetList=2/SetNumber=3`）重复，`4/5` 无枚举定义：

```ts
const POPUP_SETTINGS = [
  { label: '不启用', value: 1 },
  { label: '设置名单', value: 2 },
  ...
]
```

**建议**：复用枚举值；`4/5` 补枚举成员或明确注释为「占位/未实现」。

### P1-4 死字段与遗留 TODO

`data` 里以下字段为死代码或占位：

- `popupSettingsText`（TODO 待删除）
- `displayModeList`（未使用）
- `settings`（`{} as Settings`，从未填充）
- `items`（`/** */` 空注释 + TODO 待重命名）
- `type: '' as 'fillList' | 'listDisplay'`（空字符串兜底，类型不安全）

**建议**：删除 `popupSettingsText`、`displayModeList`、`settings`；`items` 改名 `settingOptions`；`type` 改名 `popupMode` 并初始化为明确值。

### P1-5 「进度条式」可选中但未实现

`DISPLAY_METHOD_LIST` 含 `进度条式(Process=30)`，但渲染只处理了 `Little`（三列），`Process` 会落到默认六列，属于「可选中但行为未定义」。

**建议**：本期需求明确「先不做进度条」，应从列表移除该选项，或点击时 toast「暂未支持」，避免半成品状态。

### P1-6 编辑取消缺少回滚

打开详情弹窗后，`onTextAreaInput` 实时把 `names/numbers` 写回 `data`。若用户点「取消」，`names` 已变，没有恢复到打开前的值。

**建议**：打开弹窗时快照 `names/numbers/textAreaValue`，取消时恢复；或改为「确认时才提交解析结果」。

### P1-7 高频 setData 无节流

`onTextAreaInput` 每个字符都触发全量解析 + `setData`，长名单下输入会卡顿。

**建议**：预览需实时时，可对解析做节流（如 200ms）；或预览区仅在失焦/确认时刷新。

### P1-8 清空逻辑只清一半

`handleTextAreaClear` 只清 `names`，未清 `numbers`，且清空后未调用 `handleTextAreaInput()` 同步。

**建议**：按当前模式清空对应字段，或统一调用 `handleTextAreaInput()` 保持一致。

---

### P2-1 wxml 条件表达式可读性差

`index.wxml` 第 8 行：

```html
wx:if="{{settingCurrentActionType === settingActionType.SetList && names.length !== 0 || settingCurrentActionType === settingActionType.SetNumber && numbers.length !== 0}}"
```

`&&`/`||` 混排无括号，虽逻辑正确但难读。**建议**：提取纯数据字段（如 `hasDisplayList`）或拆成可读的 `wxs`/computed。

### P2-2 `wx:key` 使用 `index` 不稳定

`wx:for` 用 `wx:key="index"`，列表增删时易渲染错乱：

- `names`：`name` 已校验唯一，可用 `wx:key="name"`（或 `number`）。
- `numbers`：去重后值唯一，可用 `wx:key="*this"`。

### P2-3 展示拼接逻辑重复

`{{item.number ? item.number + '-' + item.name : item.name}}` 在名单区和预览区重复出现两次，且是展示逻辑写在模板里。

**建议**：在 `handleNameList` 里预处理出 `label` 字段（`NameItem` 增加 `label`），模板直接用 `{{item.label}}`。

### P2-4 未使用的 Vant 组件引用

`index.json` `usingComponents` 声明了 `van-field`、`van-button`、`van-dialog`、`van-picker`，但 wxml 中均未使用。违反「按需引用」原则。

**建议**：移除未使用的组件引用，仅保留 `van-cell`、`van-icon`、`van-popup`。

---

### P3-1 名字过长会溢出

`.name-item` 固定宽度（六列 `16.6666%`）下，长名字会溢出。缺省略号处理：

```scss
.name-item {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

### P3-2 `border` 模拟缝隙是 hack，缺背景说明

`.name-item` 用 `border: $spacing-2 solid $color-white` 模拟相邻缝隙。能工作，但未说明「为什么不用 gap」（gap 与百分比宽度叠加会溢出）。副作用：一旦容器背景非纯白就会露馅。

**建议**：至少补充注释说明背景；长期看可考虑 gutter 栅格（外层负 margin + `background-clip: content-box`）或明确接受 gap + `flex-shrink` 方案。

### P3-3 魔法百分比与硬编码颜色

- `16.6666%` / `33.3333%` 魔法数字，建议抽 SCSS 变量并注释「每行 6 / 3 个」。
- `.clear` 颜色 `rgb(218, 217, 217)` 硬编码，应使用 token（如 `$color-disabled`）。

### P3-4 边缘与中间缝隙不一致

容器 `padding: $spacing-4 $spacing-6`（左右 24rpx）+ 格子 8rpx 白边 = 边缘 32rpx，中间 16rpx，视觉不统一。

**建议**：容器左右 padding 设为 8rpx，使边缘缝隙与中间一致（16rpx）。

---

## 三、架构与可维护性建议

1. **抽取纯解析逻辑**：`handleNameList` / `handleParseNumbers` 是纯函数，却内嵌 `wx.showToast` UI 副作用，难复用、难测试。建议抽到 `packages/shared` 或页面同级 `utils`，解析函数只返回 `{ ok, data, error }`，由页面统一 toast。

2. **统一枚举与选项数据**：`POPUP_SETTINGS` / `DISPLAY_METHOD_LIST` 应直接引用枚举，消除魔法数字与重复定义。

3. **明确「进度条式」的去留**：当前枚举含 `Process` 但无渲染分支，是典型半成品。要么实现、要么从可选项移除，避免给后续维护留坑。

4. **补齐注释与命名**：删除遗留 TODO 与死字段；`NameList`（实为单条名单项）建议改名 `NameItem` 消除歧义。

---

## 四、修复优先级建议

| 优先级 | 事项 |
| ------ | ---- |
| 先修 | P0-1 无效选项反馈、P0-2 解析失败残留、P0-3 确认校验、P0-4 非法输入提示 |
| 再改 | P1-1 枚举命名、P1-3 魔法数字、P1-4 死字段、P1-5 进度条去留、P1-6 取消回滚 |
| 后优化 | P2 模板可读性、组件按需引用、P3 样式细节 |
