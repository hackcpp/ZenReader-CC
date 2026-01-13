// Popup Script - 处理用户界面交互和消息传递

// 默认设置
const defaultSettings = {
  theme: 'white'
};

// 主题配置
const themes = {
  white: { bg: '#ffffff', text: '#333333' },
  sepia: { bg: '#F5F5DC', text: '#2C2C2C' },
  dark: { bg: '#1E1E1E', text: '#E0E0E0' },
  green: { bg: '#C7EDCC', text: '#2C2C2C' }
};

// DOM 元素
const themeButtons = document.querySelectorAll('.theme-btn');
const readerToggle = document.getElementById('reader-toggle');
const statusEl = document.getElementById('status');

// 当前设置
let currentSettings = { ...defaultSettings };
let isReaderActive = false;

// 初始化
async function init() {
  // 加载保存的设置
  const saved = await chrome.storage.local.get(['theme']);
  if (saved.theme) currentSettings.theme = saved.theme;

  // 更新UI
  updateThemeUI();

  // 检查当前页面阅读模式状态
  checkReaderState();

  // 绑定事件
  bindEvents();
}

// 检查阅读模式状态
async function checkReaderState() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getState' });
      if (response && response.isActive) {
        isReaderActive = true;
        updateToggleButton();
      }
    }
  } catch (e) {
    console.log('检查状态失败:', e);
  }
}

// 绑定事件
function bindEvents() {
  // 主题切换
  themeButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const theme = btn.dataset.theme;
      await setTheme(theme);
    });
  });

  // 阅读模式切换
  readerToggle.addEventListener('click', toggleReaderMode);
}

// 设置主题
async function setTheme(theme) {
  currentSettings.theme = theme;
  await chrome.storage.local.set({ theme });

  updateThemeUI();

  // 发送消息到 content script
  await sendMessage({ action: 'setTheme', theme });
}

// 更新主题UI
function updateThemeUI() {
  themeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === currentSettings.theme);
  });
}

// 切换阅读模式
async function toggleReaderMode() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    showStatus('无法获取标签页', 'error');
    return;
  }

  console.log('发送 toggleReader 消息到标签页:', tab.id);

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggleReader' });
    console.log('收到响应:', response);

    if (response && response.success) {
      isReaderActive = !isReaderActive;
      updateToggleButton();
      showStatus(isReaderActive ? '已开启阅读模式' : '已退出阅读模式', 'success');
    } else {
      showStatus('操作失败', 'error');
    }
  } catch (e) {
    console.error('发送消息失败:', e);
    showStatus('无法连接到页面: ' + e.message, 'error');
  }
}

// 更新切换按钮状态
function updateToggleButton() {
  readerToggle.textContent = isReaderActive ? '退出阅读模式' : '开启阅读模式';
  readerToggle.classList.toggle('enabled', isReaderActive);
  readerToggle.classList.toggle('disabled', !isReaderActive);
}

// 发送消息到 content script
async function sendMessage(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, message);
    } catch (e) {
      console.log('发送消息失败:', e);
    }
  }
}

// 显示状态消息
function showStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = 'status ' + type;
  statusEl.style.display = 'block';

  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 2000);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init);
