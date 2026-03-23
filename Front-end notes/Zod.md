Zod 是一个以 TypeScript 为首的 **Schema 声明与验证库**。它的核心理念是“先定义 Schema，后推导类型”，这能让你避免重复定义接口（Interface）和验证逻辑，极大地提升开发效率。

---

# 基础知识
## 1. 基础类型验证

Zod 几乎支持 JavaScript 所有的原始类型。


``` TypeScript
import { z } from "zod";

// 定义基础类型
const stringSchema = z.string();
const numberSchema = z.number();
const booleanSchema = z.boolean();
const dateSchema = z.date();

// 验证数据
stringSchema.parse("Hello"); // 通过
numberSchema.parse(123);     // 通过
// stringSchema.parse(123);  // 报错：ZodError
```

---

## 2. 对象 (Objects)

这是 Zod 最常用的场景，用于定义 API 响应或表单数据的结构。


``` TypeScript
const UserSchema = z.object({
  username: z.string(),
  age: z.number(),
  isAdmin: z.boolean().optional(), // 可选字段
});

// 使用
const result = UserSchema.parse({
  username: "Alice",
  age: 25,
});
```

---

## 3. 类型推导 (Type Inference)

这是 Zod 的杀手锏。你不需要手动写 `interface`，直接从 Schema 提取 TypeScript 类型。


``` TypeScript
type User = z.infer<typeof UserSchema>;

// 此时 User 等同于：
// interface User {
//   username: string;
//   age: number;
//   isAdmin?: boolean | undefined;
// }
```

---

## 4. 字符串验证与修饰

Zod 提供了极其丰富的内置验证器。


``` TypeScript
const passwordSchema = z.string()
  .min(8, "密码长度不能少于8位")
  .max(20)
  .email("邮箱格式不正确") // 如果是验证邮箱
  .url()                  // 如果是验证URL
  .regex(/[a-z]/);        // 正则表达式
```

---

## 5. 数组 (Arrays)

你可以定义简单数组，也可以定义复杂的对象数组。


``` TypeScript
const stringArray = z.array(z.string());

// 对象数组
const userListSchema = z.array(UserSchema);

stringArray.parse(["a", "b", "c"]); // 通过
```

---

## 6. 枚举与字面量 (Enums & Literals)

用于限制变量只能是特定的几个值。


``` TypeScript
// 字面量
const fish = z.literal("salmon");

// 枚举 (推荐方式)
const StatusEnum = z.enum(["Pending", "Success", "Failed"]);

type Status = z.infer<typeof StatusEnum>; // "Pending" | "Success" | "Failed"
```

---

## 7. 联合类型与交集 (Unions & Intersections)

类似于 TypeScript 的 `|` 和 `&`。


``` TypeScript
// 联合类型 (OR)
const stringOrNumber = z.union([z.string(), z.number()]);

// 交集类型 (AND)
const Person = z.object({ name: z.string() });
const Employee = z.object({ id: z.number() });
const AppUser = Person.and(Employee); // 必须同时拥有 name 和 id
```

---

## 8. 默认值与可空性 (Defaults & Nullables)

处理缺失或为 null 的数据。


``` TypeScript
const settingsSchema = z.object({
  theme: z.string().default("light"), // 如果缺失，默认为 "light"
  nickname: z.string().nullable(),    // 允许值为 null
  bio: z.string().nullish(),          // 允许 null 或 undefined
});
```

---

## 9. 安全解析 (Safe Parse)

如果你不想让程序因为验证失败而直接抛出异常，可以使用 `safeParse`。


``` TypeScript
const result = z.string().safeParse(123);

if (!result.success) {
  // 验证失败，处理错误
  console.log(result.error.issues);
} else {
  // 验证成功
  console.log(result.data);
}
```

---

## 10. 逻辑精炼：`.refine()`

当内置验证器不够用时，可以使用 `refine` 编写自定义逻辑（例如：确认密码是否一致）。


``` TypeScript
const RegistrationSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"], // 错误指向的字段
});
```

---

