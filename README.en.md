<div align="center">

# PostBridge 文桥

**Write in Markdown for WeChat, Xiaohongshu long-form, and Douyin articles.**

One Markdown source, adapted for multiple article editors.

[简体中文](README.md) · **English**

**[Live Demo](https://postbridge-rho.vercel.app)**

`Markdown → Article formatting → WeChat / Xiaohongshu / Douyin`

</div>

![PostBridge editor and preview](docs/preview.png)

<p align="center"><sub>Early interface preview; see the live app for the current interface.</sub></p>

---

## What is PostBridge?

**PostBridge (文桥)** is a browser-based Markdown formatting tool for WeChat Official Account authors, technical bloggers, and anyone who writes articles in Markdown.

Paste your article, choose a theme, adjust the accent color and font size, and see the result instantly. Copy the formatted rich text into the WeChat article editor when you are ready. PostBridge applies inline CSS to the generated HTML to help preserve formatting when pasted, reducing manual work on headings, quotes, tables, and code blocks.

**Live app: [https://postbridge-rho.vercel.app](https://postbridge-rho.vercel.app)**

The current version prepares, copies, and exports content for WeChat, Xiaohongshu’s native long-form editor, and Douyin’s article editor. Complete publication in the selected platform dashboard.

## Features

| Feature | What it does |
| --- | --- |
| Live preview | Edit Markdown and preview the result side by side, with character and word counts |
| Native long-form modes | Body copying, semantic preview, and the same code block design as WeChat |
| Three themes | In WeChat mode: Clean, Editorial, and Tech, with a custom accent color and 15–18 px font sizes |
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

## Xiaohongshu and Douyin articles

Choose **小红书长文** or **抖音文章**. The initial H1 is extracted as the title; enter it in the platform editor. The preview shows the body directly. Tables become labeled paragraphs, links retain their URLs, and code blocks share WeChat’s dark card design.

### Bulk import with the browser helper (experimental)

An article package contains text, code PNGs, readable article images, and their positions. The destination platform cannot open this file directly; it requires the companion helper.

1. Follow the [installation guide](extension/README.md) to load the project's `extension` folder in Chrome and pin the helper. Installation is needed once.
2. Select the destination in PostBridge and click **导出文章包 (Export article package)**.
3. Open a blank long-form editor on that platform and click the helper icon.
4. Select the downloaded `.postbridge.json` file and start importing. Images upload sequentially at their original positions.
5. Wait for completion, review the layout, fill in the title and cover, then publish yourself.

Existing content requires an explicit append checkbox. Packages support up to 100 images and 32 MB; remote images must allow cross-origin reading. Upload timeouts stop subsequent uploads; check the platform result before retrying. The helper operates on the current platform tab after you click it and uses the platform's own upload path.

**Updating:** Reload the helper in Chrome's extension manager, close any old import panel, and click the helper again. Version 0.1.1 fixes duplicate uploads, misplaced images, and leftover markers on Xiaohongshu. Existing packages remain usable; previously imported drafts are not automatically repaired.

### Direct body and individual image copying

Body copying retains code as ordinary text paragraphs so that filtering embedded images does not remove the code. Use **代码图片 (Code images)** to copy or download individual PNGs for articles with few images.

WeChat image mode converts code blocks when copying rich text. Preview, Copy HTML, and HTML downloads retain styled text code cards.

### Verification

Tested in macOS Chrome on 2026-09-13: package export and a three-image Xiaohongshu import, with one upload per image, correct order, removed markers, loaded images, and unchanged existing content. Douyin bulk import was confirmed by user feedback. The helper remains experimental and may require updates when platform editor interfaces change.

## Usage notes

- **Keep your source:** Drafts are not saved automatically. Reloading the page restores the sample article, so save your Markdown separately.
- **Code images:** Image mode applies to WeChat body copying; native long-form modes support bulk packages as well as individual PNG copying and downloads. The live preview, Copy HTML, and HTML export retain text-based code blocks.
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
├── src/platforms.js   # Platform configuration and native article conversion
├── src/import-package.js # Article text, images, and position packaging
├── extension/         # Chrome import helper and installation guide
├── src/styles.css     # Interface styles
├── index.html         # Page entry point
└── package.json       # Dependencies and development scripts
```

Report bugs or suggest features through **[GitHub Issues](https://github.com/ShimenTian/postbridge/issues)**.
