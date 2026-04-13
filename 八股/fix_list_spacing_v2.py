#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复无序列表项间距脚本 v2
目标：确保每个无序列表项（以-开头）之间有且仅有一个空行
"""

import re
from pathlib import Path

def fix_list_spacing_precise(file_path, output_path):
    """精确修复无序列表项间距"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]

        # 添加当前行
        new_lines.append(line)
        i += 1

        # 检查当前行是否是无序列表项
        if line.strip().startswith('-'):
            # 查找下一个列表项的位置
            next_list_item_pos = None
            j = i
            while j < n:
                if lines[j].strip().startswith('-') and j > i:
                    next_list_item_pos = j
                    break
                j += 1

            # 如果找到下一个列表项，确保它们之间只有一个空行
            if next_list_item_pos is not None:
                # 删除所有空行直到下一个列表项
                while i < next_list_item_pos:
                    if lines[i].strip() == '':
                        # 跳过空行
                        i += 1
                    else:
                        # 遇到非空行，如果上一个列表项后面没有空行，添加一个
                        # 但在这个版本中，我们只处理列表项之间的空行
                        i += 1

                # 添加一个空行
                new_lines.append('\n')

    # 第二次清理：确保列表项之间确实只有一个空行
    final_lines = []
    i = 0
    while i < len(new_lines):
        line = new_lines[i]
        final_lines.append(line)

        # 如果当前行是列表项，检查下一行是否也是列表项
        if line.strip().startswith('-') and i + 1 < len(new_lines):
            next_line = new_lines[i + 1]
            if next_line.strip().startswith('-'):
                # 删除多余的空行
                j = i + 1
                while j < len(new_lines) and new_lines[j].strip() == '':
                    j += 1
                # 保留一个空行
                if j > i + 1:
                    final_lines.append('\n')
                i = j
            else:
                i += 1
        else:
            i += 1

    # 写入修复后的文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(final_lines)

    print(f"修复完成，结果已保存到: {output_path}")
    return final_lines

def main():
    input_file = Path("E:\\前端\\Note\\八股\\浏览器篇_高频八股文.md")
    output_file = Path("E:\\前端\\Note\\八股\\浏览器篇_高频八股文_修复_v2.md")

    if not input_file.exists():
        print(f"错误：输入文件不存在: {input_file}")
        return

    print("开始精确修复无序列表项间距...")
    result = fix_list_spacing_precise(input_file, output_file)

if __name__ == "__main__":
    main()