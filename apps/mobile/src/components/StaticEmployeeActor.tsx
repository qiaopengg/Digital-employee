import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  OFFICE_ANCHORS,
  getAnchoredTopLeft,
} from '../office/officePhysicsModel';
import type { OfficeEmployee } from '../office/officeSceneModel';
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
    anchorId: 'secretaryStanding' as const,
    depth: 36,
    fallbackWidth: 42,
    heightRatio: 1.5,
    spriteAnchor: { x: 0.5, y: 0.92 },
    widthRatio: 0.105,
  },
  break: {
    anchorId: 'sofaSeat' as const,
    depth: 82,
    fallbackWidth: 48,
    heightRatio: 1.5,
    spriteAnchor: { x: 0.5, y: 0.46 },
    widthRatio: 0.12,
  },
};

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
          size={14}
        />
        <Text
          numberOfLines={1}
          style={[styles.actorName, { color: palette.primaryText }]}
        >
          {employee.name}
        </Text>
      </View>
      <Image
        resizeMode="contain"
        source={employee.image}
        style={styles.actorImage}
      />
    </Pressable>
  );
}

const fallbackPositions = StyleSheet.create({
  secretary: { right: '7%', top: '20%' },
  break: { bottom: '1%', left: '1%' },
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
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 5,
    paddingVertical: 3,
    position: 'absolute',
    top: -12,
    zIndex: 2,
  },
  actorName: {
    fontSize: 9,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
