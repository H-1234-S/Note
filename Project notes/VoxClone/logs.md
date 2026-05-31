
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



```