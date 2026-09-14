import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const PLATFORMS = {
  wechat: { label: '微信公众号', copyLabel: '复制到公众号', url: 'https://mp.weixin.qq.com/', guide: '复制富文本后，粘贴到公众号正文编辑器。发布前检查图片与排版。' },
  xiaohongshu: { label: '小红书长文', copyLabel: '复制长文正文', url: 'https://creator.xiaohongshu.com/publish/publish', guide: '进入创作服务平台 → 写长文，分别粘贴标题与正文，再使用平台的一键排版。入口、字数限制与最终样式以账号后台为准。' },
  douyin: { label: '抖音文章', copyLabel: '复制文章正文', url: 'https://creator.douyin.com/', guide: '进入创作者中心 → 高清发布 → 发布文章，分别粘贴标题与正文，再设置封面、摘要与配乐。入口与最终效果以账号后台为准。', referenceLimit: 8000 }
};

// Keep semantic HTML for native long-form editors; their own templates own the final styles.
export function buildLongArticle(markdown, titleOverride = null, { preserveCodeBlocks = false } = {}) {
  const body = document.createElement('section');
  body.innerHTML = DOMPurify.sanitize(marked.parse(markdown || ''));
  const heading = body.firstElementChild?.tagName === 'H1' ? body.firstElementChild : null;
  const title = titleOverride ?? heading?.textContent?.trim() ?? '';
  heading?.remove();
  const notes = [];
  if (body.querySelector('table')) {
    notes.push('表格已转成逐项文字，便于长文编辑器接收。');
    body.querySelectorAll('table').forEach(table => {
      const replacement = document.createElement('div');
      const headers = [...table.querySelectorAll('thead th')].map(cell => cell.textContent.trim());
      const rows = table.querySelectorAll('tbody tr').length ? table.querySelectorAll('tbody tr') : table.querySelectorAll('tr');
      rows.forEach(row => {
        const p = document.createElement('p');
        [...row.children].forEach((cell, index) => {
          if (index) p.append(document.createElement('br'));
          if (headers[index]) p.append(`${headers[index]}：`);
          p.append(...[...cell.childNodes].map(node => node.cloneNode(true)));
        });
        replacement.append(p);
      });
      table.replaceWith(replacement);
    });
  }
  if (!preserveCodeBlocks && body.querySelector('pre')) {
    notes.push('代码以文本保留，请在平台预览中检查缩进。');
    body.querySelectorAll('pre').forEach(pre => {
      const p = document.createElement('p');
      pre.textContent.replace(/\n$/, '').split('\n').forEach((line, index) => {
        if (index) p.append(document.createElement('br'));
        p.append(document.createTextNode(line.replace(/ /g, '\u00a0') || '\u00a0'));
      });
      pre.replaceWith(p);
    });
  }
  if (body.querySelector('img')) notes.push('正文含图片；粘贴后检查是否上传成功，必要时在平台重新插入。');
  body.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== link.textContent) link.append(`（${href}）`);
    link.replaceWith(...link.childNodes);
  });
  body.querySelectorAll('*').forEach(node => {
    for (const attr of [...node.attributes]) {
      if (!(node.tagName === 'IMG' && ['src', 'alt'].includes(attr.name))) node.removeAttribute(attr.name);
    }
  });
  const text = articleText(body);
  return { title, html: body.innerHTML, text, count: [...text.replace(/\s/g, '')].length, notes };
}

export function articleText(root) {
  function visit(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';
    if (node.tagName === 'BR') return '\n';
    if (node.tagName === 'IMG') return `[图片：${node.getAttribute('alt') || '请在平台检查图片'}]`;
    let value = [...node.childNodes].map(visit).join('');
    if (node.tagName === 'LI') {
      const index = [...node.parentElement.children].indexOf(node) + 1;
      value = `${node.parentElement.tagName === 'OL' ? `${index}.` : '•'} ${value.trim()}\n`;
    } else if (/^(P|DIV|SECTION|H[1-6]|BLOCKQUOTE|UL|OL|PRE)$/.test(node.tagName)) value += '\n\n';
    return value;
  }
  return visit(root).replace(/\u00a0/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
