<div align="center">

# 文桥 PostBridge

**用 Markdown 写作，让公众号排版更轻松。**

一份 Markdown，适配多个内容平台——从微信公众号开始。

**简体中文** · [English](README.en.md)

**[在线体验](https://postbridge-rho.vercel.app)**

`Markdown → 富文本 → 微信公众号`

</div>

![PostBridge 编辑与预览界面](docs/preview.png)

<p align="center"><sub>早期版本界面预览，当前界面以在线版本为准。</sub></p>

---

## 这是什么？

**文桥 PostBridge** 是一个在浏览器中运行的 Markdown 排版工具，适合公众号作者、技术博主，以及习惯用 Markdown 写文章的创作者。

把文章粘贴进编辑区，调整主题、强调色和字号，即可实时查看排版效果，再将富文本复制到微信公众号编辑器。PostBridge 将样式写入 HTML 元素的内联样式，帮助粘贴后的内容保留排版，减少重复调整标题、引用、表格和代码块的工作。

**在线地址：[https://postbridge-rho.vercel.app](https://postbridge-rho.vercel.app)**

当前版本专注于微信公众号排版与导出；更多内容平台的适配属于后续扩展方向。发布文章仍由你在公众号后台完成。

## 能做什么？

| 功能 | 说明 |
| --- | --- |
| 实时预览 | 左侧编辑 Markdown，右侧同步查看效果，附字符与词数统计 |
| 三种主题 | 清爽、杂志、技术，搭配自定义强调色与 15–18 px 字号 |
| 常用文章元素 | 标题、列表、引用、链接、图片、表格、行内代码和代码块 |
| 公众号富文本 | 点击「复制到公众号」，再粘贴到公众号正文编辑器 |
| 代码块展示 | 可复制的横向滚动代码，或在复制富文本时转成图片 |
| HTML 输出 | 复制带内联样式的 HTML，或下载完整 `.html` 文件 |
| 浏览器内处理 | Markdown 解析、排版和代码图片生成均在浏览器中完成，无需账号或后端服务 |

## 如何使用？

1. 打开 **[在线体验](https://postbridge-rho.vercel.app)**。
2. 在左侧粘贴或编写 Markdown，也可以点击顶部文档图标载入示例。
3. 选择主题、强调色、字号和代码模式，在右侧检查排版。
4. 点击 **「复制到公众号」**，粘贴到微信公众号后台的正文编辑器。
5. 在公众号后台检查最终效果，确认图片、链接等内容后发布。

需要 HTML 时，可直接使用顶部的 **「复制 HTML」** 或 **「导出」**。

## 使用说明

- **保存原稿：** 当前没有草稿自动保存功能，刷新页面会重新载入示例。请另行保存 Markdown 原稿。
- **代码图片：**「图片」模式仅用于「复制到公众号」；实时预览、复制 HTML 和导出 HTML 仍保留文本代码块。
- **粘贴效果：** 微信编辑器可能调整样式或处理图片，最终效果以粘贴后的预览为准。
- **剪贴板：** 在线版使用 HTTPS；本地可通过开发服务器访问。复制时可能需要浏览器授予剪贴板权限。
- **远程图片：** 文章转换在浏览器内完成；Markdown 中引用的远程图片仍会向相应图片地址发起请求。

## 本地开发

准备好 Node.js 和 npm，然后运行：

```bash
git clone https://github.com/ShimenTian/postbridge.git
cd postbridge
npm install
npm run dev
```

打开终端显示的本地地址，默认是 `http://127.0.0.1:5173`。

```bash
# 构建生产版本，输出到 dist/
npm run build

# 本地预览构建结果
npm run preview
```

项目是纯前端静态应用，可将 `dist/` 部署到 Vercel 等静态托管服务，无需配置后端或 API 密钥。

## 技术与结构

使用 **Vite + 原生 JavaScript + CSS** 构建，**Marked** 解析 Markdown，**DOMPurify** 清理生成的 HTML，**Lucide** 提供界面图标，**Canvas** 生成代码块图片。

```text
postbridge/
├── docs/preview.png   # 项目预览图
├── src/main.js        # 编辑、转换、主题与导出逻辑
├── src/styles.css     # 界面样式
├── index.html         # 页面入口
└── package.json       # 依赖与开发命令
```

问题反馈与功能建议欢迎提交到 **[GitHub Issues](https://github.com/ShimenTian/postbridge/issues)**。
