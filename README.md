# 数字员工

“数字员工”是一个以真实 AI 任务为生产力核心、以虚拟公司和员工为持续表达的
移动产品。当前阶段只维护一个 React Native 客户端，并以轻量分层 2D 办公室
作为默认场景方案。

## 当前基线

- 客户端：React Native 0.86.x、TypeScript、New Architecture、Hermes；
- 办公室：`View` / `Image` / `Pressable` 分层渲染，语义槽位与预设路径；
- 动画：在 Gate 0A 中验证并锁定 Reanimated 与 Gesture Handler；
- 条件优化：普通 RN 压力 Gate 失败后，才评估 Skia Atlas 角色层；
- 服务端：模块化单体、Temporal 耐久流程、PostgreSQL 权威事实；
- AI：平台托管多供应商、调用前成本预占、正式成果与人格汇报分离。

旧 Unity / 双运行时方案已经废弃，不属于当前方案、备用方案或低端方案。

## 文档权威顺序

1. [需求设计](./需求设计.md)：产品原则、范围与验收；
2. [技术设计](./技术设计.md)：客户端、服务端、数据流与工程门槛；
3. [技术调研与决策闭环](./技术调研与决策闭环.md)：选型依据与退出条件；
4. [项目落地风险与验证计划](./项目落地风险与验证计划.md)：Gate、停止条件与发布边界；
5. [UI 设计规范与全页面清单](./UI设计规范与全页面清单.md)：信息架构、视觉和无障碍基线。

发生冲突时，以用户最新明确决定和《需求设计》的文档治理规则为准。

## 当前实现

React Native 原型位于 [`apps/mobile`](./apps/mobile)。当前只验证业务壳、五项
顶级导航、办公室入口、场景等价列表和本地任务交互；尚未连接生产 AI、IAP、
云端任务、虚拟结算或正式 2D 资源流水线。

```sh
cd apps/mobile
npm install
npm run typecheck
npm run lint -- --max-warnings=0
npm run test:ci
```

开始任何横向 P0 开发前，必须先通过风险计划定义的对应 Gate。
