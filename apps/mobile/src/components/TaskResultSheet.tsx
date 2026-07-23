import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DEFAULT_TASK_TEAM,
  getOfficeEmployee,
} from '../office/officeSceneModel';
import type { AiTaskExecution } from '../tasks/taskTypes';
import type { AppPalette } from '../theme/palette';

type TaskResultSheetProps = {
  onClose: () => void;
  palette: AppPalette;
  task?: AiTaskExecution;
  visible: boolean;
};

const taskTeam = [...new Set(DEFAULT_TASK_TEAM)].map(getOfficeEmployee);

export function TaskResultSheet({
  onClose,
  palette,
  task,
  visible,
}: TaskResultSheetProps) {
  const insets = useSafeAreaInsets();

  if (!task) return null;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: palette.background,
            paddingTop: Math.max(insets.top, 12),
          },
        ]}
      >
        <View
          style={[styles.navigation, { borderBottomColor: palette.separator }]}
        >
          <View>
            <Text style={[styles.eyebrow, { color: palette.accent }]}>
              员工正式汇报
            </Text>
            <Text style={[styles.navigationTitle, { color: palette.primaryText }]}>
              {task.status === 'completed' ? '任务已完成' : '任务需要处理'}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="关闭任务结果"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={[styles.closeText, { color: palette.accent }]}>完成</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 20) + 20 },
          ]}
        >
          <Text style={[styles.prompt, { color: palette.primaryText }]}>
            {task.prompt}
          </Text>

          <View style={styles.teamRow}>
            {taskTeam.map(employee => (
              <View
                key={employee.id}
                style={[
                  styles.teamChip,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.separator,
                  },
                ]}
              >
                <Text style={[styles.teamName, { color: palette.primaryText }]}>
                  {employee.name}
                </Text>
                <Text style={[styles.teamRole, { color: palette.secondaryText }]}>
                  {employee.role}
                </Text>
              </View>
            ))}
          </View>

          {task.status === 'completed' ? (
            <>
              <Text style={[styles.persona, { color: palette.secretary }]}>
                {task.personaReport}
              </Text>
              <View style={[styles.resultCard, { backgroundColor: palette.card }]}>
                <Text
                  selectable
                  style={[styles.answer, { color: palette.primaryText }]}
                >
                  {task.answer}
                </Text>
              </View>
              <Text style={[styles.meta, { color: palette.secondaryText }]}>
                {task.model} · {task.usage?.totalTokens ?? 0} tokens
              </Text>
              <Pressable
                accessibilityLabel="系统分享任务结果"
                accessibilityRole="button"
                onPress={() =>
                  Share.share({
                    message: `${task.prompt}\n\n${task.answer ?? ''}`,
                    title: task.prompt,
                  })
                }
                style={({ pressed }) => [
                  styles.shareButton,
                  { backgroundColor: palette.accent },
                  pressed ? styles.pressed : undefined,
                ]}
              >
                <Text style={styles.shareText}>系统分享</Text>
              </Pressable>
            </>
          ) : (
            <View style={[styles.resultCard, { backgroundColor: palette.card }]}>
              <Text style={[styles.errorTitle, { color: palette.primaryText }]}>
                本次处理未完成
              </Text>
              <Text style={[styles.errorBody, { color: palette.secondaryText }]}>
                {task.error}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  answer: { fontSize: 16, lineHeight: 25 },
  closeButton: { minHeight: 44, justifyContent: 'center' },
  closeText: { fontSize: 16, fontWeight: '700' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  errorBody: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  errorTitle: { fontSize: 18, fontWeight: '700' },
  eyebrow: { fontSize: 11, fontWeight: '800' },
  meta: { fontSize: 11, marginTop: 10 },
  navigation: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  navigationTitle: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  persona: { fontSize: 14, fontWeight: '700', lineHeight: 21, marginTop: 18 },
  pressed: { opacity: 0.64 },
  prompt: { fontSize: 24, fontWeight: '800', lineHeight: 31 },
  resultCard: { borderRadius: 18, marginTop: 12, padding: 16 },
  shareButton: {
    alignItems: 'center',
    borderRadius: 15,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 50,
  },
  shareText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  teamChip: {
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  teamName: { fontSize: 12, fontWeight: '800' },
  teamRole: { fontSize: 8, marginTop: 2 },
  teamRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
});
