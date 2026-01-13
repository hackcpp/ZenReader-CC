// Content Script - 核心逻辑：提取内容、创建阅读器

(function() {
  'use strict';

  // 阅读器状态
  let isReaderActive = false;
  let readerContainer = null;
  let originalBodyStyle = '';
  let originalHtmlStyle = '';

  // 用户设置
  let settings = {
    theme: 'white'
  };

  // 主题配置
  const themeConfig = {
    white: { bg: '#FFFFFF', text: '#333333', link: '#0066CC' },
    sepia: { bg: '#F5F5DC', text: '#2C2C2C', link: '#5D4E37' },
    dark: { bg: '#1E1E1E', text: '#E0E0E0', link: '#64B5F6' },
    green: { bg: '#C7EDCC', text: '#2C2C2C', link: '#2E7D32' }
  };

  // 初始化
  async function init() {
    // 加载保存的设置
    const saved = await chrome.storage.local.get(['theme']);
    if (saved.theme) settings.theme = saved.theme;

    // 监听来自 Popup 和 Background 的消息
    chrome.runtime.onMessage.addListener(handleMessage);
  }

  // 处理消息
  function handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'toggleReader':
        toggleReaderMode();
        sendResponse({ success: true, isActive: isReaderActive });
        break;
      case 'setTheme':
        setTheme(message.theme);
        sendResponse({ success: true });
        break;
      case 'getState':
        sendResponse({ isActive: isReaderActive });
        break;
    }
    return true;
  }

  // 切换阅读模式
  async function toggleReaderMode() {
    if (isReaderActive) {
      exitReaderMode();
    } else {
      await enterReaderMode();
    }
  }

  // 进入阅读模式
  async function enterReaderMode() {
    try {
      // 先保存原始样式（必须在修改任何样式之前）
      originalBodyStyle = document.body.style.cssText;
      originalHtmlStyle = document.documentElement.style.cssText;

      // 隐藏原网页的滚动条
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';

      // 提取文章内容
      const article = await extractArticle();
      console.log('提取的文章:', article);

      if (!article) {
        // 即使提取失败也显示阅读器
        console.log('Readability 提取失败，显示原始页面内容');
        createReader({
          title: document.title,
          content: document.body.innerHTML,
          byline: ''
        });
      } else {
        // 创建阅读器容器
        createReader(article);
      }

      isReaderActive = true;

    } catch (error) {
      console.error('进入阅读模式失败:', error);
    }
  }

  // 退出阅读模式
  function exitReaderMode() {
    if (readerContainer) {
      readerContainer.remove();
      readerContainer = null;
    }

    // 恢复原网页样式
    document.body.style.cssText = originalBodyStyle;
    document.documentElement.style.cssText = originalHtmlStyle;

    isReaderActive = false;
  }

  // 使用 Readability 提取文章
  async function extractArticle() {
    try {
      const reader = new Readability(document.cloneNode(true));
      const article = reader.parse();

      if (!article || !article.content) {
        return null;
      }

      return {
        title: article.title || document.title,
        content: article.content,
        byline: article.byline || '',
        excerpt: article.excerpt || ''
      };
    } catch (error) {
      console.error('Readability 解析失败:', error);
      return null;
    }
  }

  // 创建阅读器
  function createReader(article) {
    // 获取当前主题配置
    const theme = themeConfig[settings.theme];
    const selectionBg = settings.theme === 'dark' ? '#1565C0' : '#ffe0b2';
    const selectionText = settings.theme === 'dark' ? '#fff' : '#333';

    // 创建容器
    readerContainer = document.createElement('div');
    readerContainer.id = 'zen-reader-container';

    // 应用外层样式 - 直接在容器上
    readerContainer.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      background-color: ${theme.bg} !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    `;

    // 创建 Shadow DOM
    const shadow = readerContainer.attachShadow({ mode: 'open' });

    // 构建内部 HTML 和样式
    shadow.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .reader-scroll {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          background-color: ${theme.bg};
          color: ${theme.text};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 18px;
          line-height: 1.8;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .reader-container {
          max-width: 680px;
          margin: 0 auto;
          padding: 60px 24px 100px;
          min-height: calc(100vh - 60px);
        }
        .exit-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 50%;
          background: rgba(128, 128, 128, 0.2);
          color: ${theme.text};
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.6;
          transition: all 0.2s ease;
          z-index: 2147483648;
        }
        .exit-btn:hover { opacity: 1; background: rgba(128, 128, 128, 0.3); transform: scale(1.1); }
        .article-header { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid rgba(128, 128, 128, 0.2); }
        .article-title { font-size: 2em; font-weight: 700; line-height: 1.3; margin-bottom: 16px; color: ${theme.text}; }
        .article-meta { font-size: 0.9em; color: rgba(128, 128, 128, 0.8); }
        .article-content { font-size: 1em; }
        .article-content p { margin-bottom: 1.5em; text-align: justify; hyphens: auto; }
        .article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6 {
          margin: 2em 0 0.8em 0; font-weight: 600; line-height: 1.3; color: ${theme.text};
        }
        .article-content h1 { font-size: 1.8em; }
        .article-content h2 { font-size: 1.5em; }
        .article-content h3 { font-size: 1.3em; }
        .article-content a { color: ${theme.link}; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
        .article-content a:hover { border-bottom-color: ${theme.link}; }
        .article-content img { max-width: 100%; height: auto; display: block; margin: 24px auto; border-radius: 8px; }
        .article-content figure { margin: 24px 0; }
        .article-content figcaption { font-size: 0.9em; color: rgba(128, 128, 128, 0.8); text-align: center; margin-top: 8px; }
        .article-content blockquote { margin: 24px 0; padding: 16px 24px; border-left: 4px solid ${theme.link}; background: rgba(128, 128, 128, 0.05); border-radius: 0 8px 8px 0; font-style: italic; }
        .article-content code { font-family: 'SF Mono', 'Fira Code', Consolas, monospace; font-size: 0.9em; background: rgba(128, 128, 128, 0.1); padding: 2px 6px; border-radius: 4px; }
        .article-content pre { background: rgba(128, 128, 128, 0.1); padding: 16px; border-radius: 8px; overflow-x: auto; margin: 24px 0; }
        .article-content pre code { background: none; padding: 0; }
        .article-content ul, .article-content ol { margin: 1.5em 0; padding-left: 2em; }
        .article-content li { margin-bottom: 0.5em; }
        .article-content hr { border: none; border-top: 1px solid rgba(128, 128, 128, 0.2); margin: 32px 0; }
        .article-content table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 0.95em; }
        .article-content th, .article-content td { border: 1px solid rgba(128, 128, 128, 0.2); padding: 12px; text-align: left; }
        .article-content th { background: rgba(128, 128, 128, 0.1); font-weight: 600; }
        ::selection { background: ${selectionBg}; color: ${selectionText}; }
        @media (max-width: 768px) {
          .exit-btn { top: 12px; right: 12px; width: 40px; height: 40px; }
          .article-title { font-size: 1.6em; }
          .reader-container { padding: 24px 16px; }
        }
      </style>
      <div class="reader-scroll" id="reader-scroll">
        <button class="exit-btn" id="exit-btn" title="退出阅读模式">&times;</button>
        <div class="reader-container">
          <article class="reader-article">
            <header class="article-header">
              <h1 class="article-title">${escapeHtml(article.title)}</h1>
              ${article.byline ? `<div class="article-meta">${escapeHtml(article.byline)}</div>` : ''}
            </header>
            <div class="article-content">${article.content}</div>
          </article>
        </div>
      </div>
    `;

    // 绑定退出按钮事件
    const exitBtn = shadow.getElementById('exit-btn');
    exitBtn.addEventListener('click', exitReaderMode);

    // 注入到页面
    document.body.appendChild(readerContainer);
    console.log('阅读器容器已添加到页面:', readerContainer.id);
  }

  // 设置主题
  function setTheme(theme) {
    if (!themeConfig[theme]) return;

    settings.theme = theme;

    // 保存到存储
    chrome.storage.local.set({ theme: theme });

    // 如果阅读器已激活，重新创建
    if (isReaderActive && readerContainer) {
      const currentArticle = {
        title: readerContainer.shadowRoot.querySelector('.article-title')?.textContent || '',
        content: readerContainer.shadowRoot.querySelector('.article-content')?.innerHTML || '',
        byline: readerContainer.shadowRoot.querySelector('.article-meta')?.textContent || ''
      };
      readerContainer.remove();
      createReader(currentArticle);
    }
  }

  // HTML 转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 启动
  init();
})();
