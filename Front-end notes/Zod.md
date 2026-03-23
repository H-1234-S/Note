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

# 进阶知识

在掌握了 Zod 的基础类型定义和 `parse` 之后，我们要进入 **Zod 的进阶领域**。进阶用法的核心在于：**数据转换、复杂的逻辑关联、以及与工程实践（如异步校验、递归结构）的结合。**

---

## 1. 转换与处理 (Transformations)

很多时候，我们不仅要验证数据，还要在验证通过后对数据进行“加工”。`.transform()` 允许你改变输出的数据结构或类型。

``` TypeScript
const searchSchema = z.string()
  .transform((val) => val.trim()) // 去除首尾空格
  .transform((val) => val.toLowerCase()); // 转小写

const result = searchSchema.parse("  Admin  "); 
// 输出: "admin"

// 进阶场景：将字符串转为数字
const idSchema = z.string().transform((val) => parseInt(val, 10));
const id = idSchema.parse("123"); // 输出类型为 number: 123
```

---

## 2. 预处理 (Preprocessing)

`.transform()` 发生在验证**之后**，而 `.preprocess()` 发生在验证**之前**。这在处理表单数据（通常全是字符串）时非常有用。


``` TypeScript
const castToNumber = z.preprocess(
  (val) => Number(val), 
  z.number().min(18)
);

castToNumber.parse("20"); // 成功。先变数字 20，再校验是否 >= 18
```

---

## 3. 异步验证 (Asynchronous Refinements)

如果你的验证逻辑需要查数据库或调用 API（例如：检查用户名是否已存在），你需要使用 `superRefine` 或 `refine` 的异步版本，并配合 `.parseAsync()`。

``` TypeScript
const UsernameSchema = z.string().refine(async (name) => {
  const exists = await checkUserExistsInDB(name); // 模拟 API 请求
  return !exists;
}, "用户名已存在");

// 注意：异步校验必须使用 parseAsync
await UsernameSchema.parseAsync("new_user");
```

---

## 4. 深度细化 (Super Refine)

`.refine()` 虽然好用，但它只能返回一个布尔值。如果你需要**在一次验证中产生多个错误**，或者将错误精确挂载到某个子路径，请使用 `superRefine`。

``` TypeScript
const PasswordStrength = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "长度太短",
      fatal: true, // 如果致命错误，后续校验不再执行
    });
  }
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "缺少大写字母",
    });
  }
});
```

---

## 5. 判别式联合 (Discriminated Unions)

在处理具有“标志位”的对象集合时，这是 Zod 的**性能之选**。它能让 TypeScript 的类型收窄（Narrowing）变得非常丝滑。

``` TypeScript
const ResponseSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("success"), data: z.string() }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

const result = ResponseSchema.parse({ type: "success", data: "ok" });

if (result.type === "success") {
  console.log(result.data); // 此处 TS 自动推断出 result 拥有 data 属性
}
```

---

## 6. 递归模式 (Recursive Schemas)

处理像“文件树”或“无限评论列表”这类嵌套数据时，需要用到 `z.lazy()` 来处理循环引用。

``` TypeScript
interface Category {
  name: string;
  subcategories: Category[];
}

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(CategorySchema), // 递归引用自身
  })
);
```

---

## 7. 严格模式与消除冗余 (Strict & Passthrough)

默认情况下，Zod 会忽略对象中未定义的额外字段。你可以改变这种行为：

- **`.passthrough()`**: 允许冗余字段并保留它们。
    
- **`.strict()`**: 只要有 Schema 中没定义的字段，直接报错。
    

``` TypeScript
const BaseUser = z.object({ name: z.string() }).strict();

BaseUser.parse({ name: "Bob", age: 20 }); // 报错：age 是多余的
```

---

## 8. 捕获错误并返回默认值 (Catch)

`.catch()` 允许你在验证失败时，不抛出异常，而是返回一个降级后的默认值。


``` TypeScript
const safelyGetNumber = z.number().catch(0);

console.log(safelyGetNumber.parse("not a number")); // 输出: 0
```

---

### 进阶思维总结

从基础到进阶的转变在于：

1. **从“仅仅检查”变为“加工处理”** (`transform`, `preprocess`)。
    
2. **从“静态规则”变为“动态业务逻辑”** (`refine`, `superRefine`)。
    
3. **从“简单结构”变为“复杂架构”** (`discriminatedUnion`, `lazy`)。
    

**你需要我为你提供一个完整的工程实战案例（例如：用 Zod 封装一个健壮的 API 请求函数）吗？**