# ZenReader - Chrome 阅读器插件

## 概述

一个 Chrome 浏览器插件，使用 Readability.js 提取文章内容，通过 Shadow DOM 隔离样式，提供预设主题切换功能，实现极致的阅读体验。

---

## 使用场景

在阅读网页时，页面有许多广告或无关内容影响阅读体验。通过插件一键清理这些东西，只保留文章内容主体以达到极致的阅读体验，同时支持切换背景颜色以便更好地阅读。

---

## 功能需求

### 核心功能
- **一键清理**: 使用 Readability.js 自动剔除广告、侧边栏、导航栏，提取文章正文
- **视觉隔离**: 使用 Shadow DOM 隔离 CSS，防止原网站样式影响阅读器
- **主题切换**: 提供多种预设背景主题供用户选择
- **持久化**: 记住用户上次使用的主题设置

### 用户交互
- 通过点击 Popup 界面按钮 开启/关闭阅读模式
- 通过 Popup 界面切换阅读主题

---

## 技术架构

* **Manifest V3**: Chrome 扩展配置文件
* **Readability.js**: 从 Mozilla CDN 下载保存在本地，提取网页文章内容
* **Shadow DOM**: 创建样式隔离的阅读容器
* **chrome.storage.local**: 用户偏好持久化存储

---

## 数据流

```javascript
用户点击 '开启阅读模式' 按钮
    ↓
Background Script 发送消息
    ↓
Content Script 接收消息
    ↓
Readability.js 提取内容
    ↓
创建 Shadow DOM 并渲染
    ↓
用户通过 Popup 切换主题
    ↓
Popup 发送消息到 Content Script
    ↓
Content Script 更新 CSS 变量
    ↓
保存设置到 chrome.storage.local
```

## 项目结构

```javascript
项目根目录/
├── manifest.json             # Manifest V3 配置文件
├── background/
│   └── background.js         # Background Script（消息中转）
├── content/
│   ├── content.js            # Content Script（主逻辑）
│   └── readability.js        # Readability.js 库（CDN引入的本地副本）
├── popup/
│   ├── popup.html            # Popup 界面
│   ├── popup.js              # Popup 逻辑
│   └── popup.css             # Popup 样式
├── styles/
│   └── reader.css            # 阅读器样式（Shadow DOM内使用）
└── icons/
    └── icon-*.png            # 插件图标
```
