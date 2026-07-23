import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { EmployeeId, EmployeeProfile } from '../office/employeeProfiles';
import type { IdleActivityPhase } from '../office/officeActivityModel';
import type { ActorPosition } from '../office/officeMotionAnimation';
import { EMPLOYEE_NEAR_FIELD_WIDTH_RATIO } from '../office/officeSeatModel';
import type { AppPalette } from '../theme/palette';
import { EmployeeStatusIcon } from './EmployeeStatusIcon';

type Props = {
  bob: SharedValue<number>;
  employee: EmployeeProfile;
  gait: SharedValue<number>;
  onPress: () => void;
  palette: AppPalette;
  phase: IdleActivityPhase;
  position: ActorPosition;
  sceneWidth: number;
};

const secretarySeated = require('../assets/office/employee-secretary-seated-rig-v5.png');

export function MobileEmployeeActor({
  bob,
  employee,
  onPress,
  palette,
  phase,
  position,
  sceneWidth,
}: Props) {
  const atDesk = phase === 'atDesk';
  const width = sceneWidth * EMPLOYEE_NEAR_FIELD_WIDTH_RATIO;
  const height = width * 1.5;
  const anchorY = atDesk && employee.id === 'secretary' ? 0.84 : 0.92;
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: position.x.value - width * 0.5 },
        { translateY: position.y.value - height * anchorY + bob.value },
      ],
    }),
    [anchorY, height, width],
  );

  return (
    <Animated.View style={[styles.actor, { height, width }, animatedStyle]}>
      <Pressable
        accessibilityLabel={`${employee.name}，${atDesk ? '在工位' : '短暂活动中'}`}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.pressTarget}
      >
        <View style={[styles.status, { backgroundColor: palette.card, borderColor: palette.separator }]}>
          <EmployeeStatusIcon kind={atDesk ? 'working' : 'moving'} palette={palette} size={9} />
        </View>
        <Image
          resizeMode="contain"
          source={atDesk && employee.id === 'secretary' ? secretarySeated : employee.image}
          style={styles.image}
        />
      </Pressable>
    </Animated.View>
  );
}

export function supportsMobileActivity(employeeId: EmployeeId) {
  return employeeId === 'secretary' || employeeId === 'break';
}

const styles = StyleSheet.create({
  actor: { left: 0, position: 'absolute', top: 0, zIndex: 66 },
  image: { height: '100%', width: '100%' },
  pressTarget: { alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '100%' },
  status: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 1,
    position: 'absolute',
    right: -5,
    top: 2,
    zIndex: 2,
  },
});
