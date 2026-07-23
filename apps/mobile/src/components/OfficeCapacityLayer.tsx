import { StyleSheet, Text, View } from 'react-native';

function ReservedWorkstation({ label }: { label: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}，等待招聘后分配`}
      style={styles.slot}
    >
      <View style={styles.floorMat} />
      <View style={styles.deskShadow} />
      <View style={styles.deskSurface}>
        <View style={styles.monitorStand} />
        <View style={styles.monitor} />
        <View style={styles.keyboard} />
        <View style={styles.notebook} />
        <View style={styles.pencilCup} />
        <View style={styles.mug} />
        <View style={styles.deskEdge} />
      </View>
      <View style={[styles.deskLeg, styles.deskLegLeft]} />
      <View style={[styles.deskLeg, styles.deskLegRight]} />
      <View style={styles.chairBack} />
      <View style={styles.chairSeat} />
      <View style={styles.chairPost} />
      <View style={styles.chairBase} />
      <View style={styles.slotBadge}>
        <Text style={styles.slotBadgeText}>+</Text>
      </View>
    </View>
  );
}

export function OfficeCapacityLayer() {
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View style={styles.row}>
        <ReservedWorkstation label="预留工位 A" />
        <ReservedWorkstation label="预留工位 B" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 13,
  },
  row: {
    flexDirection: 'row',
    gap: '8%',
    height: '8.6%',
    left: '22%',
    position: 'absolute',
    top: '67.5%',
    width: '36%',
  },
  slot: {
    flex: 1,
    position: 'relative',
  },
  floorMat: {
    backgroundColor: 'rgba(205, 191, 170, 0.18)',
    borderColor: 'rgba(135, 117, 94, 0.18)',
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    left: '-8%',
    position: 'absolute',
    right: '-8%',
    top: '-8%',
  },
  deskShadow: {
    backgroundColor: 'rgba(68, 55, 42, 0.11)',
    borderRadius: 3,
    height: '43%',
    left: 1,
    position: 'absolute',
    right: -1,
    top: 2,
  },
  deskSurface: {
    backgroundColor: '#D8C3A6',
    borderColor: 'rgba(113, 91, 65, 0.28)',
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    height: '43%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  monitor: {
    backgroundColor: '#7E8B90',
    borderColor: '#5E686C',
    borderRadius: 1,
    borderWidth: StyleSheet.hairlineWidth,
    height: '31%',
    left: '35%',
    position: 'absolute',
    top: '8%',
    width: '30%',
  },
  monitorStand: {
    backgroundColor: '#7E8B90',
    height: '36%',
    left: '48%',
    position: 'absolute',
    top: '26%',
    width: '4%',
  },
  keyboard: {
    backgroundColor: '#ECEAE5',
    borderRadius: 1,
    height: '14%',
    left: '35%',
    position: 'absolute',
    top: '63%',
    width: '30%',
  },
  notebook: {
    backgroundColor: '#F3EEE3',
    borderRadius: 1,
    height: '38%',
    left: '8%',
    position: 'absolute',
    top: '28%',
    transform: [{ rotate: '-7deg' }],
    width: '14%',
  },
  pencilCup: {
    backgroundColor: '#9B8B76',
    borderColor: '#736655',
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    height: 5,
    position: 'absolute',
    right: '8%',
    top: '21%',
    width: 5,
  },
  mug: {
    backgroundColor: '#F3F0E9',
    borderColor: '#B4ACA0',
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: '15%',
    height: 5,
    position: 'absolute',
    right: '17%',
    width: 5,
  },
  deskEdge: {
    backgroundColor: 'rgba(111, 85, 54, 0.32)',
    bottom: 0,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  deskLeg: {
    backgroundColor: '#B7AA96',
    height: '27%',
    position: 'absolute',
    top: '40%',
    width: 2,
  },
  deskLegLeft: {
    left: '9%',
  },
  deskLegRight: {
    right: '9%',
  },
  chairBack: {
    backgroundColor: '#A6B6B8',
    borderColor: '#87999B',
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: '16%',
    height: '31%',
    left: '37%',
    position: 'absolute',
    width: '26%',
  },
  chairSeat: {
    backgroundColor: '#94A7A9',
    borderRadius: 3,
    bottom: '12%',
    height: '16%',
    left: '39%',
    position: 'absolute',
    width: '22%',
  },
  chairPost: {
    backgroundColor: '#788A8D',
    bottom: '6%',
    height: '9%',
    left: '49%',
    position: 'absolute',
    width: 1,
  },
  chairBase: {
    backgroundColor: '#829396',
    bottom: '5%',
    height: 1,
    left: '30%',
    position: 'absolute',
    width: '40%',
  },
  slotBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(80, 88, 92, 0.36)',
    borderRadius: 7,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 14,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -5,
    width: 14,
  },
  slotBadgeText: {
    color: '#596468',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 11,
  },
});
