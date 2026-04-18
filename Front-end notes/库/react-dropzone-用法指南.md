react-dropzone 是一个简洁强大的 React 库，用于实现 HTML5 标准的拖拽文件上传功能。

## 1. 安装

```bash
npm install react-dropzone
# 或
yarn add react-dropzone
```

## 2. 基础用法

### 2.1 使用 useDropzone Hook

```jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function MyDropzone() {
  const onDrop = useCallback((acceptedFiles) => {
    console.log('接收到的文件:', acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>松开鼠标放置文件...</p> :
          <p>拖拽文件到这里，或点击选择文件</p>
      }
    </div>
  );
}
```

### 2.2 使用 Dropzone 组件

```jsx
import React from 'react';
import Dropzone from 'react-dropzone';

<Dropzone onDrop={(acceptedFiles) => console.log(acceptedFiles)}>
  {({ getRootProps, getInputProps, isDragActive }) => (
    <section>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>松开鼠标放置文件...</p> :
            <p>拖拽文件到这里，或点击选择文件</p>
        }
      </div>
    </section>
  )}
</Dropzone>
```

## 3. 核心 API

### 3.1 Hook 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `getRootProps` | function | 获取根元素属性（用于拖拽区域） |
| `getInputProps` | function | 获取输入框属性 |
| `isDragActive` | boolean | 是否正在拖拽文件到区域上方 |
| `isDragAccept` | boolean | 文件是否被接受（拖拽释放时） |
| `isDragReject` | boolean | 文件是否被拒绝 |
| `acceptedFiles` | File[] | 被接受的文件列表 |
| `rejectedFiles` | FileRejection[] | 被拒绝的文件列表 |

### 3.2 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onDrop` | function | - | 文件放下时的回调 |
| `onDropAccepted` | function | - | 文件被接受时的回调 |
| `onDropRejected` | function | - | 文件被拒绝时的回调 |
| `accept` | object/string | - | 接受的文件类型 |
| `minSize` | number | 0 | 最小文件大小（字节） |
| `maxSize` | number | Infinity | 最大文件大小（字节） |
| `maxFiles` | number | Infinity | 最大文件数量 |
| `disabled` | boolean | false | 是否禁用 |

## 4. 文件类型限制

### 4.1 使用 MIME 类型

```jsx
const { getRootProps, getInputProps } = useDropzone({
  accept: {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf']
  }
});
```

### 4.2 使用字符串简写

```jsx
const { getRootProps, getInputProps } = useDropzone({
  accept: 'image/*'  // 接受所有图片格式
});
```

```jsx
const { getRootProps, getInputProps } = useDropzone({
  accept: {
    'text/csv': ['.csv']
  }
});
```

## 5. 文件大小和数量限制

```jsx
const { getRootProps, getInputProps } = useDropzone({
  accept: { 'image/*': [] },
  maxSize: 1024 * 1024 * 5,    // 5MB
  maxFiles: 3                // 最多3个文件
});
```

## 6. 处理被拒绝的文件

```jsx
function FileUpload() {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    console.log('接受的文件:', acceptedFiles);
    console.log('拒绝的文件:', rejectedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 1024 * 1024 * 2
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>拖拽图片文件（最大2MB）</p>
    </div>
  );
}
```

## 7. 文件预览

### 7.1 图片预览

```jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

function ImagePreview() {
  const [previews, setPreviews] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setPreviews(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  return (
    <div>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        <p>点击或拖拽图片</p>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {previews.map(file => (
          <img
            key={file.name}
            src={file.preview}
            alt={file.name}
            style={styles.preview}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  dropzone: {
    border: '2px dashed #cccccc',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  preview: {
    width: '100px',
    height: '100px',
    objectFit: 'cover'
  }
};
```

### 7.2 清理预览

```jsx
useEffect(() => {
  return () => {
    previews.forEach(file => URL.revokeObjectURL(file.preview));
  };
}, [previews]);
```

## 8. 移除文件

```jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function FileList() {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        <p>拖拽文件到这里</p>
      </div>
      <ul>
        {files.map(file => (
          <li key={file.name}>
            {file.name} - {file.size} bytes
            <button onClick={() => removeFile(file.name)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  dropzone: {
    border: '2px dashed #007bff',
    padding: '20px',
    textAlign: 'center'
  }
};
```

## 9. 使用 Ref

```jsx
function WithRef() {
  const dropzoneRef = useRef(null);

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true
  });

  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>拖拽文件到这里</p>
      </div>
      <button onClick={open}>打开文件对话框</button>
    </div>
  );
}
```

## 10. 完整示例

### 10.1 带有上传功能的完整示例

```jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function UploadComponent() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setUploadProgress(0);

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
        setUploadProgress(100);
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
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxSize: 5 * 1024 * 1024,  // 5MB
    maxFiles: 5
  });

  return (
    <div style={styles.container}>
      <div {...getRootProps()} style={{
        ...styles.dropzone,
        borderColor: isDragActive ? '#28a745' : '#dee2e6'
      }}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p style={styles.activeText}>松开鼠标上传文件...</p> :
            <p style={styles.text}>
              拖拽图片到这里，或点击选择
              <br />
              <small>支持: jpg, png, gif | 最大5MB | 最多5个文件</small>
            </p>
        }
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

      {uploadedFiles.length > 0 && (
        <div style={styles.fileList}>
          <h4>已上传文件 ({uploadedFiles.length})</h4>
          <ul>
            {uploadedFiles.map(file => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {uploading && (
        <div style={styles.progress}>
          <div style={{ width: `${uploadProgress}%` }} />
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
    border: '2px dashed',
    borderRadius: '8px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    transition: 'border-color 0.2s'
  },
  text: {
    color: '#6c757d'
  },
  activeText: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  fileList: {
    marginTop: '20px'
  },
  progress: {
    marginTop: '20px',
    height: '4px',
    backgroundColor: '#e9ecef',
    borderRadius: '2px',
    overflow: 'hidden'
  }
};
```

### 10.2 带预览的拖拽上传组件

```jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

function ImageUploader() {
  const [files, setFiles] = useState([]);
  const [rejected, setRejected] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles?.length) {
      setFiles(prev => [
        ...prev,
        ...acceptedFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        }))
      ]);
    }

    if (rejectedFiles?.length) {
      setRejected(prev => [...prev, ...rejectedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 1024 * 1024 * 2,
    maxFiles: 4
  });

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  const removeRejected = (name) => {
    setRejected(prev => prev.filter(f => f.file.name !== name));
  };

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <form>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>松开鼠标放置文件...</p>
        ) : (
          <p>拖拽图片到这里，或点击选择</p>
        )}
      </div>

      {files.length > 0 && (
        <div>
          <h3>已接受的文件</h3>
          <div style={styles.grid}>
            {files.map(file => (
              <div key={file.name} style={styles.previewItem}>
                <img
                  src={file.preview}
                  alt={file.name}
                  style={styles.previewImage}
                />
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  style={styles.removeBtn}
                >
                  删除
                </button>
                <p>{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div>
          <h3>被拒绝的文件</h3>
          <ul>
            {rejected.map(({ file, errors }) => (
              <li key={file.name}>
                <p>{file.name}</p>
                <ul>
                  {errors.map(err => (
                    <li key={err.code}>{err.message}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => removeRejected(file.name)}
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

const styles = {
  dropzone: {
    border: '2px dashed #cccccc',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px'
  },
  previewItem: {
    position: 'relative'
  },
  previewImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover'
  },
  removeBtn: {
    position: 'absolute',
    top: '5px',
    right: '5px'
  }
};
```

## 11. TypeScript 类型

```typescript
import { useDropzone, FileRejection } from 'react-dropzone';

interface UploadProps {
  onUploadComplete?: (files: File[]) => void;
}

const MyDropzone: React.FC<UploadProps> = ({ onUploadComplete }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUploadComplete?.(acceptedFiles);
  }, [onUploadComplete]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
    </div>
  );
};
```

## 12. 自定义样式示例

### 12.1 激活状态样式

```jsx
function StyledDropzone() {
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({ onDrop });

  const style = {
    ...styles.base,
    ...(isDragAccept ? styles.accept : {}),
    ...(isDragReject ? styles.reject : {}),
    ...(isDragActive ? styles.active : {})
  };

  return (
    <div {...getRootProps()} style={style}>
      <input {...getInputProps()} />
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

## 13. 常见问题

### 13.1 获取文件内容

需要使用 FileReader API：

```jsx
const onDrop = useCallback((acceptedFiles) => {
  acceptedFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      console.log('文件内容:', content);
    };
    reader.readAsDataURL(file);
  });
}, []);
```

### 13.2 上传文件到服务器

```jsx
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  return response.json();
};
```

### 13.3 禁用点击打开文件对话框

```jsx
const { getRootProps, getInputProps } = useDropzone({
  noClick: true
});
```

### 13.4 禁用键盘支持

```jsx
const { getRootProps, getInputProps } = useDropzone({
  noKeyboard: true
});
```

## 14. API 参考

### 14.1 useDropzone Hook

```typescript
const result = useDropzone(options?: DropzoneOptions)
```

### 14.2 DropzoneOptions

```typescript
interface DropzoneOptions {
  accept?: Record<string, string[]> | string;
  multiple?: boolean;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  preventDropOnDocument?: boolean;
  noClick?: boolean;
  noKeyboard?: boolean;
  noDrag?: boolean;
  noDragEventsBubbling?: boolean;
  onFileDialogOpen?: () => void;
  onFileDialogCancel?: () => void;
  onDrop?: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
  onDropAccepted?: (acceptedFiles: File[]) => void;
  onDropRejected?: (rejectedFiles: FileRejection[]) => void;
  validator?: (file: File) => FileError[] | null;
  getFilesFromEvent?: (event: DropEvent) => Promise<File[]>;
  useFsAccessApi?: boolean;
}
```

### 14.3 FileRejection

```typescript
interface FileRejection {
  file: File;
  errors: FileError[];
}

interface FileError {
  code: string;
  message: string;
}
```