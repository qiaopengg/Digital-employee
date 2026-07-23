import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InteractiveOfficeScene } from '../components/InteractiveOfficeScene';
import { OfficeSecretaryDock } from '../components/OfficeSecretaryDock';
import {
  OfficeDetailSheet,
  type AssetAction,
  type OfficeSelection,
} from '../components/OfficeDetailSheet';
import { WorkScheduleSheet } from '../components/WorkScheduleSheet';
import type { TabKey } from '../components/BottomTabBar';
import { OFFICE_BOTTOM_CONTROL } from '../office/officeControlLayout';
import type { AssetMode } from '../office/officeSceneModel';
import {
  getTimeOfDayPeriod,
  isWorkingHour,
  type WorkSchedule,
} from '../office/officeScheduleModel';
import { useOfficeClock } from '../office/useOfficeClock';
import type { AiTaskExecution } from '../tasks/taskTypes';
import type { AppPalette } from '../theme/palette';

type OfficeWorkspaceScreenProps = {
  bottomInset: number;
  onCreateTask: () => void;
  onNavigate: (tab: TabKey) => void;
  onOpenEquivalentList: () => void;
  onOpenTaskResult: () => void;
  onWorkScheduleChange: (schedule: WorkSchedule) => void;
  palette: AppPalette;
  task?: AiTaskExecution;
  topInset: number;
  workSchedule: WorkSchedule;
};

export function OfficeWorkspaceScreen({
  bottomInset,
  onCreateTask,
  onNavigate,
  onOpenEquivalentList,
  onOpenTaskResult,
  onWorkScheduleChange,
  palette,
  task,
  topInset,
  workSchedule,
}: OfficeWorkspaceScreenProps) {
  const now = useOfficeClock();
  const workingNow = isWorkingHour(now, workSchedule);
  const period = getTimeOfDayPeriod(now);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selection, setSelection] = useState<OfficeSelection>();
  const [handoffComplete, setHandoffComplete] = useState(false);
  const [handoffReplayToken, setHandoffReplayToken] = useState(0);
  const [assetMode, setAssetMode] = useState<AssetMode>('active');
  const [assetNotice, setAssetNotice] = useState<string>();

  useEffect(() => {
    if (!task?.localId) return;
    setHandoffComplete(false);
    setHandoffReplayToken(value => value + 1);
  }, [task?.localId]);

  const handleAssetAction = (action: AssetAction) => {
    const notices: Record<AssetAction, string> = {
      maintain: '已创建维护安排；资产仍在当前槽位。',
      move: '已进入预设槽位选择，不支持任意拖拽。',
      sell: '出售属于高影响处置，请确认预计回收 ¥680。',
    };
    const nextModes: Record<AssetAction, AssetMode> = {
      maintain: 'maintenance',
      move: 'moved',
      sell: 'saleConfirm',
    };

    setAssetMode(nextModes[action]);
    setAssetNotice(notices[action]);
  };

  const replayHandoff = () => {
    setHandoffComplete(false);
    setHandoffReplayToken(value => value + 1);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingBottom: bottomInset,
          paddingTop: topInset + 8,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: palette.primaryText }]}>
            办公室
          </Text>
          <Text style={[styles.subtitle, { color: palette.secondaryText }]}>
            4 人在场 · {handoffComplete ? '顾宁正在审核' : '1 项交接中'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="设置工作时间"
            accessibilityRole="button"
            onPress={() => setIsScheduleOpen(true)}
            style={({ pressed }) => [
              styles.clock,
              { backgroundColor: palette.card, borderColor: palette.separator },
              pressed ? styles.pressed : undefined,
            ]}
          >
            <View style={[styles.clockFace, { borderColor: palette.accent }]}>
              <View style={[styles.clockHourHand, { backgroundColor: palette.accent }]} />
              <View style={[styles.clockMinuteHand, { backgroundColor: palette.accent }]} />
            </View>
            <View>
              <Text style={[styles.clockTime, { color: palette.primaryText }]}>
                {now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </Text>
              <Text style={[styles.clockState, { color: workingNow ? palette.success : palette.secondaryText }]}>
                {workingNow ? '工作中' : period === 'midday' ? '午休' : '非工作时间'}
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityLabel="查看公司资产"
            accessibilityRole="button"
            onPress={() => setSelection({ type: 'asset' })}
            style={({ pressed }) => [
              styles.balance,
              { backgroundColor: palette.card, borderColor: palette.separator },
              pressed ? styles.pressed : undefined,
            ]}
          >
            <Text style={[styles.balanceLabel, { color: palette.secondaryText }]}>公司余额</Text>
            <Text style={[styles.balanceValue, { color: palette.primaryText }]}>¥ 8,420</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sceneStage}>
        <View style={[styles.sceneFrame, { borderColor: palette.separator }]}>
          <InteractiveOfficeScene
            assetMode={assetMode}
            handoffReplayToken={handoffReplayToken}
            onHandoffComplete={() => setHandoffComplete(true)}
            onSelectAsset={() => setSelection({ type: 'asset' })}
            onSelectEmployee={employeeId =>
              setSelection({ type: 'employee', employeeId })
            }
            onSelectHandoff={() => {
              if (task?.status === 'completed' || task?.status === 'failed') {
                onOpenTaskResult();
                return;
              }
              setSelection({ type: 'handoff' });
            }}
            palette={palette}
            task={task}
          />
        </View>
        <Pressable
          accessibilityLabel="新建任务"
          accessibilityRole="button"
          onPress={onCreateTask}
          style={({ pressed }) => [
            styles.newTaskButton,
            {
              backgroundColor: palette.navigation,
              borderColor: palette.separator,
            },
            pressed ? styles.pressed : undefined,
          ]}
        >
          <Text style={[styles.newTaskMark, { color: palette.accent }]}>+</Text>
          <Text
            style={[styles.newTaskLabel, { color: palette.primaryText }]}
          >
            新任务
          </Text>
        </Pressable>
        <OfficeSecretaryDock
          onNavigate={tab => onNavigate(tab)}
          onOpenSceneList={onOpenEquivalentList}
          onReplayHandoff={replayHandoff}
          palette={palette}
        />
      </View>

      <WorkScheduleSheet
        bottomInset={bottomInset}
        onClose={() => setIsScheduleOpen(false)}
        onSave={onWorkScheduleChange}
        palette={palette}
        schedule={workSchedule}
        visible={isScheduleOpen}
      />

      {selection ? (
        <OfficeDetailSheet
          assetMode={assetMode}
          assetNotice={assetNotice}
          bottomInset={bottomInset}
          handoffComplete={handoffComplete}
          onAssetAction={handleAssetAction}
          onCancelAssetSale={() => {
            setAssetMode('active');
            setAssetNotice('已取消处置，资产恢复为正常使用。');
          }}
          onClose={() => setSelection(undefined)}
          onConfirmAssetSale={() => {
            setAssetMode('sold');
            setAssetNotice('出售演示已完成，虚拟账本回收 ¥680。');
          }}
          onCreateTask={() => {
            setSelection(undefined);
            onCreateTask();
          }}
          onFinishHandoff={() => {
            setSelection(undefined);
            replayHandoff();
          }}
          palette={palette}
          selection={selection}
        />
      ) : undefined}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 4,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  balance: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 106,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  sceneFrame: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    minHeight: 400,
    overflow: 'hidden',
  },
  sceneStage: {
    flex: 1,
    position: 'relative',
  },
  newTaskButton: {
    alignItems: 'center',
    borderRadius: OFFICE_BOTTOM_CONTROL.borderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: OFFICE_BOTTOM_CONTROL.bottom,
    flexDirection: 'row',
    height: OFFICE_BOTTOM_CONTROL.height,
    left: 10,
    justifyContent: 'center',
    paddingHorizontal: 13,
    position: 'absolute',
    width: OFFICE_BOTTOM_CONTROL.width,
    zIndex: 80,
  },
  newTaskMark: {
    fontSize: 19,
    fontWeight: '500',
    marginRight: 5,
    marginTop: -2,
  },
  newTaskLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.62,
  },
});
