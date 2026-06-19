import { useState, useRef } from 'react'
import Markdown from 'react-markdown'
import './App.css'

const DEFAULT_MD = `# Hello Markdown

## 这是一个 Markdown 编辑器

支持的语法：

- **加粗文本**
- *斜体文本*
- ~~删除线~~

### 列表

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项 A
- 无序列表项 B

### 代码

行内代码: \`console.log('hello')\`

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### 引用

> 这是一段引用文字

### 链接

[访问 GitHub](https://github.com)

### 表格

| 名称 | 语言 | Stars |
|------|------|-------|
| React | JavaScript | 230k |
| Vue | JavaScript | 210k |
| Angular | TypeScript | 100k |
`

const extractHeadings = (md) => {
  const regex = /^(#{1,3})\s+(.+)$/gm
  const headings = []
  let match
  while ((match = regex.exec(md)) !== null) {
    const text = match[2]
    headings.push({
      level: match[1].length,
      text,
      id: text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, ''),
    })
  }
  return headings
}

const generateId = (children) => {
  const text = Array.isArray(children) ? children.join('') : String(children)
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
}

function buildTree(headings) {
  const tree = []
  let currentH1 = null

  for (const h of headings) {
    if (h.level === 1) {
      currentH1 = { ...h, children: [], level: 1 }
      tree.push(currentH1)
    } else if (h.level === 2) {
      if (currentH1) {
        currentH1.children.push({ ...h, children: [], level: 2 })
      } else {
        currentH1 = { text: '', id: '_root', level: 1, children: [{ ...h, children: [], level: 2 }] }
        tree.push(currentH1)
      }
    } else if (h.level === 3) {
      if (currentH1 && currentH1.children.length > 0) {
        const lastH2 = currentH1.children[currentH1.children.length - 1]
        lastH2.children.push({ ...h, level: 3 })
      }
    }
  }

  return tree
}

function TOC({ markdown }) {
  const headings = extractHeadings(markdown)
  const [expanded, setExpanded] = useState({})

  if (headings.length === 0) return null

  const tree = buildTree(headings)

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const scrollToHeading = (id) => {
    if (!id || id === '_root') return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const renderNode = (node) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expanded[node.id]

    return (
      <li key={node.id} className={`toc-item toc-level-${node.level}`}>
        <div className="toc-link-wrapper">
          {hasChildren && (
            <span
              className={`toc-arrow ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleExpand(node.id)}
            >
              ▸
            </span>
          )}
          {node.text && (
            <a
              className="toc-link"
              href={`#${node.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToHeading(node.id)
              }}
            >
              {node.text}
            </a>
          )}
        </div>
        {hasChildren && isExpanded && (
          <ul className="toc-sub-list">
            {node.children.map((child) => renderNode(child))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="toc">
      <div className="toc-title">目录</div>
      <ul className="toc-list">
        {tree.map((node) => renderNode(node))}
      </ul>
    </div>
  )
}

function Toolbar({ onInsert }) {
  const tools = [
    { label: 'H1', before: '# ', after: '' },
    { label: 'H2', before: '## ', after: '' },
    { label: 'B', before: '**', after: '**', className: 'bold' },
    { label: 'I', before: '*', after: '*', className: 'italic' },
    { label: 'S', before: '~~', after: '~~', className: 'strike' },
    { label: 'Code', before: '`', after: '`' },
    { label: 'Link', before: '[', after: '](url)' },
    { label: 'UL', before: '- ', after: '' },
    { label: 'OL', before: '1. ', after: '' },
    { label: 'Quote', before: '> ', after: '' },
  ]

  return (
    <div className="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.label}
          className={`toolbar-btn ${tool.className || ''}`}
          onClick={() => onInsert(tool.before, tool.after)}
          title={tool.label}
        >
          {tool.label}
        </button>
      ))}
    </div>
  )
}

function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MD)
  const [showEditor, setShowEditor] = useState(false)
  const [showTOC, setShowTOC] = useState(false)
  const fileInputRef = useRef(null)

  const handleOpen = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setMarkdown(event.target.result)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleInsert = (before, after) => {
    const textarea = document.getElementById('editor')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = markdown.substring(start, end)
    const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end)
    setMarkdown(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selected.length
    }, 0)
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Markdown Editor</h1>
        <div className="header-actions">
          <button
            className={`toggle-btn ${showTOC ? 'active' : ''}`}
            onClick={() => setShowTOC(!showTOC)}
          >
            TOC
          </button>
          <button
            className={`toggle-btn ${showEditor ? 'active' : ''}`}
            onClick={() => setShowEditor(!showEditor)}
          >
            Editor
          </button>
          <button className="open-btn" onClick={() => fileInputRef.current.click()}>
            Open .md
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={handleOpen}
            style={{ display: 'none' }}
          />
          <button className="download-btn" onClick={handleDownload}>
            Download .md
          </button>
        </div>
      </header>
      <div className="container">
        {showEditor && (
          <div className="editor-panel">
            <Toolbar onInsert={handleInsert} />
            <textarea
              id="editor"
              className="editor"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type your markdown here..."
            />
          </div>
        )}
        <div className="preview-panel">
          <div className="preview-header">Preview</div>
          {showTOC && <TOC markdown={markdown} />}
          <div className="preview">
            <Markdown
              components={{
                h1: ({ children }) => {
                  const id = generateId(children)
                  return <h1 id={id}>{children}</h1>
                },
                h2: ({ children }) => {
                  const id = generateId(children)
                  return <h2 id={id}>{children}</h2>
                },
                h3: ({ children }) => {
                  const id = generateId(children)
                  return <h3 id={id}>{children}</h3>
                },
              }}
            >
              {markdown}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
