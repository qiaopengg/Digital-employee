import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';

export type TabKey = 'tasks' | 'company' | 'reports' | 'profile';

type BottomTabBarProps = {
  activeTab: TabKey;
  bottomInset: number;
  onChange: (tab: TabKey) => void;
  palette: AppPalette;
};

const tabs: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: 'tasks', label: '任务' },
  { key: 'company', label: '公司' },
  { key: 'reports', label: '汇报' },
  { key: 'profile', label: '我的' },
];

export function BottomTabBar({
  activeTab,
  bottomInset,
  onChange,
  palette,
}: BottomTabBarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.navigation,
          borderTopColor: palette.separator,
          paddingBottom: Math.max(bottomInset, 8),
        },
      ]}
    >
      {tabs.map(tab => {
        const isSelected = tab.key === activeTab;

        return (
          <Pressable
            accessibilityLabel={`${tab.label}标签`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            hitSlop={4}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              pressed ? styles.pressed : undefined,
            ]}
          >
            <View
              style={[
                styles.indicator,
                { backgroundColor: palette.accent },
                isSelected ? undefined : styles.indicatorHidden,
              ]}
            />
            <Text
              maxFontSizeMultiplier={1.6}
              style={[
                styles.label,
                { color: isSelected ? palette.accent : palette.secondaryText },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    paddingHorizontal: 8,
    paddingTop: 6,
    position: 'absolute',
    right: 0,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    opacity: 1,
  },
  pressed: {
    opacity: 0.55,
  },
  indicator: {
    borderRadius: 2,
    height: 3,
    marginBottom: 6,
    width: 22,
  },
  indicatorHidden: {
    opacity: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
