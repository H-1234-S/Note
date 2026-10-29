# `dependabot[bot]`

`dependabot[bot]` 是 GitHub 官方提供的自动化依赖管理工具 **Dependabot** 在 GitHub 平台上的机器人账号

> **作用：**

- **安全更新：** 当 GitHub 检测到你项目使用的某个依赖包存在已知漏洞时，Dependabot 会自动创建一个 Pull Request，尝试将该依赖升级到已修复漏洞的安全版本。
	
- **版本更新：** Dependabot 会定期检查你的依赖清单（如 `package.json`、`pom.xml` 等），发现有过时版本时，自动创建 Pull Request 将其更新到最新版本，保持依赖处于较新状态。

> **配置：**

可以通过仓库根目录下的 `.github/dependabot.yml` 文件进行精细配置

> **示例：**

``` yml
version: 2
updates:
	# 检测 docker-compose 文件
  - package-ecosystem: docker-compose
    # 从根目录下开始找
    directory: /
    schedule:
      interval: weekly
      day: tuesday
	# 检测 github-actions
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
      day: tuesday
```