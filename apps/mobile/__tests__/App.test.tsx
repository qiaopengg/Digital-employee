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

test('renders the boss dashboard', async () => {
  const renderer = await renderApp();
  const output = JSON.stringify(renderer.toJSON());

  expect(output).toContain('老板');
  expect(output).toContain('公司正在运转');
  expect(output).toContain('秘书简报');
});

test('opens the accessible office summary and returns', async () => {
  const renderer = await renderApp();

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '查看办公室摘要' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('非 3D 等价入口');

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: '返回老板工作台' })
      .props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('秘书简报');
});

test('switches between top-level sections', async () => {
  const renderer = await renderApp();

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
