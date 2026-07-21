import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OfficePreviewCard } from '../components/OfficePreviewCard';
import type { AppPalette } from '../theme/palette';

type BossDashboardScreenProps = {
  bottomInset: number;
  localTaskTitle?: string;
  onCreateTask: () => void;
  onOpenOffice: () => void;
  palette: AppPalette;
  topInset: number;
};

const metrics = [
  { label: '今日到岗', value: '2 / 2' },
  { label: '进行中', value: '1' },
  { label: '待你处理', value: '1' },
];

const taskUpdates = [
  {
    title: '新品发布方案',
    detail: '林策正在梳理目标用户与发布节奏',
    status: '正在工作',
  },
  {
    title: '公司介绍初稿',
    detail: '小岚整理好了两个版本，等你选择语气',
    status: '等你确认',
  },
];

function getGreeting(hour: number) {
  if (hour < 11) {
    return '早上好，老板';
  }
  if (hour < 18) {
    return '下午好，老板';
  }
  return '晚上好，老板';
}

export function BossDashboardScreen({
  bottomInset,
  localTaskTitle,
  onCreateTask,
  onOpenOffice,
  palette,
  topInset,
}: BossDashboardScreenProps) {
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(now);
  const visibleTaskUpdates = localTaskTitle
    ? [
        {
          title: localTaskTitle,
          detail: '已保存在本次 App 会话中，尚未发送给 AI',
          status: '本地验证',
        },
        ...taskUpdates,
      ]
    : taskUpdates;

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomInset, paddingTop: topInset + 12 },
      ]}
      style={{ backgroundColor: palette.background }}
    >
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={[styles.date, { color: palette.secondaryText }]}>
            {dateLabel}
          </Text>
          <Text style={[styles.greeting, { color: palette.primaryText }]}>
            {getGreeting(now.getHours())}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="新建任务"
          accessibilityRole="button"
          onPress={onCreateTask}
          style={({ pressed }) => [
            styles.newTaskButton,
            { backgroundColor: palette.accent },
            pressed ? styles.pressed : undefined,
          ]}
        >
          <Text style={styles.newTaskButtonText}>新建任务</Text>
        </Pressable>
      </View>

      <View style={styles.metricRow}>
        {metrics.map(metric => (
          <View
            key={metric.label}
            style={[styles.metric, { backgroundColor: palette.card }]}
          >
            <Text style={[styles.metricValue, { color: palette.primaryText }]}>
              {metric.value}
            </Text>
            <Text
              style={[styles.metricLabel, { color: palette.secondaryText }]}
            >
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      <OfficePreviewCard onPress={onOpenOffice} palette={palette} />

      <View style={[styles.secretaryCard, { backgroundColor: palette.card }]}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.avatar, { backgroundColor: palette.secretarySoft }]}
        >
          <Text style={[styles.avatarText, { color: palette.secretary }]}>
            岚
          </Text>
        </View>
        <View style={styles.secretaryCopy}>
          <Text style={[styles.sectionEyebrow, { color: palette.secretary }]}>
            秘书简报
          </Text>
          <Text style={[styles.secretaryTitle, { color: palette.primaryText }]}>
            今天不算忙，但有一件事需要你拍板
          </Text>
          <Text
            style={[styles.secretaryBody, { color: palette.secondaryText }]}
          >
            “公司介绍初稿”已经准备好两个语气版本。你选定后，我就让林策继续收尾。
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: palette.primaryText }]}>
          任务动态
        </Text>
        <Text style={[styles.sectionCount, { color: palette.secondaryText }]}>
          {visibleTaskUpdates.length} 项
        </Text>
      </View>

      <View style={[styles.list, { backgroundColor: palette.card }]}>
        {visibleTaskUpdates.map((task, index) => (
          <View
            key={task.title}
            style={[
              styles.taskRow,
              index > 0
                ? {
                    borderTopColor: palette.separator,
                    borderTopWidth: StyleSheet.hairlineWidth,
                  }
                : undefined,
            ]}
          >
            <View style={styles.taskCopy}>
              <Text style={[styles.taskTitle, { color: palette.primaryText }]}>
                {task.title}
              </Text>
              <Text
                style={[styles.taskDetail, { color: palette.secondaryText }]}
              >
                {task.detail}
              </Text>
            </View>
            <Text style={[styles.taskStatus, { color: palette.accent }]}>
              {task.status}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.balanceCard, { backgroundColor: palette.card }]}>
        <View>
          <Text style={[styles.balanceLabel, { color: palette.secondaryText }]}>
            公司虚拟余额
          </Text>
          <Text style={[styles.balanceValue, { color: palette.primaryText }]}>
            ¥ 12,480
          </Text>
        </View>
        <View
          style={[styles.profitPill, { backgroundColor: palette.successSoft }]}
        >
          <Text style={[styles.profitText, { color: palette.success }]}>
            本周 +¥ 1,280
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 16,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleCopy: {
    flex: 1,
    paddingRight: 12,
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 3,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  newTaskButton: {
    alignItems: 'center',
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  newTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metric: {
    borderRadius: 16,
    flex: 1,
    minHeight: 78,
    padding: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
  },
  secretaryCard: {
    borderRadius: 18,
    flexDirection: 'row',
    padding: 16,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '800',
  },
  secretaryCopy: {
    flex: 1,
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  secretaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  secretaryBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  taskRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginLeft: 16,
    minHeight: 86,
    paddingBottom: 14,
    paddingRight: 16,
    paddingTop: 14,
  },
  taskCopy: {
    flex: 1,
    paddingRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskDetail: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '700',
    paddingTop: 2,
  },
  balanceCard: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  profitPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  profitText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
