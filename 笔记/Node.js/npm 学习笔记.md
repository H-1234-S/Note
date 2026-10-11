# package.json

运行 `npm init` 命令生成 `package.json`

`dependencies` 可以理解为生产环境依赖；`devDependencies` 可以理解为开发环境的依赖

`npm config list` 命令可以查看 `npm` 的配置项，包括源、代理、位置

`npm ls -g` 用于查看全局安装了哪些依赖
# npm install 原理

## 运行 npm install 发生了什么？

安装依赖，默认采用**扁平化的安装方式**。

依赖的排序顺序：`.` 排在最前面，随后是 `@` 系列，再之后才是按首字母排序。

采用的算法是**广度优先遍历**

在处理每个依赖时，npm会检查该依赖的版本号是否符合依赖树中其他依赖的版本要求，如果不符合，则会尝试安装适合的版本。

### 广度优先遍历？

意思是 `npm` 会首先处理项目**根目录下的依赖**，然后**逐层处理每个依赖包的依赖**，直到所有依赖都被处理完毕。
#### 为什么？

`npm` 需要决定哪些包需要**提升到顶层**。

---
### 查找规则

A 包会查找自己的 `node_modules`，也就是 `A/node_modules/C`；如果没有再找 `项目/node_modules/C`

---
### 扁平化？

**扁平化**指的是 `npm` 安装依赖时会将依赖提升到顶层。

#### 为什么？

因为很多情况下，不需要给每个包单独保存一份依赖。

例如：A 包和 B 包都依赖同一个版本的 C 包，扁平化之后 A 包和 B 包都可以找到该 C 包，减少重复依赖

> **注意**

**扁平化并不是所有包都在最外层**；例如：A 包和 B 包都依赖不同版本的 C 包，会嵌套安装。

npm 会尽可能扁平化，但遇到版本冲突时，仍然可能嵌套安装。

## npm install 安装依赖前的流程

运行 `npm  install` 命令，查找 `config` 配置 `(npm config list)`。

之后会按照 `项目级.npmrc` 、`用户级.npmrc` 、`全局级.npmrc` 、`npm内置的.npmrc` 查找配置文件`(作用同 config )`

查找完之后，去检查有没有 `package-lock.json` 

- 如果有，比较 `package.json` 和 `package_lock.json` 中依赖的版本号

	- 如果不一致，会根据 `package.json` 中版本号以及语义去下载包，之后更新`package_lock.json` 文件。
		
	- 如果一致，会检查缓存，如果缓存中有，就解压到 `node_moduels`；如果没有就去源下载、添加到缓存中、更新 `lock` 文件、解压到 `node_moduels`

- 如果没有，就去**构建依赖树、同时扁平化**；之后就是检查缓存，内容同上。

---
# npm run xxx原理

运行 `npm run dev` 命令后，会去读取 `package.json` 文件中 `script` 对应脚本命令

> **查找规则**

会在当前项目的 `node_moduels` 的 `.bin` 去查找可执行命令

当前 `node_moduels` 下没有的话，再去查找全局的 `node_moduels`

如果还没找到就去环境变量查找

再找不到就进行报错

---
# npm 生命周期

``` json
    "predev": "node prev.js",
    "dev": "node index.js",
    "postdev": "node post.js"
```

执行 npm run dev 命令的时候 predev 会自动执行，他的生命周期是在dev之前执行

然后执行dev命令，再然后执行postdev，也就是dev之后执行

运用场景例如npm run build 可以在打包之后删除dist目录等等

post例如你编写完一个工具发布npm，那就可以在之后写一个ci脚本顺便帮你推送到git等等

---
# package-lock.json 的作用

`package.json` 只有大致的版本号，运行 `npm install` 时由 `npm` 决定下具体哪一个，这个具体的信息就会同步到 `package_lock.json`中。

`package_lock.json` 锁定版本、记录依赖树详细信息

## 字段

- version 该参数指定了当前包的版本号
- resolved 该参数指定了当前包的下载地址
- integrity 用于验证包的完整性
- dev 该参数指定了当前包是一个开发依赖包
- bin 该参数指定了当前包中可执行文件的路径和名称
- engines 该参数指定了当前包所依赖的Node.js版本范围

---
# npx

npx是一个命令行工具，它是npm 5.2.0版本中新增的功能。它允许用户在**不安装全局包的情况下**，运行已安装在**本地项目中**的包或者**远程仓库中**的包。

使用 npx 运行该包，其实是一次性的，将包下载到本地执行之后再删除。

## **npx 的优势**

1. 避免全局安装：`npx`允许你执行npm package，而不需要你先全局安装它。
2. 总是使用最新版本：如果你没有在本地安装相应的npm package，`npx`会从npm的package仓库中下载并使用最新版。
3. 执行任意npm包：`npx`不仅可以执行在`package.json`的`scripts`部分定义的命令，还可以执行任何npm package。
4. 执行GitHub gist：`npx`甚至可以执行GitHub gist或者其他公开的JavaScript文件。
## npm 和 npx 区别

`npx`侧重于执行命令的，执行某个模块命令。虽然会自动安装模块，但是重在执行某个命令

`npm`侧重于安装或者卸载某个模块的。重在安装，并不具备执行某个模块的功能。