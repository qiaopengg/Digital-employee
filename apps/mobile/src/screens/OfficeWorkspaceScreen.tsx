import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InteractiveOfficeScene } from '../components/InteractiveOfficeScene';
import { OfficeSecretaryDock } from '../components/OfficeSecretaryDock';
import {
  OfficeDetailSheet,
  type AssetAction,
  type OfficeSelection,
} from '../components/OfficeDetailSheet';
import type { TabKey } from '../components/BottomTabBar';
import type { AssetMode } from '../office/officeSceneModel';
import type { AppPalette } from '../theme/palette';

type OfficeWorkspaceScreenProps = {
  bottomInset: number;
  localTaskTitle?: string;
  onCreateTask: () => void;
  onNavigate: (tab: TabKey) => void;
  onOpenEquivalentList: () => void;
  palette: AppPalette;
  topInset: number;
};

export function OfficeWorkspaceScreen({
  bottomInset,
  localTaskTitle,
  onCreateTask,
  onNavigate,
  onOpenEquivalentList,
  palette,
  topInset,
}: OfficeWorkspaceScreenProps) {
  const [selection, setSelection] = useState<OfficeSelection>();
  const [handoffComplete, setHandoffComplete] = useState(false);
  const [handoffReplayToken, setHandoffReplayToken] = useState(0);
  const [assetMode, setAssetMode] = useState<AssetMode>('active');
  const [assetNotice, setAssetNotice] = useState<string>();

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
          <Text style={[styles.balanceLabel, { color: palette.secondaryText }]}>
            公司余额
          </Text>
          <Text style={[styles.balanceValue, { color: palette.primaryText }]}>
            ¥ 8,420
          </Text>
        </Pressable>
      </View>

      <View style={styles.sceneStage}>
        <View style={[styles.sceneFrame, { borderColor: palette.separator }]}>
          <InteractiveOfficeScene
            assetMode={assetMode}
            handoffReplayToken={handoffReplayToken}
            localTaskTitle={localTaskTitle}
            onHandoffComplete={() => setHandoffComplete(true)}
            onSelectAsset={() => setSelection({ type: 'asset' })}
            onSelectEmployee={employeeId =>
              setSelection({ type: 'employee', employeeId })
            }
            onSelectHandoff={() => setSelection({ type: 'handoff' })}
            palette={palette}
          />
        </View>
        <Pressable
          accessibilityLabel="新建任务"
          accessibilityRole="button"
          onPress={onCreateTask}
          style={({ pressed }) => [
            styles.newTaskButton,
            { backgroundColor: palette.primaryText },
            pressed ? styles.pressed : undefined,
          ]}
        >
          <Text style={[styles.newTaskMark, { color: palette.card }]}>+</Text>
          <Text style={[styles.newTaskLabel, { color: palette.card }]}>
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
    borderRadius: 15,
    bottom: 12,
    flexDirection: 'row',
    left: 10,
    minHeight: 42,
    paddingHorizontal: 13,
    position: 'absolute',
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
