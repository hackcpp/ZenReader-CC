// Background Service Worker - 消息中转
chrome.runtime.onInstalled.addListener(() => {
  console.log('ZenReader extension installed');
});

// 监听来自 Content Script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'readerStateChanged') {
    // 可以在这里处理状态变化，如更新图标状态等
    sendResponse({ success: true });
  }
  return true;
});
