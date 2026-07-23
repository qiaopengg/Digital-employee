import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getOfficeEmployee,
  type AssetMode,
  type EmployeeId,
} from '../office/officeSceneModel';
import type { AppPalette } from '../theme/palette';

export type OfficeSelection =
  | { type: 'employee'; employeeId: EmployeeId }
  | { type: 'asset' }
  | { type: 'handoff' };

export type AssetAction = 'move' | 'maintain' | 'sell';

type OfficeDetailSheetProps = {
  assetMode: AssetMode;
  assetNotice?: string;
  bottomInset: number;
  handoffComplete: boolean;
  onAssetAction: (action: AssetAction) => void;
  onCancelAssetSale: () => void;
  onClose: () => void;
  onConfirmAssetSale: () => void;
  onCreateTask: () => void;
  onFinishHandoff: () => void;
  palette: AppPalette;
  selection: OfficeSelection;
};

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  palette: AppPalette;
  primary?: boolean;
};

function ActionButton({
  label,
  onPress,
  palette,
  primary = false,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: primary ? palette.accent : palette.card,
          borderColor: primary ? palette.accent : palette.separator,
        },
        pressed ? styles.pressed : undefined,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.actionText,
          { color: palette.primaryText },
          primary ? styles.primaryActionText : undefined,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function OfficeDetailSheet({
  assetMode,
  assetNotice,
  bottomInset,
  handoffComplete,
  onAssetAction,
  onCancelAssetSale,
  onClose,
  onConfirmAssetSale,
  onCreateTask,
  onFinishHandoff,
  palette,
  selection,
}: OfficeDetailSheetProps) {
  let content: React.ReactNode;

  if (selection.type === 'employee') {
    const employee = getOfficeEmployee(selection.employeeId);

    content = (
      <>
        <Text style={[styles.eyebrow, { color: palette.accent }]}>
          员工对象
        </Text>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.primaryText }]}>
            {employee.name}
          </Text>
          <View
            style={[styles.statusPill, { backgroundColor: palette.accentSoft }]}
          >
            <Text style={[styles.statusText, { color: palette.accent }]}>
              {employee.status}
            </Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: palette.secondaryText }]}>
          {employee.role} · {employee.detail}
        </Text>
        <Text style={[styles.profileCopy, { color: palette.primaryText }]}>
          {employee.personality}
        </Text>
        <View style={styles.profileTagRow}>
          {employee.skills.map(skill => (
            <View
              key={skill.name}
              style={[
                styles.profileTag,
                {
                  backgroundColor: palette.accentSoft,
                  borderColor: palette.separator,
                },
              ]}
            >
              <Text style={[styles.profileTagText, { color: palette.accent }]}>
                {skill.name} · Lv.{skill.level}
              </Text>
            </View>
          ))}
        </View>
        <Text style={[styles.profileMeta, { color: palette.secondaryText }]}>
          {employee.traits.join(' · ')}
        </Text>
        <Text style={[styles.profileMeta, { color: palette.secondaryText }]}>
          协作方式：{employee.collaborationStyle}
        </Text>
        <View style={styles.actionRow}>
          <ActionButton
            label="交代任务"
            onPress={onCreateTask}
            palette={palette}
            primary
          />
          <ActionButton label="查看档案" onPress={onClose} palette={palette} />
        </View>
      </>
    );
  } else if (selection.type === 'asset') {
    const assetStatus: Record<AssetMode, string> = {
      active: '已购置 · 使用中',
      maintenance: '维护中 · 暂停使用',
      moved: '已移至新槽位',
      saleConfirm: '等待出售确认',
      sold: '已出售 · 槽位空闲',
    };

    content = (
      <>
        <Text style={[styles.eyebrow, { color: palette.secretary }]}>
          公司资产
        </Text>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.primaryText }]}>
            咖啡机
          </Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: palette.successSoft },
            ]}
          >
            <Text style={[styles.statusText, { color: palette.success }]}>
              {assetStatus[assetMode]}
            </Text>
          </View>
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text
              style={[styles.metricLabel, { color: palette.secondaryText }]}
            >
              状态
            </Text>
            <Text style={[styles.metricValue, { color: palette.primaryText }]}>
              {assetMode === 'maintenance'
                ? '维护中'
                : assetMode === 'sold'
                ? '已处置'
                : '良好'}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text
              style={[styles.metricLabel, { color: palette.secondaryText }]}
            >
              维护
            </Text>
            <Text style={[styles.metricValue, { color: palette.primaryText }]}>
              {assetMode === 'maintenance' ? '进行中' : '2 天后'}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text
              style={[styles.metricLabel, { color: palette.secondaryText }]}
            >
              折旧
            </Text>
            <Text style={[styles.metricValue, { color: palette.primaryText }]}>
              18%
            </Text>
          </View>
          <View style={styles.metric}>
            <Text
              style={[styles.metricLabel, { color: palette.secondaryText }]}
            >
              残值
            </Text>
            <Text style={[styles.metricValue, { color: palette.primaryText }]}>
              {assetMode === 'sold' ? '已回收' : '¥680'}
            </Text>
          </View>
        </View>
        <Text style={[styles.lifecycle, { color: palette.secondaryText }]}>
          购置 → 使用 → 维护 / 移位 → 出售或搬迁
        </Text>
        {assetNotice ? (
          <Text style={[styles.notice, { color: palette.secretary }]}>
            {assetNotice}
          </Text>
        ) : undefined}
        {assetMode === 'saleConfirm' ? (
          <View style={styles.actionRow}>
            <ActionButton
              label="取消出售"
              onPress={onCancelAssetSale}
              palette={palette}
            />
            <ActionButton
              label="确认出售 ¥680"
              onPress={onConfirmAssetSale}
              palette={palette}
              primary
            />
          </View>
        ) : assetMode === 'sold' ? (
          <View style={styles.actionRow}>
            <ActionButton
              label="恢复资产演示"
              onPress={onCancelAssetSale}
              palette={palette}
              primary
            />
          </View>
        ) : (
          <View style={styles.actionRow}>
            <ActionButton
              label="移动"
              onPress={() => onAssetAction('move')}
              palette={palette}
            />
            <ActionButton
              label="维护"
              onPress={() => onAssetAction('maintain')}
              palette={palette}
              primary
            />
            <ActionButton
              label="出售"
              onPress={() => onAssetAction('sell')}
              palette={palette}
            />
          </View>
        )}
      </>
    );
  } else {
    content = (
      <>
        <Text style={[styles.eyebrow, { color: palette.accent }]}>
          真实交接事件
        </Text>
        <Text style={[styles.title, { color: palette.primaryText }]}>
          新品发布方案
        </Text>
        <Text style={[styles.subtitle, { color: palette.secondaryText }]}>
          林策 → 顾宁 → 老板 ·{' '}
          {handoffComplete ? '资料已接收，正在审核' : '正在传递结构稿'}
        </Text>
        <View style={styles.actionRow}>
          <ActionButton
            label={handoffComplete ? '重新演示交接' : '开始交接演示'}
            onPress={onFinishHandoff}
            palette={palette}
            primary
          />
          <ActionButton
            label="直接汇报给老板"
            onPress={onClose}
            palette={palette}
          />
        </View>
      </>
    );
  }

  return (
    <View
      accessibilityViewIsModal
      style={[
        styles.sheet,
        {
          backgroundColor: palette.card,
          borderColor: palette.separator,
          bottom: bottomInset + 8,
        },
      ]}
    >
      <View style={styles.handleRow}>
        <View style={[styles.handle, { backgroundColor: palette.separator }]} />
        <Pressable
          accessibilityLabel="关闭详情"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed ? styles.pressed : undefined,
          ]}
        >
          <Text style={[styles.closeText, { color: palette.secondaryText }]}>
            关闭
          </Text>
        </Pressable>
      </View>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    left: 12,
    padding: 16,
    position: 'absolute',
    right: 12,
    shadowColor: '#000000',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    zIndex: 100,
  },
  handleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 24,
    justifyContent: 'center',
    marginTop: -8,
  },
  handle: {
    borderRadius: 2,
    height: 4,
    width: 38,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 4,
    position: 'absolute',
    right: 0,
  },
  closeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  title: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 999,
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  profileCopy: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    marginTop: 10,
  },
  profileMeta: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  profileTag: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  profileTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  profileTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  lifecycle: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
  },
  notice: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.62,
  },
});
