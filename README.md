# Ocean World - 动态海洋世界动画库

Ocean World 是一个基于 TypeScript 和 HTML5 Canvas 开发的动态海洋世界动画库。它能够创建逼真的海洋场景，包含游动的鲨鱼、动态海浪、上升气泡等效果，为用户提供沉浸式的海洋视觉体验。

## 核心特性
#### 🦈 智能鲨鱼系统
- 逼真的鲨鱼外观：精心设计的矢量图形，包含身体、尾巴、背鳍、胸鳍等细节

- 智能行为模式：

  - 鼠标/触摸跟随：鲨鱼会跟随用户指针移动

  - 自主游动：鼠标离开时自动随机游动

  - 边界检测：不会游出画布范围

- 可配置属性：数量、大小、速度、颜色等

#### 🌊 动态海洋环境
- 多层海浪效果：可配置的海浪层数和颜色

- 渐变背景：自定义海洋深度渐变色彩

- 气泡系统：上升的气泡动画，可开关控制

#### 🎨 高度可定制
- 丰富的配置选项：所有视觉元素均可自定义

- 响应式设计：自动适应容器尺寸变化

- TypeScript 支持：完整的类型定义和智能提示

#### 📱 多设备支持
- 触摸交互：完美支持移动设备触摸操作

- 性能优化：流畅的动画性能，60fps 运行

- 无依赖：纯原生 JavaScript/TypeScript 实现

## 快速开始

#### 安装
``` bash
npm install ocean-world
# 或
yarn add ocean-world
```
#### 基本用法

```typescript
import { OceanWorld } from 'ocean-world';

// 创建海洋世界实例
const ocean = new OceanWorld('canvasId', {
    sharkCount: 3,
    sharkSize: 50,
    waveCount: 4,
    enableBubbles: true
});

```
#### 高级配置

```typescript

const ocean = new OceanWorld('canvasId', {
    // 鲨鱼配置
    sharkCount: 5,
    sharkSize: 60,
    sharkSpeed: 4,
    autoMoveInterval: 5000,
    
    // 海洋环境
    waveCount: 5,
    bubbleCount: 40,
    waterLevel: 0.3,
    enableBubbles: true,
    
    // 视觉样式
    enableBackground: true,
    backgroundGradient: {
        colors: ['#000033', '#0066cc', '#00ccff'],
        stops: [0, 0.3, 1]
    },
    waveColors: [
        'rgba(30, 144, 255, 0.7)',
        'rgba(0, 191, 255, 0.6)',
        'rgba(135, 206, 250, 0.5)'
    ]
});
```

## API 参考
#### 核心方法
- start() - 开始动画

- stop() - 停止动画

- addShark() - 添加鲨鱼

- removeShark() - 移除鲨鱼

- toggleBubbles() - 切换气泡显示

- reset() - 重置海洋世界

- destroy() - 销毁实例

#### 配置方法

- updateConfig() - 更新配置

- setWaveColors() - 设置海浪颜色

- setBackgroundGradient() - 设置背景渐变

- changeSharkSpeed() - 改变鲨鱼速度

## 应用场景
#### 🎯 网页背景
为网站创建生动的海洋主题背景，提升用户体验

#### 🎮 交互展示
用于产品演示、教育展示等需要吸引用户注意力的场景

#### 📊 数据可视化
作为数据仪表板的动态背景，增加视觉吸引力

#### 🎨 创意项目
艺术创作、游戏开发、互动装置等创意项目

## 技术特点
- <strong>模块化设计：</strong>清晰的代码结构，易于扩展和维护

- <strong>类型安全：</strong>完整的 TypeScript 类型定义

- <strong>性能优异：</strong>优化的 Canvas 渲染和动画循环

- <strong>跨平台：</strong>支持所有现代浏览器和移动设备

- <strong>易于集成：</strong>简单的 API 设计，快速上手

## 浏览器支持
- Chrome 60+

- Firefox 55+

- Safari 12+

- Edge 79+

## 许可证
MIT License - 可自由用于个人和商业项目

#### Ocean World 让您轻松创建令人惊叹的海洋动画效果，为您的项目注入生机与活力！🌊🦈✨


## Development

- Install dependencies:

```bash
npm install
```

- Run the unit tests:

```bash
npm run test
```

- Build the library:

```bash
npm run build
```
