import { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import type {
  EmployeeActivity,
  EmployeePose,
} from '../office/officeBehaviorModel';
import type { IdleActivityPhase } from '../office/officeActivityModel';
import { isNightPeriod } from '../office/officeLightingModel';
import {
  OFFICE_ANCHORS,
  getAnchoredTopLeft,
  type NormalizedPoint,
} from '../office/officePhysicsModel';
import type { TimeOfDayPeriod } from '../office/officeScheduleModel';
import { useDeliveryBehavior } from '../office/useDeliveryBehavior';
import { useHandoffBehavior } from '../office/useHandoffBehavior';
import { useIdleActivityBehavior } from '../office/useIdleActivityBehavior';
import {
  getOfficeEmployee,
  type AssetMode,
  type EmployeeId,
} from '../office/officeSceneModel';
import { isSeatBoundPose } from '../office/officeSeatModel';
import type { AppPalette } from '../theme/palette';
import type { AiTaskExecution } from '../tasks/taskTypes';
import { AnimatedEmployeeActor } from './AnimatedEmployeeActor';
import { DeliveryDocumentIcon } from './DeliveryDocumentIcon';
import { DeskLampGlow } from './DeskLampGlow';
import { MobileEmployeeActor } from './MobileEmployeeActor';
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
  period: TimeOfDayPeriod;
  task?: AiTaskExecution;
  workingNow: boolean;
};

const officeFloor = require('../assets/office/office-floor-v3.png');

function getIdlePose(phase: IdleActivityPhase): EmployeePose {
  return phase === 'atDesk' ? 'seatedIdle' : 'walkEmpty';
}

function getIdleActivity(phase: IdleActivityPhase): EmployeeActivity {
  return phase === 'atDesk' ? 'working' : 'moving';
}

function getIdleStatus(phase: IdleActivityPhase) {
  if (phase === 'atDesk') return '在工位待命';
  if (phase === 'away') return '短暂活动，将在 20 秒内返岗';
  if (phase === 'returning') return '正在返回工位';
  return '离开工位进行短暂活动';
}

export function InteractiveOfficeScene({
  assetMode,
  handoffReplayToken,
  onHandoffComplete,
  onSelectAsset,
  onSelectEmployee,
  onSelectHandoff,
  palette,
  period,
  task,
  workingNow,
}: InteractiveOfficeSceneProps) {
  const [sceneSize, setSceneSize] = useState({ height: 0, width: 0 });
  const taskWorking = task?.status === 'working';
  const taskTerminal =
    task?.status === 'completed' || task?.status === 'failed';
  const strategyEmployee = getOfficeEmployee('strategy');
  const reviewerEmployee = getOfficeEmployee('reviewer');
  const secretaryEmployee = getOfficeEmployee('secretary');
  const contentEmployee = getOfficeEmployee('break');

  const handoffBehavior = useHandoffBehavior({
    enabled: taskWorking,
    onComplete: onHandoffComplete,
    replayToken: handoffReplayToken,
    sceneSize,
  });
  const deliveryBehavior = useDeliveryBehavior({
    enabled: taskTerminal,
    sceneSize,
    taskKey: task?.localId,
  });
  const deliveryOwnsTeam =
    taskTerminal && deliveryBehavior.phase !== 'deskReady';
  const idleEnabled = workingNow && !taskWorking && !deliveryOwnsTeam;
  const strategyIdle = useIdleActivityBehavior({
    employeeId: 'strategy',
    enabled: idleEnabled,
    sceneSize,
  });
  const reviewerIdle = useIdleActivityBehavior({
    employeeId: 'reviewer',
    enabled: idleEnabled,
    sceneSize,
  });
  const secretaryIdle = useIdleActivityBehavior({
    employeeId: 'secretary',
    enabled: idleEnabled,
    sceneSize,
  });
  const contentIdle = useIdleActivityBehavior({
    employeeId: 'break',
    enabled: idleEnabled,
    sceneSize,
  });

  const officeActive = workingNow || taskWorking || deliveryOwnsTeam;
  const strategyPose = taskWorking
    ? handoffBehavior.frame.strategy.pose
    : getIdlePose(strategyIdle.phase);
  const reviewerPose = taskWorking
    ? handoffBehavior.frame.reviewer.pose
    : getIdlePose(reviewerIdle.phase);
  const strategyAtDesk = taskWorking
    ? isSeatBoundPose(strategyPose)
    : strategyIdle.phase === 'atDesk';
  const reviewerAtDesk = taskWorking
    ? isSeatBoundPose(reviewerPose)
    : reviewerIdle.phase === 'atDesk';
  const secretaryPhase = deliveryOwnsTeam
    ? deliveryBehavior.secretaryPhase
    : secretaryIdle.phase;
  const secretaryAtDesk = secretaryPhase === 'atDesk';
  const contentAtDesk = contentIdle.phase === 'atDesk';
  const darkWorkingScene =
    isNightPeriod(period) &&
    officeActive &&
    (workingNow || taskWorking || deliveryOwnsTeam);
  const illuminatedDesks: NormalizedPoint[] = [];

  if (darkWorkingScene && strategyAtDesk) {
    illuminatedDesks.push(OFFICE_ANCHORS.strategySeat);
  }
  if (darkWorkingScene && reviewerAtDesk) {
    illuminatedDesks.push(OFFICE_ANCHORS.reviewerSeat);
  }
  if (darkWorkingScene && secretaryAtDesk) {
    illuminatedDesks.push(OFFICE_ANCHORS.secretarySeat);
  }
  if (darkWorkingScene && contentAtDesk) {
    illuminatedDesks.push(OFFICE_ANCHORS.contentSeat);
  }

  const taskTitle = task?.prompt ?? '等待老板派发新任务';
  const isDeskReady = deliveryBehavior.resultReady && taskTerminal;
  const handoffState = task
    ? task.status === 'completed'
      ? isDeskReady
        ? '汇报已放到老板桌 · 点击查看'
        : 'AI 已完成 · 小岚正在送件'
      : task.status === 'failed'
      ? isDeskReady
        ? '失败详情已放到老板桌 · 点击查看'
        : '处理失败 · 小岚正在送件'
      : handoffBehavior.phase === 'reviewing'
      ? 'AI 处理中 · 顾宁复核'
      : 'AI 处理中 · 员工协作'
    : workingNow
    ? '员工在岗 · 无任务时短暂自由活动'
    : '当前为非工作时间';
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

  const secretaryPosition = deliveryOwnsTeam
    ? deliveryBehavior.secretaryPosition
    : secretaryIdle.position;
  const secretaryBob = deliveryOwnsTeam
    ? deliveryBehavior.secretaryBob
    : secretaryIdle.bob;
  const secretaryGait = deliveryOwnsTeam
    ? deliveryBehavior.secretaryGait
    : secretaryIdle.gait;
  const secretaryFacing = deliveryOwnsTeam
    ? deliveryBehavior.secretaryFacing
    : secretaryIdle.facing;
  const documentPosition = deliveryBehavior.documentIsCarried
    ? deliveryBehavior.secretaryPosition
    : deliveryBehavior.iconPosition;

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

      {!officeActive && sceneSize.width > 0 ? (
        <StaticEmployeeActor
          employee={contentEmployee}
          onPress={() => onSelectEmployee('break')}
          palette={palette}
          sceneSize={sceneSize}
        />
      ) : undefined}

      {officeActive && sceneSize.width > 0 ? (
        <>
          <AnimatedEmployeeActor
            bob={taskWorking ? handoffBehavior.strategyBob : strategyIdle.bob}
            depth={isSeatBoundPose(strategyPose) ? 52 : 66}
            employee={strategyEmployee}
            facing={
              taskWorking
                ? handoffBehavior.frame.strategy.facing
                : strategyIdle.facing
            }
            gait={
              taskWorking ? handoffBehavior.strategyGait : strategyIdle.gait
            }
            onPress={() => onSelectEmployee('strategy')}
            palette={palette}
            pose={strategyPose}
            position={
              taskWorking
                ? handoffBehavior.strategyPosition
                : strategyIdle.position
            }
            sceneWidth={sceneSize.width}
            status={
              taskWorking
                ? handoffBehavior.frame.strategy.activity
                : getIdleActivity(strategyIdle.phase)
            }
            statusDetail={
              taskWorking
                ? handoffBehavior.frame.strategy.status
                : getIdleStatus(strategyIdle.phase)
            }
          />
          <AnimatedEmployeeActor
            bob={taskWorking ? handoffBehavior.reviewerBob : reviewerIdle.bob}
            depth={isSeatBoundPose(reviewerPose) ? 52 : 67}
            employee={reviewerEmployee}
            facing={
              taskWorking
                ? handoffBehavior.frame.reviewer.facing
                : reviewerIdle.facing
            }
            gait={
              taskWorking ? handoffBehavior.reviewerGait : reviewerIdle.gait
            }
            onPress={() => onSelectEmployee('reviewer')}
            palette={palette}
            pose={reviewerPose}
            position={
              taskWorking
                ? handoffBehavior.reviewerPosition
                : reviewerIdle.position
            }
            sceneWidth={sceneSize.width}
            status={
              taskWorking
                ? handoffBehavior.frame.reviewer.activity
                : getIdleActivity(reviewerIdle.phase)
            }
            statusDetail={
              taskWorking
                ? handoffBehavior.frame.reviewer.status
                : getIdleStatus(reviewerIdle.phase)
            }
          />

          <MobileEmployeeActor
            bob={secretaryBob}
            depth={secretaryAtDesk ? 54 : 68}
            employee={secretaryEmployee}
            facing={secretaryFacing}
            gait={secretaryGait}
            onPress={() => onSelectEmployee('secretary')}
            palette={palette}
            phase={secretaryPhase}
            position={secretaryPosition}
            sceneWidth={sceneSize.width}
          />
          <MobileEmployeeActor
            bob={contentIdle.bob}
            depth={contentAtDesk ? 52 : 68}
            employee={contentEmployee}
            facing={contentIdle.facing}
            gait={contentIdle.gait}
            onPress={() => onSelectEmployee('break')}
            palette={palette}
            phase={contentIdle.phase}
            position={contentIdle.position}
            sceneWidth={sceneSize.width}
          />
        </>
      ) : undefined}

      {sceneSize.width > 0 && taskTerminal ? (
        <DeliveryDocumentIcon
          opacity={deliveryBehavior.iconOpacity}
          palette={palette}
          position={documentPosition}
        />
      ) : undefined}

      <OfficeSeatForegroundLayer sceneSize={sceneSize} />
      <OfficeLightingOverlay period={period} />
      {illuminatedDesks.map((anchor, index) => (
        <DeskLampGlow
          anchor={anchor}
          key={`${anchor.x}-${anchor.y}-${index}`}
          sceneSize={sceneSize}
        />
      ))}

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
            style={[styles.deskNoticeDot, { backgroundColor: palette.accent }]}
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
