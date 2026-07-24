import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  getLocalOfficeDateKey,
  selectDailyActivityEmployees,
  type IdleActivityPhase,
} from '../office/officeActivityModel';
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
  bossPresent: boolean;
  handoffReplayToken: number;
  now: Date;
  onConfigureSchedule: () => void;
  onHandoffComplete: () => void;
  onSelectAsset: () => void;
  onSelectEmployee: (employeeId: EmployeeId) => void;
  onSelectHandoff: () => void;
  onToggleBossPresence: () => void;
  palette: AppPalette;
  period: TimeOfDayPeriod;
  task?: AiTaskExecution;
  workingNow: boolean;
};

const officeFloor = require('../assets/office/office-floor-v3.png');
const ACTIVITY_EMPLOYEE_IDS: ReadonlyArray<EmployeeId> = [
  'strategy',
  'reviewer',
  'secretary',
  'break',
];

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
  bossPresent,
  handoffReplayToken,
  now,
  onConfigureSchedule,
  onHandoffComplete,
  onSelectAsset,
  onSelectEmployee,
  onSelectHandoff,
  onToggleBossPresence,
  palette,
  period,
  task,
  workingNow,
}: InteractiveOfficeSceneProps) {
  const [sceneSize, setSceneSize] = useState({ height: 0, width: 0 });
  const dateKey = getLocalOfficeDateKey(now);
  const dailyActivityEmployees = useMemo(
    () => selectDailyActivityEmployees(dateKey, ACTIVITY_EMPLOYEE_IDS),
    [dateKey],
  );
  const [idleTurn, setIdleTurn] = useState(0);
  const activeIdleEmployee = dailyActivityEmployees[idleTurn];
  const taskWorking = task?.status === 'working';
  const taskTerminal =
    task?.status === 'completed' || task?.status === 'failed';
  const strategyEmployee = getOfficeEmployee('strategy');
  const reviewerEmployee = getOfficeEmployee('reviewer');
  const secretaryEmployee = getOfficeEmployee('secretary');
  const contentEmployee = getOfficeEmployee('break');

  useEffect(() => {
    setIdleTurn(0);
  }, [dateKey]);

  const completeIdleActivity = useCallback(
    (employeeId: EmployeeId) => {
      setIdleTurn(currentTurn =>
        dailyActivityEmployees[currentTurn] === employeeId
          ? currentTurn + 1
          : currentTurn,
      );
    },
    [dailyActivityEmployees],
  );
  const completeStrategyIdle = useCallback(
    () => completeIdleActivity('strategy'),
    [completeIdleActivity],
  );
  const completeReviewerIdle = useCallback(
    () => completeIdleActivity('reviewer'),
    [completeIdleActivity],
  );
  const completeSecretaryIdle = useCallback(
    () => completeIdleActivity('secretary'),
    [completeIdleActivity],
  );
  const completeContentIdle = useCallback(
    () => completeIdleActivity('break'),
    [completeIdleActivity],
  );

  const handoffBehavior = useHandoffBehavior({
    enabled: taskWorking,
    onComplete: onHandoffComplete,
    replayToken: handoffReplayToken,
    sceneSize,
  });
  const deliveryBehavior = useDeliveryBehavior({
    bossPresent,
    enabled: taskTerminal,
    sceneSize,
    taskKey: task?.localId,
  });
  const idleEnabled = workingNow && !taskWorking && !taskTerminal;
  const strategyIdle = useIdleActivityBehavior({
    employeeId: 'strategy',
    enabled: idleEnabled && activeIdleEmployee === 'strategy',
    onComplete: completeStrategyIdle,
    sceneSize,
  });
  const reviewerIdle = useIdleActivityBehavior({
    employeeId: 'reviewer',
    enabled: idleEnabled && activeIdleEmployee === 'reviewer',
    onComplete: completeReviewerIdle,
    sceneSize,
  });
  const secretaryIdle = useIdleActivityBehavior({
    employeeId: 'secretary',
    enabled: idleEnabled && activeIdleEmployee === 'secretary',
    onComplete: completeSecretaryIdle,
    sceneSize,
  });
  const contentIdle = useIdleActivityBehavior({
    employeeId: 'break',
    enabled: idleEnabled && activeIdleEmployee === 'break',
    onComplete: completeContentIdle,
    sceneSize,
  });

  const officeActive = workingNow || taskWorking || taskTerminal;
  const strategyPose = taskWorking
    ? handoffBehavior.frame.strategy.pose
    : getIdlePose(strategyIdle.phase);
  const reviewerPhase = taskTerminal
    ? deliveryBehavior.reviewerPhase
    : reviewerIdle.phase;
  const reviewerPose = taskWorking
    ? handoffBehavior.frame.reviewer.pose
    : getIdlePose(reviewerPhase);
  const strategyAtDesk = taskWorking
    ? isSeatBoundPose(strategyPose)
    : strategyIdle.phase === 'atDesk';
  const reviewerAtDesk = taskWorking
    ? isSeatBoundPose(reviewerPose)
    : reviewerPhase === 'atDesk';
  const secretaryPhase = taskTerminal
    ? deliveryBehavior.secretaryPhase
    : secretaryIdle.phase;
  const secretaryAtDesk = secretaryPhase === 'atDesk';
  const contentAtDesk = contentIdle.phase === 'atDesk';
  const darkWorkingScene = isNightPeriod(period) && officeActive;
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
  const isDeskReady = deliveryBehavior.deskReady && taskTerminal;
  const deliveryInReviewerHands =
    deliveryBehavior.phase === 'reviewerStanding' ||
    deliveryBehavior.phase === 'secretaryStanding' ||
    deliveryBehavior.phase === 'reviewerOutbound' ||
    deliveryBehavior.phase === 'reviewerHandoff';
  const deliveryProgressText = bossPresent
    ? '顾宁正在将终审汇报送往老板桌'
    : deliveryInReviewerHands
    ? '顾宁正在将终审汇报转交小岚'
    : '小岚正在将汇报送往老板桌';
  const handoffState = task
    ? task.status === 'completed'
      ? isDeskReady
        ? '任务完成 · 汇报已送达老板桌 · 点击查看'
        : `任务完成 · ${deliveryProgressText}`
      : task.status === 'failed'
      ? isDeskReady
        ? '处理失败 · 详情已送达老板桌 · 点击查看'
        : `处理失败 · ${deliveryProgressText}`
      : handoffBehavior.phase === 'reviewing'
      ? 'AI 处理中 · 顾宁复核'
      : 'AI 处理中 · 员工协作'
    : workingNow
    ? idleTurn < dailyActivityEmployees.length
      ? '员工在岗 · 今日自由活动依次进行'
      : '员工在岗 · 今日自由活动已完成'
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

  const reviewerBob = taskTerminal
    ? deliveryBehavior.reviewerBob
    : reviewerIdle.bob;
  const reviewerFacing = taskTerminal
    ? deliveryBehavior.reviewerFacing
    : reviewerIdle.facing;
  const reviewerGait = taskTerminal
    ? deliveryBehavior.reviewerGait
    : reviewerIdle.gait;
  const reviewerPosition = taskTerminal
    ? deliveryBehavior.reviewerPosition
    : reviewerIdle.position;
  const secretaryPosition = taskTerminal
    ? deliveryBehavior.secretaryPosition
    : secretaryIdle.position;
  const secretaryBob = taskTerminal
    ? deliveryBehavior.secretaryBob
    : secretaryIdle.bob;
  const secretaryGait = taskTerminal
    ? deliveryBehavior.secretaryGait
    : secretaryIdle.gait;
  const secretaryFacing = taskTerminal
    ? deliveryBehavior.secretaryFacing
    : secretaryIdle.facing;
  const documentPosition =
    deliveryBehavior.documentCarrier === 'reviewer'
      ? deliveryBehavior.reviewerPosition
      : deliveryBehavior.documentCarrier === 'secretary'
      ? deliveryBehavior.secretaryPosition
      : deliveryBehavior.iconPosition;
  const hourRotation = ((now.getHours() % 12) + now.getMinutes() / 60) * 30;
  const minuteRotation = now.getMinutes() * 6;
  const formattedTime = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  });

  return (
    <ImageBackground
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
            bob={taskWorking ? handoffBehavior.reviewerBob : reviewerBob}
            depth={isSeatBoundPose(reviewerPose) ? 52 : 67}
            employee={reviewerEmployee}
            facing={
              taskWorking
                ? handoffBehavior.frame.reviewer.facing
                : reviewerFacing
            }
            gait={taskWorking ? handoffBehavior.reviewerGait : reviewerGait}
            onPress={() => onSelectEmployee('reviewer')}
            palette={palette}
            pose={reviewerPose}
            position={
              taskWorking ? handoffBehavior.reviewerPosition : reviewerPosition
            }
            sceneWidth={sceneSize.width}
            status={
              taskWorking
                ? handoffBehavior.frame.reviewer.activity
                : getIdleActivity(reviewerPhase)
            }
            statusDetail={
              taskWorking
                ? handoffBehavior.frame.reviewer.status
                : taskTerminal && deliveryBehavior.bubble
                ? deliveryBehavior.bubble
                : getIdleStatus(reviewerPhase)
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

      <Pressable
        accessibilityLabel={`设置工作时间，当前 ${formattedTime}`}
        accessibilityRole="button"
        onPress={onConfigureSchedule}
        style={({ pressed }) => [
          styles.sceneClock,
          {
            backgroundColor: palette.navigation,
            borderColor: palette.separator,
          },
          pressed ? styles.pressedActor : undefined,
        ]}
      >
        <View style={[styles.clockFace, { borderColor: palette.accent }]}>
          <View
            style={[
              styles.clockHourHand,
              { backgroundColor: palette.accent },
              { transform: [{ rotate: `${hourRotation}deg` }] },
            ]}
          />
          <View
            style={[
              styles.clockMinuteHand,
              { backgroundColor: palette.accent },
              { transform: [{ rotate: `${minuteRotation}deg` }] },
            ]}
          />
        </View>
        <Text style={[styles.clockTime, { color: palette.primaryText }]}>
          {formattedTime}
        </Text>
      </Pressable>

      <Pressable
        accessibilityLabel={`老板当前${
          bossPresent ? '在场，点击设为外出' : '外出，点击设为在场'
        }`}
        accessibilityRole="switch"
        accessibilityState={{ checked: bossPresent }}
        onPress={onToggleBossPresence}
        style={({ pressed }) => [
          styles.bossPresence,
          {
            backgroundColor: palette.navigation,
            borderColor: bossPresent ? palette.success : palette.separator,
          },
          pressed ? styles.pressedActor : undefined,
        ]}
      >
        <View
          style={[
            styles.bossPresenceDot,
            {
              backgroundColor: bossPresent
                ? palette.success
                : palette.secondaryText,
            },
          ]}
        />
        <Text style={[styles.bossPresenceText, { color: palette.primaryText }]}>
          {bossPresent ? '老板在场' : '老板外出'}
        </Text>
      </Pressable>

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
  sceneClock: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 5,
    left: '61%',
    minHeight: 34,
    paddingHorizontal: 6,
    position: 'absolute',
    top: '3%',
    zIndex: 94,
  },
  clockFace: {
    borderRadius: 11,
    borderWidth: 1.3,
    height: 22,
    position: 'relative',
    width: 22,
  },
  clockHourHand: {
    borderRadius: 1,
    height: 6,
    left: 9.4,
    position: 'absolute',
    top: 4.5,
    transformOrigin: '50% 100%',
    width: 1.8,
  },
  clockMinuteHand: {
    borderRadius: 1,
    height: 7.5,
    left: 10,
    position: 'absolute',
    top: 3,
    transformOrigin: '50% 100%',
    width: 1,
  },
  clockTime: {
    fontSize: 9,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  bossPresence: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 4,
    minHeight: 34,
    paddingHorizontal: 7,
    position: 'absolute',
    right: '2%',
    top: '3%',
    zIndex: 94,
  },
  bossPresenceDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  bossPresenceText: {
    fontSize: 9,
    fontWeight: '800',
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
