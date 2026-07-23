import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import App from '../App';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

async function renderApp() {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  if (!renderer) {
    throw new Error('App did not render');
  }

  return renderer;
}

test('renders the office home by default', async () => {
  const renderer = await renderApp();
  const output = JSON.stringify(renderer.toJSON());

  expect(output).toContain('标准公司楼层');
  expect(output).toContain('新品发布方案');
  expect(output).toContain('预留工位 A');
  expect(output).toContain('休息中');
  expect(output).not.toContain('林策：结构和风险项已标注');
});

test('opens the accessible scene equivalent list and returns', async () => {
  const renderer = await renderApp();

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '打开秘书工作台' })
      .props.onPress();
  });

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '场景列表' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('场景等价入口');

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '返回办公室' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('新品发布方案');
});

test('opens employee and asset interaction sheets', async () => {
  const renderer = await renderApp();

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '沈言，内容员工，休息中' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('仍可正常派发新任务');

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '关闭详情' })
      .props.onPress();
    renderer.root
      .findByProps({ accessibilityLabel: '查看咖啡机资产' })
      .props.onPress();
  });

  const output = JSON.stringify(renderer.toJSON());
  expect(output).toContain('已购置 · 使用中');
  expect(output).toContain('折旧');
  expect(output).toContain('出售或搬迁');

  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ accessibilityLabel: '出售' }).props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('确认出售 ¥680');

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '确认出售 ¥680' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('已出售 · 槽位空闲');
});

test('queues the visible employee handoff animation', async () => {
  const renderer = await renderApp();

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '查看交接任务' })
      .props.onPress();
  });

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '开始交接演示' })
      .props.onPress();
  });

  const output = JSON.stringify(renderer.toJSON());
  expect(output).toContain('新品发布方案');
  expect(output).not.toContain('真实交接事件');
});

test('switches between top-level sections', async () => {
  const renderer = await renderApp();

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '打开秘书工作台' })
      .props.onPress();
  });

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '打开任务' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('真实工作队列');

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '公司标签' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('人事与经营');
});

test('creates an honest local validation task', async () => {
  const renderer = await renderApp();

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '新建任务' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('交代一项任务');

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '任务目标' })
      .props.onChangeText('整理一份周会提纲');
  });

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '保存本地验证任务' })
      .props.onPress();
  });

  const output = JSON.stringify(renderer.toJSON());
  expect(output).toContain('整理一份周会提纲');
  expect(output).toContain('尚未发送给 AI');
});
