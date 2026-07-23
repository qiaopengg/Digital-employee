import { StyleSheet, View } from 'react-native';

import { OFFICE_WORKSTATIONS } from '../office/officeLayoutModel';

export function OfficeWorkstationHotspots() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {OFFICE_WORKSTATIONS.map(workstation => (
        <View
          accessible
          accessibilityLabel={
            workstation.occupiedBy
              ? `${workstation.label}，已分配`
              : `${workstation.label}，等待招聘后分配`
          }
          key={workstation.id}
          style={[
            styles.hotspot,
            {
              height: `${workstation.deskRect.height * 100}%`,
              left: `${workstation.deskRect.x * 100}%`,
              top: `${workstation.deskRect.y * 100}%`,
              width: `${workstation.deskRect.width * 100}%`,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hotspot: {
    position: 'absolute',
  },
});
