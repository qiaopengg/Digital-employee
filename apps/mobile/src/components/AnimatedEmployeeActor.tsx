import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import type {
  AnimatedEmployeeId,
  EmployeeActivity,
  EmployeePose,
  Facing,
} from '../office/officeBehaviorModel';
import type { ActorPosition } from '../office/officeMotionAnimation';
import type { OfficeEmployee } from '../office/officeSceneModel';
import { getEmployeePoseFrames } from '../office/employeeSpriteSources';
import {
  EMPLOYEE_WORLD_ASPECT_RATIO,
  EMPLOYEE_WORLD_WIDTH_RATIO,
  OFFICE_EMPLOYEE_SPRITE_ANCHORS,
} from '../office/officeSeatModel';
import type { AppPalette } from '../theme/palette';
import { EmployeeStatusIcon, employeeStatusLabels } from './EmployeeStatusIcon';

type AnimatedEmployeeActorProps = {
  bob: SharedValue<number>;
  depth: number;
  employee: OfficeEmployee;
  facing: Facing;
  gait: SharedValue<number>;
  onPress: () => void;
  palette: AppPalette;
  pose: EmployeePose;
  position: ActorPosition;
  sceneWidth: number;
  status: EmployeeActivity;
  statusDetail: string;
};

export function AnimatedEmployeeActor({
  bob,
  depth,
  employee,
  facing,
  gait,
  onPress,
  palette,
  pose,
  position,
  sceneWidth,
  status,
  statusDetail,
}: AnimatedEmployeeActorProps) {
  const employeeId = employee.id as AnimatedEmployeeId;
  const frames = getEmployeePoseFrames(employeeId, pose, facing);
  const isWalking = pose === 'walkEmpty' || pose === 'walkWithFolder';
  const actorWidth = sceneWidth * EMPLOYEE_WORLD_WIDTH_RATIO;
  const actorHeight = actorWidth * EMPLOYEE_WORLD_ASPECT_RATIO;
  const spriteAnchor = OFFICE_EMPLOYEE_SPRITE_ANCHORS[pose];
  const positionStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: position.x.value - actorWidth * spriteAnchor.x },
        { translateY: position.y.value - actorHeight * spriteAnchor.y },
      ],
    }),
    [actorHeight, actorWidth, spriteAnchor.x, spriteAnchor.y],
  );
  const firstFrameStyle = useAnimatedStyle(
    () => ({
      opacity: !isWalking || gait.value < 0.5 ? 1 : 0,
      transform: [{ translateY: bob.value }, { scaleX: frames.mirror }],
    }),
    [frames.mirror, isWalking],
  );
  const secondFrameStyle = useAnimatedStyle(
    () => ({
      opacity: gait.value < 0.5 ? 0 : 1,
      transform: [{ translateY: bob.value }, { scaleX: frames.mirror }],
    }),
    [frames.mirror],
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.actor,
        { height: actorHeight, width: actorWidth, zIndex: depth },
        positionStyle,
      ]}
    >
      <Pressable
        accessibilityLabel={`${employee.name}，${employee.role}，${employeeStatusLabels[status]}，${statusDetail}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressTarget,
          pressed ? styles.pressed : undefined,
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.actorLabel,
            {
              backgroundColor: palette.card,
              borderColor: palette.separator,
            },
          ]}
        >
          <EmployeeStatusIcon kind={status} palette={palette} size={8} />
        </View>
        <Animated.Image
          resizeMode="contain"
          source={frames.first}
          style={[styles.actorImage, firstFrameStyle]}
        />
        {isWalking && frames.second ? (
          <Animated.Image
            resizeMode="contain"
            source={frames.second}
            style={[styles.actorImage, secondFrameStyle]}
          />
        ) : undefined}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actor: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  pressTarget: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: '100%',
  },
  actorImage: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  actorLabel: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 1,
    position: 'absolute',
    right: -8,
    top: '28%',
    zIndex: 2,
  },
  pressed: {
    opacity: 0.72,
  },
});
