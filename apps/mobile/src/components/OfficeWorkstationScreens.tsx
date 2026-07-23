import { StyleSheet, View } from 'react-native';

const codeLineWidths = ['78%', '56%', '70%', '42%'] as const;
const documentColumnWidths = ['23%', '35%', '26%'] as const;

function IdePreview() {
  return (
    <View style={[styles.screen, styles.ideScreen]}>
      <View style={styles.ideSidebar} />
      <View style={styles.ideLines}>
        {codeLineWidths.map((width, index) => (
          <View
            key={width}
            style={[styles.codeLine, { opacity: 1 - index * 0.15, width }]}
          />
        ))}
      </View>
    </View>
  );
}

function DocumentPreview() {
  return (
    <View style={[styles.screen, styles.documentScreen]}>
      <View style={styles.documentToolbar} />
      <View style={styles.documentGrid}>
        {documentColumnWidths.map(width => (
          <View key={width} style={[styles.documentColumn, { width }]} />
        ))}
      </View>
    </View>
  );
}

export function OfficeWorkstationScreens() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      <View style={[styles.monitor, styles.strategyMonitor]}>
        <IdePreview />
      </View>
      <View style={[styles.monitor, styles.reviewerMonitor]}>
        <DocumentPreview />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monitor: {
    borderRadius: 1,
    height: '2.45%',
    overflow: 'hidden',
    position: 'absolute',
    top: '46.1%',
    width: '7.8%',
    zIndex: 12,
  },
  strategyMonitor: {
    left: '25.8%',
  },
  reviewerMonitor: {
    left: '63.8%',
  },
  screen: {
    flex: 1,
    flexDirection: 'row',
    padding: 1,
  },
  ideScreen: {
    backgroundColor: '#18212d',
  },
  ideSidebar: {
    backgroundColor: '#26384a',
    marginRight: 1,
    width: '18%',
  },
  ideLines: {
    flex: 1,
    gap: 1,
    justifyContent: 'center',
  },
  codeLine: {
    backgroundColor: '#75c7b7',
    height: 1,
  },
  documentScreen: {
    backgroundColor: '#f4f7f8',
    flexDirection: 'column',
  },
  documentToolbar: {
    backgroundColor: '#3da39b',
    height: 2,
    width: '100%',
  },
  documentGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: 1,
    paddingTop: 1,
  },
  documentColumn: {
    backgroundColor: '#b7c8cf',
    opacity: 0.8,
  },
});
