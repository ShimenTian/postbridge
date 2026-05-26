import DOMPurify from 'dompurify';
import { Code2, Copy, Download, FileText, Trash2, createIcons } from 'lucide';
import { marked } from 'marked';
import './styles.css';

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
    accent: '#0f766e',
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
  markdown: DEFAULT_MARKDOWN,
  theme: 'clean',
  accent: THEMES.clean.accent,
  fontSize: 16
};

const app = document.querySelector('#app');

app.innerHTML = `
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true">微</div>
      <div>
        <h1>公众号排版导出器</h1>
        <p>Markdown 转微信公众号富文本</p>
      </div>
    </div>
    <div class="topbar-actions">
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

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const els = {
  markdownInput: document.querySelector('#markdownInput'),
  previewContent: document.querySelector('#previewContent'),
  themeSelect: document.querySelector('#themeSelect'),
  accentInput: document.querySelector('#accentInput'),
  fontSizeSelect: document.querySelector('#fontSizeSelect'),
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
  const html = buildWechatHtml();
  const text = els.previewContent.innerText.trim();

  try {
    if (navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' })
        })
      ]);
    } else {
      copyPreviewSelection();
    }
    showToast('已复制富文本');
  } catch (error) {
    copyPreviewSelection();
    showToast('已复制预览内容');
  }
});

els.copyHtmlButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(buildWechatHtml());
  showToast('HTML 已复制');
});

els.downloadButton.addEventListener('click', () => {
  const file = new Blob([buildFullHtmlDocument()], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wechat-article-${formatDate(new Date())}.html`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('已导出 HTML');
});

function render() {
  const html = buildWechatHtml();
  els.previewContent.innerHTML = html;
  els.statsLine.textContent = getStatsText(state.markdown);
  els.statusLine.textContent = state.markdown.trim() ? '实时同步' : '暂无内容';
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
  wrapper.setAttribute('data-origin', 'youmind-wechat-exporter');
  applyArticleStyles(wrapper, theme);
  decorateCodeBlocks(wrapper, theme);
  return wrapper.outerHTML;
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

    setStyle(card, {
      margin: '24px 0',
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#282d35',
      border: '1px solid #1a1f26',
      boxShadow: '0 10px 24px rgba(17, 24, 39, 0.18)'
    });

    setStyle(header, {
      padding: '15px 20px 13px',
      background: '#20252c',
      borderBottom: '1px solid #171c22',
      lineHeight: '1',
      textAlign: 'left'
    });

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

    code.textContent = codeText;
    setStyle(code, {
      display: 'block',
      padding: '0',
      borderRadius: '0',
      background: 'transparent',
      color: '#b8bfcc',
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: `${Math.max(state.fontSize - 1, 14)}px`,
      lineHeight: '1.82',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'break-word'
    });

    setStyle(codeBody, {
      margin: '0',
      padding: '20px 22px 22px',
      borderRadius: '0',
      background: '#282d35',
      color: '#b8bfcc',
      overflowX: 'auto',
      lineHeight: '1.82',
      whiteSpace: 'pre-wrap'
    });

    header.append(controls);
    codeBody.append(code);
    card.append(header, codeBody);
    pre.replaceWith(card);
  });
}

function buildFullHtmlDocument() {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>微信公众号文章</title>
  </head>
  <body>
    ${buildWechatHtml()}
  </body>
</html>`;
}

function copyPreviewSelection() {
  const range = document.createRange();
  range.selectNodeContents(els.previewContent);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
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
