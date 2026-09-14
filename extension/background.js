chrome.action.onClicked.addListener(async tab => {
  const url = new URL(tab.url || 'about:blank');
  if (!['creator.xiaohongshu.com', 'creator.douyin.com'].includes(url.hostname) || url.protocol !== 'https:') {
    await chrome.action.setBadgeText({ tabId: tab.id, text: '平台' });
    await chrome.action.setTitle({ tabId: tab.id, title: '请先打开小红书或抖音的长文编辑器' });
    return;
  }
  try {
    await chrome.action.setBadgeText({ tabId: tab.id, text: '' });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN', files: ['importer.js'] });
  } catch {
    await chrome.action.setBadgeText({ tabId: tab.id, text: '重试' });
    await chrome.action.setTitle({ tabId: tab.id, title: '无法连接编辑器，请刷新平台页面后重试' });
  }
});
