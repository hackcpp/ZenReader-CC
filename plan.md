---
name: Chrome阅读器插件开发
overview: 创建一个Chrome浏览器插件，使用Readability.js提取文章内容，通过Shadow DOM隔离样式，提供预设主题切换功能，实现极致的阅读体验。
todos:
  - id: create_structure
    content: 创建项目目录结构和基础文件（manifest.json、各模块文件夹）
    status: pending
  - id: implement_manifest
    content: 实现 manifest.json（Manifest V3），配置权限、Background、Content Script 和 Popup
    status: pending
  - id: implement_background
    content: 实现 Background Script，处理插件消息转发
    status: pending
  - id: integrate_readability
    content: 在 Content Script 中集成 Readability.js（CDN 或本地），实现文章内容提取
    status: pending
  - id: implement_shadow_dom
    content: 实现 Shadow DOM 阅读器，创建隔离的阅读界面并注入样式
    status: pending
  - id: implement_popup
    content: 实现 Popup 界面（HTML/CSS/JS），包含主题切换按钮
    status: pending
  - id: implement_theme_switching
    content: 实现主题切换功能，通过消息传递更新 Shadow DOM 的 CSS 变量
    status: pending
  - id: implement_storage
    content: 实现设置持久化，使用 chrome.storage.local 保存和恢复用户偏好
    status: pending
  - id: implement_exit_mode
    content: 实现退出阅读模式功能，恢复原网页显示
    status: pending
  - id: polish_ui
    content: 优化阅读器样式和 Popup 界面，提升用户体验
    status: pending
---

# Chrome阅读器插件开发计划

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



## 核心实现

### 1. Manifest V3 配置 (`manifest.json`)

- 配置权限：`activeTab`、`storage`
- 注册 Background Service Worker
- 注册 Content Script（匹配所有网页）
- 配置 Action Popup

### 2. Background Script (`background/background.js`)

- 监听插件图标点击事件
- 向当前活动标签页的 Content Script 发送消息
- 处理来自 Content Script 的响应

### 3. Content Script (`content/content.js`)

**核心功能：**

- 监听来自 Background 的消息
- 动态加载 Readability.js（从 CDN 或本地文件）
- 调用 Readability.js 提取文章内容（标题、正文HTML）
- 创建 Shadow DOM 容器
- 注入阅读器 HTML 模板
- 隐藏原网页 body 内容
- 监听来自 Popup 的主题切换消息
- 通过 CSS 变量动态更新 Shadow DOM 样式

**关键实现点：**

- 使用 `document.createElement('div')` 创建容器
- 使用 `attachShadow({ mode: 'open' })` 创建 Shadow Root
- 通过 `chrome.runtime.sendMessage` 与 Popup 通信

### 4. Popup 界面 (`popup/popup.html`, `popup/popup.js`)

**功能：**

- 显示预设主题按钮（白色、米色、深色、护眼绿）
- 显示字号调节滑块
- 显示"退出/开启阅读模式"按钮
- 使用 `chrome.storage.local` 保存用户偏好
- 页面加载时恢复上次设置

### 5. 阅读器样式 (`styles/reader.css`)

- 定义 CSS 变量：`--bg-color`、`--text-color`、`--font-size`
- 响应式布局设计
- 优雅的排版样式（行高、字间距、页边距）

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


## 技术要点

1. **Readability.js 集成**：从 Mozilla CDN 动态加载，或打包为本地文件
2. **Shadow DOM 隔离**：确保阅读器样式不受原网页影响
3. **消息传递**：Background ↔ Content Script ↔ Popup 三方通信
4. **状态管理**：使用 chrome.storage.local 持久化用户设置
5. **优雅降级**：如果 Readability.js 提取失败，显示友好提示

## 预设主题配置

- **白色主题**：`#FFFFFF` 背景，`#333333` 文字
- **米色主题**：`#F5F5DC` 背景，`#2C2C2C` 文字
- **深色主题**：`#1E1E1E` 背景，`#E0E0E0` 文字
- **护眼绿主题**：`#C7EDCC` 背景，`#2C2C2C` 文字

## 待实现功能清单

1. ✅ 创建项目基础结构
2. ✅ 实现 manifest.json（Manifest V3）
3. ✅ 实现 Background Script
4. ✅ 实现 Content Script（Readability.js 集成）
5. ✅ 实现 Shadow DOM 阅读器渲染
6. ✅ 实现 Popup 界面和逻辑
7. ✅ 实现主题切换功能