import { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { useHandoffBehavior } from '../office/useHandoffBehavior';
import {
  getOfficeEmployee,
  officeEmployees,
  type AssetMode,
  type EmployeeId,
} from '../office/officeSceneModel';
import { isSeatBoundPose } from '../office/officeSeatModel';
import type { AppPalette } from '../theme/palette';
import { AnimatedEmployeeActor } from './AnimatedEmployeeActor';
import { OfficeSceneStatusLayer } from './OfficeSceneStatusLayer';
import { OfficeSeatForegroundLayer } from './OfficeSeatForegroundLayer';
import { OfficeWorkstationHotspots } from './OfficeWorkstationHotspots';
import { StaticEmployeeActor } from './StaticEmployeeActor';

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

const officeFloor = require('../assets/office/office-floor-v3.png');

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
      ? '已交接 · 审核中'
      : handoffBehavior.isRunning
      ? '工位间交接执行中'
      : '等待重新派单';

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
      resizeMode="stretch"
      source={officeFloor}
      style={styles.scene}
    >
      <OfficeWorkstationHotspots />

      <Pressable
        accessibilityLabel="查看咖啡机资产"
        accessibilityRole="button"
        onPress={onSelectAsset}
        style={({ pressed }) => [
          styles.assetTarget,
          pressed ? styles.pressedActor : undefined,
        ]}
      >
        <View style={[styles.assetBadge, { backgroundColor: palette.card }]}>
          <Text style={[styles.assetBadgeText, { color: palette.secretary }]}>
            {assetMode === 'maintenance'
              ? '维护'
              : assetMode === 'moved'
              ? '迁移'
              : assetMode === 'sold'
              ? '已售'
              : '资产'}
          </Text>
        </View>
      </Pressable>

      {officeEmployees
        .filter(
          employee => employee.id === 'secretary' || employee.id === 'break',
        )
        .map(employee => (
          <StaticEmployeeActor
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
              isSeatBoundPose(handoffBehavior.frame.strategy.pose) ? 52 : 66
            }
            employee={strategyEmployee}
            facing={handoffBehavior.frame.strategy.facing}
            gait={handoffBehavior.strategyGait}
            onPress={() => onSelectEmployee('strategy')}
            palette={palette}
            pose={handoffBehavior.frame.strategy.pose}
            position={handoffBehavior.strategyPosition}
            sceneWidth={sceneSize.width}
            status={handoffBehavior.frame.strategy.activity}
            statusDetail={handoffBehavior.frame.strategy.status}
          />
          <AnimatedEmployeeActor
            bob={handoffBehavior.reviewerBob}
            depth={
              isSeatBoundPose(handoffBehavior.frame.reviewer.pose) ? 52 : 67
            }
            employee={reviewerEmployee}
            facing={handoffBehavior.frame.reviewer.facing}
            gait={handoffBehavior.reviewerGait}
            onPress={() => onSelectEmployee('reviewer')}
            palette={palette}
            pose={handoffBehavior.frame.reviewer.pose}
            position={handoffBehavior.reviewerPosition}
            sceneWidth={sceneSize.width}
            status={handoffBehavior.frame.reviewer.activity}
            statusDetail={handoffBehavior.frame.reviewer.status}
          />
        </>
      ) : undefined}

      <OfficeSeatForegroundLayer sceneSize={sceneSize} />
      <OfficeSceneStatusLayer
        bubble={handoffBehavior.frame.bubble}
        handoffState={handoffState}
        localTaskTitle={localTaskTitle}
        onSelectHandoff={onSelectHandoff}
        palette={palette}
        taskTitle={taskTitle}
      />
    </ImageBackground>
  );
}

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
  assetTarget: {
    alignItems: 'center',
    height: '14%',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: '62%',
    width: '11%',
    zIndex: 8,
  },
  assetBadge: {
    borderRadius: 7,
    left: -7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: 7,
  },
  assetBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  pressedActor: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
