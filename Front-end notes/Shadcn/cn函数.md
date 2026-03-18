# clsx函数

用于**处理条件判断**，接收乱七八糟的输入，如嵌套数组、对象；输出一串字符串

## 处理对象

``` ts
export type ClassDictionary = Record<string, any>;

type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

`keyof` 获取一个**对象类型**的所有键，将它们合并成一个联合类型。

`keyof any` 指的是**可以做为对象键的类型**，只能是 `string`、`number` 和 `symbol`。

`[P in K]: T` 意思是

假如你写：

``` TypeScript
type Animal = "cat" | "dog" | "bird";

type Counts = Record<Animal, number>;
```

展开后相当于：

``` TypeScript
type Counts = {
  [P in "cat" | "dog" | "bird"]: number
}

// 相当于手动写的：
type Counts = {
  cat:  number;
  dog:  number;
  bird: number;
}
```
## 处理数组

``` ts
export type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;

export type ClassArray = ClassValue[];
```




# twMerge函数

用于**合并冲突的Tailwind类名**，并以后写的类名为主

接收一串字符串，返回合并冲突后的字符串