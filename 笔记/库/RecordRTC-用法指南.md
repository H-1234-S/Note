RecordRTC 是一个强大的 WebRTC JavaScript 库，用于在浏览器中录制音频、视频、屏幕以及 Canvas（2D/3D 动画）。

## 1. 安装

```bash
npm install recordrtc
# 或
yarn add recordrtc
```

### CDN 引入

```html
<!-- 推荐 -->
<script src="https://www.WebRTC-Experiment.com/RecordRTC.js"></script>
<!-- 或 -->
<script src="https://unpkg.com/recordrtc@5.6.2/RecordRTC.js"></script>
```

## 2. 核心概念

RecordRTC 的核心设计非常简洁：

1. **获取媒体流** - 使用 `navigator.mediaDevices.getUserMedia()` 获取麦克风、摄像头或屏幕
2. **创建录制器** - `new RecordRTC(stream, config)` 创建录制实例
3. **控制录制** - 调用 `startRecording()`、`stopRecording()` 等方法
4. **获取结果** - 通过回调获取 Blob 或直接使用 toURL()

支持录制的内容：

- `audio` - 音频录制
- `video` - 视频录制
- `screen` - 屏幕录制
- `canvas` - Canvas 录制（2D/3D 动画）
- `gif` - GIF 动画录制

## 3. 基础用法

### 3.1 最简单的视频录制

```javascript
import RecordRTC from 'recordrtc';

async function startRecording() {
  // 1. 获取视频流
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  // 2. 创建录制器
  const recorder = new RecordRTC(stream, {
    type: 'video'
  });

  // 3. 开始录制
  recorder.startRecording();

  // 4. 停止录制（可以通过按钮或定时器触发）
  setTimeout(() => {
    recorder.stopRecording(function(blob) {
      // 获取 Blob
      const videoBlob = blob;
      // 转为 URL 用于播放
      const videoURL = recorder.toURL();
      console.log('录制完成:', videoURL);
    });
  }, 5000); // 录制 5 秒
}
```

### 3.2 音频录制

```javascript
async function recordAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  const recorder = new RecordRTC(stream, {
    type: 'audio',
    recorderType: RecordRTC.StereoAudioRecorder,
    mimeType: 'audio/webm'
  });

  recorder.startRecording();

  // 录制 10 秒后停止
  setTimeout(() => {
    recorder.stopRecording(function(blob) {
      console.log('音频 Blob:', blob);
    });
  }, 10000);
}
```

### 3.3 屏幕录制

```javascript
async function recordScreen() {
  // 获取屏幕共享流
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always'  // 鼠标显示模式
    },
    audio: true  // 是否录制系统声音
  });

  const recorder = new RecordRTC(stream, {
    type: 'video',
    disableLogs: true
  });

  recorder.startRecording();

  // 监听用户点击"停止共享"
  stream.getVideoTracks()[0].onended = () => {
    recorder.stopRecording(function(blob) {
      console.log('屏幕录制完成:', blob);
    });
  };
}
```

## 4. 配置选项详解

RecordRTC 的配置对象包含以下选项：

| 配置项                     | 类型               | 默认值          | 说明                                                                                 |
| ----------------------- | ---------------- | ------------ | ---------------------------------------------------------------------------------- |
| `type`                  | string           | -            | 录制类型：`audio`、`video`、`screen`、`canvas`、`gif`                                       |
| `recorderType`          | function         | -            | 录制器类型：`MediaStreamRecorder`、`StereoAudioRecorder`、`CanvasRecorder`、`GifRecorder` 等 |
| `mimeType`              | string           | `video/webm` | MIME 类型，如 `video/webm`、`video/mp4`、`audio/webm`                                    |
| `disableLogs`           | boolean          | `false`      | 是否禁用日志                                                                             |
| `numberOfAudioChannels` | number           | `1`          | 音频通道数（1 或 2）                                                                       |
| `bufferSize`            | number           | `0`          | 缓冲区大小（0 为自动）                                                                       |
| `sampleRate`            | number           | `0`          | 采样率                                                                                |
| `desiredSampRate`       | number           | `16000`      | 期望采样率                                                                              |
| `video`                 | HTMLVideoElement | -            | 视频元素引用                                                                             |
| `timeSlice`             | number           | -            | 间隔时间（毫秒），每段时间后触发 ondataavailable                                                   |
| `ondataavailable`       | function         | -            | 数据可用时的回调                                                                           |
| `onStateChanged`        | function         | -            | 状态变化回调                                                                             |

### 4.1 type 选项

```javascript
// 视频录制
new RecordRTC(stream, { type: 'video' });

// 音频录制
new RecordRTC(stream, { type: 'audio' });

// 屏幕录制
new RecordRTC(screenStream, { type: 'screen' });

// Canvas 录制
new RecordRTC(canvasElement, { type: 'canvas' });

// GIF 录制
new RecordRTC(stream, { type: 'gif' });
```

### 4.2 recorderType 选项

```javascript
// 视频录制（默认）
new RecordRTC(stream, {
  type: 'video',
  recorderType: RecordRTC.MediaStreamRecorder
});

// 音频录制
new RecordRTC(stream, {
  type: 'audio',
  recorderType: RecordRTC.StereoAudioRecorder
});

// Canvas 录制
new RecordRTC(canvasElement, {
  type: 'canvas',
  recorderType: RecordRTC.CanvasRecorder
});

// GIF 录制
new RecordRTC(stream, {
  type: 'gif',
  recorderType: RecordRTC.GifRecorder
});

// WebAssembly 录制（需额外安装 webm-wasm）
new RecordRTC(stream, {
  type: 'video',
  recorderType: RecordRTC.WebAssemblyRecorder
});
```

### 4.3 mimeType 选项

```javascript
// WebM 格式（Chrome/Firefox 支持）
new RecordRTC(stream, {
  type: 'video',
  mimeType: 'video/webm'
});

// MP4 格式（部分浏览器支持）
new RecordRTC(stream, {
  type: 'video',
  mimeType: 'video/mp4'
});

// WAV 格式（音频）
new RecordRTC(stream, {
  type: 'audio',
  mimeType: 'audio/wav'
});
```

### 4.4 timeSlice 和 ondataavailable

用于间隔获取录制数据块：

```javascript
const recorder = new RecordRTC(stream, {
  type: 'video',
  timeSlice: 1000,  // 每 1 秒获取一次数据
  ondataavailable: (blob) => {
    console.log('新的数据块:', blob);
  }
});

recorder.startRecording();
```

## 5. API 方法

RecordRTC 实例上的方法：

| 方法 | 说明 |
|------|------|
| `startRecording()` | 开始录制 |
| `stopRecording(callback)` | 停止录制，在回调中获取 Blob |
| `pauseRecording()` | 暂停录制 |
| `resumeRecording()` | 恢复录制 |
| `reset()` | 重置录制器状态 |
| `getBlob()` | 获取录制数据的 Blob |
| `toURL()` | 获取 Blob 的 URL |
| `getDataURL(callback)` | 获取 Data URL |
| `save(fileName)` | 触发下载保存对话框 |
| `setRecordingDuration(duration, callback)` | 设置自动停止时间 |
| `destroy()` | 销毁录制器实例 |
| `getState()` | 获取当前状态 |

### 5.1 startRecording 开始录制

```javascript
recorder.startRecording();

// 也可以传递配置
recorder.startRecording({
  type: 'video',
  mimeType: 'video/webm'
});
```

### 5.2 stopRecording 停止录制

```javascript
// 方式一：传入回调函数
recorder.stopRecording(function(blob) {
  const url = URL.createObjectURL(blob);
  videoElement.src = url;
});

// 方式二：先停止，再获取 Blob
recorder.stopRecording();
const blob = recorder.getBlob();
```

### 5.3 pauseRecording / resumeRecording 暂停和恢复

```javascript
// 暂停
recorder.pauseRecording();

// 恢复
recorder.resumeRecording();

// 可以监听状态变化
const recorder = new RecordRTC(stream, {
  type: 'video',
  onStateChanged: (state) => {
    console.log('状态:', state);  // 'recording' | 'paused' | 'stopped'
  }
});
```

### 5.4 save 保存到文件

```javascript
// 保存为指定文件名
recorder.save('my-recording.webm');

// 在 video 元素中播放
recorder.stopRecording(function() {
  const video = document.querySelector('video');
  video.src = this.toURL();
});
```

### 5.5 setRecordingDuration 自动停止

```javascript
// 5 分钟后自动停止
const fiveMinutes = 5 * 1000 * 60;
recorder.setRecordingDuration(fiveMinutes, function() {
  const blob = this.getBlob();
  console.log('录制完成:', blob);
});

recorder.startRecording();
```

## 6. 完整示例

### 6.1 基础视频录制示例

```javascript
import RecordRTC from 'recordrtc';

function VideoRecorder() {
  let recorder = null;
  let stream = null;

  async function start() {
    try {
      // 获取摄像头和麦克风
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720
        },
        audio: true
      });

      // 创建录制器
      recorder = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm',
        disableLogs: true
      });

      // 开始录制
      recorder.startRecording();

      console.log('开始录制...');
    } catch (error) {
      console.error('获取媒体设备失败:', error);
    }
  }

  function stop() {
    if (!recorder) return;

    recorder.stopRecording(function(blob) {
      // 创建视频 URL
      const videoURL = recorder.toURL();

      // 显示录制的视频
      const video = document.querySelector('video');
      video.src = videoURL;
      video.controls = true;

      console.log('录制完成');

      // 停止摄像头
      stream.getTracks().forEach(track => track.stop());
    });
  }

  return { start, stop };
}
```

### 6.2 同时录制多个媒体流

```javascript
async function recordMultipleStreams() {
  // 获取摄像头
  const videoStream = await navigator.mediaDevices.getUserMedia({
    video: true
  });

  // 获取屏幕
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  });

  // 合并流
  const combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...videoStream.getAudioTracks(),
    ...screenStream.getVideoTracks()
  ]);

  const recorder = new RecordRTC(combinedStream, {
    type: 'video',
    disableLogs: true
  });

  recorder.startRecording();
}
```

### 6.3 带录制时长的录音示例

```javascript
import RecordRTC from 'recordrtc';

function AudioRecorder() {
  let recorder = null;
  let stream = null;
  let isRecording = false;

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,  // 回声消除
        noiseSuppression: true,   // 降噪
        sampleRate: 48000      // 采样率
      }
    });

    recorder = new RecordRTC(stream, {
      type: 'audio',
      recorderType: RecordRTC.StereoAudioRecorder,
      mimeType: 'audio/webm',
      numberOfAudioChannels: 2,
      sampleRate: 48000,
      timeSlice: 100,
      ondataavailable: (blob) => {
        console.log('音频数据块:', blob.size);
      }
    });

    recorder.startRecording();
    isRecording = true;
    console.log('开始录音...');
  }

  function stop() {
    if (!recorder || !isRecording) return;

    recorder.stopRecording(function(blob) {
      const audio = document.querySelector('audio');
      audio.src = recorder.toURL();
      audio.controls = true;

      isRecording = false;
      stream.getTracks().forEach(track => track.stop());
      console.log('录音完成, 时长:', blob.size);
    });
  }

  return { start, stop, isRecording: () => isRecording };
}
```

### 6.4 Canvas 动画录制

```javascript
function CanvasRecorder() {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  let animationId;
  let recorder;

  function drawFrame() {
    // 绘制动画
    const time = Date.now() * 0.002;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `hsl(${time * 50 % 360}, 70%, 50%)`;
    ctx.beginPath();
    ctx.arc(
      200 + Math.sin(time) * 100,
      150 + Math.cos(time) * 100,
      50,
      0,
      Math.PI * 2
    );
    ctx.fill();

    animationId = requestAnimationFrame(drawFrame);
  }

  function start() {
    drawFrame();

    recorder = new RecordRTC(canvas, {
      type: 'canvas'
    });

    recorder.startRecording();
    console.log('Canvas 录制开始...');
  }

  function stop() {
    cancelAnimationFrame(animationId);

    recorder.stopRecording(function(blob) {
      const video = document.querySelector('video');
      video.src = recorder.toURL();
      console.log('Canvas 录制完成...');
    });
  }

  return { start, stop };
}
```

### 6.5 上传到服务器

```javascript
async function uploadRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });

  const recorder = new RecordRTC(stream, {
    type: 'video'
  });

  recorder.startRecording();

  // 录制 10 秒
  setTimeout(() => {
    recorder.stopRecording(function(blob) {
      // 创建 FormData
      const formData = new FormData();
      formData.append('video', blob, 'recording.webm');

      // 上传到服务器
      fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          console.log('上传成功:', data);
        })
        .catch(error => {
          console.error('上传失败:', error);
        });
    });
  }, 10000);
}
```

## 7. 全局 API

RecordRTC 提供了一些全局函数：

| API | 说明 |
|-----|------|
| `bytesToSize(bytes)` | 字节转换为人类可读的大小 |
| `invokeSaveAsDialog(file, fileName)` | 打开保存对话框 |
| `getSeekableBlob(blob, callback)` | 获取可搜索的 Blob（修复视频.seek() 问题） |
| `DiskStorage` | IndexedDB 存储对象 |
| `Storage` | 存储 AudioContext 等 |
| `isChrome` | 是否 Chrome 浏览器 |
| `isSafari` | 是否 Safari 浏览器 |
| `isFirefox` | 是否 Firefox 浏览器 |
| `isEdge` | 是否 Edge 浏览器 |
| `isOpera` | 是否 Opera 浏览器 |

### 7.1 bytesToSize 字节转换

```javascript
const size = bytesToSize(1024 * 1024 * 5);
console.log(size);  // '5 MB'
```

### 7.2 invokeSaveAsDialog 保存对话框

```javascript
recorder.stopRecording(function(blob) {
  invokeSaveAsDialog(blob, 'my-recording.webm');
});
```

### 7.3 getSeekableBlob 修复视频 seek 问题

某些录制的视频无法 seek，可以使用此方法修复：

```javascript
recorder.stopRecording(function(blob) {
  getSeekableBlob(blob, function(seekableBlob) {
    const video = document.querySelector('video');
    video.src = URL.createObjectURL(seekableBlob);
  });
});
```

### 7.4 DiskStorage IndexedDB 存储

将录制数据存储到 IndexedDB：

```javascript
// 初始化
DiskStorage.init(function() {
  console.log('存储初始化完成');
});

// 存储
DiskStorage.Store({
  audio: audioBlob,
  video: videoBlob,
  gif: gifBlob
});

// 获取
DiskStorage.Fetch(function(dataURL, type) {
  if (type === 'audioBlob') {
    // 处理音频
  }
  if (type === 'videoBlob') {
    // 处理视频
  }
});
```

### 7.5 浏览器检测

```javascript
const browserInfo = {
  isChrome: typeof isChrome !== 'undefined' && isChrome,
  isSafari: typeof isSafari !== 'undefined' && isSafari,
  isFirefox: typeof isFirefox !== 'undefined' && isFirefox,
  isEdge: typeof isEdge !== 'undefined' && isEdge,
  isOpera: typeof isOpera !== 'undefined' && isOpera
};

console.log('浏览器:', browserInfo);
```

## 8. 常见问题

### 8.1 回声问题

解决录制中的回声问题：

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: {
    echoCancellation: true  // 启用回声消除
  }
});

// 同时设置视频元素静音
videoElement.muted = true;
videoElement.volume = 0;
```

### 8.2 视频无法 seek

使用 `getSeekableBlob` 修复：

```javascript
getSeekableBlob(blob, function(seekableBlob) {
  videoElement.src = URL.createObjectURL(seekableBlob);
  // 现在可以 seek 了
});
```

### 8.3 录制格式兼容

不同浏览器支持的格式不同：

| 浏览器 | 推荐格式 |
|--------|----------|
| Chrome | `video/webm` |
| Firefox | `video/webm` 或 `video/ogg` |
| Safari | `video/mp4` |
| Edge | `video/webm` |

检测格式支持：

```javascript
const isSupported = RecordRTC.isTypeSupported('video/webm');
console.log('WebM 支持:', isSupported);
```

### 8.4 录制系统声音

```javascript
// 屏幕录制时包含系统声音
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    displaySurface: 'monitor'  // 整个屏幕
  },
  audio: true  // 包含系统声音
});
```

### 8.5 内存问题

使用完记得释放：

```javascript
function cleanup() {
  // 停止所有轨道
  stream.getTracks().forEach(track => track.stop());

  // 销毁录制器
  recorder.destroy();
  recorder = null;

  // 释放 Blob URL
  URL.revokeObjectURL(videoElement.src);
}
```

## 9. 录制状态

RecordRTC 的状态：

| 状态 | 说明 |
|------|------|
| `idle` | 空闲状态 |
| `recording` | 录制中 |
| `paused` | 暂停中 |
| `stopped` | 已停止 |

监听状态变化：

```javascript
const recorder = new RecordRTC(stream, {
  type: 'video',
  onStateChanged: (state) => {
    console.log('录制状态:', state);
  }
});

console.log('当前状态:', recorder.getState());
```

## 10. React 中使用 RecordRTC

```jsx
import React, { useRef, useState } from 'react';
import RecordRTC from 'recordrtc';

function VideoRecorder() {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      const recorder = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm'
      });

      recorderRef.current = recorder;
      recorder.startRecording();
      setRecording(true);
    } catch (error) {
      console.error('获取媒体失败:', error);
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;

    recorderRef.current.stopRecording((blob) => {
      const video = videoRef.current;
      video.src = URL.createObjectURL(blob);
      setRecording(false);
    });
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline controls />
      <div>
        <button onClick={startRecording} disabled={recording}>
          开始录制
        </button>
        <button onClick={stopRecording} disabled={!recording}>
          停止录制
        </button>
      </div>
    </div>
  );
}

export default VideoRecorder;
```

## 11. TypeScript 类型

```typescript
import RecordRTC from 'recordrtc';

interface RecorderConfig {
  type: 'audio' | 'video' | 'screen' | 'canvas' | 'gif';
  recorderType?: any;
  mimeType?: string;
  disableLogs?: boolean;
  numberOfAudioChannels?: number;
  bufferSize?: number;
  sampleRate?: number;
  desiredSampRate?: number;
  timeSlice?: number;
  ondataavailable?: (blob: Blob) => void;
  onStateChanged?: (state: string) => void;
}

async function recordVideo(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  const recorder: RecordRTC = new RecordRTC(stream, {
    type: 'video',
    mimeType: 'video/webm',
    disableLogs: true
  });

  recorder.startRecording();

  setTimeout(() => {
    recorder.stopRecording((blob: Blob) => {
      const url: string = recorder.toURL();
      console.log('录制完成:', url);
    });
  }, 5000);
}
```

## 12. API 参考速查

### 配置选项速查

```javascript
new RecordRTC(stream, {
  // 基础配置
  type: 'video',
  mimeType: 'video/webm',

  // 录制器
  recorderType: RecordRTC.MediaStreamRecorder,

  // 音频配置
  numberOfAudioChannels: 2,
  sampleRate: 48000,
  bufferSize: 0,

  // 日志
  disableLogs: true,

  // 回调
  timeSlice: 1000,
  ondataavailable: (blob) => {},
  onStateChanged: (state) => {}
});
```

### 方法速查

```javascript
// 开始录制
recorder.startRecording();

// 暂停录制
recorder.pauseRecording();

// 恢复录制
recorder.resumeRecording();

// 停止录制
recorder.stopRecording((blob) => {});

// 设置自动停止
recorder.setRecordingDuration(5000, () => {});

// 获取 Blob
const blob = recorder.getBlob();

// 获取 URL
const url = recorder.toURL();

// 保存到文件
recorder.save('video.webm');

// 重置
recorder.reset();

// 销毁
recorder.destroy();

// 获取状态
const state = recorder.getState();
```

### 全局 API 速查

```javascript
// 字节转换
bytesToSize(1024 * 1024);  // '1 MB'

// 保存对话框
invokeSaveAsDialog(blob, 'video.webm');

// 可 seek 的 Blob
getSeekableBlob(blob, (seekableBlob) => {});

// 存储到 IndexedDB
DiskStorage.Store({ video: blob });
DiskStorage.Fetch((url, type) => {});
```

## 13. 相关资源

- 官方文档：https://recordrtc.org/
- GitHub：https://github.com/muaz-khan/RecordRTC
- 官方示例：https://www.webrtc-experiment.com/RecordRTC/simple-demos/
- NPM：https://www.npmjs.com/package/recordrtc