
react-dropzone 是一个简洁强大的 React 库，用于实现 HTML5 标准的拖拽文件上传功能。
## 1. 安装

```bash
npm install react-dropzone
# 或
yarn add react-dropzone
```

## 2. 核心概念

react-dropzone 提供了两种使用方式：

1. **useDropzone Hook** - 更灵活，推荐使用

2. **Dropzone 组件** - 使用 render props 模式

### 为什么要 getRootProps 和 getInputProps？

这是 react-dropzone 的核心设计，理解这个很重要：

- **getRootProps()** - 返回根元素的 props，用于处理拖拽事件（dragenter、dragover、dragleave、drop）

- **getInputProps()** - 返回隐藏的 input 元素的 props，用于处理文件选择（点击或键盘）

两者缺一不可：

- 没有 getRootProps，就无法监听拖拽事件

- 没有 getInputProps，点击区域就无法打开文件选择对话框

## 3. useDropzone Hook 详解

### 3.1 最简单的用法

```jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function MyDropzone() {
  // onDrop 是文件放下时的回调函数
  const onDrop = useCallback((acceptedFiles) => {
    console.log('接收到的文件:', acceptedFiles);
  }, []);

  // 调用 useDropzone，得到一系列属性和方法
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    // 用 {...getRootProps()} 把返回的 props 展开给 div
    <div {...getRootProps()}>
      {/* 用 {...getInputProps()} 把返回的 props 展开给 input */}
      <input {...getInputProps()} />
      
      {isDragActive ? (
        <p>松开鼠标放置文件...</p>
      ) : (
        <p>拖拽文件到这里，或点击选择文件</p>
      )}
    </div>
  );
}
```

### 3.2 useDropzone 接收的参数（配置选项）

useDropzone 接受一个配置对象作为参数，以下是所有可用的配置选项：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `onDrop` | `(acceptedFiles: File[], rejectedFiles: FileRejection[]) => void` | - | **最常用**。当文件被放下时触发，无论是接受还是拒绝 |
| `onDropAccepted` | `(acceptedFiles: File[]) => void` | - | 只在文件被接受时触发 |
| `onDropRejected` | `(rejectedFiles: FileRejection[]) => void` | - | 只在文件被拒绝时触发 |
| `accept` | `Record<string, string[]> \| string` | - | 限制接受的文件类型（MIME 类型或扩展名） |
| `multiple` | `boolean` | `true` | 是否允许多选多个文件 |
| `maxSize` | `number` | `Infinity` | 单个文件最大大小（字节） |
| `minSize` | `number` | `0` | 单个文件最小大小（字节） |
| `maxFiles` | `number` | `Infinity` | 最多接受的文件数量 |
| `disabled` | `boolean` | `false` | 是否禁用，禁用后无法选择文件 |
| `noClick` | `boolean` | `false` | 是否禁用点击打开文件对话框 |
| `noKeyboard` | `boolean` | `false` | 是否禁用键盘支持（Enter/Space 打开对话框） |
| `noDrag` | `boolean` | `false` | 是否禁用拖拽功能 |
| `preventDropOnDocument` | `boolean` | `true` | 是否阻止文档上的默认拖放行为 |
| `onFileDialogOpen` | `() => void` | - | 打开文件对话框时触发 |
| `onFileDialogCancel` | `() => void` | - | 关闭文件对话框时触发 |
| `validator` | `(file: File) => FileError[] \| null` | - | 自定义文件验证函数 |

### 3.3 useDropzone 返回的内容

useDropzone 返回一个对象，包含以下属性：

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `getRootProps` | `() => Props` | 获取根元素的属性，需要展开（...）给包裹拖拽区域的 div |
| `getInputProps` | `() => Props` | 获取 input 元素的属性，需要展开（...）给 input 元素 |
| `isDragActive` | `boolean` | 是否正在拖拽文件到区域上方（文件悬停）在区域上方 |
| `isDragAccept` | `boolean` | 当前拖拽的文件符合 accept 条件 |
| `isDragReject` | `boolean` | 当前拖拽的文件不符合 accept 条件 |
| `isFocused` | `boolean` | 拖拽区域是否获得焦点 |
| `acceptedFiles` | `File[]` | 被接受的文件列表 |
| `rejectedFiles` | `FileRejection[]` | 被拒绝的文件列表 |
| `rootRef` | `RefObject<HTMLElement>` | 根元素的 ref |
| `inputRef` | `RefObject<HTMLInputElement>` | input 的 ref |
| `open` | `() => void` | 手动打开文件对话框（可用于 noClick 时） |

## 4. accept 配置详解

### 4.1 什么是 accept？

accept 选项用于指定允许上传的文件类型，类似于 HTML input 元素的 accept 属性。

如果不传 accept，则接受任何类型的文件。

### 4.2 使用 MIME 类型（推荐）

```jsx
const { getRootProps, getInputProps } = useDropzone({
  accept: {
    'image/jpeg': ['.jpg', '.jpeg'],  // 接受 jpg/jpeg 图片
    'image/png': ['.png'],            // 接受 png 图片
    'image/gif': ['.gif'],            // 接受 gif 图片
    'application/pdf': ['.pdf']        // 接受 PDF
  }
});
```

### 4.3 使用通配符

```jsx
// 接受所有图片格式
const { getRootProps, getInputProps } = useDropzone({
  accept: 'image/*'
});
```

### 4.4 文件类型速查表

| 文件类型 | accept 值 |
|----------|-----------|
| JPG 图片 | `'image/jpeg'` 或 `'image/*'` |
| PNG 图片 | `'image/png'` |
| GIF 图片 | `'image/gif'` |
| WebP 图片 | `'image/webp'` |
| PDF 文档 | `'application/pdf'` |
| Word 文档 | `'application/vnd.ms-word'` |
| Excel | `'application/vnd.ms-excel'` |
| ZIP | `'application/zip'` |
| MP3 | `'audio/mpeg'` |
| MP4 | `'video/mp4'` |
| JSON | `'application/json'` |

## 5. onDrop 回调详解

### 5.1 onDrop 的参数

当文件被放下时，onDrop 回调会接收两个参数：

```jsx
const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
  // acceptedFiles - 符合条件被接受的文件 (File[])
  // rejectedFiles - 不符合条件被拒绝的文件 (FileRejection[])
}, []);
```

### 5.2 File 对象的属性

被接受的文件是标准的 File 对象：

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 文件名 |
| `size` | `number` | 文件大小（字节） |
| `type` | `string` | MIME 类型 |
| `lastModified` | `number` | 最后修改时间戳 |

### 5.3 FileRejection 对象

被拒绝的文件是 FileRejection 对象：

```jsx
{
  file: File,           // 被拒绝的文件
  errors: [            // 拒绝原因数组
    {
      code: 'file-too-large',    // 错误代码
      message: 'File is too large'  // 错误信息
    }
  ]
}
```

常见的错误代码：

| 错误代码 | 说明 |
|----------|------|
| `file-too-large` | 文件超过 maxSize |
| `file-too-small` | 文件小于 minSize |
| `too-many-files` | 文件数量超过 maxFiles |
| `file-invalid-type` | 文件类型不匹配 accept |

### 5.4 onDropAccepted 和 onDropRejected

这两个是 onDrop 的简化版本：

```jsx
const { getRootProps, getInputProps } = useDropzone({
  // 只在有文件被接受时触发
  onDropAccepted: (acceptedFiles) => {
    console.log('接受的图片:', acceptedFiles);
  },
  
  // 只在有文件被拒绝时触发
  onDropRejected: (rejectedFiles) => {
    console.log('被拒绝:', rejectedFiles);
  }
});
```

## 6. 文件大小和数量限制

### 6.1 maxSize - 单个文件最大大小

```jsx
const { getRootProps, getInputProps } = useDropzone({
  accept: { 'image/*': [] },
  maxSize: 1024 * 1024 * 5,  // 5MB = 5 * 1024 * 1024
  onDropRejected: (rejectedFiles) => {
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        console.log(`${file.name}: ${error.message}`);
      });
    });
  }
});
```

字节换算：
- 1 KB = 1024 字节
- 1 MB = 1024 * 1024 = 1,048,576 字节
- 1 GB = 1024 * 1024 * 1024 = 1,073,741,824 字节

### 6.2 minSize - 单个文件最小大小

```jsx
const { getRootProps, getInputProps } = useDropzone({
  minSize: 1024,  // 最小 1KB
});
```

### 6.3 maxFiles - 最大文件数量

```jsx
const { getRootProps, getInputProps } = useDropzone({
  maxFiles: 3,  // 最多3个文件
});
```

### 6.4 multiple - 是否允许多选

```jsx
const { getRootProps, getInputProps } = useDropzone({
  multiple: true,   // 允许选择多个文件（默认）
  // multiple: false,  // 每次只允许选择一个文件
});
```

## 7. 禁用功能

### 7.1 disabled - 完全禁用

```jsx
const { getRootProps, getInputProps } = useDropzone({
  disabled: true,  // 完全禁用，用户无法操作
});
```

### 7.2 noClick - 禁用点击

禁用点击后，需要手动调用 open() 来打开文件对话框：

```jsx
function Demo() {
  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,  // 点击不会打开文件对话框
  });

  return (
    <div>
      {/* 拖拽区域 */}
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>只能拖拽，不能点击</p>
      </div>
      
      {/* 手动打开 */}
      <button onClick={open}>选择文件</button>
    </div>
  );
}
```

### 7.3 noKeyboard - 禁用键盘

```jsx
const { getRootProps, getInputProps } = useDropzone({
  noKeyboard: true,  // 禁用键盘操作
});
```

## 8. 文件预览

### 8.1 为什么要做文件预览？

用户上传图片后，通常希望能预览将要上传的图片，这时需要用到 URL.createObjectURL()。

### 8.2 预览原理

浏览器提供了 URL.createObjectURL() 方法，可以将 File 对象转换成一个临时的 URL，用于在 img 标签中显示：

```jsx
const onDrop = useCallback((acceptedFiles) => {
  // 给每个文件添加 preview 属性
  const filesWithPreview = acceptedFiles.map(file => ({
    ...file,
    preview: URL.createObjectURL(file)  // 创建预览 URL
  }));
  setFiles(filesWithPreview);
}, []);
```

### 8.3 清理内存

使用完预览后，必须调用 URL.revokeObjectURL() 释放内存，否则会造成内存泄漏：

```jsx
useEffect(() => {
  return () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);  // 释放内存
      }
    });
  };
}, [files]);
```

## 9. 完整示例

### 9.1 基础示例（带图片预览）

```jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

function ImagePreview() {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    // 创建预览 URL
    const filesWithPreview = acceptedFiles.map(file => ({
      ...file,
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },     // 只接受图片
    maxSize: 5 * 1024 * 1024,      // 最大 5MB
    maxFiles: 5                    // 最多 5 个文件
  });

  // 清理内存
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div>
      {/* 拖拽区域 */}
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>松开鼠标放置文件...</p>
        ) : (
          <p>���拽图片到这里，或点击选择</p>
        )}
      </div>

      {/* 预览列表 */}
      <div style={styles.previewList}>
        {files.map(file => (
          <div key={file.name} style={styles.previewItem}>
            <img src={file.preview} alt="" style={styles.previewImage} />
            <p>{file.name}</p>
            <p>{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  dropzone: {
    border: '2px dashed #ccc',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  previewList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '20px'
  },
  previewItem: {
    textAlign: 'center'
  },
  previewImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover'
  }
};
```

### 9.2 带删除功能的示例

```jsx
import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [rejected, setRejected] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // 添加接受的图片
    if (acceptedFiles?.length) {
      const newFiles = acceptedFiles.map(file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }

    // 记录被拒绝的图片
    if (rejectedFiles?.length) {
      setRejected(prev => [...prev, ...rejectedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 2 * 1024 * 1024,
    maxFiles: 4
  });

  const removeFile = (name) => {
    setFiles(prev => {
      const file = prev.find(f => f.name === name);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.name !== name);
    });
  };

  const removeRejected = (name) => {
    setRejected(prev => prev.filter(f => f.file.name !== name));
  };

  // 清理
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

  return (
    <div>
      {/* 拖拽区域 */}
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? '松开' : '拖拽图片或点击选择'}
      </div>

      {/* 已接受的文件 */}
      {files.length > 0 && (
        <div>
          <h3>已接受的文件</h3>
          {files.map(file => (
            <div key={file.name} style={styles.fileItem}>
              <img src={file.preview} alt="" style={styles.thumb} />
              <span>{file.name}</span>
              <button onClick={() => removeFile(file.name)}>删除</button>
            </div>
          ))}
        </div>
      )}

      {/* 被拒绝的文件 */}
      {rejected.length > 0 && (
        <div>
          <h3>被拒绝的文件</h3>
          {rejected.map(({ file, errors }) => (
            <div key={file.name} style={styles.fileItem}>
              <span>{file.name}</span>
              <ul>
                {errors.map(err => (
                  <li key={err.code}>{err.message}</li>
                ))}
              </ul>
              <button onClick={() => removeRejected(file.name)}>移除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  dropzone: {
    padding: '20px',
    border: '2px dashed #ccc',
    textAlign: 'center',
    cursor: 'pointer'
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px'
  },
  thumb: {
    width: '50px',
    height: '50px',
    objectFit: 'cover'
  }
};
```

### 9.3 上传到服务器

```jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function UploadComponent() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    acceptedFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedFiles(prev => [...prev, ...result.files]);
        setProgress(100);
      }
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setUploading(false);
    }
  }, []);

  const onDropRejected = useCallback((rejectedFiles) => {
    console.log('被拒绝的文件:', rejectedFiles);
    alert(`有 ${rejectedFiles.length} 个文件不符合要求`);
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { 'image/*': [] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5
  });

  return (
    <div style={styles.container}>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? '松开鼠标上传文件...' : '拖拽图片到这里，或点击选择'}
      </div>

      {acceptedFiles.length > 0 && (
        <div style={styles.fileList}>
          <h4>待上传文件 ({acceptedFiles.length})</h4>
          <ul>
            {acceptedFiles.map(file => (
              <li key={file.name}>
                {file.name} - {(file.size / 1024).toFixed(1)} KB
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploading && (
        <div style={styles.progress}>
          <div style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px'
  },
  dropzone: {
    border: '2px dashed #ccc',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  fileList: {
    marginTop: '20px'
  },
  progress: {
    marginTop: '20px',
    height: '4px',
    backgroundColor: '#e9ecef'
  }
};
```

### 9.4 带激活状态样式

```jsx
function StyledDropzone() {
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop
  });

  const style = {
    ...styles.base,
    ...(isDragAccept ? styles.accept : {}),
    ...(isDragReject ? styles.reject : {}),
    ...(isDragActive ? styles.active : {})
  };

  return (
    <div {...getRootProps()} style={style}>
      <input {...getInputProps()} />
      <p>{isDragAccept ? '松开上传' : isDragReject ? '文件不符合要求' : isDragActive ? '松开鼠标' : '拖拽文件到这里'}</p>
    </div>
  );
}

const styles = {
  base: {
    border: '2px dashed #cccccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center'
  },
  active: {
    borderColor: '#007bff'
  },
  accept: {
    borderColor: '#28a745',
    backgroundColor: '#f0f8ff'
  },
  reject: {
    borderColor: '#dc3545',
    backgroundColor: '#fff0f0'
  }
};
```

## 10. Dropzone 组件（render props 模式）

除了 useDropzone hook，也可以使用 Dropzone 组件：

```jsx
import Dropzone from 'react-dropzone';

<Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
  {({ getRootProps, getInputProps, isDragActive }) => (
    <section>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? '松开' : '拖拽文件'}
      </div>
    </section>
  )}
</Dropzone>
```

组件版本的 render props 传递的属性与 hook 返回值相同。

## 11. TypeScript 类型

```typescript
import { useDropzone, FileRejection } from 'react-dropzone';

interface FileError {
  code: string;
  message: string;
}

interface FileRejection {
  file: File;
  errors: FileError[];
}

interface UploadProps {
  onUploadComplete?: (files: File[]) => void;
}

const MyDropzone: React.FC<UploadProps> = ({ onUploadComplete }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUploadComplete?.(acceptedFiles);
  }, [onUploadComplete]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
    </div>
  );
};
```

## 12. 常见问题

### 12.1 如何读取文件内容？

需要使用 FileReader API：

```jsx
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);  // 读取文本
    // reader.readAsDataURL(file);  // 读取图片
  });
};

const onDrop = async (acceptedFiles) => {
  for (const file of acceptedFiles) {
    const content = await readFileContent(file);
    console.log(file.name, content);
  }
};
```

### 12.2 如何手动打开文件对话框？

```jsx
const { getRootProps, getInputProps, open } = useDropzone({ noClick: true });

<button onClick={open}>选择文件</button>
```

### 12.3 如何自定义验证？

```jsx
const { getRootProps, getInputProps } = useDropzone({
  validator: (file) => {
    const errors = [];
    if (file.name.startsWith('temp_')) {
      errors.push({ code: 'invalid-name', message: '文件名不能以 temp_ 开头' });
    }
    return errors.length > 0 ? errors : null;
  }
});
```

### 12.4 如何上传文件���服���器？

```jsx
const uploadFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  return response.json();
};
```

## 13. API 参考速查表

### 配置选项速查

```typescript
useDropzone({
  // 文件处理
  onDrop: (accepted, rejected) => {},
  onDropAccepted: (files) => {},
  onDropRejected: (files) => {},

  // 文件类型
  accept: { 'image/*': ['.jpg', '.png'] },
  // 或 accept: 'image/*',

  // 大小和数量
  minSize: 0,
  maxSize: Infinity,
  maxFiles: Infinity,
  multiple: true,

  // 禁用控制
  disabled: false,
  noClick: false,
  noKeyboard: false,
  noDrag: false,

  // 其他
  preventDropOnDocument: true,
  onFileDialogOpen: () => {},
  onFileDialogCancel: () => {},
  validator: (file) => null
})
```

### 返回值速查

```jsx
const {
  getRootProps(),    // 传给拖拽区域的 div
  getInputProps(),  // 传给隐藏的 input
  isDragActive,    // 鼠标悬停上方
  isDragAccept,   // 可接受
  isDragReject,    // 会被拒绝
  isFocused,      // 获得焦点
  acceptedFiles,  // 被接受的文件
  rejectedFiles,  // 被拒绝的文件
  open,           // 手动打开对话框
  rootRef,         // 根元素 ref
  inputRef         // input ref
} = useDropzone(options);
```