import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type ImageSourcePropType,
} from 'react-native';

import type {
  AnimatedEmployeeId,
  EmployeePose,
  Facing,
} from '../office/officeBehaviorModel';
import type { OfficeEmployee } from '../office/officeSceneModel';
import type { AppPalette } from '../theme/palette';

type AnimatedEmployeeActorProps = {
  bob: Animated.Value;
  depth: number;
  employee: OfficeEmployee;
  facing: Facing;
  onPress: () => void;
  palette: AppPalette;
  pose: EmployeePose;
  position: Animated.ValueXY;
  status: string;
};

const poseSources: Record<
  AnimatedEmployeeId,
  Record<EmployeePose, ImageSourcePropType>
> = {
  strategy: {
    handoff: require('../assets/office/employee-strategy.png'),
    seatedIdle: require('../assets/office/employee-strategy-workstation.png'),
    seatedReviewing: require('../assets/office/employee-strategy-workstation.png'),
    walkEmpty: require('../assets/office/employee-strategy-walk-empty.png'),
    walkWithFolder: require('../assets/office/employee-strategy-walk.png'),
  },
  reviewer: {
    handoff: require('../assets/office/employee-reviewer.png'),
    seatedIdle: require('../assets/office/employee-reviewer-workstation-idle.png'),
    seatedReviewing: require('../assets/office/employee-reviewer-workstation-review.png'),
    walkEmpty: require('../assets/office/employee-reviewer-walk-empty.png'),
    walkWithFolder: require('../assets/office/employee-reviewer-walk.png'),
  },
};

const baseFacing: Record<AnimatedEmployeeId, Facing> = {
  reviewer: 'left',
  strategy: 'right',
};

const poseAnchors: Record<EmployeePose, { x: number; y: number }> = {
  handoff: { x: 0.5, y: 0.9 },
  seatedIdle: { x: 0.5, y: 0.53 },
  seatedReviewing: { x: 0.5, y: 0.53 },
  walkEmpty: { x: 0.5, y: 0.9 },
  walkWithFolder: { x: 0.5, y: 0.9 },
};

export function AnimatedEmployeeActor({
  bob,
  depth,
  employee,
  facing,
  onPress,
  palette,
  pose,
  position,
  status,
}: AnimatedEmployeeActorProps) {
  const employeeId = employee.id as AnimatedEmployeeId;
  const poseOpacity = useRef(new Animated.Value(1)).current;
  const mirror = baseFacing[employeeId] === facing ? 1 : -1;
  const actorSize = actorSizes[employeeId];
  const spriteAnchor = poseAnchors[pose];

  useEffect(() => {
    poseOpacity.setValue(0.25);
    const transition = Animated.timing(poseOpacity, {
      duration: 160,
      toValue: 1,
      useNativeDriver: true,
    });
    transition.start();

    return () => transition.stop();
  }, [pose, poseOpacity]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.actor,
        actorSize,
        {
          transform: [
            {
              translateX: Animated.subtract(
                position.x,
                actorSize.width * spriteAnchor.x,
              ),
            },
            {
              translateY: Animated.subtract(
                position.y,
                actorSize.height * spriteAnchor.y,
              ),
            },
          ],
          zIndex: depth,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={`${employee.name}，${employee.role}，${status}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressTarget,
          pressed ? styles.pressed : undefined,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.actorLabel,
            {
              backgroundColor: palette.card,
              borderColor: palette.separator,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[styles.actorName, { color: palette.primaryText }]}
          >
            {employee.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.actorStatus, { color: palette.accent }]}
          >
            {status}
          </Text>
        </Animated.View>
        <Animated.Image
          resizeMode="contain"
          source={poseSources[employeeId][pose]}
          style={[
            styles.actorImage,
            {
              opacity: poseOpacity,
              transform: [{ translateY: bob }, { scaleX: mirror }],
            },
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

const actorSizes = StyleSheet.create({
  reviewer: {
    height: 150,
    width: 94,
  },
  strategy: {
    height: 154,
    width: 102,
  },
});

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
    width: '100%',
  },
  actorLabel: {
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    left: -2,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: 'absolute',
    right: -2,
    top: -12,
    zIndex: 2,
  },
  actorName: {
    flexShrink: 0,
    fontSize: 10,
    fontWeight: '800',
    marginRight: 4,
  },
  actorStatus: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
