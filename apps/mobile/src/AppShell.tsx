import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar, type TabKey } from './components/BottomTabBar';
import { TaskComposerSheet } from './components/TaskComposerSheet';
import { BossDashboardScreen } from './screens/BossDashboardScreen';
import { OfficeSummaryScreen } from './screens/OfficeSummaryScreen';
import { SectionPlaceholderScreen } from './screens/SectionPlaceholderScreen';
import type { AppPalette } from './theme/palette';

type AppShellProps = {
  palette: AppPalette;
};

const sectionContent: Record<
  Exclude<TabKey, 'tasks'>,
  { title: string; eyebrow: string; description: string; nextStep: string }
> = {
  company: {
    title: '公司',
    eyebrow: '人事与经营',
    description: '员工、工资、资产和扩建会在这里形成完整的公司经营视图。',
    nextStep: '下一切片接入员工目录和虚拟资金账本。',
  },
  reports: {
    title: '汇报',
    eyebrow: '秘书收件箱',
    description: '员工完成的结果会由秘书归纳，不用一个接一个打断你。',
    nextStep: '下一切片接入汇报列表与正式结果页面。',
  },
  profile: {
    title: '我的',
    eyebrow: '账号与偏好',
    description: '订阅、算力、通知、隐私和减少动态效果会集中在这里。',
    nextStep: '正式账号体系接入前，这里只保留结构占位。',
  },
};

export function AppShell({ palette }: AppShellProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('tasks');
  const [isOfficeOpen, setIsOfficeOpen] = useState(false);
  const [isTaskComposerOpen, setIsTaskComposerOpen] = useState(false);
  const [localTaskTitle, setLocalTaskTitle] = useState<string>();

  if (isOfficeOpen) {
    return (
      <OfficeSummaryScreen
        bottomInset={insets.bottom}
        onClose={() => setIsOfficeOpen(false)}
        palette={palette}
        topInset={insets.top}
      />
    );
  }

  const content =
    activeTab === 'tasks' ? (
      <BossDashboardScreen
        bottomInset={insets.bottom + 76}
        localTaskTitle={localTaskTitle}
        onCreateTask={() => setIsTaskComposerOpen(true)}
        onOpenOffice={() => setIsOfficeOpen(true)}
        palette={palette}
        topInset={insets.top}
      />
    ) : (
      <SectionPlaceholderScreen
        bottomInset={insets.bottom + 76}
        content={sectionContent[activeTab]}
        palette={palette}
        topInset={insets.top}
      />
    );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {content}
      <BottomTabBar
        activeTab={activeTab}
        bottomInset={insets.bottom}
        onChange={setActiveTab}
        palette={palette}
      />
      <TaskComposerSheet
        onClose={() => setIsTaskComposerOpen(false)}
        onSubmit={title => {
          setLocalTaskTitle(title);
          setIsTaskComposerOpen(false);
        }}
        palette={palette}
        visible={isTaskComposerOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
