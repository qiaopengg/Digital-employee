import { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { isNightPeriod } from '../office/officeLightingModel';
import { OFFICE_ANCHORS, getAnchoredTopLeft } from '../office/officePhysicsModel';
import { getTimeOfDayPeriod } from '../office/officeScheduleModel';
import { useDeliveryBehavior } from '../office/useDeliveryBehavior';
import { useHandoffBehavior } from '../office/useHandoffBehavior';
import { useOfficeClock } from '../office/useOfficeClock';
import {
  getOfficeEmployee,
  officeEmployees,
  type AssetMode,
  type EmployeeId,
} from '../office/officeSceneModel';
import { isSeatBoundPose } from '../office/officeSeatModel';
import type { AppPalette } from '../theme/palette';
import type { AiTaskExecution } from '../tasks/taskTypes';
import { AnimatedEmployeeActor } from './AnimatedEmployeeActor';
import { DeliveryDocumentIcon } from './DeliveryDocumentIcon';
import { DeskLampGlow } from './DeskLampGlow';
import { OfficeLightingOverlay } from './OfficeLightingOverlay';
import { OfficeSceneStatusLayer } from './OfficeSceneStatusLayer';
import { OfficeSeatForegroundLayer } from './OfficeSeatForegroundLayer';
import { OfficeWorkstationHotspots } from './OfficeWorkstationHotspots';
import { StaticEmployeeActor } from './StaticEmployeeActor';

type InteractiveOfficeSceneProps = {
  assetMode: AssetMode;
  handoffReplayToken: number;
  onHandoffComplete: () => void;
  onSelectAsset: () => void;
  onSelectEmployee: (employeeId: EmployeeId) => void;
  onSelectHandoff: () => void;
  palette: AppPalette;
  task?: AiTaskExecution;
};

const officeFloor = require('../assets/office/office-floor-v3.png');

export function InteractiveOfficeScene({
  assetMode,
  handoffReplayToken,
  onHandoffComplete,
  onSelectAsset,
  onSelectEmployee,
  onSelectHandoff,
  palette,
  task,
}: InteractiveOfficeSceneProps) {
  const [sceneSize, setSceneSize] = useState({ height: 0, width: 0 });
  const now = useOfficeClock();
  const timeOfDayPeriod = getTimeOfDayPeriod(now);
  const isOvertimePeriod = isNightPeriod(timeOfDayPeriod);
  const strategyEmployee = getOfficeEmployee('strategy');
  const reviewerEmployee = getOfficeEmployee('reviewer');
  const handoffBehavior = useHandoffBehavior({
    onComplete: onHandoffComplete,
    replayToken: handoffReplayToken,
    sceneSize,
  });
  const deliveryBehavior = useDeliveryBehavior({
    sceneSize,
    taskKey: task?.localId,
    taskStatus:
      task?.status === 'completed' || task?.status === 'failed'
        ? task.status
        : undefined,
  });
  const taskTitle = task?.prompt ?? '新品发布方案';
  const isDeskReady =
    deliveryBehavior.phase === 'deskReady' &&
    (task?.status === 'completed' || task?.status === 'failed');
  const handoffState = task
    ? task.status === 'completed'
      ? isDeskReady
        ? '汇报就绪 · 点击老板桌查看'
        : '汇报就绪 · 点击查看'
      : task.status === 'failed'
      ? isDeskReady
        ? '处理失败 · 点击老板桌查看'
        : '处理失败 · 点击查看'
      : handoffBehavior.phase === 'reviewing'
      ? '模型处理中 · 顾宁复核'
      : '员工协作中'
    : handoffBehavior.phase === 'reviewing'
    ? '已交接 · 审核中'
    : handoffBehavior.isRunning
    ? '工位间交接执行中'
    : '等待重新派单';
  const bossDeskPixels =
    sceneSize.width > 0
      ? getAnchoredTopLeft(
          OFFICE_ANCHORS.bossDesk,
          sceneSize.width,
          sceneSize.height,
          34,
          34,
          { x: 0.5, y: 1 },
        )
      : undefined;

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

      {isOvertimePeriod ? (
        <>
          <DeskLampGlow
            anchor={OFFICE_ANCHORS.strategySeat}
            sceneSize={sceneSize}
          />
          <DeskLampGlow
            anchor={OFFICE_ANCHORS.reviewerSeat}
            sceneSize={sceneSize}
          />
        </>
      ) : undefined}

      {sceneSize.width > 0 ? (
        <DeliveryDocumentIcon
          opacity={deliveryBehavior.iconOpacity}
          palette={palette}
          position={deliveryBehavior.iconPosition}
        />
      ) : undefined}

      <OfficeSeatForegroundLayer sceneSize={sceneSize} />
      <OfficeLightingOverlay period={timeOfDayPeriod} />

      {isDeskReady && bossDeskPixels ? (
        <Pressable
          accessibilityLabel="老板桌上有新汇报，点击查看员工工作结果"
          accessibilityRole="button"
          onPress={onSelectHandoff}
          style={({ pressed }) => [
            styles.deskNotice,
            {
              backgroundColor: palette.card,
              borderColor: palette.secretary,
              left: bossDeskPixels.left,
              top: bossDeskPixels.top,
            },
            pressed ? styles.pressedActor : undefined,
          ]}
        >
          <View
            style={[
              styles.deskNoticeDot,
              { backgroundColor: palette.accent },
            ]}
          />
          <Text style={[styles.deskNoticeText, { color: palette.secretary }]}>
            汇报
          </Text>
        </Pressable>
      ) : undefined}

      <OfficeSceneStatusLayer
        bubble={deliveryBehavior.bubble ?? handoffBehavior.frame.bubble}
        handoffState={handoffState}
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
  deskNotice: {
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: 1.4,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'absolute',
    zIndex: 92,
  },
  deskNoticeDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  deskNoticeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
