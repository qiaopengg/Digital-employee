import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';

type OfficePreviewCardProps = {
  onPress: () => void;
  palette: AppPalette;
};

const desks = ['林策 · 工作中', '小岚 · 在整理'];

export function OfficePreviewCard({
  onPress,
  palette,
}: OfficePreviewCardProps) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.officeCard, borderColor: palette.separator },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: palette.accent }]}>
            办公室
          </Text>
          <Text style={[styles.title, { color: palette.primaryText }]}>
            公司正在运转
          </Text>
        </View>
        <View
          style={[styles.livePill, { backgroundColor: palette.successSoft }]}
        >
          <View
            style={[styles.liveDot, { backgroundColor: palette.success }]}
          />
          <Text style={[styles.liveText, { color: palette.success }]}>
            工作时段
          </Text>
        </View>
      </View>

      <View style={[styles.floor, { backgroundColor: palette.officeFloor }]}>
        <View style={styles.roomRow}>
          <View style={[styles.room, { backgroundColor: palette.officeRoom }]}>
            <Text style={[styles.roomLabel, { color: palette.secondaryText }]}>
              项目区
            </Text>
            <View style={styles.deskRow}>
              {desks.map((desk, index) => (
                <View key={desk} style={styles.employee}>
                  <View
                    style={[
                      styles.employeeDot,
                      {
                        backgroundColor:
                          index === 0 ? palette.accent : palette.secretary,
                      },
                    ]}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.employeeLabel,
                      { color: palette.primaryText },
                    ]}
                  >
                    {desk}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View
            style={[styles.smallRoom, { backgroundColor: palette.officeRoom }]}
          >
            <Text style={[styles.roomLabel, { color: palette.secondaryText }]}>
              会议室
            </Text>
            <Text style={[styles.roomStatus, { color: palette.primaryText }]}>
              空闲
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.caption, { color: palette.secondaryText }]}>
        当前展示非 3D 摘要；Unity 场景将在下一验证切片接入。
      </Text>
      <Pressable
        accessibilityLabel="查看办公室摘要"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: palette.accent },
          pressed ? styles.pressed : undefined,
        ]}
      >
        <Text style={styles.buttonText}>查看办公室摘要</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  livePill: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    minHeight: 30,
    paddingHorizontal: 10,
  },
  liveDot: {
    borderRadius: 4,
    height: 7,
    marginRight: 6,
    width: 7,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  floor: {
    borderRadius: 16,
    marginTop: 16,
    padding: 10,
  },
  roomRow: {
    flexDirection: 'row',
    gap: 8,
  },
  room: {
    borderRadius: 12,
    flex: 1,
    minHeight: 118,
    padding: 10,
  },
  smallRoom: {
    borderRadius: 12,
    justifyContent: 'space-between',
    minHeight: 118,
    padding: 10,
    width: 88,
  },
  roomLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  roomStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  deskRow: {
    gap: 8,
    marginTop: 12,
  },
  employee: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  employeeDot: {
    borderRadius: 7,
    height: 14,
    marginRight: 7,
    width: 14,
  },
  employeeLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
