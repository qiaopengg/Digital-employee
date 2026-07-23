# 数字员工 Mobile

阶段 0A 的 React Native 单客户端，用于验证 iPhone 与 Android 上的业务壳、
轻量分层 2D 办公室、任务交互和原生结果页面。项目不使用第二场景运行时。

## 当前能力

- Apple 风格办公室首页，支持深浅色、安全区和文字缩放；
- “办公室、任务、公司、汇报、我的”五个稳定顶层入口，默认进入办公室；
- 固定镜头的分层 2D 办公室，包含老板办公室、正式工位、预留空工位、休息区和会议室；
- 工位间单向交接：提交人正向行走到审核人工位，审核人接收后立即回座审核；
- 办公室内以独立“新任务”按钮和可收起的秘书工作台承载主要操作与导航；
- 新建任务 Sheet，可选择快速、标准或深度模式；
- 当前提交只形成会话内本地验证任务，不调用 AI 或产生虚拟收入；
- iOS 15.1+，React Native New Architecture 与 Hermes。

## 当前架构边界

- 任务、AI、人事、时间、权益和账务最终以服务端事实为准；
- 办公室只消费语义槽位、场景快照和视觉意图，不推进业务状态；
- 正式结果、文件、支付、长文和无障碍入口由 React Native 页面承担；
- Reanimated 4.5.3 / Worklets 0.11.1 驱动 UI 线程中的人物根运动和步态；
- Skia 2.9.1 已完成依赖锁定，角色 Atlas 接入仍需通过双平台原生构建和压力 Gate；
- 人物热区、状态图标、工作气泡和无障碍语义继续由 React Native 原生层承担。

## 固定版本

- Node.js 24.18.0（见 `.nvmrc`）
- React Native 0.86.0
- Ruby 4.0.6（见 `.ruby-version`）
- Xcode 26.6 / iOS 26.5 Simulator

## 首次安装

```sh
nvm use
npm install

export PATH="/opt/homebrew/opt/ruby/bin:/opt/homebrew/bin:$PATH"
bundle install
cd ios
bundle exec pod install
cd ..
```

仓库父目录包含中文。React Native 0.86 的 Hermes podspec 与 CocoaPods 在这种路径下存在编码冲突，`ios/Podfile` 已集中把 CocoaPods 命令输出规范为 UTF-8；不要改写 `node_modules` 规避该问题。

## 在 iPhone 模拟器预览

先启动 Metro：

```sh
npm start
```

另开一个终端：

```sh
npm run ios -- --simulator "iPhone 17 Pro"
```

也可以打开 `ios/DigitalEmployee.xcworkspace`，选择 iPhone 模拟器后运行。必须打开 `.xcworkspace`，不要打开 `.xcodeproj`。

## 验证

```sh
npm run typecheck
npm run lint -- --max-warnings=0
npm run test:ci
npm audit --audit-level=moderate
```

当前 Bundle ID `com.digitalemployee.prototype` 仅用于 PoC。确定开发者域名与 App Store 标识后再冻结正式 Bundle ID。
