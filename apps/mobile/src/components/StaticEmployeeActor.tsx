import { Image, Pressable, StyleSheet, View } from 'react-native';

import {
  OFFICE_ANCHORS,
  getAnchoredTopLeft,
} from '../office/officePhysicsModel';
import type { OfficeEmployee } from '../office/officeSceneModel';
import {
  EMPLOYEE_NEAR_FIELD_WIDTH_RATIO,
  OFFICE_EMPLOYEE_SPRITE_ANCHORS,
} from '../office/officeSeatModel';
import type { AppPalette } from '../theme/palette';
import { EmployeeStatusIcon } from './EmployeeStatusIcon';

type StaticEmployeeActorProps = {
  employee: OfficeEmployee;
  onPress: () => void;
  palette: AppPalette;
  sceneSize: { height: number; width: number };
};

const actorConfigs = {
  secretary: {
    anchorId: 'secretarySeat' as const,
    depth: 54,
    fallbackWidth: 42,
    heightRatio: 1.5,
    spriteAnchor: OFFICE_EMPLOYEE_SPRITE_ANCHORS.seatedIdle,
    widthRatio: EMPLOYEE_NEAR_FIELD_WIDTH_RATIO,
  },
  break: {
    anchorId: 'sofaSeat' as const,
    depth: 56,
    fallbackWidth: 42,
    heightRatio: 1.5,
    spriteAnchor: { x: 0.5, y: 0.53 },
    widthRatio: EMPLOYEE_NEAR_FIELD_WIDTH_RATIO,
  },
};

const secretarySeatSprite = require('../assets/office/employee-secretary-seated-rig-v5.png');

export function StaticEmployeeActor({
  employee,
  onPress,
  palette,
  sceneSize,
}: StaticEmployeeActorProps) {
  const actorConfig =
    employee.id === 'secretary' ? actorConfigs.secretary : actorConfigs.break;
  const actorWidth =
    sceneSize.width > 0
      ? sceneSize.width * actorConfig.widthRatio
      : actorConfig.fallbackWidth;
  const actorHeight = actorWidth * actorConfig.heightRatio;
  const anchoredPosition =
    sceneSize.width > 0
      ? getAnchoredTopLeft(
          OFFICE_ANCHORS[actorConfig.anchorId],
          sceneSize.width,
          sceneSize.height,
          actorWidth,
          actorHeight,
          actorConfig.spriteAnchor,
        )
      : employee.id === 'secretary'
      ? fallbackPositions.secretary
      : fallbackPositions.break;

  return (
    <Pressable
      accessibilityLabel={`${employee.name}，${employee.role}，${employee.status}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actor,
        {
          height: actorHeight,
          width: actorWidth,
          zIndex: actorConfig.depth,
        },
        anchoredPosition,
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
        <EmployeeStatusIcon
          kind={employee.id === 'break' ? 'break' : 'available'}
          palette={palette}
          size={10}
        />
      </View>
      <Image
        resizeMode="contain"
        source={
          employee.id === 'secretary' ? secretarySeatSprite : employee.image
        }
        style={styles.actorImage}
      />
    </Pressable>
  );
}

const fallbackPositions = StyleSheet.create({
  secretary: { bottom: '24%', left: '13%' },
  break: { bottom: '22%', right: '18%' },
});

const styles = StyleSheet.create({
  actor: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
  },
  actorImage: {
    height: '100%',
    width: '100%',
  },
  actorLabel: {
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 2,
    position: 'absolute',
    right: -6,
    top: -12,
    zIndex: 2,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
