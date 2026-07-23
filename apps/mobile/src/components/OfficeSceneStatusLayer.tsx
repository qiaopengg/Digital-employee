import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';

type OfficeSceneStatusLayerProps = {
  bubble?: string;
  handoffState: string;
  localTaskTitle?: string;
  onSelectHandoff: () => void;
  palette: AppPalette;
  taskTitle: string;
};

export function OfficeSceneStatusLayer({
  bubble,
  handoffState,
  localTaskTitle,
  onSelectHandoff,
  palette,
  taskTitle,
}: OfficeSceneStatusLayerProps) {
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View style={styles.sceneHeader}>
        <View
          style={[
            styles.officeChip,
            { backgroundColor: palette.card, borderColor: palette.separator },
          ]}
        >
          <Text style={[styles.officeChipText, { color: palette.primaryText }]}>
            标准公司楼层 · 固定镜头
          </Text>
        </View>
        <View
          style={[styles.liveChip, { backgroundColor: palette.successSoft }]}
        >
          <Text style={[styles.liveChipText, { color: palette.success }]}>
            4 人在场
          </Text>
        </View>
      </View>

      <View
        accessible
        accessibilityLabel="老板办公室，当前空闲"
        style={[styles.bossOfficeBadge, { backgroundColor: palette.card }]}
      >
        <Text style={[styles.bossOfficeText, { color: palette.primaryText }]}>
          老板办公室 · 空闲
        </Text>
      </View>

      {bubble ? (
        <Pressable
          accessibilityLabel="查看员工交接对话"
          accessibilityRole="button"
          onPress={onSelectHandoff}
          style={({ pressed }) => [
            styles.handoffBubble,
            {
              backgroundColor: palette.card,
              borderColor: palette.separator,
            },
            pressed ? styles.pressed : undefined,
          ]}
        >
          <Text style={[styles.handoffText, { color: palette.primaryText }]}>
            {bubble}
          </Text>
        </Pressable>
      ) : undefined}

      <Pressable
        accessibilityLabel="查看交接任务"
        accessibilityRole="button"
        onPress={onSelectHandoff}
        style={({ pressed }) => [
          styles.taskStrip,
          {
            backgroundColor: palette.navigation,
            borderColor: palette.separator,
          },
          pressed ? styles.pressed : undefined,
        ]}
      >
        <View
          style={[styles.taskIndicator, { backgroundColor: palette.accent }]}
        />
        <View style={styles.taskCopy}>
          <Text
            numberOfLines={1}
            style={[styles.taskTitle, { color: palette.primaryText }]}
          >
            {taskTitle}
          </Text>
          <Text style={[styles.taskState, { color: palette.secondaryText }]}>
            {handoffState}
          </Text>
        </View>
      </Pressable>

      {localTaskTitle ? (
        <View style={[styles.localTask, { backgroundColor: palette.card }]}>
          <Text
            style={[styles.localTaskText, { color: palette.secondaryText }]}
          >
            尚未发送给 AI
          </Text>
        </View>
      ) : undefined}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 30,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 10,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  officeChip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  officeChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  liveChip: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  liveChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bossOfficeBadge: {
    borderRadius: 8,
    left: '35%',
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: 'absolute',
    top: '16%',
  },
  bossOfficeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  handoffBubble: {
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    left: '29%',
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    top: '40%',
    width: '57%',
  },
  handoffText: {
    fontSize: 11,
    fontWeight: '800',
  },
  taskStrip: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 10,
    flexDirection: 'row',
    left: '27%',
    paddingHorizontal: 9,
    paddingVertical: 7,
    position: 'absolute',
    right: '18%',
  },
  taskIndicator: {
    borderRadius: 3,
    height: 18,
    marginRight: 7,
    width: 3,
  },
  taskCopy: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 10,
    fontWeight: '800',
  },
  taskState: {
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },
  localTask: {
    borderRadius: 8,
    bottom: 10,
    paddingHorizontal: 7,
    paddingVertical: 5,
    position: 'absolute',
    right: 10,
  },
  localTaskText: {
    fontSize: 8,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.65,
  },
});
