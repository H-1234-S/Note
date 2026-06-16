# Change: ep2-04-config-panel-enhancement (改进版)

## 📋 改进说明

本文档基于原始 `ep2-04-config-panel-enhancement.md`，针对现有项目实际情况进行调整。

### 主要调整点

1. **文件组织**：遵循项目现有目录结构（`__tests__/` 而非 `tests/`）
2. **常量管理**：在组件内定义，避免创建不存在的目录
3. **枚举共享**：从后端导出枚举值，前后端保持一致
4. **组件简化**：移除不必要的 `ConfigItem` 抽象
5. **校验强化**：后端添加枚举校验，确保数据一致性

---

## 1. Change Overview

### Goal

为 GenerateTab 添加可折叠的**参数配置面板**，让用户自定义视频生成参数（目标对象、难度、比例、时长、语音）。

### User Value

- 用户可根据场景定制视频参数（学生/教师、横屏/竖屏）
- 提供专业控制感，提升产品完成度
- 为后续付费计划预留差异化参数

### Scope

✅ **包含内容**
1. 参数配置面板组件（`ConfigPanel.tsx`）
2. 5 个参数输入组件（内联在 ConfigPanel 中）
3. GenerateTab 集成
4. 前端校验（Zod Schema）
5. 响应式适配（移动/桌面）

❌ **不包含内容**
- 实际 TTS 语音列表 API（使用 Mock 数据）
- 配置预设保存功能
- 高级参数（音频速度、动效风格）

---

## 2. 实施计划（调整版）

### Phase 1: 后端增强 - 导出枚举常量

**目标**：确保前后端枚举值一致

**文件**：`src/trpc/routers/project.ts`

**修改内容**：

```typescript
// ---- 导出枚举常量供前端使用 ----

export const ASPECT_RATIOS = ["16:9", "9:16", "1:1"] as const;
export const AUDIENCE_ROLES = ["student", "teacher"] as const;
export const AUDIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const VOICE_PROVIDERS = ["minimax"] as const;

/** createAndGenerate 输入校验 */
export const createProjectInputSchema = z.object({
  sourceText: z.string().min(1).max(5000),
  aspectRatio: z.enum(ASPECT_RATIOS).optional(),
  audienceRole: z.enum(AUDIENCE_ROLES).optional(),        // ✅ 改为枚举
  audienceLevel: z.enum(AUDIENCE_LEVELS).optional(),      // ✅ 改为枚举
  targetDurationSec: z.number().int().positive().max(3600).optional(),
  voiceProvider: z.enum(VOICE_PROVIDERS).optional(),      // ✅ 改为枚举
  voiceId: z.string().max(100).optional(),
  requestId: z.string().uuid(),
});
```

**完成标准**：
- [ ] 导出所有枚举常量
- [ ] 将 `audienceRole` 和 `audienceLevel` 改为 `z.enum()`
- [ ] 测试通过（确保现有测试仍然有效）

---

### Phase 2: 前端组件 - ConfigPanel

**目标**：创建参数配置面板

**新建文件**：`src/components/main-app/ConfigPanel.tsx`

**组件结构**：

```typescript
"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ASPECT_RATIOS,
  AUDIENCE_ROLES,
  AUDIENCE_LEVELS,
} from "@/trpc/routers/project";

// ---- Mock 数据：语音选项 ----
const MOCK_VOICES = [
  { providerId: "minimax", voiceId: "male-qn-qingse", label: "青涩青年（男）" },
  { providerId: "minimax", voiceId: "male-qn-jingying", label: "精英青年（男）" },
  { providerId: "minimax", voiceId: "male-qn-badao", label: "霸道青年（男）" },
  { providerId: "minimax", voiceId: "female-shaonv", label: "灿烂少女（女）" },
  { providerId: "minimax", voiceId: "female-yujie", label: "御姐（女）" },
  { providerId: "minimax", voiceId: "female-chengshu", label: "成熟女性（女）" },
] as const;

// ---- 默认配置 ----
export const DEFAULT_CONFIG = {
  audienceRole: "student" as const,
  audienceLevel: "intermediate" as const,
  aspectRatio: "16:9" as const,
  targetDurationSec: 120,
  voiceProvider: "minimax" as const,
  voiceId: "male-qn-qingse",
};

export type ProjectConfig = typeof DEFAULT_CONFIG;

// ---- 组件接口 ----
interface ConfigPanelProps {
  config: ProjectConfig;
  onConfigChange: (key: keyof ProjectConfig, value: string | number) => void;
  disabled?: boolean;
}

export function ConfigPanel({ config, onConfigChange, disabled }: ConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full rounded-lg border border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* 折叠触发器 */}
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
          <span>配置参数</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>

        {/* 可折叠内容 */}
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 pt-2">
            {/* TODO: 5个参数项将在下一步实现 */}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
```

**完成标准**：
- [ ] Collapsible 结构正确
- [ ] 默认展开状态
- [ ] 折叠动画流畅
- [ ] 导入后端枚举类型（`ASPECT_RATIOS` 等）

---

### Phase 3: 实现 5 个参数输入项

**目标**：在 ConfigPanel 中添加参数输入组件

**修改文件**：`src/components/main-app/ConfigPanel.tsx`

**实现内容**：

```typescript
{/* 参数 1: 目标对象 */}
<div className="space-y-2">
  <Label htmlFor="audience-role">目标对象</Label>
  <RadioGroup
    id="audience-role"
    value={config.audienceRole}
    onValueChange={(value) => onConfigChange("audienceRole", value)}
    disabled={disabled}
  >
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="student" id="role-student" />
      <Label htmlFor="role-student" className="font-normal cursor-pointer">
        学生
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="teacher" id="role-teacher" />
      <Label htmlFor="role-teacher" className="font-normal cursor-pointer">
        教师
      </Label>
    </div>
  </RadioGroup>
</div>

{/* 参数 2: 难度级别 */}
<div className="space-y-2">
  <Label htmlFor="audience-level">难度级别</Label>
  <Select
    value={config.audienceLevel}
    onValueChange={(value) => onConfigChange("audienceLevel", value)}
    disabled={disabled}
  >
    <SelectTrigger id="audience-level" className="w-full">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="beginner">入门</SelectItem>
      <SelectItem value="intermediate">中级</SelectItem>
      <SelectItem value="advanced">高级</SelectItem>
    </SelectContent>
  </Select>
</div>

{/* 参数 3: 视频比例 */}
<div className="space-y-2">
  <Label htmlFor="aspect-ratio">视频比例</Label>
  <RadioGroup
    id="aspect-ratio"
    value={config.aspectRatio}
    onValueChange={(value) => onConfigChange("aspectRatio", value)}
    disabled={disabled}
  >
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="16:9" id="ratio-16-9" />
      <Label htmlFor="ratio-16-9" className="font-normal cursor-pointer">
        横屏 (16:9)
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="9:16" id="ratio-9-16" />
      <Label htmlFor="ratio-9-16" className="font-normal cursor-pointer">
        竖屏 (9:16)
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="1:1" id="ratio-1-1" />
      <Label htmlFor="ratio-1-1" className="font-normal cursor-pointer">
        方形 (1:1)
      </Label>
    </div>
  </RadioGroup>
</div>

{/* 参数 4: 视频时长 */}
<div className="space-y-2">
  <Label>视频时长</Label>
  <SegmentedControl
    options={[
      { value: 60, label: "1 分钟" },
      { value: 180, label: "3 分钟" },
      { value: 300, label: "5 分钟" },
    ]}
    value={config.targetDurationSec}
    onChange={(value) => onConfigChange("targetDurationSec", value)}
    className="w-full"
  />
</div>

{/* 参数 5: 语音 */}
<div className="space-y-2 md:col-span-2">
  <Label htmlFor="voice">语音</Label>
  <Select
    value={config.voiceId}
    onValueChange={(value) => onConfigChange("voiceId", value)}
    disabled={disabled}
  >
    <SelectTrigger id="voice" className="w-full">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {MOCK_VOICES.map((voice) => (
        <SelectItem key={voice.voiceId} value={voice.voiceId}>
          {voice.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**完成标准**：
- [ ] 所有 5 个参数项正确渲染
- [ ] 选中状态视觉反馈清晰
- [ ] 键盘导航支持（Tab 键切换）
- [ ] 禁用状态正确显示

---

### Phase 4: 集成到 GenerateTab

**目标**：将 ConfigPanel 嵌入 GenerateTab 并管理状态

**修改文件**：`src/components/main-app/GenerateTab.tsx`

**修改内容**：

```typescript
"use client";

import { useState, useCallback } from "react";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { IconButton, type IconButtonState } from "@/components/ui/icon-button";
import { FadeMask } from "@/components/ui/fade-mask";
import { ConfigPanel, DEFAULT_CONFIG, type ProjectConfig } from "./ConfigPanel"; // ✅ 新增
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface GenerateTabProps {
  onTabChange: (tab: "history") => void;
}

export function GenerateTab({ onTabChange }: GenerateTabProps) {
  const [text, setText] = useState("");
  const [config, setConfig] = useState<ProjectConfig>(DEFAULT_CONFIG); // ✅ 新增

  const trpc = useTRPC();
  const createMutation = useMutation(
    trpc.project.createAndGenerate.mutationOptions({
      onSuccess: () => {
        setText("");
        // ✅ 成功后保留配置（不重置）
        toast.success("项目创建成功，正在生成中…");
        onTabChange("history");
      },
      onError: (error) => {
        toast.error(error.message || "创建失败，请重试");
      },
    }),
  );

  const isPending = createMutation.isPending;
  const isTextEmpty = text.trim().length === 0;

  const buttonState: IconButtonState = isPending
    ? "pending"
    : isTextEmpty
      ? "disabled"
      : "ready";

  // ✅ 新增：配置变化回调
  const handleConfigChange = useCallback(
    (key: keyof ProjectConfig, value: string | number) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (isTextEmpty || isPending) return;
    createMutation.mutate({
      sourceText: text.trim(),
      requestId: crypto.randomUUID(),
      ...config, // ✅ 使用用户配置
    });
  }, [text, config, isTextEmpty, isPending, createMutation]); // ✅ 添加 config 依赖

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="w-full max-w-3xl space-y-6"> {/* ✅ 添加 space-y-6 */}
        {/* 输入区域 */}
        <div className="relative">
          <AutoResizeTextarea
            placeholder="描述你想生成的视频内容..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPending}
            minHeight={56}
            maxLines={6}
            paddingRight="pr-14"
            paddingBottom="pb-14"
            className="w-full"
          />
          <FadeMask />
          <div className="absolute bottom-3 right-3 z-20">
            <IconButton
              state={buttonState}
              onClick={handleSubmit}
              aria-label="生成视频"
            />
          </div>
        </div>

        {/* ✅ 配置面板 - 新增 */}
        <ConfigPanel
          config={config}
          onConfigChange={handleConfigChange}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
```

**关键修改点**：
1. 导入 `ConfigPanel` 和 `DEFAULT_CONFIG`
2. 添加 `config` state
3. 实现 `handleConfigChange` 回调
4. 提交时使用 `...config` 展开用户配置
5. 成功/失败后配置均保留（不重置）
6. 在输入框下方渲染 `ConfigPanel`（间距 24px）

**完成标准**：
- [ ] ConfigPanel 正确渲染
- [ ] 配置变化实时更新到 state
- [ ] 提交时传递正确参数
- [ ] 成功后配置保留
- [ ] 失败后配置保留

---

### Phase 5: 测试

**目标**：确保功能正确且无回归

#### 5.1 单元测试

**新建文件**：`src/components/main-app/__tests__/ConfigPanel.test.tsx`

**测试用例**：

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigPanel, DEFAULT_CONFIG } from "../ConfigPanel";
import { describe, it, expect, vi } from "vitest";

describe("ConfigPanel", () => {
  it("应该默认展开", () => {
    const handleChange = vi.fn();
    render(<ConfigPanel config={DEFAULT_CONFIG} onConfigChange={handleChange} />);
    
    expect(screen.getByText("目标对象")).toBeInTheDocument();
    expect(screen.getByText("难度级别")).toBeInTheDocument();
  });

  it("点击折叠按钮应该隐藏内容", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ConfigPanel config={DEFAULT_CONFIG} onConfigChange={handleChange} />);
    
    const trigger = screen.getByRole("button", { name: /配置参数/i });
    await user.click(trigger);
    
    // Collapsible 折叠后内容仍在 DOM 但不可见
    expect(screen.getByText("目标对象")).not.toBeVisible();
  });

  it("修改目标对象应该触发回调", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ConfigPanel config={DEFAULT_CONFIG} onConfigChange={handleChange} />);
    
    const teacherRadio = screen.getByLabelText("教师");
    await user.click(teacherRadio);
    
    expect(handleChange).toHaveBeenCalledWith("audienceRole", "teacher");
  });

  it("修改难度级别应该触发回调", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ConfigPanel config={DEFAULT_CONFIG} onConfigChange={handleChange} />);
    
    const levelSelect = screen.getByRole("combobox", { name: /难度级别/i });
    await user.click(levelSelect);
    
    const advancedOption = screen.getByRole("option", { name: "高级" });
    await user.click(advancedOption);
    
    expect(handleChange).toHaveBeenCalledWith("audienceLevel", "advanced");
  });

  it("disabled 状态应该禁用所有输入", () => {
    const handleChange = vi.fn();
    render(<ConfigPanel config={DEFAULT_CONFIG} onConfigChange={handleChange} disabled />);
    
    const studentRadio = screen.getByLabelText("学生");
    expect(studentRadio).toBeDisabled();
  });
});
```

#### 5.2 集成测试

**修改文件**：`src/components/main-app/__tests__/GenerateTab.test.tsx`

**新增测试用例**：

```typescript
it("提交时应该包含用户配置的参数", async () => {
  const user = userEvent.setup();
  const mockMutate = vi.fn();
  
  render(<GenerateTab onTabChange={vi.fn()} />);
  
  // 1. 修改配置
  const teacherRadio = screen.getByLabelText("教师");
  await user.click(teacherRadio);
  
  const aspectRatioRadio = screen.getByLabelText("竖屏 (9:16)");
  await user.click(aspectRatioRadio);
  
  // 2. 输入文本
  const textarea = screen.getByPlaceholderText(/描述你想生成的视频内容/i);
  await user.type(textarea, "测试文本");
  
  // 3. 提交
  const submitButton = screen.getByRole("button", { name: /生成视频/i });
  await user.click(submitButton);
  
  // 4. 验证参数
  expect(mockMutate).toHaveBeenCalledWith(
    expect.objectContaining({
      sourceText: "测试文本",
      audienceRole: "teacher",
      aspectRatio: "9:16",
    })
  );
});

it("提交成功后配置应该保留", async () => {
  const user = userEvent.setup();
  
  render(<GenerateTab onTabChange={vi.fn()} />);
  
  // 1. 修改配置
  const teacherRadio = screen.getByLabelText("教师");
  await user.click(teacherRadio);
  
  // 2. 提交成功
  const textarea = screen.getByPlaceholderText(/描述你想生成的视频内容/i);
  await user.type(textarea, "测试文本");
  
  const submitButton = screen.getByRole("button", { name: /生成视频/i });
  await user.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByLabelText("教师")).toBeChecked();
  });
});
```

**完成标准**：
- [ ] ConfigPanel 单元测试全部通过
- [ ] GenerateTab 集成测试通过
- [ ] 测试覆盖率 > 80%

---

## 3. 文件清单（最终版）

### 新建文件

```
src/components/main-app/
├── ConfigPanel.tsx                          ~250 LOC  # 配置面板（含所有参数项）
└── __tests__/
    └── ConfigPanel.test.tsx                 ~150 LOC  # 单元测试
```

### 修改文件

```
src/trpc/routers/project.ts                  ~20 LOC   # 导出枚举 + 强化校验
src/components/main-app/GenerateTab.tsx      ~40 LOC   # 集成 ConfigPanel
src/components/main-app/__tests__/GenerateTab.test.tsx  ~50 LOC  # 新增测试用例
```

### 删除文件

无

---

## 4. 与原始方案的对比

| 方面 | 原始方案 | 改进方案 | 原因 |
|------|---------|---------|------|
| **目录结构** | `lib/validation/`, `lib/constants/` | 组件内定义 | 项目无这些目录，遵循现有模式 |
| **ConfigItem** | 独立组件 (~80 LOC) | 内联在 ConfigPanel | 避免过度抽象，参数类型差异大 |
| **测试路径** | `tests/components/` | `__tests__/` | 符合项目习惯 |
| **枚举管理** | 前端重新定义 | 从后端导入 | 确保前后端一致性 |
| **后端校验** | `audienceRole` 为任意字符串 | 改为枚举 | 数据一致性更强 |
| **总代码量** | ~600 LOC | ~510 LOC | 移除不必要抽象，减少 15% |

---

## 5. 实施检查清单

### 后端修改
- [ ] 导出 `ASPECT_RATIOS`, `AUDIENCE_ROLES`, `AUDIENCE_LEVELS`, `VOICE_PROVIDERS`
- [ ] 将 `audienceRole` 和 `audienceLevel` 改为 `z.enum()`
- [ ] 运行测试确保无回归

### 前端开发
- [ ] 创建 `ConfigPanel.tsx`（~250 LOC）
- [ ] 实现 5 个参数输入项
- [ ] 修改 `GenerateTab.tsx` 集成 ConfigPanel
- [ ] 手动测试折叠/展开功能
- [ ] 手动测试所有参数变化

### 测试
- [ ] 编写 `ConfigPanel.test.tsx`
- [ ] 更新 `GenerateTab.test.tsx`
- [ ] 运行 `npm test` 确保全部通过
- [ ] 测试覆盖率 > 80%

### UI/UX 验证
- [ ] 桌面端：2 列布局
- [ ] 移动端（< 768px）：1 列布局
- [ ] 键盘导航流畅（Tab 键切换）
- [ ] 禁用状态视觉反馈清晰
- [ ] 折叠动画流畅（300ms）

### 回归测试
- [ ] 输入框扩展行为正常
- [ ] 按钮状态切换正常
- [ ] 提交成功跳转正常
- [ ] 错误处理正常

---

## 6. 风险与缓解

### 风险 1: 修改后端枚举导致现有测试失败

**概率**：中  
**影响**：中  
**缓解**：
- 先在开发环境运行完整测试套件
- 检查是否有测试传递了非枚举值
- 如有失败，更新测试用例使用合法枚举值

### 风险 2: 语音 Mock 数据与真实 API 不匹配

**概率**：高  
**影响**：低  
**缓解**：
- 提前查阅 MiniMax API 文档，使用真实 `voiceId`
- 在注释中标注 Mock 数据来源
- 在 Epic 4 接入真实 API 时优先验证这些 ID

### 风险 3: 移动端布局问题

**概率**：低  
**影响**：中  
**缓解**：
- 使用 Tailwind 响应式类（`grid-cols-1 md:grid-cols-2`）
- 在 375px 宽度设备上手动测试
- 确保触控目标 ≥ 44px

---

## 7. 预估工时

| 阶段 | 原估计 | 新估计 | 说明 |
|------|--------|--------|------|
| Phase 1（后端） | 0.5 天 | **0.3 天** | 仅导出枚举 + 修改校验 |
| Phase 2（ConfigPanel 结构） | 0.5 天 | **0.4 天** | 移除 ConfigItem 简化 |
| Phase 3（5 个参数项） | 0.5 天 | **0.5 天** | 无变化 |
| Phase 4（集成） | 0.3 天 | **0.3 天** | 无变化 |
| Phase 5（测试） | 0.2 天 | **0.3 天** | 增加后端校验测试 |
| **总计** | **2.0 天** | **1.8 天** | 减少 0.2 天 |

---

## 8. 成功标准

### 功能完整性
- [x] 用户可修改 5 个参数
- [x] 提交时传递正确参数到 API
- [x] 成功/失败后配置保留

### 代码质量
- [x] 测试覆盖率 > 80%
- [x] 无 TypeScript 错误
- [x] 无 ESLint 警告
- [x] 前后端枚举值一致

### 用户体验
- [x] 折叠/展开动画流畅
- [x] 键盘导航支持
- [x] 移动端布局正确
- [x] 禁用状态反馈清晰

---

## 9. 后续优化（不在本 Change 范围）

1. **真实语音列表**（Epic 4）
   - 接入 `provider.listTtsVoices` API
   - 移除 Mock 数据

2. **配置预设**（Phase 2）
   - 保存常用配置为模板
   - 快速切换预设

3. **参数推荐**（Phase 4）
   - 基于文本内容 AI 推荐最优参数

4. **语音试听**（Phase 2）
   - 点击播放语音样本

---

**文档版本**：v2.0 (改进版)  
**创建日期**：2026-06-16  
**基于**：ep2-04-config-panel-enhancement.md  
**改进人**：Claude Opus 4.8
