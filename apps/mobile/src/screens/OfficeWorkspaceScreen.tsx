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
  const [bossPresent, setBossPresent] = useState(true);
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
          paddingTop: topInset,
        },
      ]}
    >
      <View style={styles.sceneStage}>
        <View style={styles.sceneFrame}>
          <InteractiveOfficeScene
            assetMode={assetMode}
            bossPresent={bossPresent}
            handoffReplayToken={handoffReplayToken}
            now={now}
            onConfigureSchedule={() => setIsScheduleOpen(true)}
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
            onToggleBossPresence={() => setBossPresent(value => !value)}
            palette={palette}
            period={period}
            task={task}
            workingNow={workingNow}
          />
        </View>
        <Pressable
          accessibilityLabel="查看公司资产"
          accessibilityRole="button"
          onPress={() => setSelection({ type: 'asset' })}
          style={({ pressed }) => [
            styles.assetButton,
            {
              backgroundColor: palette.navigation,
              borderColor: palette.separator,
            },
            pressed ? styles.pressed : undefined,
          ]}
        >
          <View style={styles.assetButtonIcon}>
            <View
              style={[styles.assetIconBar, { backgroundColor: palette.accent }]}
            />
            <View
              style={[
                styles.assetIconBar,
                styles.assetIconBarMiddle,
                { backgroundColor: palette.accent },
              ]}
            />
            <View
              style={[
                styles.assetIconBar,
                styles.assetIconBarShort,
                { backgroundColor: palette.accent },
              ]}
            />
          </View>
          <Text
            style={[styles.assetButtonLabel, { color: palette.primaryText }]}
          >
            资产
          </Text>
        </Pressable>
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
          <Text style={[styles.newTaskLabel, { color: palette.primaryText }]}>
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
  },
  sceneFrame: {
    flex: 1,
    overflow: 'hidden',
  },
  sceneStage: {
    flex: 1,
    position: 'relative',
  },
  assetButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 58,
    position: 'absolute',
    right: 10,
    top: '44%',
    width: 52,
    zIndex: 80,
  },
  assetButtonIcon: {
    alignItems: 'flex-end',
    height: 18,
    justifyContent: 'space-between',
    width: 22,
  },
  assetIconBar: {
    borderRadius: 2,
    height: 4,
    width: 22,
  },
  assetIconBarMiddle: {
    width: 17,
  },
  assetIconBarShort: {
    width: 12,
  },
  assetButtonLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 5,
  },
  newTaskButton: {
    alignItems: 'center',
    borderRadius: OFFICE_BOTTOM_CONTROL.borderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: OFFICE_BOTTOM_CONTROL.bottom,
    flexDirection: 'row',
    height: OFFICE_BOTTOM_CONTROL.height,
    justifyContent: 'center',
    left: 10,
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
