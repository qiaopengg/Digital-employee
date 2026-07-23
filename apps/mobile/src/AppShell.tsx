import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar, type TabKey } from './components/BottomTabBar';
import { TaskComposerSheet } from './components/TaskComposerSheet';
import { TaskResultSheet } from './components/TaskResultSheet';
import { DEFAULT_WORK_SCHEDULE } from './office/officeScheduleModel';
import type { WorkSchedule } from './office/officeScheduleModel';
import { OfficeSummaryScreen } from './screens/OfficeSummaryScreen';
import { OfficeWorkspaceScreen } from './screens/OfficeWorkspaceScreen';
import { SectionPlaceholderScreen } from './screens/SectionPlaceholderScreen';
import { submitAiTask } from './tasks/aiTaskClient';
import type { AiTaskExecution, TaskMode } from './tasks/taskTypes';
import type { AppPalette } from './theme/palette';

type AppShellProps = {
  palette: AppPalette;
};

const sectionContent: Record<
  Exclude<TabKey, 'office'>,
  { title: string; eyebrow: string; description: string; nextStep: string }
> = {
  tasks: {
    title: '任务',
    eyebrow: '真实工作队列',
    description: '进行中、待补充、已完成和失败任务会在这里统一管理。',
    nextStep: '下一切片接入权威任务状态、筛选和恢复入口。',
  },
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
  const [activeTab, setActiveTab] = useState<TabKey>('office');
  const [isOfficeOpen, setIsOfficeOpen] = useState(false);
  const [isTaskComposerOpen, setIsTaskComposerOpen] = useState(false);
  const [isTaskResultOpen, setIsTaskResultOpen] = useState(false);
  const [task, setTask] = useState<AiTaskExecution>();
  const [workSchedule, setWorkSchedule] =
    useState<WorkSchedule>(DEFAULT_WORK_SCHEDULE);

  const submitTask = async (prompt: string, mode: TaskMode) => {
    const localId = `task-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const workingTask: AiTaskExecution = {
      localId,
      mode,
      prompt,
      status: 'working',
    };

    setTask(workingTask);
    setActiveTab('office');
    setIsTaskComposerOpen(false);

    try {
      const completedTask = await submitAiTask({ localId, mode, prompt });
      setTask(current =>
        current?.localId === localId ? completedTask : current,
      );
    } catch (error) {
      setTask(current =>
        current?.localId === localId
          ? {
              ...current,
              error:
                error instanceof Error
                  ? error.message
                  : '任务服务暂时无法连接。',
              status: 'failed',
            }
          : current,
      );
    }
  };

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
    activeTab === 'office' ? (
      <OfficeWorkspaceScreen
        bottomInset={insets.bottom}
        onCreateTask={() => setIsTaskComposerOpen(true)}
        onNavigate={setActiveTab}
        onOpenEquivalentList={() => setIsOfficeOpen(true)}
        onOpenTaskResult={() => setIsTaskResultOpen(true)}
        palette={palette}
        task={task}
        topInset={insets.top}
        workSchedule={workSchedule}
        onWorkScheduleChange={setWorkSchedule}
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
      {activeTab === 'office' ? undefined : (
        <BottomTabBar
          activeTab={activeTab}
          bottomInset={insets.bottom}
          onChange={setActiveTab}
          palette={palette}
        />
      )}
      <TaskComposerSheet
        onClose={() => setIsTaskComposerOpen(false)}
        onSubmit={submitTask}
        palette={palette}
        visible={isTaskComposerOpen}
      />
      <TaskResultSheet
        onClose={() => setIsTaskResultOpen(false)}
        palette={palette}
        task={task}
        visible={isTaskResultOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
