import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DEFAULT_WORK_SCHEDULE,
  type WorkSchedule,
} from '../office/officeScheduleModel';
import type { AppPalette } from '../theme/palette';

type Props = {
  bottomInset: number;
  onClose: () => void;
  onSave: (schedule: WorkSchedule) => void;
  palette: AppPalette;
  schedule: WorkSchedule;
  visible: boolean;
};

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function HourStepper({
  label,
  onChange,
  palette,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  palette: AppPalette;
  value: number;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={[styles.stepperLabel, { color: palette.primaryText }]}>
        {label}
      </Text>
      <View style={styles.stepperControls}>
        <Pressable
          accessibilityLabel={`${label}提前一小时`}
          accessibilityRole="button"
          onPress={() => onChange(Math.max(0, value - 1))}
          style={[styles.stepButton, { backgroundColor: palette.accentSoft }]}
        >
          <Text style={[styles.stepMark, { color: palette.accent }]}>−</Text>
        </Pressable>
        <Text style={[styles.hour, { color: palette.primaryText }]}>
          {formatHour(value)}
        </Text>
        <Pressable
          accessibilityLabel={`${label}延后一小时`}
          accessibilityRole="button"
          onPress={() => onChange(Math.min(24, value + 1))}
          style={[styles.stepButton, { backgroundColor: palette.accentSoft }]}
        >
          <Text style={[styles.stepMark, { color: palette.accent }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
export function WorkScheduleSheet({
  bottomInset,
  onClose,
  onSave,
  palette,
  schedule,
  visible,
}: Props) {
  const [hours, setHours] = useState(() => [
    schedule.windows[0]?.startHour ?? 9,
    schedule.windows[0]?.endHour ?? 12,
    schedule.windows[1]?.startHour ?? 14,
    schedule.windows[1]?.endHour ?? 18,
  ]);

  useEffect(() => {
    if (!visible) return;
    setHours([
      schedule.windows[0]?.startHour ?? 9,
      schedule.windows[0]?.endHour ?? 12,
      schedule.windows[1]?.startHour ?? 14,
      schedule.windows[1]?.endHour ?? 18,
    ]);
  }, [schedule, visible]);

  const updateHour = (index: number, value: number) =>
    setHours(current => current.map((hour, item) => (item === index ? value : hour)));
  const isValid = hours[0] < hours[1] && hours[1] <= hours[2] && hours[2] < hours[3];

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={[styles.header, { borderBottomColor: palette.separator }]}>
          <Pressable onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.headerAction, { color: palette.accent }]}>取消</Text>
          </Pressable>
          <Text style={[styles.title, { color: palette.primaryText }]}>工作时间</Text>
          <Pressable
            accessibilityLabel="保存工作时间"
            disabled={!isValid}
            onPress={() => {
              onSave({ windows: [
                { startHour: hours[0], endHour: hours[1] },
                { startHour: hours[2], endHour: hours[3] },
              ] });
              onClose();
            }}
            style={styles.headerButton}
          >
            <Text style={[styles.headerAction, { color: palette.accent }, !isValid && styles.disabled]}>保存</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={[styles.explanation, { color: palette.secondaryText }]}>
            办公室按设备真实时间运行。工作时段内员工默认在岗；无任务时可短暂活动，但会在 20 秒内返回工位。
          </Text>
          <View style={[styles.card, { backgroundColor: palette.card }]}>
            <Text style={[styles.sectionTitle, { color: palette.primaryText }]}>上午</Text>
            <HourStepper label="上午上班" value={hours[0]} onChange={value => updateHour(0, value)} palette={palette} />
            <HourStepper label="上午下班" value={hours[1]} onChange={value => updateHour(1, value)} palette={palette} />
          </View>
          <View style={[styles.card, { backgroundColor: palette.card }]}>
            <Text style={[styles.sectionTitle, { color: palette.primaryText }]}>下午</Text>
            <HourStepper label="下午上班" value={hours[2]} onChange={value => updateHour(2, value)} palette={palette} />
            <HourStepper label="下午下班" value={hours[3]} onChange={value => updateHour(3, value)} palette={palette} />
          </View>
          {!isValid ? (
            <Text style={styles.error}>时间必须按“上午开始 → 上午结束 → 下午开始 → 下午结束”递增。</Text>
          ) : undefined}
          <Pressable
            accessibilityLabel="恢复默认工作时间"
            onPress={() => setHours([
              DEFAULT_WORK_SCHEDULE.windows[0].startHour,
              DEFAULT_WORK_SCHEDULE.windows[0].endHour,
              DEFAULT_WORK_SCHEDULE.windows[1].startHour,
              DEFAULT_WORK_SCHEDULE.windows[1].endHour,
            ])}
            style={[styles.reset, { borderColor: palette.separator }]}
          >
            <Text style={[styles.resetText, { color: palette.accent }]}>恢复默认 09–12 / 14–18</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: 18, marginTop: 16, padding: 16 },
  container: { flex: 1 },
  content: { padding: 20 },
  disabled: { opacity: 0.35 },
  error: { color: '#B42318', fontSize: 13, lineHeight: 19, marginTop: 12 },
  explanation: { fontSize: 14, lineHeight: 21 },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 12,
  },
  headerAction: { fontSize: 16, fontWeight: '700' },
  headerButton: { justifyContent: 'center', minHeight: 44, minWidth: 58 },
  hour: { fontSize: 16, fontVariant: ['tabular-nums'], fontWeight: '800', minWidth: 58, textAlign: 'center' },
  reset: { alignItems: 'center', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginTop: 18, padding: 14 },
  resetText: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  stepButton: { alignItems: 'center', borderRadius: 10, height: 36, justifyContent: 'center', width: 36 },
  stepMark: { fontSize: 20, fontWeight: '700' },
  stepperControls: { alignItems: 'center', flexDirection: 'row' },
  stepperLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  stepperRow: { alignItems: 'center', flexDirection: 'row', minHeight: 52 },
  title: { fontSize: 17, fontWeight: '800' },
});
