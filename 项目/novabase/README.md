# Monorepo

`Monorepo` 架构就是将多个项目/应用/包放在同一个 Git 仓库中。

核心价值：**统一管理**

> **用途：** 前后端共享代码

``` ts
// packages/types
export interface User {
  id: string
  name: string
  age: number
}
```

然后：`apps/web` 和 `apps/api` 共享一份代码

## pnpm-workspace.yaml

> pnpm 怎么知道哪些目录属于这个 Monorepo？

``` yaml
packages:
  - "apps/*"
  - "packages/*"
```

> 告诉 pnpm：`apps` 和 `packages` 下面的这些目录，都属于当前 Workspace。

## package.json

为什么每个目录还需要 package.json？

**apps/api/package.json**
``` json
{
  "name": "@novabase/api",
  "dependencies": {
    "@novabase/types": "workspace:*"
  }
}
```

**packages/types/package.json**

``` json
{
  "name": "@novabase/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts"
}
```

本地依赖，是 Workspace 最核心的作用之一。

## workspace:*

依赖的是**当前 Monorepo 中的本地 workspace package**。

而不是去 npm 源下载远程的包。

# Auth

## 双 Token 机制

双 Token 机制指的是服务端发送两个 Token 给客户端

一个 Token 用于业务问题校验、短期；一个 Token 用于短期 Token 失效，重新刷新签发。

> **完整流程：**

1. 登陆时,用户输入账号密码,服务端签发**两个**令牌,都写进 Cookie
2. 前端每次调接口,浏览器自动带上 accessToken
3. 15 分钟后,accessToken 失效。这时前端调接口,服务端校验发现 accessToken 过期,返回 **401 Unauthorized**。
4. 前端在请求拦截器里捕获 401,发现是 token 过期,就**自动**调刷新接口.注意:这一步浏览器自动带上 refreshToken。
5. 服务端检查 refreshToken:
	- **有效且没过期** → 签发一个**新的 accessToken**,通过 Set-Cookie 返回
	- **无效或过期** → 返回 401,前端跳转登录页
6. 前端收到新的 accessToken 后,**重新发送刚才失败的那个请求**。这次 accessToken 是新的,请求成功。
7. 用户从头到尾**什么都没做**,页面没有跳转登录,数据正常显示。这就是"无感知"

## Slug

Slug 是指把一段人类可读的文本（比如标题、名称、组织名）转换成一个适合放在 URL、文件名、数据库标识里的“短字符串”。

> **特点是：**

- 全部小写
    
- 空格换成连字符 `-`（有时用下划线 `_`）
    
- 去掉特殊符号、重音符号、标点
    
- 只保留字母、数字、连字符
    
- 简短、可读、对 SEO 友好

> **示例：**

``` ts
import slugify from 'slugify';

private generateOrgSlug(name: string): string {
    const base = slugify(`${name}-org`, { lower: true, strict: true });
    const suffix = randomBytes(3).toString('hex');
    return `${base}-${suffix}`;
  }
```

1. `` `${name}-org` ``  
    把组织名后面拼上 `-org`，比如 `name = "Acme"`，就变成 `"Acme-org"`。
    
2. `slugify(..., { lower: true, strict: true })`  
    用 `slugify` 库把字符串转成 slug：
    
    - `lower: true`：全部转小写 → `acme-org`
        
    - `strict: true`：只保留字母、数字、连字符，其他字符（如中文、标点、空格）都去掉或转成 `-`
        
    - 结果 `base` 类似 `acme-org`
        
3. `randomBytes(3).toString('hex')`  
    生成 3 个随机字节，转成 16 进制字符串，长度是 6，比如 `a1b2c3`。  
    这一步是为了**保证唯一性**，因为不同组织可能有相同的名字，只靠名字生成的 slug 会冲突。
    
4. `` return `${base}-${suffix}` ``  
    拼起来 → `acme-org-a1b2c3`
    
