
# locale-codes 完全指南

locale-codes 是一个用于获取语言代码和国家代码的 npm 库，基于 ISO 639 和 ISO 3166 标准。当前版本：1.3.1

## 1. 安装

```bash
npm install locale-codes
# 或
yarn add locale-codes
```

## 2. 核心概念

locale-codes 提供了语言代码（Language Code）和国家代码（Country Code）的查询功能，基于国际标准：

- **ISO 639-1** - 两字母语言代码（如 `en`、`zh`）

- **ISO 639-2** - 三字母语言代码（如 `eng`、`zho`）

- **LCID** - Windows 语言标识符

### 支持查询的字段

每个语言条目包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 语言英文名称 |
| `local` | string \| null | 语言本地名称 |
| `location` | string \| null | 使用国家/地区 |
| `tag` | string | LCID 标签（如 `zh-cn`） |
| `lcid` | number | LCID 数字标识 |
| `iso639-2` | string | ISO 639-2 代码（三字母） |
| `iso639-1` | string \| null | ISO 639-1 代码（两字母） |

## 3. 基础用法

### 3.1 引入库

**ES6 方式（推荐）：**
```javascript
import * as locale from 'locale-codes';
```

**CommonJS 方式：**
```javascript
const locale = require('locale-codes');
```

### 3.2 locale.all - 获取所有语言

```javascript
const locale = require('locale-codes');

// 获取所有语言列表
console.log(locale.all);
// [
//   { name: 'Afar', local: 'Afaraf', location: null, tag: 'aa', lcid: 4096, 'iso639-2': 'aar', 'iso639-1': 'aa' },
//   { name: 'Abkhaz', local: 'аҧсшӀа', location: 'Georgia', tag: 'ab', lcid: 4096, 'iso639-2': 'abk', 'iso639-1': 'ab' },
//   ...
// ]
```

返回的是一个包含所有语言信息的数组，每个元素是一个语言对象。

## 4. 查询方法详解

### 4.1 locale.where(key, value) - 通用查询方法

这是最核心的查询方法，根据指定字段查找语言。

```javascript
// 语法
locale.where(key, value)
```

**参数说明：**
- `key` - 要查询的字段名（name、local、location、tag、lcid、iso639-2、iso639-1）
- `value` - 要查询的值

**返回值：** 返回第一个匹配的语言对象，如果没有找到返回 `undefined`

```javascript
const locale = require('locale-codes');

// 根据语言名称查询
locale.where('name', 'Chinese');
// { name: 'Chinese', local: '中文', location: null, tag: 'zh', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

// 根据本地名称查询
locale.where('local', '中文');

// 根据使用地区查询
locale.where('location', 'China');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

// 根据 tag 查询
locale.where('tag', 'zh-cn');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

// 根据 LCID 数字查询
locale.where('lcid', 2052);
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

// 根据 ISO 639-2 查询
locale.where('iso639-2', 'zho');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

// 根据 ISO 639-1 查询
locale.where('iso639-1', 'zh');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }
```

### 4.2 locale.getByName(name) - 根据语言名称查询

这是 `locale.where('name', name)` 的快捷方式。

```javascript
const locale = require('locale-codes');

// 查询中文
locale.getByName('Chinese');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

// 查询英文
locale.getByName('English');
// { name: 'English', local: 'English', location: null, tag: 'en', lcid: 9, 'iso639-2': 'eng', 'iso639-1': 'en' }
```

### 4.3 locale.getByTag(tag) - 根据 tag 查询

这是 `locale.where('tag', tag)` 的快捷方式。

```javascript
const locale = require('locale-codes');

// 根据 tag 查询（不区分大小写）
locale.getByTag('zh-cn');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

locale.getByTag('en-us');
// { name: 'English', local: 'English', location: 'United States', tag: 'en-US', lcid: 1033, 'iso639-2': 'eng', 'iso639-1': 'en' }

locale.getByTag('pt-br');
// { name: 'Portuguese', local: 'Português', location: 'Brazil', tag: 'pt-BR', lcid: 1046, 'iso639-2': 'por', 'iso639-1': 'pt' }
```

### 4.4 locale.getByISO6391(code) - 根据 ISO 639-1 查询

两字母语言代码查询，如 `zh`、`en`、`ja`。

```javascript
const locale = require('locale-codes');

locale.getByISO6391('zh');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

locale.getByISO6391('en');
// { name: 'English', local: 'English', location: null, tag: 'en', lcid: 9, 'iso639-2': 'eng', 'iso639-1': 'en' }

locale.getByISO6391('ja');
// { name: 'Japanese', local: '日本語', location: 'Japan', lcid: 1041, 'iso639-2': 'jpn', 'iso639-1': 'ja' }
```

### 4.5 locale.getByISO6392(code) - 根据 ISO 639-2 查询

三字母语言代码查询，如 `zho`、`eng`、`jpn`。

```javascript
const locale = require('locale-codes');

locale.getByISO6392('zho');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

locale.getByISO6392('eng');
// { name: 'English', local: 'English', location: null, tag: 'en', lcid: 9, 'iso639-2': 'eng', 'iso639-1': 'en' }

locale.getByISO6392('jpn');
// { name: 'Japanese', local: '日本語', location: 'Japan', lcid: 1041, 'iso639-2': 'jpn', 'iso639-1': 'ja' }
```

### 4.6 locale.getByLCID(lcid) - 根据 LCID 查询

Windows 语言标识符查询。

```javascript
const locale = require('locale-codes');

locale.getByLCID(2052);
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

locale.getByLCID(1033);
// { name: 'English', local: 'English', location: 'United States', tag: 'en-US', lcid: 1033, 'iso639-2': 'eng', 'iso639-1': 'en' }
```

### 4.7 locale.getByLocation(location) - 根据使用地区查询

```javascript
const locale = require('locale-codes');

// 根据使用国家/地区查询
locale.getByLocation('China');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

locale.getByLocation('United States');
// { name: 'English', local: 'English', location: 'United States', tag: 'en-US', lcid: 1033, 'iso639-2': 'eng', 'iso639-1': 'en' }
```

### 4.8 locale.getByNameLocal(local) - 根据本地名称查询

```javascript
const locale = require('locale-codes');

// 根据本地名称查询
locale.getByNameLocal('中文');
// { name: 'Chinese', local: '中文', location: 'China', tag: 'zh-CN', lcid: 2052, 'iso639-2': 'zho', 'iso639-1': 'zh' }

locale.getByNameLocal('English');
// { name: 'English', local: 'English', location: null, tag: 'en', lcid: 9, 'iso639-2': 'eng', 'iso639-1': 'en' }
```

## 5. 常见用法示例

### 5.1 从 locale tag 获取语言名称

```javascript
const locale = require('locale-codes');

function getLanguageName(tag) {
  const info = locale.getByTag(tag);
  return info ? info.name : null;
}

console.log(getLanguageName('zh-CN'));  // 'Chinese'
console.log(getLanguageName('en-US'));  // 'English'
console.log(getLanguageName('ja-JP'));  // 'Japanese'
```

### 5.2 从 locale tag 获取本地语言名称

```javascript
const locale = require('locale-codes');

function getLanguageLocalName(tag) {
  const info = locale.getByTag(tag);
  return info ? info.local : null;
}

console.log(getLanguageLocalName('zh-CN'));  // '中文'
console.log(getLanguageLocalName('en-US'));  // 'English'
console.log(getLanguageLocalName('ja-JP'));  // '日本語'
```

### 5.3 获取语言列表作为下拉选项

```javascript
const locale = require('locale-codes');

function getLanguageOptions() {
  return locale.all.map(item => ({
    value: item.tag,
    label: item.name,
    local: item.local
  }));
}

// 返回格式
// [
//   { value: 'aa', label: 'Afar', local: 'Afaraf' },
//   { value: 'ab', label: 'Abkhaz', local: 'аҧсшӀа' },
//   ...
// ]
```

### 5.4 验证语言代码是否有效

```javascript
const locale = require('locale-codes');

function isValidLanguageCode(code) {
  // 支持 tag、iso639-1、iso639-2
  return !!(locale.getByTag(code) || 
          locale.getByISO6391(code) || 
          locale.getByISO6392(code));
}

console.log(isValidLanguageCode('zh-CN'));  // true
console.log(isValidLanguageCode('zh'));      // true
console.log(isValidLanguageCode('zho'));    // true
console.log(isValidLanguageCode('xx'));     // false
```

### 5.5 根据 ISO 639-1 获取完整信息

```javascript
const locale = require('locale-codes');

function getLanguageInfo(iso6391) {
  const info = locale.getByISO6391(iso6391);
  if (!info) return null;
  
  return {
    name: info.name,
    localName: info.local,
    location: info.location,
    tag: info.tag,
    iso6392: info['iso639-2'],
    lcid: info.lcid
  };
}

console.log(getLanguageInfo('zh'));
// {
//   name: 'Chinese',
//   localName: '中文',
//   location: 'China',
//   tag: 'zh-CN',
//   iso6392: 'zho',
//   lcid: 2052
// }
```

### 5.6 兼容浏览器和 Node.js 环境

```javascript
// 兼容写法
let locale;
if (typeof window !== 'undefined') {
  // 浏览器
  locale = window.localeCodes;
} else {
  // Node.js
  locale = require('locale-codes');
}

// 使用
const chinese = locale.getByISO6391('zh');
```

## 6. TypeScript 用法

```typescript
import * as locale from 'locale-codes';
import { ILocale } from 'locale-codes';

// 获取所有语言
const allLocales: ILocale[] = locale.all;

// 选择第一个
const first: ILocale = locale.all[0];

// 根据 tag 查询
const result: ILocale | undefined = locale.getByTag('zh-CN');

// 根据 ISO 639-1 查询
const byISO: ILocale | undefined = locale.getByISO6391('zh');

// 使用 where 方法
const where: ILocale | undefined = locale.where('tag', 'zh-CN');

// ILocale 接口定义
interface ILocale {
  name: string;
  local: string | null;
  location: string | null;
  tag: string;
  lcid: number;
  'iso639-2': string;
  'iso639-1': string | null;
}
```

## 7. API 参考速查表

### 主要方法

```javascript
// 获取所有语言列表
locale.all

// 通用查询方法
locale.where(key, value)

// 快捷查询方法
locale.getByName(name)        // = where('name', name)
locale.getByNameLocal(local) // = where('local', local)
locale.getByLocation(location) // = where('location', location)
locale.getByTag(tag)       // = where('tag', tag)
locale.getByLCID(lcid)     // = where('lcid', lcid)
locale.getByISO6392(code)  // = where('iso639-2', code)
locale.getByISO6391(code)  // = where('iso639-1', code)
```

### 字段速查

| 字段 | 说明 | 示例 |
|------|------|------|
| `name` | 英文名称 | `'Chinese'` |
| `local` | 本地名称 | `'中文'` |
| `location` | 使用地区 | `'China'` |
| `tag` | LCID 标签 | `'zh-CN'` |
| `lcid` | LCID 数字 | `2052` |
| `iso639-2` | ISO 639-2 | `'zho'` |
| `iso639-1` | ISO 639-1 | `'zh'` |

## 8. 常见问题

### 8.1 locale.all 返回数量

```javascript
const locale = require('locale-codes');

console.log(locale.all.length);  // 大约 200+ 种语言
```

### 8.2 大小写问题

```javascript
const locale = require('locale-codes');

// tag 查询不区分大小写
locale.getByTag('zh-CN') === locale.getByTag('zh-cn') === locale.getByTag('ZH-CN')
// true
```

### 8.3 返回 undefined

```javascript
const locale = require('locale-codes');

// 如果找不到，返回 undefined
locale.getByTag('invalid-code');  // undefined
locale.getByISO6391('xx');        // undefined
```

### 8.4 处理返回 undefined 的情况

```javascript
const locale = require('locale-codes');

function safeGetByTag(tag) {
  return locale.getByTag(tag) || null;
}

console.log(safeGetByTag('zh-CN'));   // { name: 'Chinese', ... }
console.log(safeGetByTag('invalid'));   // null
```

### 8.5 国家/地区可能为 null

```javascript
const locale = require('locale-codes');

locale.all.forEach(item => {
  console.log(`${item.name}: ${item.location || '全球'}`);
});
```

## 9. 数据字段示例

### 部分语言数据示例

```javascript
const locale = require('locale-codes');

// 中文（简体）
locale.getByTag('zh-CN');
// {
//   name: 'Chinese',
//   local: '中文',
//   location: 'China',
//   tag: 'zh-CN',
//   lcid: 2052,
//   'iso639-2': 'zho',
//   'iso639-1': 'zh'
// }

// 中文（繁体）
locale.getByTag('zh-TW');
// {
//   name: 'Chinese',
//   local: '中文',
//   location: 'Taiwan',
//   tag: 'zh-TW',
//   lcid: 1028,
//   'iso639-2': 'zho',
//   'iso639-1': 'zh'
// }

// 英文（美国）
locale.getByTag('en-US');
// {
//   name: 'English',
//   local: 'English',
//   location: 'United States',
//   tag: 'en-US',
//   lcid: 1033,
//   'iso639-2': 'eng',
//   'iso639-1': 'en'
// }

// 日语
locale.getByTag('ja-JP');
// {
//   name: 'Japanese',
//   local: '日本語',
//   location: 'Japan',
//   tag: 'ja-JP',
//   lcid: 1041,
//   'iso639-2': 'jpn',
//   'iso639-1': 'ja'
// }

// 葡萄牙语（巴西）
locale.getByTag('pt-BR');
// {
//   name: 'Portuguese',
//   local: 'Português',
//   location: 'Brazil',
//   tag: 'pt-BR',
//   lcid: 1046,
//   'iso639-2': 'por',
//   'iso639-1': 'pt'
// }
```

## 10. 与其他库配合

### 10.1 用于 i18n 国际化

```javascript
const locale = require('locale-codes');

function setupI18n(userLocale) {
  const langInfo = locale.getByTag(userLocale);
  if (!langInfo) {
    console.warn(`Unknown locale: ${userLocale}, fallback to en`);
    return {
      name: 'English',
      local: 'English',
      tag: 'en'
    };
  }
  return {
    name: langInfo.name,
    local: langInfo.local,
    tag: langInfo.tag,
    iso6391: langInfo['iso639-1']
  };
}
```

### 10.2 用于语言选择器组件

```javascript
const locale = require('locale-codes');

function LanguageSelector() {
  const languages = locale.all.map(item => ({
    value: item.tag,
    label: `${item.name} (${item.local || item.name})`,
    iso6391: item['iso639-1']
  }));
  
  return (
    <select>
      {languages.map(lang => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
```