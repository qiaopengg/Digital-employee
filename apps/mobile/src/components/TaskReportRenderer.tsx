import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { TaskReportBlock, TaskReportV1 } from '../tasks/taskTypes';
import type { AppPalette } from '../theme/palette';

type Props = {
  palette: AppPalette;
  report: TaskReportV1;
};

type BlockProps = {
  block: TaskReportBlock;
  palette: AppPalette;
};

function ReportBlock({ block, palette }: BlockProps) {
  if (block.type === 'paragraph') {
    return (
      <Text
        selectable
        style={[styles.paragraph, { color: palette.primaryText }]}
      >
        {block.text}
      </Text>
    );
  }

  if (block.type === 'bullets') {
    return (
      <View style={styles.blockGap}>
        {block.items.map((item, index) => (
          <View key={`${index}-${item}`} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: palette.accent }]}>•</Text>
            <Text style={[styles.bulletText, { color: palette.primaryText }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (block.type === 'metrics') {
    return (
      <View style={[styles.metricGrid, styles.blockGap]}>
        {block.items.map((item, index) => (
          <View
            key={`${index}-${item.label}`}
            style={[styles.metricCard, { backgroundColor: palette.card }]}
          >
            <Text
              style={[styles.metricLabel, { color: palette.secondaryText }]}
            >
              {item.label}
            </Text>

            <Text style={[styles.metricValue, { color: palette.primaryText }]}>
              {item.value}
            </Text>
            {item.note ? (
              <Text
                style={[styles.metricNote, { color: palette.secondaryText }]}
              >
                {item.note}
              </Text>
            ) : undefined}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.blockGap}>
      {block.caption ? (
        <Text style={[styles.tableCaption, { color: palette.secondaryText }]}>
          {block.caption}
        </Text>
      ) : undefined}
      <ScrollView
        directionalLockEnabled
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
        style={[styles.tableFrame, { borderColor: palette.separator }]}
      >
        <View>
          <View
            style={[styles.tableRow, { backgroundColor: palette.accentSoft }]}
          >
            {block.columns.map((column, index) => (
              <Text
                key={`${index}-${column}`}
                style={[styles.headerCell, { color: palette.accent }]}
              >
                {column}
              </Text>
            ))}
          </View>
          {block.rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[styles.tableRow, { borderTopColor: palette.separator }]}
            >
              {row.map((cell, columnIndex) => (
                <Text
                  key={columnIndex}
                  selectable
                  style={[styles.tableCell, { color: palette.primaryText }]}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function TaskReportRenderer({ palette, report }: Props) {
  return (
    <View style={styles.report}>
      <Text style={[styles.title, { color: palette.primaryText }]}>
        {report.title}
      </Text>
      <View
        style={[styles.summaryCard, { backgroundColor: palette.secretarySoft }]}
      >
        <Text style={[styles.summaryLabel, { color: palette.secretary }]}>
          摘要
        </Text>
        <Text
          selectable
          style={[styles.summary, { color: palette.primaryText }]}
        >
          {report.summary}
        </Text>
      </View>

      {report.sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {section.title ? (
            <Text style={[styles.sectionTitle, { color: palette.primaryText }]}>
              {section.title}
            </Text>
          ) : undefined}
          {section.blocks.map((block, blockIndex) => (
            <ReportBlock
              block={block}
              key={`${block.type}-${blockIndex}`}
              palette={palette}
            />
          ))}
        </View>
      ))}
      {report.nextSteps?.length ? (
        <View style={styles.nextSteps}>
          <Text style={[styles.sectionTitle, { color: palette.primaryText }]}>
            下一步
          </Text>
          {report.nextSteps.map((step, index) => (
            <View key={`${index}-${step.text}`} style={styles.nextStepRow}>
              <View
                style={[styles.stepNumber, { backgroundColor: palette.accent }]}
              >
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepText, { color: palette.primaryText }]}>
                  {step.text}
                </Text>
                {step.owner || step.due ? (
                  <Text
                    style={[styles.stepMeta, { color: palette.secondaryText }]}
                  >
                    {[
                      step.owner && `负责人：${step.owner}`,
                      step.due && `日期：${step.due}`,
                    ]
                      .filter(Boolean)
                      .join('  ·  ')}
                  </Text>
                ) : undefined}
              </View>
            </View>
          ))}
        </View>
      ) : undefined}
    </View>
  );
}

const styles = StyleSheet.create({
  blockGap: { marginTop: 12 },
  bullet: { fontSize: 18, fontWeight: '800', lineHeight: 24, width: 18 },
  bulletRow: { flexDirection: 'row', marginBottom: 7 },
  bulletText: { flex: 1, fontSize: 15, lineHeight: 24 },
  headerCell: { fontSize: 12, fontWeight: '800', minWidth: 120, padding: 12 },
  metricCard: {
    borderRadius: 14,
    flexBasis: '46%',
    flexGrow: 1,
    minWidth: 138,
    padding: 14,
  },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricLabel: { fontSize: 12, fontWeight: '600' },
  metricNote: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
    marginTop: 4,
  },
  nextStepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 12,
  },
  nextSteps: { marginTop: 26 },
  paragraph: { fontSize: 15, lineHeight: 24, marginTop: 12 },
  report: { marginTop: 20 },
  section: { marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
  stepContent: { flex: 1, paddingTop: 1 },
  stepMeta: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  stepNumber: {
    alignItems: 'center',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    marginRight: 10,
    width: 22,
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  stepText: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  summary: { fontSize: 16, fontWeight: '600', lineHeight: 25, marginTop: 6 },
  summaryCard: { borderRadius: 18, marginTop: 14, padding: 17 },
  summaryLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  tableCaption: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  tableCell: { fontSize: 13, lineHeight: 20, minWidth: 120, padding: 12 },
  tableFrame: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  tableRow: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row' },
  title: { fontSize: 25, fontWeight: '800', lineHeight: 32 },
});
