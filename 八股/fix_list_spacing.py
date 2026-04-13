#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复无序列表项间距脚本
目标：确保每个无序列表项（以-开头）之间有且仅有一个空行
"""

import re
from pathlib import Path

def analyze_list_spacing(file_path):
    """分析无序列表项间距情况"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    list_items = []
    # 找到所有以-开头的行
    for i, line in enumerate(lines):
        if line.strip().startswith('-'):
            list_items.append((i, line.strip()))

    print(f"共找到 {len(list_items)} 个无序列表项")

    spacing_analysis = []
    for i in range(len(list_items) - 1):
        current_line = list_items[i][0]
        next_line = list_items[i + 1][0]

        # 计算两个列表项之间的空行数量
        empty_lines = 0
        for j in range(current_line + 1, next_line):
            if lines[j].strip() == '':
                empty_lines += 1
            elif not lines[j].startswith('    '):  # 不是缩进行
                break

        spacing_analysis.append({
            'current_line': current_line,
            'next_line': next_line,
            'empty_lines': empty_lines,
            'needs_fix': empty_lines != 1
        })

    return list_items, spacing_analysis

def fix_list_spacing(file_path, output_path):
    """修复无序列表项间距"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    list_items, spacing_analysis = analyze_list_spacing(file_path)

    new_lines = []
    i = 0
    n = len(lines)

    while i < n:
        current_line = lines[i]

        # 检查当前行是否是列表项
        if current_line.strip().startswith('-'):
            new_lines.append(current_line)
            i += 1

            # 跳过后面的空行（如果有）
            while i < n and lines[i].strip() == '' and not current_line.startswith('    '):
                i += 1

            # 检查下一行是否也是列表项
            if i < n and lines[i].strip().startswith('-'):
                # 添加一个空行
                new_lines.append('\n')
        else:
            new_lines.append(current_line)
            i += 1

    # 清理多余的空行（可能连续多个空行）
    final_lines = []
    for i, line in enumerate(new_lines):
        # 添加当前行
        final_lines.append(line)

        # 检查下一个是否也是列表项且当前行是列表项
        if (i + 1 < len(new_lines) and
            line.strip().startswith('-') and
            new_lines[i + 1].strip().startswith('-')):
            # 确保只有一个空行
            if i + 2 < len(new_lines) and new_lines[i + 2].strip() == '':
                # 删除多余的空行
                final_lines.append('\n')
        else:
            # 对于非列表项之间的空行，保持原样
            pass

    # 进一步清理：确保列表项之间只有一个空行
    cleaned_lines = []
    last_was_list = False
    for line in final_lines:
        current_is_list = line.strip().startswith('-')

        if current_is_list:
            if last_was_list:
                # 如果前一行是列表项，当前也是列表项，确保只有一个空行
                if cleaned_lines[-1].strip() == '':
                    # 如果前一行已经是空行，删除它
                    cleaned_lines.pop()
                cleaned_lines.append('\n')
            cleaned_lines.append(line)
            last_was_list = True
        else:
            cleaned_lines.append(line)
            last_was_list = False

    # 写入修复后的文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)

    print(f"修复完成，结果已保存到: {output_path}")
    return spacing_analysis

def main():
    input_file = Path("E:\\前端\\Note\\八股\\浏览器篇_高频八股文.md")
    output_file = Path("E:\\前端\\Note\\八股\\浏览器篇_高频八股文_修复.md")

    if not input_file.exists():
        print(f"错误：输入文件不存在: {input_file}")
        return

    print("开始分析无序列表项间距...")
    analysis = fix_list_spacing(input_file, output_file)

    print("\n分析结果：")
    for i, item in enumerate(analysis):
        status = "需要修复" if item['needs_fix'] else "正常"
        print(f"  {i+1}. 列表项 {item['current_line']+1} 到 {item['next_line']+1}: {item['empty_lines']} 个空行 ({status})")

    # 统计需要修复的数量
    need_fix_count = sum(1 for item in analysis if item['needs_fix'])
    print(f"\n总计需要修复: {need_fix_count} 处")

if __name__ == "__main__":
    main()