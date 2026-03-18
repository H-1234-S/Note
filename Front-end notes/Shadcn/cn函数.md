# clsx函数

接收乱七八糟的输入，如嵌套数组、对象；输出一串字符串

``` ts
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

`keyof` 获取一个“对象类型”的所有键，将它们合并成一个联合类型。

`keyof any` 指的是**任何可以做为键的类型**，只能是 `string`、`number` 和 `symbol`。