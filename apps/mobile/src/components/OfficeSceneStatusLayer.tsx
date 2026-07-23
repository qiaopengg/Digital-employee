import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';
import { OFFICE_BOTTOM_CONTROL } from '../office/officeControlLayout';

type OfficeSceneStatusLayerProps = {
  bubble?: string;
  handoffState: string;
  onSelectHandoff: () => void;
  palette: AppPalette;
  taskTitle: string;
};

export function OfficeSceneStatusLayer({
  bubble,
  handoffState,
  onSelectHandoff,
  palette,
  taskTitle,
}: OfficeSceneStatusLayerProps) {
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View
        accessible
        accessibilityLabel="老板办公室，当前空闲"
        style={[styles.bossOfficeBadge, { backgroundColor: palette.card }]}
      >
        <View
          style={[styles.bossOfficeDot, { backgroundColor: palette.success }]}
        />
        <Text style={[styles.bossOfficeText, { color: palette.primaryText }]}>
          老板室
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
          <Text
            numberOfLines={2}
            style={[styles.handoffText, { color: palette.primaryText }]}
          >
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
  bossOfficeBadge: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    left: '73%',
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: 'absolute',
    top: '4%',
  },
  bossOfficeDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  bossOfficeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  handoffBubble: {
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    left: '20%',
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'absolute',
    top: '11%',
    width: '46%',
  },
  handoffText: {
    fontSize: 8.5,
    fontWeight: '700',
    lineHeight: 11,
  },
  taskStrip: {
    alignItems: 'center',
    borderRadius: OFFICE_BOTTOM_CONTROL.borderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: OFFICE_BOTTOM_CONTROL.bottom,
    flexDirection: 'row',
    height: OFFICE_BOTTOM_CONTROL.height,
    left: '50%',
    marginLeft: -OFFICE_BOTTOM_CONTROL.width / 2,
    paddingHorizontal: 9,
    position: 'absolute',
    width: OFFICE_BOTTOM_CONTROL.width,
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
  pressed: {
    opacity: 0.65,
  },
});
