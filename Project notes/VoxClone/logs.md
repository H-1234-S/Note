
## Custom Voice Process

自定义语音存在两种语音上传方式，一种是**上传音频文件**，另一种是**录音上传**，其实都是基于recordRTC实现的

思路：获取音频文件 -> 上传到R2中 -> 前端再请求

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

如果用户选择完其他参数，点击提交后，向/api/voices/create发送请求，将基本的参数用查询参数传递，将file在请求体里

在route中进行基本的鉴权操作，safeParse数据



```