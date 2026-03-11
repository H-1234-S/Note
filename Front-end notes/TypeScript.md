# TypeScript

## 数据类型

### any

* 含义是：**任意数据类型**，一旦将变量的数据类型限制为any，意味着放弃了对该变量的类型检查
  * **注意：**any类型的值可以赋值给任意变量

~~~typescript
// 明确的表示a的类型是 any - 【显式的any】
let a: any
// 以下对a的赋值,均无警告
a = 100
a = '你好
a = false

// 没有明确的表示b的类型是any,但TS主动推断出来b是any-隐式的any
let b
//以下对b的赋值,均无警告
b = 100
b ='你好'
b = false
~~~

### unknown

* 含义是：**未知数据类型**，适用于:起初不确定数据的具体类型,要后期才能确定
  * **注意：**

~~~typescript
//unknown可以理解为一个类型安全的any。

// 设置a的类型为unknown
let a: unknown

//以下对a的赋值,均符合规范
a = 100
a = false
a='你好'

// 设置x的数据类型为string
let x: string
x=a//警告:不能将类型“unknown”分配给类型“string”
~~~

* **unknown **会强制开发者在**使用之前进行类型检查**,从而提供更强的类型安全性。

~~~typescript
// 设置a的类型为unknown
let a: unknown
a = 'hello'

// 设置x的数据类型为string
let x: string
x=a//警告:不能将类型“unknown”分配给类型“string”

//使用前进行类型检查
//第一种方式:加类型判断
if(typeof a === 'string' ){
x = a
console.log (x)

}

//第二种方式:加断言
x = a as string

//第三种方式:加断言
x = <string>a
~~~

* 读取 any 类型数据的任何属性都不会报错,而unknown正好与之相反。
  * `使用之前进行类型检查`

~~~typescript
let str1: string
str1 = 'hello'
str1.toUpperCase()//无警告

let str2: any
str2 = 'hello'
str2.toUpperCase()//无警告

let str3: unknown
str3 = 'hello';
str3.toUpperCase()//警告:“str3”的类型为“未知”

// 使用断言强制指定str3的类型为string
(str3 as string).toUpperCase()//无警告
~~~

### never

* never 的含义是:**任何值都不是**,即:不能有值,例如undefined、1、'、0 、null都不行!
* never一般不用来限制变量，没有意义；`是TS推断出来的数据类型`

### void

* void，通常**用于函数返回值限定**，的含义是空，即:函数**不返回任何值**，`函数调用者不应依赖其返回值进行任何操作`
  * **注意：**undefined 是void 可以接受的一种“空”。

~~~typescript
//隐式返回值undefined
function myFn(a: string): void {
}

//隐式返回值undefined
function myFn(a: string): void {
    return；
}

//显式返回值undefined
function myFn(a: string): void {
    return undefined；
}
~~~

* myFn函数没有显式返回值，但有隐式返回值，**是undefined**



#### void与undefined区别

* **【返回值类型为 void 的函数,`调用者不应依赖其返回值进行任何操作!`】**
* undefined限定函数只能返回undefined，但void限定函数返回值为空，而undefined是void可以接受的一种空，重要的是void限定的函数，调用者不应该对函数的返回值进行任何操作

~~~typescript
//void
function logMessage(msg: string): void {
  console.log(msg)
}

let result = logMessage('你好')

if (result) {
  //此行报错:无法测试"void"类型的表达式的真实性
  console.log('logMessage有返回值')
}
~~~

~~~typescript
//undefined
function logMessage(msg: string): undefined {
  console.log(msg)
}

let result = logMessage('你好')

if (result) {
  //此⾏⽆警告
  console.log('logMessage有返回值')
}
//被undefined限定的函数可以其返回值进行操作
~~~

* 如果一个函数返回类型为 void
  * 从语法上讲:函数是可以返回 undefined 的,至于显式返回,还是隐式返回,这无所谓!
  * 从语义上讲:函数调用者不应关心函数返回的值,也不应依赖返回值进行任何操作!即使我们知道它返回了 undefined 

### object

* object（小写），**可存储非原始类型**
  * 原始类型：number、string、boolean、null、undefined
* Object（大写），**可存存储除了 undefined 和 null 之外的任何值。**

#### 声明对象类型

* 属性名后跟？**表示可选属性**，可以给age赋值也可以不赋值
  * 声明时`可省略，`赋值时`不可省略，`？？？？？

~~~typescript
//限制person1对象必须有name属性,age为可选属性
let person1: { name: string, age?: number }

//含义同上,也能用分号做分隔
let person2: { name: string; age?: number }

// 含义同上,也能用换行做分隔
let person3: {
  name: string
  age?: number
}
// 如下赋值均可以
person1 = { name: '李四', age: 18 }
person2 = { name: '张三' }
person3 = { name: '王五' }
~~~

##### 索引签名

* 允许定义对象可以具有**任意数量的属性**,这些属性的**键**和**类型**是可变的,

~~~typescript
// 索引签名，完全可以不⽤key这个单词，换成其他的也可以
[key: string]: any 
// string是对属性名数据类型的限定，限定属性名必须是string类型
~~~

~~~typescript
//例如
let person: {
  name: string
  age?: number
  [k: string]: any
}
person = {
  name: '张三',
  age: 18,
  gender: '男'
}
console.log(person)
~~~

#### 声明函数类型

* **=> number **表示限定函数的返回值类型为number

~~~typescript
let sum: (x: number, y: number) => number
sum = function getSum(x, y) {
  return x + y
}

console.log(sum(1, 2))
//返回值为3
~~~

#### 声明数组类型

* ​

~~~typescript
//单个数组元素限定
let arr: [number, string]
arr = [1, 'hu']

//全部数组元素限定
let newArr: string[]
newArr = ['w', 'r', 't']
~~~

### tuple

* 元组(Tuple)是一种特殊的**数组类型**,可以存储固定数量的元素,并且每个元素的类型是已知的且可以不同。
  * [string, number] ---元组
* 元组用于精确描述一组值的类型,?表示可选元素。

~~~typescript
// 第一个元素必须是 string 类型,第二个元素必须是 number 类型。
let arr1: [string, number]
//第一个元素必须是 number 类型,第二个元素是可选的,如果存在,必须是boolean 类型。
let arr2: [number, boolean?]
// 第一个元素必须是 number 类型,后面的元素可以是任意数量的 string 类型	>= 0
let arr3: [number, ...string[]]

// 可以赋值
arr1 = ['hello', 123]
arr2 = [100, false]
arr2 = [200]
arr3 = [100, 'hello', 'world']
arr3 = [100]

// 不可以赋值,arr1声明时是两个元素,赋值的是三个
// arr1 = ['hello', 123, false]
~~~

### enum

* 可以用来定义一组**命名常量**
  * 注意：枚举的属性是只读的

#### 数字枚举

* 数字枚举一种最常见的枚举类型,其**成员的值会自动递增**,且数字枚举还具备**反向映射**的特点
* 在下面代码的打印中,不难发现:**可以通过值来获取对应的枚举成员名称。**

~~~typescript
// 定义一个描述【上下左右】方向的枚举Direction
enum Direction {
  Up,
  Down,
  Left,
  Right
}
console.log(Direction)
//打印Direction会看到如下内容
/*
0：'Up'
1:'Down',
2: 'Left',
3:'Right',
Up:0,
Down:1,
Left:2,
Right:3
*/

// 反向映射
console.log(Direction.Up)	//打印0
console.log(Direction[0])	//打印Up

//此行代码报错,枚举中的属性是只读的
// Direction.Up = 'shang'

~~~

* 也可以指定枚举成员的初始值,其后的成员值会自动递增。

~~~typescript
//也可以指定枚举成员的初始值,其后的成员值会自动递增。
enum Direction {
  Up = 6,
  Down,
  Left,
  Right
}

console.log(Direction.Up); //6
console.log(Direction.Down); // 7
~~~

#### 字符串枚举

* 字符串枚举无**反向映射**特点

~~~typescript
// 枚举成员的值是字符串
enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right"
}
console.log(Direction)
//返回值{ Up: 'up', Down: 'down', Left: 'left', Right: 'right' }
~~~

#### 常量枚举

* 使用const关键字定义常量枚举
* 可以使得js代码只显示业务代码

### type

* type可以为任意类型创建别名
  * 注意：要有实际意义，要有语义

#### 基本用法

* **type 类型别名 = 类型名**

~~~typescript
type P = number
let a: P = 10
~~~

* ​

~~~typescript
type State = { count: number }  //类型声明
type AS = { type: 'add' | 'sub' }  //类型声明
//等价于
//action:AS
action: { type: 'add' | 'sub' }  //类型声明
~~~

##### 函数

~~~typescript
//定义构造函数
type Constructor = new (...string: any[]) => void
~~~

~~~typescript
//定义普通函数
type Fn = (...string: any[]) => void
//定义普通函数
type Fnfn = {
  (x: number, y: number): void
}
//定义普通函数
type Fnfn = (x: number, y: number) => void
~~~

#### 联合类型

* `|`字符相当于**或**

~~~typescript
//定义的Status类型的数据可以时number类型，也可以是string类型
type Status = number | string
//定义的Gender类型的数据只能是'男'或'女'
type Gender = '男' | '女'

function printStatus(status: Status) {
  console.log(status);
}
function logGender(str: Gender) {
  console.log(str)
}
printStatus(404);
printStatus('200');

logGender('男')
logGender('女')
~~~

#### 交叉类型

* 将多个用type定义过的类型合并成一个类型
* 合并后的类型有被合并类型的所有成员
* `&`符号用于交叉类型，相当于并且

~~~typescript
//面积
type Area = {
  height: number;//高
  width: number; //
}
//地址
type Address = {
  num: number;//楼号
  cell: number;//单元号
  room: string;//房间号
}
//定义类型House,且House是Area和Address组成的交叉类型
type House = Area & Address

const house: House = {
  height: 180,
  width: 75,
  num: 6,
  cell: 3,
  room: '702'
};

console.log(house)
//{ height: 180, width: 75, num: 6, cell: 3, room: '702' }
~~~

#### 特殊情况

## 类

### 基本用法

*   在ts中，实例对象的属性名要先定义

~~~typescript
class Person {
  //在ts中，实例对象的属性名要先定义
  name: string
  age: number
  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
  speak() {
    console.log(`我是学生,我叫:${this.name},今年${this.age}岁`)
  }
}
~~~

* 重写从父类继承的方法时
* **override关键字**，表示重写父类某一方法

~~~typescript
class Student extends Person {
  grade: string
  // 构造器
  constructor(name: string, age: number, grade: string) {
    super(name, age)
    this.grade = grade
  }
  // 备注本例中若Student类不需要额外的属性,Student的构造器可以省略
  // 重写从父类继承的方法
  override speak() {
    console.log(`我是学生,我叫:${this.name},今年${this.age}岁,在读${this.grade}年级`,)
  }
  // 子类自己的方法
  study() {
    console.log(`${this.name}正在努力学习中...`)
  }
}
~~~

#### 简写类

~~~typescript
//简写前
class Person {
  //在ts中，实例对象的属性名要先定义
  protected name: string
  public age: number
  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}

~~~

~~~typescript
//简写后
class Person {
  //在ts中，实例对象的属性名要先定义
  //简写时要带修饰符
  constructor(public name: string, public age: number) {
  }
}
~~~

### 修饰符

| 修饰符     | 含义         | 具体规则                             |
| ---------- | ------------ | ------------------------------------ |
| public     | 公开的       | 可以被：**类内部、子类、类外部**访问 |
| protected  | 受保护的     | 可以被：**类内部、子类**访问         |
| private    | 私有的       | 可以被：**类内部**访问               |
| <readonly> | **只读属性** | 属性无法被修改                       |

### 抽象类

* 概述:**抽象类是一种无法被实例化的类**,专门用来定义类的**结构和行为**,类中可以写抽象方法,也可以写具体实现。
* `抽象类主要用来`**为其派生类提供一个基础结构**,要求其**派生类必须实现其中的抽象方法**。

~~~typescript
// 定义了一个抽象类 
// 快递包裹 包含两个子类  标准包裹  特快包裹
abstract class Package {
  constructor(public weight: number) { }
  // 抽象方法:用来计算运费,不同类型包裹有不同的计算方式
  abstract calculate(): number
  // 通用方法:打印包裹详情
  printPackage() {
    console.log(`包裹重量为:${this.weight}kg,运费为:${this.calculate()}元`)
  }
}
~~~

~~~typescript
// 定义了抽象类的派生类
// 标准包裹
class StandardPackage extends Package {
    // 派生类
  constructor(
    weight: number,
    public unitPrice: number//每公斤的固定费率
  ) { super(weight) }

  // 具体实现抽象方法:计算运费
  calculate(): number {
    return this.weight * this.unitPrice;
  }
}
// 创建标准包裹实例
// 对象实例指具体一个包裹  每个包裹可能有不同的重量
const s1 = new StandardPackage(10, 5)
s1.printPackage()
~~~

~~~typescript
// 特快包裹
class ExpressPackage extends Package {
  constructor(
    weight: number,
    private unitPrice: number,//每公斤的固定费率(快速包裹更高)
    private additional: number // 超出10kg以后的附加费
  ) { super(weight) }

  // 实现抽象方法:计算运费
  calculate(): number {
    if (this.weight > 10) {
      // 超出10kg的部分,每公斤多收additional对应的价格
      return 10 * this.unitPrice + (this.weight - 10) * this.additional
    } else {
      return this.weight * this.unitPrice;
    }
  }
}
// 创建特快包裹实例
const el = new ExpressPackage(13, 8, 2)
el.printPackage()
~~~

* 总结:何时使用抽象类?
  * 定义通用接口:为一组相关的类定义通用的行为(方法或属性)时。
  * 提供基础实现:在抽象类中提供某些方法或为其提供基础实现,这样派生类就可以继承这些实现。
  * 确保关键实现:**强制派生类实现一些关键行为**。
  * 共享代码和逻辑:当多个类需要共享部分代码时,抽象类可以避免代码重复。

### Mixins

* Mixins 是一种**将多个类的功能组合到一个类中的方式**。在 TypeScript 中，由于不支持多继承，mixins 提供了一种替代方案。

~~~typescript
// 定义可复用的行为
class Disposable {
    isDisposed: boolean = false;
    
    dispose() {
        this.isDisposed = true;
        console.log('Disposed');
    }
}

class Activatable {
    isActive: boolean = false;
    
    activate() {
        this.isActive = true;
        console.log('Activated');
    }
    
    deactivate() {
        this.isActive = false;
        console.log('Deactivated');
    }
}

// 主类
class SmartObject {
    constructor() {
        console.log('SmartObject created');
    }
    
    interact() {
        console.log('Interacting...');
    }
}

// 应用 mixins
interface SmartObject extends Disposable, Activatable {}
//将多个类的功能（方法和属性）复制到目标类中。
applyMixins(SmartObject, [Disposable, Activatable]);

// 使用
const obj = new SmartObject();
obj.interact();   // SmartObject 自己的方法
obj.activate();   // 来自 Activatable
obj.dispose();    // 来自 Disposable
~~~
- **SmartObject**：目标类（想要增强的类）
- **[Disposable, Activatable]**：源类列表（提供功能的类）
- **applyMixins**：一个工具函数，执行复制操作
```typescript
applyMixins(SmartObject, [Disposable, Activatable]);
```

#### 插件类型混入

~~~typescript
class Logger {
  log(msg: string) {
    console.log(msg)
  }
}
class Html {
  render() {
    console.log('render')
  }
}
class App {
  run() {
    console.log('run')
  }
}

type Custructor<T> = new (...args: any[]) => T
// 定义函数 要求传入参数和返回值是 类类型
// 用到泛型约束 <T extends Custructor<App>>
function pluginMinxins<T extends Custructor<App>>(Base: T) {
  return class extends Base {
    private Logger = new Logger()
    private Html = new Html()
    constructor(...args: any[]) {
      super(...args)
      this.Logger = new Logger()
      this.Html = new Html()
    }
    run() {
    }
    render() {
      this.Logger.log('render')
      this.Html.render()
    }
  }
}

const mixins = pluginMinxins(App)
const app = new mixins
~~~







## 接口

* **interface是一种`定义结构`的方式**，主要作用为类、对象、函数等规定一种契约
  * 是定义结构的方式，约束了必须要有接口这种结构，而不是名义

### 定义类结构

* class  类名  implements  接口名
* 表示某类实现了某接口

~~~typescript
// PersonInterface接口,用与限制Person类的格式
interface PersonInterface {
  name: string
  age: number
  speak(n: number): void
}
//定义一个类 Person,实现 PersonInterface 接口
class Person implements PersonInterface {
  constructor(
    public name: string,
    public age: number
  ) { }
  // 实现接口中的 speak 方法
  speak(n: number): void {
    for (let i = 0; i < n; i++) {
      // 打印出包含名字和年龄的问候语句
      console.log(`你好,我叫${this.name},我的年龄是${this.age}`);
    }
  }
}
// 创建一个 Person 类的实例 p1,传入名字‘tom'和年龄 18
const p1 = new Person('tom', 18);
p1.speak(3)
~~~

#### 接口可以继承于某类

~~~typescript
class Disposable {
    isDisposed: boolean = false;
    
    dispose() {
        this.isDisposed = true;
        console.log('Disposed');
    }
}

class Activatable {
    isActive: boolean = false;
    
    activate() {
        this.isActive = true;
        console.log('Activated');
    }
    
    deactivate() {
        this.isActive = false;
        console.log('Deactivated');
    }
}

// 主类
class SmartObject {
    constructor() {
        console.log('SmartObject created');
    }
    
    interact() {
        console.log('Interacting...');
    }
}

//接口继承类
interface SmartObject extends Disposable, Activatable {
    
}
~~~

### 定义对象结构

* ​

~~~typescript
interface PersonInterface {
  name: string
  age: number
  speak: (n: number) => void
}
//定义一个对象，实现PersonInterface接口
const P: PersonInterface = {
  name: 'h',
  age: 18,
  speak(n) {
    console.log(1)
  }
}
~~~

### 定义函数结构

* ​

~~~typescript
// 定义函数接口
interface CountInterface {
  (a: number, b: number): number;
}
const count: CountInterface = (x, y) => {
  return x + y
}
~~~

### 接口的特性

#### 继承(可多继承)

~~~typescript
interface PersonInterface {
name: string//姓名
age: number // 年龄
}

interface StudentInterface extends PersonInterface {
grade: string //年级
}

const stu: StudentInterface = {
name:"张三",
age: 25,
grade:'高三'
}
~~~

#### 合并(可重复定义)

~~~typescript
interface PersonInterface {
  // 属性声明
  name: string
  age: number
}
//给PersonInterface接口添加新属性
interface PersonInterface {
  // 方法声明
  speak(): void
}

//等价于

interface PersonInterface {
  name: string
  age: number
  speak(): void
}
~~~

###  interface 与 type 的区别

* 相同点：interface 与 type都可以定义对象结构

~~~typescript
// 使用 interface 定义 Person 对象
interface PersonInterface {
  name: string;
  age: number;
  speak(): void;
}
// 使用 type 定义 Person 对象
type PersonType = {
  name: string;
  age: number;
  speak(): void;
}
~~~

* 不同点：
  * interface 支持继承和合并
  * type 可以定义类别名，联合类型和交叉类型

~~~typescript
// 使用 type 定义 Person 类型,并通过交叉类型实现属性的合并
type PersonType = {
  name: string;// 姓名
  age: number;// 年龄
} & {
  speak: () => void;
};

// 使用 type 定义 Student 类型,并通过交叉类型继承 PersonType

// 相当于
// type J = { grade: string}
// type StudentType = PersonType & J

type StudentType = PersonType & {
  grade: string;//年级
}
const student: StudentType = {
  name: '李四',
  age: 18,
  grade: '高二',
  speak() {
    console.log(this.name, this.age, this.grade);
  }
}
~~~

### interface 与 抽象类的区别

* 相同点:都能定义一个类的格式(定义类应遵循的契约)
* 不相同:
  * 接口:**只能描述结构**,不能有任何实现代码,**一个类可以实现多个接口。**
  *  抽象类:既可以包含抽象方法,也可以包含具体方法,**一个类只能继承一个抽象类。**

## 泛型


* 泛型允许我们在**定义函数、类或接口**时,`使用类型参数来表示未指定的类型`,这些参数在**具体使用时**,才被指定具体的类型
* 泛型能让同一段代码适用于多种类型,同时仍然保持类型的安全性。
* 定义函数、类或接口时，不能确定类型，调用时才能确定类型，就要用到泛型


### 泛型函数

~~~typescript
function logData<T>(data: T): T {
  console.log(data)
  return data
}
logData<number>(100)
logData<string>('hello')
~~~

### 泛型可以有多个

~~~typescript
// 泛型可以有多个
function fnFn<T, G>(x: T, y: G): T | G {
  return Date.now() % 2 ? x : y
}
console.log(fnFn<string, number>('偶数', 1))
~~~

### 泛型type

~~~typescript
//泛型type
type A<T> = number | string | T
let data: A<number> = 1
~~~

### 泛型接口

~~~typescript
// 泛型接口
interface GetSum<T> {
  x: number,
  y?: string,
  e: T
}
const obj: GetSum<string> = {
  x: 1,
  // y: 'hello',
  e: 'word'
}
console.log(obj)
//{ x: 1, e: 'word' }
~~~

### 泛型约束

* 限制泛型参数必须满足特定的条件。


~~~typescript
function add<T extends number>(x: T, y: T) {
  return x + y
}
add(1,2)
~~~

* 语法：<T extends ConstraintType>



~~~ typescript
//定义了一种结构
interface LengthInterface {
  length: number
}
// 约束规则是:传入的类型T必须具有 length 属性
// T是什么？T是数据类型，比如number、string等
// T被约束了要有Len这种结构
// string里有接口Len这种结构，所以string类型的数据可以被传入
function logPerson<T extends LengthInterface>(data: T): void {
  console.log(data.length)
}
logPerson<string>('hello')

//报错:因为number不具备length属性
// logPerson<number>(100)
~~~

#### keyof

* keyof 可以将对象身上的key 转成联合类型

~~~typescript
let obj = {
  name: '小满',
  gender: '女'
}

type key = keyof typeof obj   //===> 'name' | 'gender'
~~~

~~~typescript
let obj = {
  name: '小满',
  gender: '女'
}

function ob<T extends object, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}
//要想key能被obj解析，必须是obj的key
//要对K进行泛型约束，约束传入的key必须是是obj的key
//keyof 将obj身上的key，转成联合类型
ob(obj, 'gender')
~~~

* 遍历接口

~~~typescript
interface Data {
  name: string
  age: number
  sex: string
}
//for in for(let key in obj)
type Options<T extends object> = {
  readonly [Key in keyof T]: T[Key]	//映射与反向映射
}

type B = Options<Data>
~~~

### 泛型类

~~~typescript
// 5.泛型类
class Person<T> {
  constructor(
    public name: string,
    public age: number,
    public extraInfo: T
  ) { }
  speak() {
    console.log(`我叫${this.name}今年${this.age}岁了`)
    console.log(this.extraInfo)
  }
}
// 测试代码1
const p1 = new Person<number>("tom", 30, 250);

// 测试代码2
type JobInfo = {
  title: string;
  company: string;
}
const p2 = new Person<JobInfo>("tom", 30, {
  title: '研发总监', company: '发发发科技公司'
});
~~~

## 命名空间

* 用来分离变量或方法，避免全局污染
* 要在空间外访问空间内变量或方法，通过export关键字导出
* 语法：

~~~typescript
namespace 空间名 {
    esport
    //导出
}
~~~

* 特性：嵌套 抽离 导出 简化 合并

~~~typescript
namespace Test {
  export let a: number = 1
  export const add: (x: number, y: number) => number = (x, y) => {
    return x + y
  }
  export const sum = (x: number, y: number): number => x + y
}
console.log(Test.a)	// 打印1
~~~

~~~typescript
import Test from './Test.ts'
~~~

## 知识点

### typeof

* 在typescript中，typeof是**类型查询操作符**，用于获得某个值的详细信息，与javascript不同

~~~typescript
const initState = { count: -1 };
// TypeScript 的 typeof 会推导出 initState 的具体结构
// 结果是：{ readonly count: number } 或 { count: number }
type State = typeof initState;
// State 现在等价于 { count: number }
~~~

### as 类型断言

例：

~~~typescript
({} as ThemeContextType)
//用一个空对象 {} 作为默认值，并通过 as ThemeContextType 告诉 TypeScript 将其断言为该类型
~~~

































































