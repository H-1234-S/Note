import re

def adjust_list_spacing(content):
    # 匹配无序列表项（以-或*开头）
    pattern = re.compile(r'(^- .+?$)', re.MULTILINE)

    # 按行分割
    lines = content.split('\n')
    new_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # 如果是列表项
        if line.strip().startswith('- ') or line.strip().startswith('* '):
            # 添加当前行
            new_lines.append(line)
            i += 1

            # 检查下一行是否也是列表项
            while i < len(lines) and (lines[i].strip().startswith('- ') or lines[i].strip().startswith('* ')):
                # 如果下一行是列表项，确保只有一行空行
                if i > 0 and new_lines[-1].strip() and lines[i].strip():
                    # 如果上一行不是空行，添加一个空行
                    if new_lines[-1].strip():
                        new_lines.append('')

                # 添加列表项
                new_lines.append(lines[i])
                i += 1

                # 跳过空行
                while i < len(lines) and not lines[i].strip():
                    i += 1
        else:
            # 如果不是列表项，直接添加
            new_lines.append(line)
            i += 1

    return '\n'.join(new_lines)

# 读取文件
with open('E:/前端/Note/八股/浏览器篇_高频八股文.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 调整列表间距
new_content = adjust_list_spacing(content)

# 写回文件
with open('E:/前端/Note/八股/浏览器篇_高频八股文.md', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("列表间距调整完成")