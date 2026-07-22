import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { useHandoffBehavior } from '../office/useHandoffBehavior';
import {
  OFFICE_ANCHORS,
  getAnchoredTopLeft,
} from '../office/officePhysicsModel';
import {
  getOfficeEmployee,
  officeEmployees,
  type AssetMode,
  type EmployeeId,
  type OfficeEmployee,
} from '../office/officeSceneModel';
import type { AppPalette } from '../theme/palette';
import { AnimatedEmployeeActor } from './AnimatedEmployeeActor';

type InteractiveOfficeSceneProps = {
  assetMode: AssetMode;
  handoffReplayToken: number;
  localTaskTitle?: string;
  onHandoffComplete: () => void;
  onSelectAsset: () => void;
  onSelectEmployee: (employeeId: EmployeeId) => void;
  onSelectHandoff: () => void;
  palette: AppPalette;
};

type EmployeeActorProps = {
  employee: OfficeEmployee;
  onPress: () => void;
  palette: AppPalette;
  sceneSize: { height: number; width: number };
};

const officeFloor = require('../assets/office/office-floor.png');
const coffeeMachine = require('../assets/office/asset-coffee-machine.png');

function EmployeeActor({
  employee,
  onPress,
  palette,
  sceneSize,
}: EmployeeActorProps) {
  const actorConfig =
    employee.id === 'secretary'
      ? staticActorConfigs.secretary
      : staticActorConfigs.break;
  const anchoredPosition =
    sceneSize.width > 0
      ? getAnchoredTopLeft(
          OFFICE_ANCHORS[actorConfig.anchorId],
          sceneSize.width,
          sceneSize.height,
          actorConfig.width,
          actorConfig.height,
          actorConfig.spriteAnchor,
        )
      : employee.id === 'secretary'
      ? actorPositions.secretary
      : actorPositions.break;

  return (
    <Pressable
      accessibilityLabel={`${employee.name}，${employee.role}，${employee.status}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actor,
        {
          height: actorConfig.height,
          width: actorConfig.width,
          zIndex: actorConfig.depth,
        },
        anchoredPosition,
        pressed ? styles.pressedActor : undefined,
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
        <Text
          numberOfLines={1}
          style={[styles.actorName, { color: palette.primaryText }]}
        >
          {employee.name}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.actorStatus,
            {
              color:
                employee.id === 'break' ? palette.secretary : palette.accent,
            },
          ]}
        >
          {employee.status}
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

export function InteractiveOfficeScene({
  assetMode,
  handoffReplayToken,
  localTaskTitle,
  onHandoffComplete,
  onSelectAsset,
  onSelectEmployee,
  onSelectHandoff,
  palette,
}: InteractiveOfficeSceneProps) {
  const [sceneSize, setSceneSize] = useState({ height: 0, width: 0 });
  const strategyEmployee = getOfficeEmployee('strategy');
  const reviewerEmployee = getOfficeEmployee('reviewer');
  const handoffBehavior = useHandoffBehavior({
    onComplete: onHandoffComplete,
    replayToken: handoffReplayToken,
    sceneSize,
  });
  const taskTitle = localTaskTitle ?? '新品发布方案';
  const handoffState =
    handoffBehavior.phase === 'reviewing'
      ? '已交接'
      : handoffBehavior.isRunning
      ? '现场进行中'
      : '待启动';

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setSceneSize(current =>
      current.height === height && current.width === width
        ? current
        : { height, width },
    );
  };

  return (
    <ImageBackground
      imageStyle={styles.backgroundImage}
      onLayout={handleLayout}
      resizeMode="cover"
      source={officeFloor}
      style={styles.scene}
    >
      <View style={styles.sceneHeader}>
        <View
          style={[
            styles.officeChip,
            { backgroundColor: palette.card, borderColor: palette.separator },
          ]}
        >
          <Text style={[styles.officeChipText, { color: palette.primaryText }]}>
            标准公司楼层 · 租赁中
          </Text>
        </View>
        <View
          style={[styles.liveChip, { backgroundColor: palette.successSoft }]}
        >
          <Text style={[styles.liveChipText, { color: palette.success }]}>
            4 人在场
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel="查看咖啡机资产"
        accessibilityRole="button"
        onPress={onSelectAsset}
        style={({ pressed }) => [
          styles.assetTarget,
          { borderColor: palette.secretary },
          assetMode === 'moved' ? styles.assetMoved : undefined,
          assetMode === 'sold' ? styles.assetSold : undefined,
          pressed ? styles.pressedActor : undefined,
        ]}
      >
        {assetMode === 'sold' ? undefined : (
          <Image
            resizeMode="contain"
            source={coffeeMachine}
            style={styles.assetImage}
          />
        )}
        <View style={[styles.assetBadge, { backgroundColor: palette.card }]}>
          <Text style={[styles.assetBadgeText, { color: palette.secretary }]}>
            {assetMode === 'maintenance'
              ? '维护中'
              : assetMode === 'moved'
              ? '新槽位'
              : assetMode === 'sold'
              ? '空闲槽位'
              : '资产'}
          </Text>
        </View>
      </Pressable>

      {officeEmployees
        .filter(
          employee => employee.id === 'secretary' || employee.id === 'break',
        )
        .map(employee => (
          <EmployeeActor
            employee={employee}
            key={employee.id}
            onPress={() => onSelectEmployee(employee.id)}
            palette={palette}
            sceneSize={sceneSize}
          />
        ))}

      {sceneSize.width > 0 ? (
        <>
          <AnimatedEmployeeActor
            bob={handoffBehavior.strategyBob}
            depth={
              handoffBehavior.phase === 'idle' ||
              handoffBehavior.phase === 'reviewing'
                ? 52
                : 66
            }
            employee={strategyEmployee}
            facing={handoffBehavior.frame.strategy.facing}
            onPress={() => onSelectEmployee('strategy')}
            palette={palette}
            pose={handoffBehavior.frame.strategy.pose}
            position={handoffBehavior.strategyPosition}
            status={handoffBehavior.frame.strategy.status}
          />
          <AnimatedEmployeeActor
            bob={handoffBehavior.reviewerBob}
            depth={
              handoffBehavior.phase === 'idle' ||
              handoffBehavior.phase === 'reviewing'
                ? 52
                : 67
            }
            employee={reviewerEmployee}
            facing={handoffBehavior.frame.reviewer.facing}
            onPress={() => onSelectEmployee('reviewer')}
            palette={palette}
            pose={handoffBehavior.frame.reviewer.pose}
            position={handoffBehavior.reviewerPosition}
            status={handoffBehavior.frame.reviewer.status}
          />
        </>
      ) : undefined}

      <Pressable
        accessibilityLabel="查看员工交接对话"
        accessibilityRole="button"
        onPress={onSelectHandoff}
        style={({ pressed }) => [
          styles.handoffBubble,
          {
            backgroundColor: palette.card,
            borderColor: palette.separator,
          },
          pressed ? styles.pressed : undefined,
        ]}
      >
        <Text style={[styles.handoffTask, { color: palette.secondaryText }]}>
          {taskTitle} · {handoffState}
        </Text>
        <Text style={[styles.handoffText, { color: palette.primaryText }]}>
          {handoffBehavior.frame.bubble}
        </Text>
      </Pressable>

      {localTaskTitle ? (
        <View style={[styles.localTask, { backgroundColor: palette.card }]}>
          <Text
            style={[styles.localTaskText, { color: palette.secondaryText }]}
          >
            尚未发送给 AI
          </Text>
        </View>
      ) : undefined}
    </ImageBackground>
  );
}

const actorPositions = StyleSheet.create({
  secretary: {
    height: 130,
    right: '7%',
    top: '20%',
    width: 82,
  },
  break: {
    bottom: '1%',
    height: 145,
    left: '1%',
    width: 104,
  },
});

const staticActorConfigs = {
  secretary: {
    anchorId: 'secretaryStanding' as const,
    depth: 36,
    height: 130,
    spriteAnchor: { x: 0.5, y: 0.9 },
    width: 82,
  },
  break: {
    anchorId: 'sofaSeat' as const,
    depth: 82,
    height: 145,
    spriteAnchor: { x: 0.5, y: 0.5 },
    width: 104,
  },
};

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    minHeight: 400,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    borderRadius: 24,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 10,
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 20,
  },
  officeChip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  officeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  liveChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
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
  assetTarget: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 66,
    justifyContent: 'center',
    left: '44%',
    position: 'absolute',
    top: '5%',
    width: 58,
    zIndex: 8,
  },
  assetImage: {
    height: 58,
    width: 58,
  },
  assetMoved: {
    left: '37%',
  },
  assetSold: {
    borderStyle: 'dashed',
  },
  assetBadge: {
    borderRadius: 7,
    bottom: -10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
  },
  assetBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  handoffBubble: {
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    left: '20%',
    paddingHorizontal: 11,
    paddingVertical: 7,
    position: 'absolute',
    top: '27%',
    width: '60%',
    zIndex: 30,
  },
  handoffTask: {
    fontSize: 9,
    fontWeight: '600',
  },
  handoffText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  localTask: {
    borderRadius: 9,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
    right: 10,
    zIndex: 18,
  },
  localTaskText: {
    fontSize: 9,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.65,
  },
  pressedActor: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
