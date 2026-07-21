import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppPalette } from '../theme/palette';

type TaskMode = '快速' | '标准' | '深度';

type TaskComposerSheetProps = {
  onClose: () => void;
  onSubmit: (title: string, mode: TaskMode) => void;
  palette: AppPalette;
  visible: boolean;
};

const modes: ReadonlyArray<{ key: TaskMode; detail: string }> = [
  { key: '快速', detail: '先给方向' },
  { key: '标准', detail: '完整交付' },
  { key: '深度', detail: '充分研究' },
];

export function TaskComposerSheet({
  onClose,
  onSubmit,
  palette,
  visible,
}: TaskComposerSheetProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<TaskMode>('标准');
  const [task, setTask] = useState('');
  const normalizedTask = task.trim();
  const canSubmit = normalizedTask.length > 0;

  useEffect(() => {
    if (!visible) {
      setMode('标准');
      setTask('');
    }
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: palette.background }]}
      >
        <View
          style={[
            styles.navigation,
            {
              borderBottomColor: palette.separator,
              paddingTop: Math.max(insets.top, 12),
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [
              styles.navigationButton,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={[styles.cancelText, { color: palette.accent }]}>
              取消
            </Text>
          </Pressable>
          <Text
            style={[styles.navigationTitle, { color: palette.primaryText }]}
          >
            新建任务
          </Text>
          <View style={styles.navigationSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.eyebrow, { color: palette.accent }]}>
            交代一项任务
          </Text>
          <Text style={[styles.title, { color: palette.primaryText }]}>
            你希望员工完成什么？
          </Text>
          <Text style={[styles.description, { color: palette.secondaryText }]}>
            先说清目标即可。需要文件、来源或格式时，员工会继续向你确认。
          </Text>

          <TextInput
            accessibilityLabel="任务目标"
            autoFocus
            keyboardAppearance={
              palette.background === '#000000' ? 'dark' : 'light'
            }
            maxLength={2000}
            multiline
            onChangeText={setTask}
            placeholder="例如：帮我为下周的新品发布整理一份执行方案"
            placeholderTextColor={palette.secondaryText}
            selectionColor={palette.accent}
            style={[
              styles.input,
              {
                backgroundColor: palette.card,
                color: palette.primaryText,
              },
            ]}
            textAlignVertical="top"
            value={task}
          />

          <Text style={[styles.modeTitle, { color: palette.primaryText }]}>
            任务模式
          </Text>
          <View style={styles.modeRow}>
            {modes.map(item => {
              const isSelected = item.key === mode;

              return (
                <Pressable
                  accessibilityLabel={`${item.key}模式`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={item.key}
                  onPress={() => setMode(item.key)}
                  style={({ pressed }) => [
                    styles.modeButton,
                    {
                      backgroundColor: isSelected
                        ? palette.accentSoft
                        : palette.card,
                      borderColor: isSelected
                        ? palette.accent
                        : palette.separator,
                    },
                    pressed ? styles.pressed : undefined,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeLabel,
                      {
                        color: isSelected
                          ? palette.accent
                          : palette.primaryText,
                      },
                    ]}
                  >
                    {item.key}
                  </Text>
                  <Text
                    style={[
                      styles.modeDetail,
                      { color: palette.secondaryText },
                    ]}
                  >
                    {item.detail}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.localNotice, { backgroundColor: palette.card }]}>
            <Text
              style={[styles.localNoticeTitle, { color: palette.primaryText }]}
            >
              当前为设备体验验证
            </Text>
            <Text
              style={[styles.localNoticeBody, { color: palette.secondaryText }]}
            >
              提交后只保存在本次 App 会话中，不会调用
              AI、消耗额度或产生虚拟收入。
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.footer,
            {
              borderTopColor: palette.separator,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <Pressable
            accessibilityLabel="保存本地验证任务"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            disabled={!canSubmit}
            onPress={() => onSubmit(normalizedTask, mode)}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: palette.accent },
              !canSubmit ? styles.disabled : undefined,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={styles.submitText}>保存本地验证任务</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navigation: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  navigationButton: {
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: 6,
  },
  cancelText: { fontSize: 16, fontWeight: '600' },
  navigationTitle: { fontSize: 17, fontWeight: '700' },
  navigationSpacer: { width: 64 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 22 },
  eyebrow: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  title: {
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 5,
  },
  description: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  input: {
    borderRadius: 18,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 20,
    minHeight: 132,
    padding: 16,
  },
  modeTitle: { fontSize: 17, fontWeight: '700', marginTop: 24 },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  modeButton: {
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 68,
    padding: 11,
  },
  modeLabel: { fontSize: 15, fontWeight: '700' },
  modeDetail: { fontSize: 11, marginTop: 5 },
  localNotice: { borderRadius: 16, marginTop: 20, padding: 14 },
  localNoticeTitle: { fontSize: 14, fontWeight: '700' },
  localNoticeBody: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 15,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
  },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.36 },
  pressed: { opacity: 0.65 },
});
