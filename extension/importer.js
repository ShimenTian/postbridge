(() => {
  'use strict';
  const platform = location.hostname === 'creator.xiaohongshu.com' ? 'xiaohongshu'
    : location.hostname === 'creator.douyin.com' ? 'douyin' : null;
  if (!platform || location.protocol !== 'https:') return;
  if (document.querySelector('#postbridge-importer')) return;
  const candidates = [...document.querySelectorAll('.tiptap[contenteditable="true"]')].filter(el => el.editor?.isEditable);
  if (candidates.length !== 1) { alert('请先打开可编辑的小红书长文或抖音文章正文。'); return; }
  const editor = candidates[0].editor;
  const host = document.createElement('div');
  host.id = 'postbridge-importer';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.35);display:grid;place-items:center';
  const ui = host.attachShadow({ mode: 'open' });
  ui.innerHTML = `<style>
    *{box-sizing:border-box}section{font:15px/1.7 -apple-system,"PingFang SC",sans-serif;background:white;color:#26323b;border-radius:12px;padding:24px;width:min(560px,calc(100vw - 32px));max-height:90vh;overflow:auto;box-shadow:0 20px 70px #0003}h2{margin:0;font-size:20px}p{margin:12px 0}button{font:inherit;padding:8px 14px;border-radius:7px;border:1px solid #cfd8d0;background:white;cursor:pointer}button:disabled{opacity:.5;cursor:default}#start{background:#0f766e;color:white;border:0}header,footer{display:flex;gap:12px;align-items:center;justify-content:space-between}footer{margin-top:20px;flex-wrap:wrap}label{display:block;margin:12px 0}input[type=file]{max-width:100%}progress{width:100%;accent-color:#0f766e}#status{white-space:pre-wrap;color:#334155}#details{color:#667085;overflow-wrap:anywhere}
    </style><section role="dialog" aria-modal="true" aria-labelledby="heading">
    <header><h2 id="heading">导入文桥文章</h2><button id="close">关闭</button></header>
    <p>选择文桥导出的文章包。正文与图片将按原文顺序导入，完成后由你检查和发布。</p>
    <input id="file" type="file" accept=".json,application/json" aria-label="选择文桥文章包">
    <p id="details"></p>
    <label id="appendLabel" hidden><input id="append" type="checkbox"> 追加到当前正文末尾，保留已有内容</label>
    <progress id="progress" value="0" max="1" hidden></progress>
    <p id="status" role="status" aria-live="polite"></p>
    <footer><button id="start" disabled>开始导入</button><button id="stop" hidden>完成当前图片后停止</button></footer>
    </section>`;
  document.body.append(host);
  const $ = id => ui.getElementById(id);
  let pack = null, running = false, stopping = false, complete = false;
  let lateObserver = null;
  const hasContent = () => Boolean(editor.state.doc.textContent.trim() || imageCount());
  function imageCount() { let n = 0; editor.state.doc.descendants(node => { if (node.type.name === 'image') n++; }); return n; }
  function updateButton() {
    $('appendLabel').hidden = !hasContent();
    $('start').disabled = !pack || running || complete || (hasContent() && !$('append').checked);
  }
  function status(message) { $('status').textContent = message; }
  function cleanup() { lateObserver?.(); document.removeEventListener('keydown', blockEditing, true); host.remove(); }
  function blockEditing(event) {
    if (running && !event.composedPath().includes(host)) { event.preventDefault(); event.stopImmediatePropagation(); }
  }
  document.addEventListener('keydown', blockEditing, true);
  $('close').onclick = () => { if (!running) cleanup(); };
  $('append').onchange = updateButton;
  $('stop').onclick = () => { stopping = true; $('stop').disabled = true; status('将在当前图片上传完成后停止，避免图片插入到错误位置。'); };
  $('file').onchange = async () => {
    pack = null; complete = false; updateButton();
    const file = $('file').files[0];
    if (!file) return;
    try {
      if (file.size > 32 * 1024 * 1024) throw new Error('文章包超过 32 MB。');
      pack = validate(JSON.parse(await file.text()));
      $('details').textContent = `标题：${pack.title || '未填写'} · 图片 ${pack.assets.length} 张`;
      status(hasContent() ? '当前正文已有内容。可打开空白新稿，或勾选追加。' : '准备就绪。上传期间请保留此页面。');
    } catch (error) { status(`无法导入：${error.message}`); }
    updateButton();
  };
  $('start').onclick = async () => {
    if (!pack || running || complete || (hasContent() && !$('append').checked)) return;
    running = true; stopping = false; $('file').disabled = true; $('append').disabled = true;
    $('close').disabled = true; $('stop').hidden = false; $('progress').hidden = false;
    $('progress').max = Math.max(1, pack.assets.length); updateButton();
    let imported = 0;
    try {
      if (editor.isDestroyed || !candidates[0].isConnected) throw new Error('编辑器已关闭，请重新打开导入助手。');
      // Append only. Existing title, body, cover and publishing settings are never replaced.
      const inserted = editor.commands.insertContentAt(editor.state.doc.content.size, pack.html, { updateSelection: false });
      if (!inserted || pack.assets.some(a => !findToken(a.token))) throw new Error('平台未保留图片位置标记，请保留文章包并检查正文。');
      for (const asset of pack.assets) {
        if (stopping) break;
        const range = findToken(asset.token);
        if (!range) throw new Error('图片位置发生变化，已停止后续上传。');
        status(`正在上传图片 ${imported + 1} / ${pack.assets.length}，请等待平台处理……`);
        // Xiaohongshu inserts at selection.to instead of replacing the selection.
        editor.commands.setTextSelection(platform === 'xiaohongshu' ? range.from : range);
        editor.view.focus();
        const count = imageCount();
        const transfer = new DataTransfer();
        const bytes = Uint8Array.from(atob(asset.dataUrl.split(',')[1]), c => c.charCodeAt(0));
        transfer.items.add(new File([bytes], `postbridge-${imported + 1}.png`, { type: 'image/png' }));
        const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer });
        if (platform === 'xiaohongshu' && typeof editor.options.onPaste !== 'function') throw new Error('小红书上传接口已变化，请更新导入助手。');
        const wait = waitForImage(asset.token, count);
        try {
          // Dispatching through the DOM triggers the platform upload twice.
          // Call its existing upload callback once, preserving its normal upload path.
          if (platform === 'xiaohongshu') editor.options.onPaste(event);
          else editor.view.dom.dispatchEvent(event);
        } catch (error) { lateObserver?.(); await wait.catch(() => {}); throw error; }
        await wait;
        if (platform === 'xiaohongshu') {
          const remaining = findToken(asset.token);
          if (!remaining) throw new Error('图片已上传，但位置标记发生变化，请检查正文。');
          const position = editor.state.doc.resolve(remaining.from);
          const wholeParagraph = position.parent.type.name === 'paragraph' && position.parent.textContent === asset.token;
          editor.commands.deleteRange(wholeParagraph
            ? { from: position.before(), to: position.after() } : remaining);
        }
        imported++;
        $('progress').value = imported;
      }
      if (stopping) {
        restoreRemainingCode();
        status(`已停止，成功插入 ${imported} 张图片；其余代码已保留为文字。请检查正文。`);
      } else {
        $('progress').value = $('progress').max;
        status(`导入完成：${imported} 张图片已按顺序插入。请检查排版、填写标题后发布。`);
      }
    } catch (error) {
      // On timeout the platform may still insert its in-flight image. Do not move
      // selection, retry the upload or delete its marker while that is uncertain.
      status(`导入未完成（已插入 ${imported} 张）：${error.message}\n请先检查平台上传结果，避免立即重新导入产生重复内容。原文与图片仍在文章包中。`);
    } finally {
      complete = true; running = false; $('stop').hidden = true; $('close').disabled = false;
      $('file').disabled = false; updateButton();
    }
  };
  function findToken(token) {
    const matches = [];
    editor.state.doc.descendants((node, pos) => {
      if (!node.isText) return;
      const index = node.text.indexOf(token);
      if (index >= 0) matches.push({ from: pos + index, to: pos + index + token.length });
    });
    return matches.length === 1 ? matches[0] : null;
  }
  function restoreRemainingCode() {
    for (const asset of pack.assets) {
      const range = findToken(asset.token);
      if (!range) continue;
      editor.commands.insertContentAt(range, escapeHtml(asset.source || `[${asset.description}，请从文章包补充]`).replace(/\n/g, '<br>'), { updateSelection: false });
    }
  }
  function waitForImage(token, previousCount) {
    return new Promise((resolve, reject) => {
      let timer, timeout;
      const check = () => {
        if (editor.isDestroyed || !editor.view.dom.isConnected) return finish(new Error('编辑器已关闭。'));
        if (imageCount() > previousCount && (platform === 'xiaohongshu' || !findToken(token))) finish();
      };
      const finish = error => { clearInterval(timer); clearTimeout(timeout); editor.off('update', check); lateObserver = null; error ? reject(error) : resolve(); };
      lateObserver = () => finish(new Error('已结束等待。'));
      editor.on('update', check);
      timer = setInterval(check, 250);
      timeout = setTimeout(() => finish(new Error('图片上传超过两分钟，结果尚不确定。平台可能仍在上传，请核对后再操作。')), 120000);
    });
  }
  function escapeHtml(text) { const p = document.createElement('p'); p.textContent = text; return p.innerHTML; }
  function validate(value) {
    if (value?.format !== 'postbridge-article' || value.version !== 1 || value.platform !== platform) throw new Error('请选择与当前平台一致的文桥文章包。');
    if (typeof value.html !== 'string' || value.html.length > 1000000 || typeof value.title !== 'string' || !Array.isArray(value.assets) || value.assets.length > 100) throw new Error('文章包格式或大小不支持。');
    const doc = new DOMParser().parseFromString(value.html, 'text/html');
    const allowed = new Set(['P','DIV','SPAN','SECTION','H1','H2','H3','H4','H5','H6','UL','OL','LI','BLOCKQUOTE','STRONG','B','EM','I','S','U','BR']);
    for (const node of [...doc.body.querySelectorAll('*')].reverse()) {
      if (!allowed.has(node.tagName)) { node.replaceWith(doc.createTextNode(node.textContent || '')); continue; }
      for (const attr of [...node.attributes]) node.removeAttribute(attr.name);
    }
    const seen = new Set();
    for (const asset of value.assets) {
      if (typeof asset.token !== 'string' || !/^【文桥图片[a-f0-9]{32}_\d+】$/.test(asset.token) || seen.has(asset.token) || typeof asset.dataUrl !== 'string' || !/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/=]+$/.test(asset.dataUrl) || asset.dataUrl.length > 12 * 1024 * 1024 || typeof asset.source !== 'string' || typeof asset.description !== 'string') throw new Error('文章包包含无效图片。');
      if (doc.body.textContent.split(asset.token).length !== 2) throw new Error('图片与正文位置不匹配。');
      seen.add(asset.token);
    }
    return { ...value, html: doc.body.innerHTML };
  }
  updateButton();
})();
