# Markdown Editor

一个基于 React + Vite 的现代 Markdown 编辑器，支持实时预览、目录导航和文件导入导出。

## 功能

- **实时预览** - 左侧编辑，右侧即时渲染
- **目录导航** - 自动提取 H1-H3 标题，支持展开/折叠，点击跳转
- **工具栏** - 快捷插入标题、加粗、斜体、代码、链接、列表、引用
- **文件操作** - 导入本地 .md 文件，导出下载
- **清新主题** - 绿白配色，简洁现代

## 支持的 Markdown 语法

- 标题（H1-H3）
- **加粗**、*斜体*、~~删除线~~
- 行内代码和代码块
- 链接
- 有序/无序列表
- 引用
- 表格
- 分割线

## 技术栈

- **React 19** - UI 框架
- **Vite** - 构建工具
- **react-markdown** - Markdown 渲染

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问
http://localhost:5173
```

## 项目结构

```
my-md-editor/
├── src/
│   ├── App.jsx          # 主组件
│   ├── App.css          # 样式
│   ├── index.css        # 全局样式
│   └── main.jsx         # 入口
├── package.json
└── README.md
```

## 使用方法

1. 点击 **Editor** 按钮显示编辑器
2. 在左侧输入 Markdown 内容
3. 右侧实时预览渲染结果
4. 点击 **TOC** 按钮显示目录
5. 点击目录项跳转到对应标题
6. 点击 **Open .md** 导入本地文件
7. 点击 **Download .md** 导出文件

## License

MIT
