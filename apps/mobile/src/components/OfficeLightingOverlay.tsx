import { StyleSheet, View } from 'react-native';

import { getOfficeLightingTheme } from '../office/officeLightingModel';
import type { TimeOfDayPeriod } from '../office/officeScheduleModel';

type OfficeLightingOverlayProps = {
  period: TimeOfDayPeriod;
};

export function OfficeLightingOverlay({
  period,
}: OfficeLightingOverlayProps) {
  const theme = getOfficeLightingTheme(period);

  if (theme.ambientOpacity <= 0) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          backgroundColor: theme.overlayColor,
          opacity: theme.ambientOpacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 70,
  },
});
