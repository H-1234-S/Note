#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用正则表达式精确修复无序列表项间距
目标：确保每个无序列表项（以-开头）之间有且仅有一个空行
"""

import re
from pathlib import Path

def fix_list_spacing_with_regex(file_path, output_path):
    """使用正则表达式修复无序列表项间距"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 定义正则表达式匹配无序列表项（包括缩进的情况）
    # 匹配 - 开头的行，前面可以有4个空格的缩进
    pattern = r'(    )?-\s*(.*?)(?=(?:\n\s*-\s*(.*))?(?=\n\s*(?!\s*-)[^\s]))'

    # 先找到所有的无序列表项
    list_items = re.findall(r'(    )?-\s*(.*?)\n', content)

    print(f"共找到 {len(list_items)} 个无序列表项")

    # 替换方法：将连续的列表项之间插入一个空行
    # 使用更简单的方法：先分割，然后重新组合

    lines = content.split('\n')
    new_lines = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]

        # 如果是列表项，添加后检查下一个
        if line.strip().startswith('-'):
            new_lines.append(line)
            i += 1

            # 跳过后续的空行（如果有的话）
            while i < n and lines[i].strip() == '':
                # 如果下一个也是列表项，跳过这个空行，但保留一个
                if i + 1 < n and lines[i + 1].strip().startswith('-'):
                    # 如果当前已经是空行，跳过它
                    i += 1
                    # 在下一个列表项前添加一个空行
                    if i < n and lines[i].strip().startswith('-'):
                        new_lines.append('')
                else:
                    # 如果下一个不是列表项，保持空行
                    new_lines.append(lines[i])
                    i += 1
        else:
            new_lines.append(line)
            i += 1

    # 第二遍清理：确保列表项之间确实只有一个空行
    final_lines = []
    skip_empty = False

    for i, line in enumerate(new_lines):
        final_lines.append(line)

        # 如果当前行是列表项，检查下一个是否也是列表项
        if line.strip().startswith('-') and i + 1 < len(new_lines):
            next_line = new_lines[i + 1]
            if next_line.strip().startswith('-'):
                # 确保只有一个空行
                # 检查再下一个是否是空行
                if i + 2 < len(new_lines) and new_lines[i + 2].strip() == '':
                    # 跳过这个多余的空行
                    continue
                else:
                    # 添加一个空行
                    if i + 2 < len(new_lines) and not new_lines[i + 2].strip().startswith('-'):
                        final_lines.append('')

    # 更精确的方法：遍历所有行，确保列表项之间只有一个空行
    cleaned_lines = []
    last_was_list = False

    for line in new_lines:
        current_is_list = line.strip().startswith('-')

        if current_is_list:
            if last_was_list:
                # 前一个也是列表项，确保只有一个空行
                # 如果最后一个元素已经是空行，先删除它
                if cleaned_lines and cleaned_lines[-1].strip() == '':
                    cleaned_lines.pop()
                # 添加一个空行
                cleaned_lines.append('')
            cleaned_lines.append(line)
            last_was_list = True
        else:
            cleaned_lines.append(line)
            last_was_list = False

    # 写入修复后的文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)

    print(f"修复完成，结果已保存到: {output_path}")
    return cleaned_lines

def main():
    input_file = Path("E:\\前端\\Note\\八股\\浏览器篇_高频八股文.md")
    output_file = Path("E:\\前端\Note\八股\浏览器篇_高频八股文_修复_final.md")

    if not input_file.exists():
        print(f"错误：输入文件不存在: {input_file}")
        return

    print("使用正则表达式修复无序列表项间距...")
    result = fix_list_spacing_with_regex(input_file, output_file)

if __name__ == "__main__":
    main()