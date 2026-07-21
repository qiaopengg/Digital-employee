import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';

type OfficeSummaryScreenProps = {
  bottomInset: number;
  onClose: () => void;
  palette: AppPalette;
  topInset: number;
};

const employees = [
  {
    name: '林策',
    role: '策略负责人',
    status: '正在梳理新品发布方案',
    tone: 'working',
  },
  {
    name: '小岚',
    role: '老板秘书',
    status: '正在整理今天的待办',
    tone: 'available',
  },
] as const;

export function OfficeSummaryScreen({
  bottomInset,
  onClose,
  palette,
  topInset,
}: OfficeSummaryScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomInset + 24, paddingTop: topInset + 8 },
      ]}
      style={{ backgroundColor: palette.background }}
    >
      <View style={styles.navigationRow}>
        <Pressable
          accessibilityLabel="返回老板工作台"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: palette.card },
            pressed ? styles.pressed : undefined,
          ]}
        >
          <Text style={[styles.backText, { color: palette.accent }]}>返回</Text>
        </Pressable>
        <Text style={[styles.navigationTitle, { color: palette.primaryText }]}>
          办公室摘要
        </Text>
        <View style={styles.navigationSpacer} />
      </View>

      <View style={[styles.notice, { backgroundColor: palette.accentSoft }]}>
        <Text style={[styles.noticeEyebrow, { color: palette.accent }]}>
          非 3D 等价入口
        </Text>
        <Text style={[styles.noticeTitle, { color: palette.primaryText }]}>
          不进入场景，也能把公司管明白
        </Text>
        <Text style={[styles.noticeBody, { color: palette.secondaryText }]}>
          这里展示与未来 Unity 办公室相同的员工和任务事实。3D
          只负责演出，不会改变任务结果。
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: palette.primaryText }]}>
          在办公室
        </Text>
        <Text style={[styles.sectionMeta, { color: palette.secondaryText }]}>
          2 人到岗
        </Text>
      </View>

      <View style={[styles.listCard, { backgroundColor: palette.card }]}>
        {employees.map((employee, index) => (
          <View
            accessibilityLabel={`${employee.name}，${employee.role}，${employee.status}`}
            key={employee.name}
            style={[
              styles.employeeRow,
              index > 0
                ? {
                    borderTopColor: palette.separator,
                    borderTopWidth: StyleSheet.hairlineWidth,
                  }
                : undefined,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    employee.tone === 'working'
                      ? palette.accent
                      : palette.secretary,
                },
              ]}
            />
            <View style={styles.employeeCopy}>
              <View style={styles.employeeTitleRow}>
                <Text
                  style={[styles.employeeName, { color: palette.primaryText }]}
                >
                  {employee.name}
                </Text>
                <Text
                  style={[
                    styles.employeeRole,
                    { color: palette.secondaryText },
                  ]}
                >
                  {employee.role}
                </Text>
              </View>
              <Text
                style={[
                  styles.employeeStatus,
                  { color: palette.secondaryText },
                ]}
              >
                {employee.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: palette.primaryText }]}>
          当前工作
        </Text>
        <Text style={[styles.sectionMeta, { color: palette.secondaryText }]}>
          真实状态
        </Text>
      </View>

      <View style={[styles.taskCard, { backgroundColor: palette.card }]}>
        <Text style={[styles.taskTitle, { color: palette.primaryText }]}>
          新品发布方案
        </Text>
        <Text style={[styles.taskOwner, { color: palette.secondaryText }]}>
          负责人：林策
        </Text>
        <View style={styles.progressRow}>
          <View
            style={[styles.progressDot, { backgroundColor: palette.accent }]}
          />
          <View style={styles.progressCopy}>
            <Text
              style={[styles.progressTitle, { color: palette.primaryText }]}
            >
              正在形成结构
            </Text>
            <Text
              style={[styles.progressBody, { color: palette.secondaryText }]}
            >
              他刚整理完目标用户，现在开始安排发布节奏。这个任务无法可靠估算百分比，你可以先去处理别的事。
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.unityCard, { borderColor: palette.separator }]}>
        <Text style={[styles.unityTitle, { color: palette.primaryText }]}>
          3D 办公室尚未加载
        </Text>
        <Text style={[styles.unityBody, { color: palette.secondaryText }]}>
          下一开发切片会创建 Unity 场景、员工占位模型和 Idle / Walk / Work
          状态机。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 16,
  },
  navigationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 60,
    paddingHorizontal: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  navigationTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  navigationSpacer: {
    width: 60,
  },
  pressed: {
    opacity: 0.6,
  },
  notice: {
    borderRadius: 20,
    padding: 18,
  },
  noticeEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  noticeTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 29,
    marginTop: 6,
  },
  noticeBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  listCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  employeeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 16,
    minHeight: 82,
    paddingRight: 16,
  },
  statusDot: {
    borderRadius: 6,
    height: 12,
    marginRight: 12,
    width: 12,
  },
  employeeCopy: {
    flex: 1,
  },
  employeeTitleRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  employeeRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  employeeStatus: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  taskCard: {
    borderRadius: 18,
    padding: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  taskOwner: {
    fontSize: 13,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  progressDot: {
    borderRadius: 5,
    height: 10,
    marginRight: 11,
    marginTop: 5,
    width: 10,
  },
  progressCopy: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  unityCard: {
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 16,
  },
  unityTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  unityBody: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
