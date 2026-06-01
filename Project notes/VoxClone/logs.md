
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

同时 tanstack query 集成了 tRPC，
```