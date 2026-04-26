
> wavesurfer.js - Web 音频波形可视化与播放库

## 特性

- **波形渲染** - 将音频以可视化的波形形式展示

- **音频播放** - 支持交互式播放控制

- **响应式** - 自定义波形样式和颜色

- **插件扩展** - 通过插件实现区域标记、时间线、小地图等功能

- **TypeScript 支持** - 完整的类型定义

- **零依赖** - 无需额外依赖

## 安装

### npm 安装

```bash
npm install wavesurfer.js
```

### CDN 引入

```html
<script src="https://unpkg.com/wavesurfer.js@7"></script>
```

或使用 ESM 方式：

```html
<script type="module">
import WaveSurfer from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/wavesurfer.esm.js'
</script>
```

## 快速开始

### 最简单的示例

```html
<!-- 1. 创建容器 -->
<div id="waveform"></div>

<script type="module">
import WaveSurfer from 'wavesurfer.js'

// 2. 创建实例
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  url: '/audio.mp3'
})

// 3. 响应交互自动播放
wavesurfer.on('interaction', () => {
  wavesurfer.play()
})
</script>
```

## 基本用法

### 创建波形播放器

```javascript
import WaveSurfer from 'wavesurfer.js'

const wavesurfer = WaveSurfer.create({
  // 必需：指定容器
  container: '#waveform',
  
  // 可选：外观选项
  waveColor: '#4F4A85',      // 未播放部分的颜色
  progressColor: '#383351',  // 已播放部分的颜色
  cursorColor: '#333',        // 光标颜色
  barWidth: 2,                // 波形条宽度
  barGap: 1,                 // 波形条间距
  barRadius: 2,               // 波形条圆角
  height: 128,               // 波形高度
  normalize: true,            // 归一化波形振幅
  
  // 可选：加载选项
  url: '/audio.mp3',          // 音频文件路径
})
```

### 加载音频

```javascript
// 方式1：创建时指定 URL
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  url: '/audio.mp3'
})

// 方式2：使用 load 方法
wavesurfer.load('/audio.mp3')

// 方式3：加载 Blob 或 MediaElement
wavesurfer.load(blob)

// 方式4：加载预解析的波形数据（跳过解码）
wavesurfer.load(mediaElement, peaks)
```

### 事件监听

```javascript
// 音频解码完成，波形渲染完成
wavesurfer.on('ready', () => {
  console.log('波形已准备好')
  wavesurfer.play()  // 自动播放
})

// 播放/暂停时触发
wavesurfer.on('play', () => console.log('开始播放'))
wavesurfer.on('pause', () => console.log('暂停'))

// 播放完成
wavesurfer.on('finish', () => console.log('播放完成'))

// 当前播放位置更新
wavesurfer.on('timeupdate', (currentTime) => {
  console.log('当前时间:', currentTime)
})

// 音频被点击（交互）
wavesurfer.on('interaction', () => {
  if (wavesurfer.isPlaying()) {
    wavesurfer.pause()
  } else {
    wavesurfer.play()
  }
})

// 音频加载错误
wavesurfer.on('error', (err) => {
  console.error('错误:', err)
})
```

## 核心方法

### 播放控制

```javascript
// 播放
wavesurfer.play()

// 暂停
wavesurfer.pause()

// 播放/暂停切换
wavesurfer.playPause()

// 停止并重置到开始
wavesurfer.stop()

// 跳转到指定时间（秒）
wavesurfer.setTime(10)

// 跳转到百分比位置
wavesurfer.seekTo(0.5)  // 50% 位置
```

### 音量控制

```javascript
// 设置音量 (0-1)
wavesurfer.setVolume(0.5)

// 静音/取消静音切换
wavesurfer.toggleMute()

// 获取当前音量
const volume = wavesurfer.getVolume()
```

### 获取状态

```javascript
// 是否正在播放
const isPlaying = wavesurfer.isPlaying()

// 获取当前播放时间
const currentTime = wavesurfer.getCurrentTime()

// 获取音频时长
const duration = wavesurfer.getDuration()

// 获取播放进度 (0-1)
const progress = wavesurfer.getProgress()
```

### 销毁实例

```javascript
// 销毁实例，释放资源
wavesurfer.destroy()
```

## 选项详解

### 外观选项

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `container` | string/HTMLElement | - | 必需，波形容器 |
| `waveColor` | string | '#999' | 未播放波形颜色 |
| `progressColor` | '#555' | 已播放波形颜色 |
| `cursorColor` | '#333' | 光标颜色 |
| `cursorWidth` | 1 | 光标宽度(px) |
| `barWidth` | - | 波形条宽度 |
| `barGap` | - | 波形条间距 |
| `barRadius` | - | 波形条圆角 |
| `height` | 128 | 波形高度 |
| `minPxPerSec` | - | 每秒像素数 |
| `normalize` | false | 归一化振幅 |
| `fillParent` | true | 填满容器宽度 |
| `interact` | true | 允许点击交互 |
| `skipLength` | 2 | 跳过的秒数 |

### 播放选项

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `backend` | 'WebAudio'/'MediaElement' | 'WebAudio' | 音频后端 |
| `media` | - | - | 自定义媒体元素 |
| `mediaControls` | false | 显示原生控件 |
| `autoplay` | false | 自动播放 |
| `preload` | 'auto' | 预加载方式 |

### 音频选项

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `audioRate` | 1 | 播放速率 |
| `suppressNoise` | - | 降噪 |

## 常见用法示例

### 带播放按钮的播放器

```html
<div id="waveform"></div>
<button id="playBtn">播放</button>

<script type="module">
import WaveSurfer from 'wavesurfer.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  height: 80,
})

wavesurfer.load('/audio.mp3')

const playBtn = document.getElementById('playBtn')
playBtn.addEventListener('click', () => {
  wavesurfer.playPause()
})

wavesurfer.on('play', () => {
  playBtn.textContent = '暂停'
})

wavesurfer.on('pause', () => {
  playBtn.textContent = '播放'
})

wavesurfer.on('finish', () => {
  playBtn.textContent = '播放'
})
</script>
```

### 带进度条和时间的播放器

```html
<div id="waveform"></div>
<div id="time-display">
  <span id="current-time">0:00</span> / <span id="duration">0:00</span>
</div>
<input type="range" id="volume" min="0" max="1" step="0.1" value="1">

<script type="module">
import WaveSurfer from 'wavesurfer.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  height: 80,
})

wavesurfer.load('/audio.mp3')

// 格式化时间
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 更新时间显示
wavesurfer.on('timeupdate', (currentTime) => {
  document.getElementById('current-time').textContent = formatTime(currentTime)
})

wavesurfer.on('ready', (duration) => {
  document.getElementById('duration').textContent = formatTime(duration)
})

// 音量控制
document.getElementById('volume').addEventListener('input', (e) => {
  wavesurfer.setVolume(e.target.value)
})
</script>
```

### 响应式波形

```javascript
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  height: 128,
  minPxPerSec: 1,
  fillParent: true,
})

wavesurfer.load('/audio.mp3')

// 窗口大小改变时重新调整
window.addEventListener('resize', () => {
  wavesurfer.render()
})
```

## 插件使用

### registerPlugin 方法

用于注册插件扩展 wavesurfer.js 的功能。

```javascript
wavesurfer.registerPlugin(pluginInstance)
```

**参数：**
- `pluginInstance` - 通过 `PluginName.create(options)` 创建的插件实例

**返回值：**
- 返回注册的插件实例，用于监听事件和调用方法

**常用选项：**

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `plugins` | Plugin[] | - | 创建实例时同时注册多个插件 |

```javascript
// 方式1：分别注册
const wsRegions = wavesurfer.registerPlugin(Regions.create())
const wsTimeline = wavesurfer.registerPlugin(Timeline.create())

// 方式2：创建时同时注册多个插件
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  plugins: [
    Regions.create(),
    Timeline.create(),
  ],
})
```

### Regions - 区域标记

用于标记音频的特定区域（如歌词片段）：

```javascript
import WaveSurfer from 'wavesurfer.js'
import Regions from 'wavesurfer.js/dist/plugins/regions.esm.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
})

// 注册插件
const wsRegions = wavesurfer.registerPlugin(Regions.create())

// 添加区域
wsRegions.addRegion({
  start: 2,      // 开始时间（秒）
  end: 5,        // 结束时间（秒）
  color: 'rgba(255, 0, 0, 0.3)',  // 区域颜色
  drag: true,    // 允许拖动
  resize: true,  // 允许调整大小
})

// 监听区域点击
wsRegions.on('region-clicked', (region, e) => {
  e.stopPropagation()
  region.play()
})

// 监听区域更新
wsRegions.on('region-updated', (region) => {
  console.log('区域更新:', region.start, region.end)
})
```

### Timeline - 时间线

在波形下方显示时间刻度：

```javascript
import WaveSurfer from 'wavesurfer.js'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
})

const timeline = wavesurfer.registerPlugin(
  Timeline.create({
    container: '#timeline',  // 时间线容器
    height: 30,              // 高度
    timeInterval: 1,         // 时间间隔（秒）
    primaryLabelInterval: 5,  // 主标签间隔
    primaryLabelColor: '#000',
    secondaryLabelColor: '#999',
  })
)
```

### Minimap - 小地图

显示整个波形的小地图导航：

```javascript
import WaveSurfer from 'wavesurfer.js'
import Minimap from 'wavesurfer.js/dist/plugins/minimap.esm.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
})

const minimap = wavesurfer.registerPlugin(
  Minimap.create({
    container: '#minimap',
    height: 40,
    waveColor: '#4F4A85',
    progressColor: '#383351',
  })
)
```

### Hover - 悬停提示

鼠标悬停时显示时间位置：

```javascript
import WaveSurfer from 'wavesurfer.js'
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
})

wavesurfer.registerPlugin(
  Hover.create({
    scope: 1,  // 作用范围
    interpolate: true,  // 平滑插值
  })
)
```

### Envelope - 音量包络

图形化控制淡入淡出和音量：

```javascript
import WaveSurfer from 'wavesurfer.js'
import Envelope from 'wavesurfer.js/dist/plugins/envelope.esm.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
})

const envelope = wavesurfer.registerPlugin(
  Envelope.create({
    container: '#envelope',
    height: 50,
    defaultPoints: [
      [0, 1],    // 开始音量 100%
      [0.5, 1],  // 中间音量 100%
      [1, 0],    // 结束音量 0%
    ],
  })
)

// 获取音量包络
envelope.getPoints().then((points) => {
  console.log('音量点:', points)
})
```

### Record - 录音

从麦克风录制音频：

```javascript
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
})

const record = wavesurfer.registerPlugin(
  RecordPlugin.create({
    scrollingWaveform: true,  // 录音时波形滚动
  })
)

// 开始录音
document.getElementById('recordBtn').addEventListener('click', () => {
  record.startRecording()
})

// 停止录音
document.getElementById('stopBtn').addEventListener('click', () => {
  record.stopRecording()
})

// 录音结束，获取 Blob
record.on('record-end', (blob) => {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.controls = true
  document.body.appendChild(audio)
})
```

### RecordRTC - 实时波形录音

结合 RecordRTC 库实现实时录音并渲染波形图：

```bash
npm install recordrtc
```

**核心实现方式**

wavesurfer.js 的 RecordPlugin 提供了 `renderMicStream` 方法，可以直接将麦克风音频流实时渲染为波形：

```html
<div id="waveform"></div>
<button id="recordBtn">开始录音</button>
<button id="stopBtn" disabled>停止录音</button>

<script type="module">
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import RecordRTC from 'recordrtc'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: 'hsl(var(--foreground) / 0.5)',
  progressColor: 'hsl(var(--foreground))',
  height: 144,
  barWidth: 1,
  barGap: 2,
  barRadius: 1,
  cursorWidth: 0,
  barMinHeight: 10,
  barHeight: 2,
  normalize: true,
})

let recorder = null
let mediaStream = null
let micStreamHandle = null

// 开始录音
async function startRecording() {
  try {
    // 获取麦克风权限
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // 创建 WaveSurfer 实例后注册 RecordPlugin
    const record = wavesurfer.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,  // 波形滚动
      })
    )

    // 关键：renderMicStream 将麦克风音频实时渲染到波形
    micStreamHandle = record.renderMicStream(mediaStream)

    // 使用 RecordRTC 录制完整音频（用于最终保存）
    const { default: RecordRTC, StereoAudioRecorder } = await import('recordrtc')
    recorder = new RecordRTC(mediaStream, {
      recorderType: StereoAudioRecorder,
      mimeType: 'audio/wav',
      numberOfAudioChannels: 1,
      desiredSampRate: 44100,
    })
    recorder.startRecording()

    document.getElementById('recordBtn').disabled = true
    document.getElementById('stopBtn').disabled = false
  } catch (err) {
    console.error('麦克风访问失败:', err)
  }
}

// 停止录音
function stopRecording() {
  if (recorder) {
    recorder.stopRecording(() => {
      const blob = recorder.getBlob()
      // 处理录音 blob，可上传或播放
      console.log('录音完成:', blob)

      // 释放麦克风流
      if (micStreamHandle) {
        micStreamHandle.onDestroy()
        micStreamHandle = null
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }

      // 可选：加载录音到 wavesurfer 播放
      wavesurfer.load(URL.createObjectURL(blob))

      document.getElementById('recordBtn').disabled = false
      document.getElementById('stopBtn').disabled = true
    })
  }
}

document.getElementById('recordBtn').addEventListener('click', startRecording)
document.getElementById('stopBtn').addEventListener('click', stopRecording)
</script>
```

**React Hook 实现参考**

```jsx
import { useState, useRef, useCallback, useEffect } from 'react'
import RecordRTC from 'recordrtc'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'

function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<RecordRTC | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const micStreamRef = useRef<{ onDestroy: () => void } | null>(null)

  const destroyWaveSurfer = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.onDestroy()
      micStreamRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.destroy()
      wsRef.current = null
    }
  }, [])

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (recorderRef.current) recorderRef.current.destroy()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    destroyWaveSurfer()
  }, [destroyWaveSurfer])

  useEffect(() => {
    if (!isRecording || !containerRef.current || !streamRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'hsl(var(--foreground) / 0.5)',
      height: 144,
      barWidth: 1,
      barGap: 2,
      barRadius: 1,
      cursorWidth: 0,
      barMinHeight: 10,
      barHeight: 2,
      normalize: true,
    })

    wsRef.current = ws

    const record = ws.registerPlugin(RecordPlugin.create({
      scrollingWaveform: true,
    }))

    // 关键：实时渲染麦克风音频到波形
    const handle = record.renderMicStream(streamRef.current)
    micStreamRef.current = handle

    return () => destroyWaveSurfer()
  }, [isRecording, destroyWaveSurfer])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setAudioBlob(null)
      setElapsedTime(0)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const { default: RecordRTC, StereoAudioRecorder } = await import('recordrtc')
      const recorder = new RecordRTC(stream, {
        recorderType: StereoAudioRecorder,
        mimeType: 'audio/wav',
        numberOfAudioChannels: 1,
        desiredSampRate: 44100,
      })

      recorderRef.current = recorder
      recorder.startRecording()
      setIsRecording(true)

      // 计时器
      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000)
      }, 100)
    } catch (err) {
      cleanup()
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('麦克风访问被拒绝，请在浏览器设置中允许麦克风权限')
      } else {
        setError('麦克风访问失败，请检查设备')
      }
    }
  }, [cleanup])

  const stopRecording = useCallback((onBlob?: (blob: Blob) => void) => {
    const recorder = recorderRef.current
    if (!recorder) return

    recorder.stopRecording(() => {
      const blob = recorder.getBlob()
      setAudioBlob(blob)
      setIsRecording(false)
      cleanup()
      onBlob?.(blob)
    })
  }, [cleanup])

  return {
    isRecording,
    elapsedTime,
    audioBlob,
    containerRef,
    error,
    startRecording,
    stopRecording,
    resetRecording: cleanup,
  }
}

export default useAudioRecorder
```

**RecordRTC 常用配置项：**

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `recorderType` | StereoAudioRecorder | - | 立体声音频录制器 |
| `mimeType` | 'audio/wav' | - | 音频格式 |
| `numberOfAudioChannels` | 1 | - | 音频通道数 |
| `desiredSampRate` | 44100 | - | 采样率 |

**RecordPlugin 关键方法：**

| 方法 | 说明 |
|-----|------|
| `renderMicStream(stream)` | 将麦克风音频流实时渲染为波形，返回 `{ onDestroy }` 用于清理 |
| `scrollingWaveform` | 设为 `true` 可使波形实时滚动 |

## React 中使用

### 基础组件

```jsx
import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

function AudioPlayer({ audioUrl }) {
  const containerRef = useRef(null)
  const wavesurferRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4F4A85',
      progressColor: '#383351',
      height: 80,
    })

    wavesurfer.load(audioUrl)

    wavesurfer.on('ready', () => setIsReady(true))
    wavesurfer.on('play', () => setIsPlaying(true))
    wavesurfer.on('pause', () => setIsPlaying(false))
    wavesurfer.on('finish', () => setIsPlaying(false))

    wavesurferRef.current = wavesurfer

    return () => wavesurfer.destroy()
  }, [audioUrl])

  const togglePlay = () => {
    wavesurferRef.current?.playPause()
  }

  return (
    <div>
      <div ref={containerRef}></div>
      <button onClick={togglePlay} disabled={!isReady}>
        {isPlaying ? '暂停' : '播放'}
      </button>
    </div>
  )
}

export default AudioPlayer
```

## 高级用法

### 预解码波形数据

如果无法直接在浏览器中解码大文件，可以预先在服务端生成波形数据：

```bash
# 安装 audiowaveform 工具
brew install audiowaveform

# 生成 JSON 格式的波形数据
audiowaveform -i audio.mp3 -o peaks.json --pixels-per-second 20 --bits 8
```

然后在前端加载：

```javascript
fetch('/peaks.json')
  .then(response => response.json())
  .then(peaks => {
    wavesurfer.load(mediaElement, peaks.data)
  })
```

### 使用 MediaElement 后端

使用 HTML5 Audio 元素后端，可以边加载边播放：

```javascript
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  backend: 'MediaElement',
  waveColor: '#4F4A85',
  progressColor: '#383351',
})

wavesurfer.load('/audio.mp3')
```

### CORS 问题解决

加载跨域音频文件时，确保服务器设置了正确的 CORS 头：

```javascript
wavesurfer.load('https://example.com/audio.mp3', [], {
  credentials: 'same-origin',
  mode: 'cors',
})
```

## 注意事项

- **CORS** - 跨域音频需要服务器设置 CORS 头
- **解码** - 完整音频文件需要在浏览器中完整解码
- **iOS** - 需要用户交互才能播放音频
- **URL 长度** - 避免 URL 过长

## 参考链接

- 官方文档：https://wavesurfer.xyz
- GitHub：https://github.com/katspaugh/wavesurfer.js
- 示例：https://wavesurfer.xyz/examples