import DOMPurify from 'dompurify';
import { Code2, Copy, Download, FileText, Trash2, createIcons } from 'lucide';
import { marked } from 'marked';
import './styles.css';
import { PLATFORMS, buildLongArticle, articleText } from './platforms.js';
import { buildImportPackage } from './import-package.js';

marked.setOptions({
  gfm: true,
  breaks: false,
  mangle: false,
  headerIds: false
});

const DEFAULT_MARKDOWN = `# 从资料到文章：让 AI 成为你的第二大脑

> 真正高效的创作，不是从空白页开始，而是从一组已经被理解过的资料开始。

很多人使用 AI 写文章时，会直接输入一个标题，然后期待模型吐出一篇完整稿件。这个方式当然快，但它通常会带来三个问题：

- 内容容易泛泛而谈
- 观点缺少自己的判断
- 结构看起来完整，却没有真实材料支撑

## 更稳的工作流

你可以把创作拆成四步：

1. 收集资料：网页、PDF、视频、播客、聊天记录都可以成为素材。
2. 提炼观点：把高亮、笔记和疑问集中到一个地方。
3. 生成草稿：让 AI 基于资料组织结构，而不是凭空发挥。
4. 精修发布：调整标题、节奏、案例和排版。

## 一个简单例子

假设你要写一篇关于 **AI 笔记工具** 的文章，可以先整理出这样的材料：

| 材料 | 用途 |
| --- | --- |
| 产品官网 | 明确定位和核心功能 |
| 用户评论 | 找到真实使用场景 |
| 竞品页面 | 比较差异化 |

然后让 AI 帮你生成初稿，再手动补上自己的判断。这样写出来的内容更像一篇文章，而不是一段自动生成的说明书。

## 可以直接复用的提示词

\`\`\`text
请基于我提供的资料，写一篇适合微信公众号发布的文章。
要求：
1. 开头给出一个明确问题
2. 正文包含真实场景和具体建议
3. 结尾提供可执行清单
\`\`\`

## 结论

AI 最适合承担的是整理、联想、初稿和改写。真正决定文章质量的，仍然是你的材料、判断和取舍。
`;

const THEMES = {
  clean: {
    label: '清爽',
    accent: '#07C160',
    ink: '#202124',
    muted: '#667085',
    border: '#d8e0dc',
    surface: '#f6faf8',
    quote: '#edf7f3',
    codeBg: '#111827',
    codeText: '#f9fafb'
  },
  editorial: {
    label: '杂志',
    accent: '#b45309',
    ink: '#241f1a',
    muted: '#71675f',
    border: '#ead9c6',
    surface: '#fff8ef',
    quote: '#f8ead8',
    codeBg: '#2d2218',
    codeText: '#fff7ed'
  },
  tech: {
    label: '技术',
    accent: '#2563eb',
    ink: '#1f2937',
    muted: '#6b7280',
    border: '#d7def0',
    surface: '#f5f8ff',
    quote: '#edf2ff',
    codeBg: '#0f172a',
    codeText: '#e5edff'
  }
};

const state = {
  platform: 'wechat',
  markdown: DEFAULT_MARKDOWN,
  theme: 'clean',
  accent: THEMES.clean.accent,
  fontSize: 16,
  codeMode: 'scroll'
};

const app = document.querySelector('#app');

app.innerHTML = `
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true">桥</div>
      <div>
        <h1>文桥 <span>PostBridge</span></h1>
        <p>一份 Markdown，适配多个内容平台</p>
      </div>
    </div>
    <div class="topbar-actions">
      <label class="control platform-control">发布平台
        <select id="platformSelect" aria-label="发布平台">
          ${Object.entries(PLATFORMS).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join('')}
        </select>
      </label>
      <button class="icon-button secondary" type="button" id="resetButton" title="载入示例">
        <i data-lucide="file-text"></i>
      </button>
      <button class="icon-button secondary" type="button" id="clearButton" title="清空">
        <i data-lucide="trash-2"></i>
      </button>
      <button class="text-button secondary" type="button" id="copyHtmlButton">
        <i data-lucide="code-2"></i>
        <span>复制 HTML</span>
      </button>
      <button class="text-button secondary" type="button" id="downloadButton">
        <i data-lucide="download"></i>
        <span>导出</span>
      </button>
      <button class="text-button secondary" type="button" id="exportPackageButton" hidden title="配合浏览器导入助手，按顺序导入全文和所有代码图片">导出文章包</button>
      <button class="text-button secondary" type="button" id="codeImagesButton" hidden>代码图片</button>
      <button class="text-button primary" type="button" id="copyRichButton">
        <i data-lucide="copy"></i>
        <span>复制到公众号</span>
      </button>
    </div>
  </header>

  <main class="workspace">
    <section class="editor-panel" aria-label="编辑区">
      <div class="panel-header">
        <div>
          <h2>编辑</h2>
          <p id="statsLine"></p>
        </div>
        <div class="controls">
          <label class="control">
            <span id="themeLabel">主题</span>
            <select id="themeSelect">
              ${Object.entries(THEMES).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join('')}
            </select>
          </label>
          <label class="control color-control">
            <span id="accentLabel">强调色</span>
            <input id="accentInput" type="color" value="${state.accent}" />
          </label>
          <label class="control">
            <span id="fontSizeLabel">字号</span>
            <select id="fontSizeSelect">
              <option value="15">15</option>
              <option value="16" selected>16</option>
              <option value="17">17</option>
              <option value="18">18</option>
            </select>
          </label>
          <label class="control">
            <span id="codeModeLabel">代码</span>
            <select id="codeModeSelect">
              <option value="scroll" selected>可复制</option>
              <option value="image">图片</option>
            </select>
          </label>
        </div>
      </div>
      <textarea id="markdownInput" spellcheck="false"></textarea>
    </section>

    <section class="preview-panel" aria-label="预览区">
      <div class="panel-header">
        <div>
          <h2>预览</h2>
          <p id="statusLine">等待编辑</p>
        </div>
      </div>
      <div class="preview-shell">
        <article id="previewContent" class="preview-content"></article>
      </div>
    </section>
  </main>

  <dialog id="codeImagesDialog" aria-labelledby="codeImagesTitle">
    <div class="image-dialog-header"><h2 id="codeImagesTitle">代码图片</h2><button id="closeCodeImagesButton" type="button" class="text-button secondary">关闭</button></div>
    <p>正文复制保留代码文字。可逐张复制图片到平台；若粘贴失败，下载 PNG 后通过平台的插入图片功能上传，再替换对应代码文字。</p>
    <p id="codeImagesStatus" role="status" aria-live="polite"></p>
    <div id="codeImagesList"></div>
  </dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const els = {
  platformSelect: document.querySelector('#platformSelect'),
  markdownInput: document.querySelector('#markdownInput'),
  previewContent: document.querySelector('#previewContent'),
  themeSelect: document.querySelector('#themeSelect'),
  accentInput: document.querySelector('#accentInput'),
  fontSizeSelect: document.querySelector('#fontSizeSelect'),
  codeModeSelect: document.querySelector('#codeModeSelect'),
  copyRichButton: document.querySelector('#copyRichButton'),
  copyHtmlButton: document.querySelector('#copyHtmlButton'),
  downloadButton: document.querySelector('#downloadButton'),
  resetButton: document.querySelector('#resetButton'),
  clearButton: document.querySelector('#clearButton'),
  statsLine: document.querySelector('#statsLine'),
  statusLine: document.querySelector('#statusLine'),
  toast: document.querySelector('#toast')
};

els.themeSelect.setAttribute('aria-labelledby', 'themeLabel');
els.accentInput.setAttribute('aria-labelledby', 'accentLabel');
els.fontSizeSelect.setAttribute('aria-labelledby', 'fontSizeLabel');
els.codeModeSelect.setAttribute('aria-labelledby', 'codeModeLabel');
els.markdownInput.value = state.markdown;
createIcons({
  icons: {
    Code2,
    Copy,
    Download,
    FileText,
    Trash2
  }
});
render();

els.platformSelect.addEventListener('change', () => {
  state.platform = els.platformSelect.value;
  render();
});

els.markdownInput.addEventListener('input', () => {
  state.markdown = els.markdownInput.value;
  render();
});

els.themeSelect.addEventListener('change', () => {
  state.theme = els.themeSelect.value;
  state.accent = THEMES[state.theme].accent;
  els.accentInput.value = state.accent;
  render();
});

els.accentInput.addEventListener('input', () => {
  state.accent = els.accentInput.value;
  render();
});

els.fontSizeSelect.addEventListener('change', () => {
  state.fontSize = Number(els.fontSizeSelect.value);
  render();
});

els.codeModeSelect.addEventListener('change', () => {
  state.codeMode = els.codeModeSelect.value;
  render();
  showToast(state.platform !== 'wechat' ? '长文正文保留代码文字，图片请使用「代码图片」单独插入' : state.codeMode === 'image' ? '复制正文时自动将代码转为图片' : '复制正文时保留代码文本');
});

els.resetButton.addEventListener('click', () => {
  state.markdown = DEFAULT_MARKDOWN;
  els.markdownInput.value = state.markdown;
  render();
  showToast('已载入示例');
});

els.clearButton.addEventListener('click', () => {
  state.markdown = '';
  els.markdownInput.value = '';
  render();
  showToast('已清空');
});

els.copyRichButton.addEventListener('click', async () => {
  const platform = state.platform;
  const codeMode = state.codeMode;
  try {
    const html = await buildPlatformClipboardHtml();
    const container = document.createElement('div');
    container.innerHTML = html;
    await writeClipboard(html, platform === 'wechat' ? articleText(container) : buildLongArticle(state.markdown).text);
    showToast(platform !== 'wechat' ? '正文已复制，代码文字已保留；图片可从「代码图片」单独插入' : codeMode === 'image' ? '已复制富文本，代码块已转为图片' : '正文已复制，请粘贴到平台正文编辑器');
  } catch { showToast('复制失败，请重试或导出 HTML'); }
});

els.copyHtmlButton.addEventListener('click', async () => {
  try {
    await writeClipboard('', buildPlatformHtml());
    showToast('HTML 已复制');
  } catch { showToast('复制失败，请使用导出'); }
});

els.downloadButton.addEventListener('click', () => {
  const file = new Blob([buildFullHtmlDocument()], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${state.platform}-article-${formatDate(new Date())}.html`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('已导出 HTML');
});

function render() {
  const platform = PLATFORMS[state.platform];
  const longForm = state.platform !== 'wechat';
  els.previewContent.innerHTML = buildPlatformHtml();
  document.querySelector('#exportPackageButton').hidden = !longForm;
  document.querySelector('#codeImagesButton').hidden = !longForm || !els.previewContent.querySelector('[data-code-block="true"]');
  els.codeModeSelect.querySelector('[value="image"]').textContent = longForm ? '图片单独插入' : '图片';
  els.previewContent.classList.toggle('native-article', longForm);
  els.statsLine.textContent = getStatsText(state.markdown);
  els.statusLine.textContent = state.markdown.trim() ? `${platform.label} · ${longForm ? '正文结构预览' : '实时同步'}` : '暂无内容';
  els.copyRichButton.querySelector('span').textContent = platform.copyLabel;
  [els.themeSelect, els.accentInput, els.fontSizeSelect].forEach(control => {
    control.disabled = longForm;
    control.closest('label').hidden = longForm;
  });
}

function buildPlatformHtml() {
  if (state.platform === 'wechat') return buildWechatHtml();
  const wrapper = document.createElement('section');
  wrapper.innerHTML = buildLongArticle(state.markdown, null, { preserveCodeBlocks: true }).html;
  decorateCodeBlocks(wrapper, { ...THEMES[state.theme], accent: state.accent });
  return wrapper.outerHTML;
}

function buildWechatHtml() {
  const theme = { ...THEMES[state.theme], accent: state.accent };
  const dirty = marked.parse(state.markdown || '');
  const safe = DOMPurify.sanitize(dirty, {
    ADD_ATTR: ['target', 'rel']
  });

  const doc = document.implementation.createHTMLDocument('wechat');
  const wrapper = doc.createElement('section');
  wrapper.innerHTML = safe;
  wrapper.setAttribute('data-origin', 'postbridge');
  normalizeListParagraphs(wrapper);
  applyArticleStyles(wrapper, theme);
  decorateCodeBlocks(wrapper, theme);
  return wrapper.outerHTML;
}

async function buildPlatformClipboardHtml() {
  // Native editors may discard data-URI images and custom code cards.
  // Keep code as ordinary paragraphs in both clipboard representations.
  if (state.platform !== 'wechat') return buildLongArticle(state.markdown).html;
  const html = buildPlatformHtml();
  if (state.codeMode !== 'image') {
    return html;
  }

  const theme = { ...THEMES[state.theme], accent: state.accent };
  const doc = document.implementation.createHTMLDocument('article-clipboard');
  const container = doc.createElement('div');
  container.innerHTML = html;

  await Promise.all([...container.querySelectorAll('[data-code-block="true"]')].map(async (card) => {
    const codeText = card.tagName === 'PRE'
      ? card.textContent.replace(/\n$/, '')
      : card.getAttribute('data-code-source') || '';
    const image = doc.createElement('img');
    image.src = renderCodeBlockImage(codeText, theme);
    image.alt = `代码块：${codeText}`;
    setStyle(image, {
      display: 'block',
      width: '100%',
      maxWidth: '669px',
      height: 'auto',
      margin: '24px auto',
      borderRadius: '10px'
    });
    card.replaceWith(image);
  }));

  return container.innerHTML;
}

document.querySelector('#exportPackageButton').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = '正在打包…';
  // Capture the article and style before awaiting any remote images.
  const markdown = state.markdown;
  const platform = state.platform;
  const theme = { ...THEMES[state.theme], accent: state.accent };
  const fontSize = state.fontSize;
  try {
    if (!markdown.trim()) throw new Error('请先填写文章内容');
    const pack = await buildImportPackage(markdown, platform, code => renderCodeBlockImage(code, theme, fontSize));
    const blob = new Blob([JSON.stringify(pack)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${platform}-article-${formatDate(new Date())}.postbridge.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`文章包已导出（${pack.assets.length} 张图片），请在平台使用导入助手打开`);
  } catch (error) { showToast(error.message || '文章打包失败，请重试'); }
  finally { button.disabled = false; button.textContent = '导出文章包'; }
});

document.querySelector('#closeCodeImagesButton').addEventListener('click', () => document.querySelector('#codeImagesDialog').close());
document.querySelector('#codeImagesButton').addEventListener('click', () => {
  const list = document.querySelector('#codeImagesList');
  list.replaceChildren();
  document.querySelector('#codeImagesStatus').textContent = '';
  const root = document.createElement('div');
  root.innerHTML = buildPlatformHtml();
  const theme = { ...THEMES[state.theme], accent: state.accent };
  root.querySelectorAll('[data-code-block="true"]').forEach((card, index) => {
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = `代码图片 ${index + 1}`;
    const image = document.createElement('img');
    image.src = renderCodeBlockImage(card.getAttribute('data-code-source') || '', theme);
    image.alt = `代码图片 ${index + 1}`;
    const copy = document.createElement('button');
    copy.className = 'text-button secondary';
    copy.type = 'button';
    copy.textContent = '复制图片';
    copy.addEventListener('click', async () => {
      try {
        const bytes = Uint8Array.from(atob(image.src.split(',')[1]), char => char.charCodeAt(0));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': new Blob([bytes], { type: 'image/png' }) })]);
        document.querySelector('#codeImagesStatus').textContent = `代码图片 ${index + 1} 已复制，请在平台粘贴；若未插入，可下载后上传。`;
        showToast(`代码图片 ${index + 1} 已复制，请在平台粘贴`);
      } catch {
        document.querySelector('#codeImagesStatus').textContent = '图片复制失败，请下载 PNG 后在平台上传';
        showToast('图片复制失败，请下载 PNG 后在平台上传');
      }
    });
    const download = document.createElement('a');
    download.className = 'text-button secondary';
    download.textContent = '下载 PNG';
    download.href = image.src;
    download.download = `${state.platform}-code-${index + 1}.png`;
    section.append(heading, image, copy, download);
    list.append(section);
  });
  if (!list.children.length) {
    showToast('当前文章没有代码块');
    return;
  }
  document.querySelector('#codeImagesDialog').showModal();
});

function normalizeListParagraphs(root) {
  // Keep inline runs together when rich-text editors normalize list children.
  // Existing paragraphs and other blocks retain their original boundaries.
  const blockTags = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DETAILS', 'DIV', 'DL',
    'FIELDSET', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4',
    'H5', 'H6', 'HEADER', 'HR', 'MAIN', 'NAV', 'OL', 'P', 'PRE',
    'SECTION', 'TABLE', 'UL'
  ]);

  root.querySelectorAll('li').forEach((item) => {
    let paragraph = null;
    [...item.childNodes].forEach((node) => {
      if (node.nodeType === 1 && blockTags.has(node.tagName)) {
        paragraph = null;
        return;
      }
      if (!paragraph) {
        if (node.nodeType === 8 || (node.nodeType === 3 && !node.textContent.trim())) return;
        paragraph = root.ownerDocument.createElement('p');
        item.insertBefore(paragraph, node);
      }
      paragraph.append(node);
    });
  });
}

function applyArticleStyles(root, theme) {
  setStyle(root, {
    boxSizing: 'border-box',
    maxWidth: '677px',
    margin: '0 auto',
    padding: '8px 4px',
    color: theme.ink,
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
    fontSize: `${state.fontSize}px`,
    lineHeight: '1.82',
    letterSpacing: '0'
  });

  root.querySelectorAll('*').forEach((node) => {
    const tag = node.tagName.toLowerCase();
    const styles = getInlineStyle(tag, theme);

    if (styles) {
      setStyle(node, styles);
    }

    if (tag === 'p' && node.parentElement?.tagName === 'LI') {
      // List spacing belongs to the item; retain gaps between real paragraphs.
      node.style.margin = node.nextElementSibling?.tagName === 'P' ? '0 0 18px' : '0';
    }

    if (tag === 'a') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noreferrer');
    }
  });
}

function getInlineStyle(tag, theme) {
  const paragraph = {
    margin: '0 0 18px',
    color: theme.ink,
    fontSize: `${state.fontSize}px`,
    lineHeight: '1.82'
  };

  const styles = {
    h1: {
      margin: '8px 0 24px',
      padding: '0 0 14px',
      borderBottom: `2px solid ${theme.accent}`,
      color: theme.ink,
      fontSize: `${state.fontSize + 8}px`,
      lineHeight: '1.42',
      fontWeight: '700',
      textAlign: 'left'
    },
    h2: {
      margin: '32px 0 18px',
      padding: `8px 12px 8px 14px`,
      borderLeft: `5px solid ${theme.accent}`,
      background: theme.surface,
      color: theme.ink,
      fontSize: `${state.fontSize + 3}px`,
      lineHeight: '1.5',
      fontWeight: '700'
    },
    h3: {
      margin: '26px 0 14px',
      padding: '0 0 0 10px',
      borderLeft: `3px solid ${theme.accent}`,
      color: theme.ink,
      fontSize: `${state.fontSize + 1}px`,
      lineHeight: '1.55',
      fontWeight: '700'
    },
    p: paragraph,
    strong: {
      color: theme.accent,
      fontWeight: '700'
    },
    em: {
      color: theme.muted,
      fontStyle: 'italic'
    },
    blockquote: {
      margin: '22px 0',
      padding: '14px 16px',
      borderLeft: `4px solid ${theme.accent}`,
      background: theme.quote,
      color: theme.ink
    },
    ul: {
      margin: '0 0 18px',
      padding: '0 0 0 24px',
      color: theme.ink
    },
    ol: {
      margin: '0 0 18px',
      padding: '0 0 0 24px',
      color: theme.ink
    },
    li: {
      margin: '0 0 8px',
      lineHeight: '1.82',
      color: theme.ink
    },
    table: {
      width: '100%',
      margin: '20px 0',
      borderCollapse: 'collapse',
      fontSize: `${Math.max(state.fontSize - 1, 14)}px`,
      lineHeight: '1.6'
    },
    thead: {
      background: theme.surface
    },
    th: {
      padding: '10px 12px',
      border: `1px solid ${theme.border}`,
      color: theme.ink,
      fontWeight: '700',
      textAlign: 'left'
    },
    td: {
      padding: '10px 12px',
      border: `1px solid ${theme.border}`,
      color: theme.ink,
      textAlign: 'left'
    },
    code: {
      padding: '2px 6px',
      borderRadius: '4px',
      background: theme.surface,
      color: theme.accent,
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: `${Math.max(state.fontSize - 2, 13)}px`
    },
    pre: {
      margin: '20px 0',
      padding: '16px',
      borderRadius: '6px',
      background: theme.codeBg,
      color: theme.codeText,
      overflow: 'auto',
      lineHeight: '1.65'
    },
    img: {
      display: 'block',
      maxWidth: '100%',
      height: 'auto',
      margin: '20px auto',
      borderRadius: '6px'
    },
    hr: {
      height: '1px',
      margin: '28px 0',
      border: '0',
      background: theme.border
    },
    a: {
      color: theme.accent,
      textDecoration: 'none',
      borderBottom: `1px solid ${theme.accent}`
    }
  };

  return styles[tag];
}

function setStyle(node, styles) {
  Object.entries(styles).forEach(([property, value]) => {
    node.style[property] = value;
  });
}

function decorateCodeBlocks(root, theme) {
  const doc = root.ownerDocument;

  root.querySelectorAll('pre').forEach((pre) => {
    const sourceCode = pre.querySelector('code');
    const codeText = (sourceCode?.textContent ?? pre.textContent ?? '').replace(/\n$/, '');
    const card = doc.createElement('section');
    const header = doc.createElement('section');
    const controls = doc.createElement('section');
    const codeBody = doc.createElement('pre');
    const code = doc.createElement('code');

    card.setAttribute('data-code-block', 'true');
    card.setAttribute('data-code-source', codeText);

    setStyle(card, {
      maxWidth: '100%',
      margin: '24px 0',
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#282d35',
      backgroundColor: '#282d35',
      border: '1px solid #1a1f26',
      boxShadow: '0 10px 24px rgba(17, 24, 39, 0.18)'
    });
    card.style.setProperty('background-color', '#282d35', 'important');
    card.style.setProperty('border-radius', '10px', 'important');
    card.style.setProperty('overflow', 'hidden', 'important');

    setStyle(header, {
      display: 'block',
      boxSizing: 'border-box',
      width: '100%',
      padding: '15px 20px 13px',
      background: '#20252c',
      backgroundColor: '#20252c',
      borderBottom: '1px solid #171c22',
      borderRadius: '10px 10px 0 0',
      lineHeight: '1',
      textAlign: 'left'
    });
    header.style.setProperty('background', '#20252c', 'important');
    header.style.setProperty('background-color', '#20252c', 'important');
    header.style.setProperty('border-radius', '10px 10px 0 0', 'important');

    setStyle(controls, {
      display: 'inline-block',
      verticalAlign: 'middle'
    });

    [
      ['#ff5f57', '关闭'],
      ['#ffbd2e', '最小化'],
      ['#28c840', '缩放']
    ].forEach(([color, label]) => {
      const dot = doc.createElement('span');
      dot.setAttribute('aria-label', label);
      dot.textContent = '\u00a0';
      setStyle(dot, {
        display: 'inline-block',
        width: '12px',
        height: '12px',
        marginRight: '7px',
        borderRadius: '50%',
        color: 'transparent',
        backgroundColor: color,
        fontSize: '0',
        lineHeight: '0',
        overflow: 'hidden',
        verticalAlign: 'middle'
      });
      controls.append(dot);
    });

    setStyle(codeBody, {
      display: 'block',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      margin: '0',
      padding: '0',
      borderRadius: '0 0 10px 10px',
      background: '#282d35',
      backgroundColor: '#282d35',
      color: '#b8bfcc',
      overflow: 'hidden',
      lineHeight: '1.82'
    });
    codeBody.style.setProperty('background', '#282d35', 'important');
    codeBody.style.setProperty('background-color', '#282d35', 'important');
    codeBody.style.setProperty('color', '#b8bfcc', 'important');
    codeBody.style.setProperty('border-radius', '0 0 10px 10px', 'important');

    setStyle(code, {
      display: '-webkit-box',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      margin: '0',
      padding: '20px 22px 22px',
      borderRadius: '0 0 10px 10px',
      background: '#282d35',
      backgroundColor: '#282d35',
      color: '#b8bfcc',
      overflowX: 'auto',
      overflowY: 'hidden',
      textIndent: '0',
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: `${Math.max(state.fontSize - 1, 14)}px`,
      lineHeight: '1.82',
      whiteSpace: 'nowrap',
      wordBreak: 'normal',
      overflowWrap: 'normal',
      tabSize: '2',
      WebkitOverflowScrolling: 'touch'
    });
    code.style.setProperty('display', '-webkit-box', 'important');
    code.style.setProperty('background', '#282d35', 'important');
    code.style.setProperty('background-color', '#282d35', 'important');
    code.style.setProperty('color', '#b8bfcc', 'important');
    code.style.setProperty('border-radius', '0 0 10px 10px', 'important');
    code.style.setProperty('overflow-x', 'auto', 'important');
    code.style.setProperty('white-space', 'nowrap', 'important');
    code.style.setProperty('word-break', 'normal', 'important');
    code.style.setProperty('overflow-wrap', 'normal', 'important');

    appendWechatCodeLines(code, codeText);

    header.append(controls);
    codeBody.append(code);
    card.append(header, codeBody);
    pre.replaceWith(card);
  });
}

function renderCodeBlockImage(codeText, theme, articleFontSize = state.fontSize) {
  const lines = codeText.split('\n');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const scale = 2;
  const width = 669;
  const headerHeight = 46;
  const horizontalPadding = 22;
  const verticalPadding = 20;
  const availableTextWidth = width - horizontalPadding * 2;
  const fontFamily = 'SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
  let fontSize = Math.max(articleFontSize - 1, 14);

  context.font = `${fontSize}px ${fontFamily}`;
  const widestLine = Math.max(...lines.map((line) => context.measureText(line || ' ').width));
  if (widestLine > availableTextWidth) {
    fontSize = Math.max(9, Math.floor(fontSize * availableTextWidth / widestLine));
  }

  const lineHeight = Math.max(19, Math.ceil(fontSize * 1.82));
  const bodyHeight = verticalPadding * 2 + Math.max(lines.length, 1) * lineHeight;
  const height = headerHeight + bodyHeight;
  canvas.width = width * scale;
  canvas.height = height * scale;
  context.scale(scale, scale);

  drawRoundedRect(context, 0, 0, width, height, 10);
  context.fillStyle = '#282d35';
  context.fill();

  context.save();
  drawRoundedRect(context, 0, 0, width, headerHeight, 10);
  context.clip();
  context.fillStyle = '#20252c';
  context.fillRect(0, 0, width, headerHeight);
  context.restore();

  context.fillStyle = '#171c22';
  context.fillRect(0, headerHeight - 1, width, 1);
  ['#ff5f57', '#ffbd2e', '#28c840'].forEach((color, index) => {
    context.beginPath();
    context.arc(22 + index * 19, 23, 6, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  });

  context.font = `${fontSize}px ${fontFamily}`;
  context.textBaseline = 'top';
  context.fillStyle = theme.codeText === '#f9fafb' ? '#b8bfcc' : theme.codeText;
  lines.forEach((line, index) => {
    context.fillText(line || ' ', horizontalPadding, headerHeight + verticalPadding + index * lineHeight);
  });

  return canvas.toDataURL('image/png');
}

function drawRoundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function appendWechatCodeLines(container, codeText) {
  const doc = container.ownerDocument;
  const lines = codeText.split('\n');

  lines.forEach((line, index) => {
    const normalizedLine = line.replace(/\t/g, '  ').replace(/ /g, '\u00a0');
    container.append(doc.createTextNode(normalizedLine || '\u00a0'));

    if (index < lines.length - 1) {
      container.append(doc.createElement('br'));
    }
  });
}

function buildFullHtmlDocument() {
  const heading = document.createElement('h1');
  heading.textContent = buildLongArticle(state.markdown).title;
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${PLATFORMS[state.platform].label}</title>
  </head>
  <body>
    ${state.platform === 'wechat' ? '' : heading.outerHTML}
    ${buildPlatformHtml()}
  </body>
</html>`;
}

async function writeClipboard(html, text) {
  try {
    if (html && navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      })]);
    } else if (!html && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else throw new Error('Clipboard API unavailable');
    return;
  } catch {
    // Supply the exact payload on fallback, including title-only and image-code copies.
    const fallback = document.createElement('textarea');
    fallback.value = text;
    fallback.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(fallback);
    const focused = document.activeElement;
    fallback.select();
    const onCopy = event => {
      if (!event.clipboardData) return;
      event.preventDefault();
      event.clipboardData.setData('text/plain', text);
      if (html) event.clipboardData.setData('text/html', html);
    };
    document.addEventListener('copy', onCopy);
    try {
      if (!document.execCommand('copy')) throw new Error('Copy failed');
    } finally {
      document.removeEventListener('copy', onCopy);
      fallback.remove();
      focused?.focus();
    }
  }
}

function getStatsText(value) {
  const text = value.replace(/\s/g, '');
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return `${text.length} 字符 · ${words} 词`;
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add('show');
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove('show');
  }, 1800);
}
