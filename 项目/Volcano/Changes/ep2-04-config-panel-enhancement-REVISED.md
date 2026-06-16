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
