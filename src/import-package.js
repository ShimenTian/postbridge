import { buildLongArticle } from './platforms.js';

// A local transport format: the destination platform uploads the embedded files.
export async function buildImportPackage(markdown, platform, renderCode) {
  const article = buildLongArticle(markdown, null, { preserveCodeBlocks: true });
  const root = document.createElement('div');
  root.innerHTML = article.html;
  const id = crypto.randomUUID().replaceAll('-', '');
  const assets = [];
  for (const node of [...root.querySelectorAll('pre, img')]) {
    // An image inside a code block is already represented by that block.
    if (!root.contains(node)) continue;
    const token = `【文桥图片${id}_${assets.length + 1}】`;
    const code = node.tagName === 'PRE';
    const source = code ? node.textContent.replace(/\n$/, '') : node.alt;
    let dataUrl;
    try {
      dataUrl = code ? renderCode(source) : await imageToPng(node.getAttribute('src'));
      if (!dataUrl.startsWith('data:image/png;base64,') || dataUrl.length < 100) throw new Error('图片生成失败');
    } catch {
      throw new Error(`第 ${assets.length + 1} 张图片无法打包。配图需允许跨站读取；请更换图片地址后重试。`);
    }
    if (dataUrl.length > 12 * 1024 * 1024) throw new Error(`第 ${assets.length + 1} 张图片过大，请拆分代码块或缩小配图。`);
    const placeholder = document.createElement(code ? 'p' : 'span');
    placeholder.textContent = token;
    node.replaceWith(placeholder);
    assets.push({ token, dataUrl, description: code ? `代码图片 ${assets.length + 1}` : source || '正文配图', source: source || '' });
  }
  const result = { format: 'postbridge-article', version: 1, platform, title: article.title, html: root.innerHTML, assets };
  if (assets.length > 100 || result.html.length > 1000000) throw new Error('文章过长或图片超过 100 张，请拆分文章。');
  if (new Blob([JSON.stringify(result)]).size > 32 * 1024 * 1024) throw new Error('文章包超过 32 MB，请压缩配图或拆分文章。');
  return result;
}

async function imageToPng(src) {
  if (!src) throw new Error('缺少图片地址');
  const url = new URL(src, location.href);
  if (!['https:', 'http:', 'data:'].includes(url.protocol)) throw new Error('不支持的图片地址');
  const response = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('图片读取失败');
  const blob = await response.blob();
  if (!blob.type.startsWith('image/') || blob.size > 10 * 1024 * 1024) throw new Error('图片格式或大小不支持');
  const bitmap = await createImageBitmap(blob);
  try {
    if (bitmap.width * bitmap.height > 32 * 1024 * 1024) throw new Error('图片尺寸过大');
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0);
    return canvas.toDataURL('image/png');
  } finally { bitmap.close(); }
}
