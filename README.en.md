<div align="center">

# PostBridge 文桥

**Write in Markdown. Publish beautifully on WeChat.**

One Markdown source, formatted for publishing—starting with WeChat Official Accounts.

[简体中文](README.md) · **English**

**[Live Demo](https://postbridge-rho.vercel.app)**

`Markdown → Rich Text → WeChat`

</div>

![PostBridge editor and preview](docs/preview.png)

<p align="center"><sub>Early interface preview; see the live app for the current interface.</sub></p>

---

## What is PostBridge?

**PostBridge (文桥)** is a browser-based Markdown formatting tool for WeChat Official Account authors, technical bloggers, and anyone who writes articles in Markdown.

Paste your article, choose a theme, adjust the accent color and font size, and see the result instantly. Copy the formatted rich text into the WeChat article editor when you are ready. PostBridge applies inline CSS to the generated HTML to help preserve formatting when pasted, reducing manual work on headings, quotes, tables, and code blocks.

**Live app: [https://postbridge-rho.vercel.app](https://postbridge-rho.vercel.app)**

The current version focuses on formatting and export for WeChat Official Accounts. Support for additional publishing platforms is a future direction. You complete publication in the WeChat dashboard.

## Features

| Feature | What it does |
| --- | --- |
| Live preview | Edit Markdown and preview the result side by side, with character and word counts |
| Three themes | Clean, Editorial, and Tech, with a custom accent color and 15–18 px font sizes |
| Article elements | Headings, lists, quotes, links, images, tables, inline code, and code blocks |
| WeChat rich text | Copy formatted content and paste it into the WeChat article editor |
| Code block modes | Keep horizontally scrollable, copyable code, or convert it to images when copying rich text |
| HTML output | Copy HTML with inline styles or download a complete `.html` document |
| In-browser processing | Markdown conversion, styling, and code image generation run in your browser; no account or backend required |

## How to use

1. Open the **[live app](https://postbridge-rho.vercel.app)**. The current interface is in Chinese.
2. Paste or write Markdown in the left pane. The document icon in the toolbar loads a sample article.
3. Choose a theme, accent color, font size, and code mode, then review the right pane.
4. Click **复制到公众号 (Copy to WeChat)** and paste into the WeChat Official Account article editor.
5. Check the final formatting, images, and links in WeChat before publishing.

Use **复制 HTML (Copy HTML)** or **导出 (Export)** in the toolbar when you need HTML output.

## Usage notes

- **Keep your source:** Drafts are not saved automatically. Reloading the page restores the sample article, so save your Markdown separately.
- **Code images:** Image mode applies only to Copy to WeChat. The live preview, Copy HTML, and HTML export retain text-based code blocks.
- **Paste compatibility:** WeChat may modify styles or process images. Review the pasted result in its editor.
- **Clipboard access:** The live app uses HTTPS; local development runs through a development server. Your browser may request clipboard permission.
- **Remote images:** Article conversion runs locally in your browser, but remote images referenced in Markdown still make requests to their source URLs.

## Local development

With Node.js and npm installed:

```bash
git clone https://github.com/ShimenTian/postbridge.git
cd postbridge
npm install
npm run dev
```

Open the local URL printed in your terminal, typically `http://127.0.0.1:5173`.

```bash
# Build for production into dist/
npm run build

# Preview the production build locally
npm run preview
```

PostBridge is a static frontend application. Deploy `dist/` to a static host such as Vercel; no backend or API keys are required.

## Stack and structure

Built with **Vite, vanilla JavaScript, and CSS**. **Marked** parses Markdown, **DOMPurify** sanitizes the generated HTML, **Lucide** provides icons, and **Canvas** renders code block images.

```text
postbridge/
├── docs/preview.png   # Project preview
├── src/main.js        # Editor, conversion, themes, and export
├── src/styles.css     # Interface styles
├── index.html         # Page entry point
└── package.json       # Dependencies and development scripts
```

Report bugs or suggest features through **[GitHub Issues](https://github.com/ShimenTian/postbridge/issues)**.
