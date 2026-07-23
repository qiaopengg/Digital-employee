import { Pressable, StyleSheet, Text, View } from 'react-native';
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

const poseAnchors: Record<EmployeePose, { x: number; y: number }> = {
  handoff: { x: 0.5, y: 0.92 },
  risingEmpty: { x: 0.5, y: 0.92 },
  risingWithFolder: { x: 0.5, y: 0.92 },
  seatedIdle: { x: 0.5, y: 0.57 },
  seatedReviewing: { x: 0.5, y: 0.57 },
  standingEmpty: { x: 0.5, y: 0.92 },
  standingWithFolder: { x: 0.5, y: 0.92 },
  walkEmpty: { x: 0.5, y: 0.92 },
  walkWithFolder: { x: 0.5, y: 0.92 },
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
  const spriteAnchor = poseAnchors[pose];
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
          <EmployeeStatusIcon kind={status} palette={palette} size={14} />
          <Text
            numberOfLines={1}
            style={[styles.actorName, { color: palette.primaryText }]}
          >
            {employee.name}
          </Text>
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
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 5,
    paddingVertical: 3,
    position: 'absolute',
    top: -10,
    zIndex: 2,
  },
  actorName: {
    fontSize: 9,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
});
