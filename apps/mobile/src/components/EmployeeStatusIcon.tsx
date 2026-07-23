import { StyleSheet, Text, View } from 'react-native';

import type { EmployeeActivity } from '../office/officeBehaviorModel';
import type { AppPalette } from '../theme/palette';

export type EmployeeStatusKind = EmployeeActivity | 'available' | 'break';

const statusGlyphs: Record<EmployeeStatusKind, string> = {
  available: '+',
  break: 'Ⅱ',
  handoff: '⇄',
  moving: '›',
  reviewing: '✓',
  working: '·',
};

export const employeeStatusLabels: Record<EmployeeStatusKind, string> = {
  available: '可接任务',
  break: '短时休息',
  handoff: '工作交接',
  moving: '移动中',
  reviewing: '审核中',
  working: '工作中',
};

export function EmployeeStatusIcon({
  kind,
  palette,
  size = 16,
}: {
  kind: EmployeeStatusKind;
  palette: AppPalette;
  size?: number;
}) {
  const color =
    kind === 'reviewing' || kind === 'available'
      ? palette.success
      : kind === 'handoff'
      ? palette.secretary
      : kind === 'moving'
      ? '#A46118'
      : kind === 'break'
      ? palette.secondaryText
      : palette.accent;
  const backgroundColor =
    kind === 'reviewing' || kind === 'available'
      ? palette.successSoft
      : kind === 'handoff'
      ? palette.secretarySoft
      : kind === 'working'
      ? palette.accentSoft
      : palette.card;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.icon,
        {
          backgroundColor,
          borderColor: color,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}
    >
      <Text
        style={[
          styles.glyph,
          { color, fontSize: size * 0.64, lineHeight: size },
        ]}
      >
        {statusGlyphs[kind]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
  glyph: {
    fontWeight: '900',
    marginTop: -1,
    textAlign: 'center',
  },
});
