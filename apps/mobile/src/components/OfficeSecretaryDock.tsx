import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TabKey } from './BottomTabBar';
import type { AppPalette } from '../theme/palette';

type SecretaryDestination = Exclude<TabKey, 'office'>;

type OfficeSecretaryDockProps = {
  onNavigate: (destination: SecretaryDestination) => void;
  onOpenSceneList: () => void;
  onReplayHandoff: () => void;
  palette: AppPalette;
};

const destinations: ReadonlyArray<{
  key: SecretaryDestination;
  label: string;
  shortLabel: string;
}> = [
  { key: 'tasks', label: '任务', shortLabel: '任' },
  { key: 'company', label: '公司', shortLabel: '司' },
  { key: 'reports', label: '汇报', shortLabel: '报' },
  { key: 'profile', label: '我的', shortLabel: '我' },
];

export function OfficeSecretaryDock({
  onNavigate,
  onOpenSceneList,
  onReplayHandoff,
  palette,
}: OfficeSecretaryDockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {isOpen ? (
        <View
          style={[
            styles.menu,
            {
              backgroundColor: palette.navigation,
              borderColor: palette.separator,
            },
          ]}
        >
          <Text style={[styles.menuTitle, { color: palette.primaryText }]}>
            秘书工作台
          </Text>
          <Pressable
            accessibilityLabel="重新派单"
            accessibilityRole="button"
            onPress={() => {
              onReplayHandoff();
              setIsOpen(false);
            }}
            style={({ pressed }) => [
              styles.actionRow,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={[styles.rowIcon, { color: palette.accent }]}>↻</Text>
            <Text style={[styles.rowLabel, { color: palette.primaryText }]}>
              重新派单
            </Text>
          </Pressable>
          {destinations.map(destination => (
            <Pressable
              accessibilityLabel={`打开${destination.label}`}
              accessibilityRole="button"
              key={destination.key}
              onPress={() => onNavigate(destination.key)}
              style={({ pressed }) => [
                styles.actionRow,
                pressed ? styles.pressed : undefined,
              ]}
            >
              <View
                style={[
                  styles.rowIconBadge,
                  { backgroundColor: palette.secretarySoft },
                ]}
              >
                <Text
                  style={[styles.rowIconText, { color: palette.secretary }]}
                >
                  {destination.shortLabel}
                </Text>
              </View>
              <Text style={[styles.rowLabel, { color: palette.primaryText }]}>
                {destination.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityLabel="场景列表"
            accessibilityRole="button"
            onPress={onOpenSceneList}
            style={({ pressed }) => [
              styles.actionRow,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={[styles.rowIcon, { color: palette.secondaryText }]}>
              ≡
            </Text>
            <Text style={[styles.rowLabel, { color: palette.primaryText }]}>
              场景列表
            </Text>
          </Pressable>
        </View>
      ) : undefined}

      <Pressable
        accessibilityLabel={isOpen ? '收起秘书工作台' : '打开秘书工作台'}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen(value => !value)}
        style={({ pressed }) => [
          styles.launcher,
          { backgroundColor: palette.secretary },
          pressed ? styles.pressed : undefined,
        ]}
      >
        <Text style={styles.launcherMark}>秘</Text>
        <Text style={styles.launcherLabel}>秘书</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    bottom: 12,
    position: 'absolute',
    right: 10,
    zIndex: 80,
  },
  menu: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 7,
    padding: 7,
    width: 126,
  },
  menuTitle: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  actionRow: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    minHeight: 34,
    paddingHorizontal: 5,
  },
  rowIcon: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    width: 22,
  },
  rowIconBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  rowIconText: {
    fontSize: 9,
    fontWeight: '900',
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
  },
  launcher: {
    alignItems: 'center',
    borderRadius: 17,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  launcherMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  launcherLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  pressed: {
    opacity: 0.64,
  },
});
