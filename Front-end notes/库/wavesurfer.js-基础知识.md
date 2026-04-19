# wavesurfer.js 基础知识

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
import Record from 'wavesurfer.js/dist/plugins/record.esm.js'

const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
})

const record = wavesurfer.registerPlugin(Record.create())

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