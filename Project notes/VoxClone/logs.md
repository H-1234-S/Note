
## Custom Voice Process

自定义语音存在两种语音上传方式，一种是**上传音频文件**，另一种是**录音上传**，其实都是基于recordRTC实现的

**录音上传流程：**
```
用户点击录制按钮，其实是调用startRecording函数

在函数获取麦克风权限、中对recordRTC初始化，调用recorder.startRecording方法开始录音

当用户点击暂停时，也就是调用stopRecording函数

在函数中调用recorder.stopRecording方法暂停录音，调用recorder.getBlob方法获取类型为audio/wav的blob对象

	blob 代表一段二进制数据，可以是任何东西的二进制形式
	file 是 blob 的特殊形式，也是对 blob 的拓展，目的是使其能够表现为一个操作系统中的文件
	new File 可以将 Blob 转为 File

将 blob 转为 file 之后，使用 tanstack form 管理表单数据

如果用户选择完其他参数，点击提交后，向/api/voices/create发送请求，将基本的参数用查询参数传递，file作为body发送

	也可以使用formData上传，但是解析需要用 request.formData() 来解析

在route中进行基本的鉴权操作，safeParse数据，request.arrayBuffer 处理二进制数据

对二进制数据进行大小校验、时长校验，时长校验使用了music-metadata库

之后就需要将文件上传到 cloudflare 中，但是在 cloudflare 中使用 voices/orgs/${orgId}/${voice.id} 这种格式上传数据

因此需要先使用 prisma.voice.create 生成一个占位符，获取 voiceId

之后调用 uploadAudio 函数上传音频数据，同时将 r2ObjectKey 补充到表中

	对于 cloudflare 的应用，其实也就是初始化r2，之后上传数据、删除数据、获取一个临时的url链接用来预览音频
```

## Audio Generation Process

```
用户在 tts 页面输入文本，选择音色，调整对应参数，点击生成之后

首先 tanstack form 管理表单数据，点击生成提交表单数据到 onSubmit 函数中进行处理

onSubmit 函数中使用了 tanstack query 的 mutation 函数处理请求

同时 tanstack query 与 tRPC 进行集成
	
	因为使用 tRPC 获取的数据本质上还是 server state，拿到的其实是后端数据
	tRPC 是让你类型安全的调用服务端程序，类型安全的获取后端数据
	Tanstack Query 则是类型安全的对服务端状态进行管理

使用 createMutation 携带参数到 trpc.generations.create 程序执行

在 procedure 中对数据基本验证、鉴权，根据 voiceId 查找对应的 r2ObjectKey

调用 chatterbox.POST 传入 r2ObjectKey，Chatterbox 后端根据 r2ObjectKey 去加载对应的参考音频，根据 prompt 生成新的音频

	chatterbox.POST("/generate", ...)
	它会向环境变量 CHATTERBOX_API_URL 指向的 Modal 平台上的 Chatterbox 服务发送 HTTP 请求
	而这个 Modal 服务就是由根目录的 chatterbox_tts.py 部署出来的

返回的数据是 web 标准的 ArrayBuffer 原始二进制数据

对于返回的 generation 音频，上传到 cloudflare 中，用于生成一个预览url，便于前端展示

响应成功后携带 generationId 跳转到生成音频详情页

跳转到生成详情页，根据对应 generationId 预取对应数据
	
	预取的数据 
```

## tRPC

tRPC，全称 TypeScript Remote Procedure Call。它让**前端**像调用本地函数一样调用**服务端 Procedure**，同时把输入、输出、错误类型从服务端路由自动推导到客户端。

核心概念

执行流程

架构设计
## Tanstack Query

Tanstack Query 是一个用于管理**服务端状态**的异步状态管理库。它不负责发送请求，依旧可以使用 `fetch`、`axios`、`ky` 或使用 `tRPC` 请求数据

它真正解决的是：请求结果如何缓存、什么时候重新请求、多个组件如何共享同一份数据、失败如何重试、修改数据后如何同步界面。
