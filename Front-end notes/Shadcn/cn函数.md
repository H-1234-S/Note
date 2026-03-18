# clsx函数

接收乱七八糟的输入，如嵌套数组、对象；输出一串字符串

``` ts
export type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;
export type ClassDictionary = Record<string, any>;
export type ClassArray = ClassValue[];

export function clsx(...inputs: ClassValue[]): string;
export default clsx;
```


``` ts
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```