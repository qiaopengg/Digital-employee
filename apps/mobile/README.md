# 数字员工 Mobile

阶段 0A 的 React Native 客户端，用于先验证 iPhone 上的业务壳、办公室入口、任务交互和后续 Unity 全屏集成边界。

## 当前能力

- Apple 风格老板工作台，支持深浅色、安全区和文字缩放；
- “任务、公司、汇报、我的”四个稳定顶层入口；
- 非 3D 办公室摘要，可查看员工与任务的真实状态投影；
- 新建任务 Sheet，可选择快速、标准或深度模式；
- 当前提交只形成会话内本地验证任务，不调用 AI 或产生虚拟收入；
- iOS 15.1+，React Native New Architecture 与 Hermes。

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
