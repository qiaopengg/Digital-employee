import { Image, StyleSheet, View } from 'react-native';

import { OFFICE_SEAT_FOREGROUND_DEPTH } from '../office/officeSeatModel';

type SceneSize = Readonly<{ height: number; width: number }>;

type OccluderRect = Readonly<{
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
}>;

const officeFloor = require('../assets/office/office-floor-v2.png');
const REVIEWER_OFFSET_X = 0.372;

const strategyOccluders: ReadonlyArray<OccluderRect> = [
  { height: 0.008, id: 'desk-edge', width: 0.219, x: 0.193, y: 0.522 },
  { height: 0.052, id: 'left-arm', width: 0.017, x: 0.251, y: 0.519 },
  { height: 0.052, id: 'right-arm', width: 0.017, x: 0.326, y: 0.519 },
  { height: 0.009, id: 'seat-front', width: 0.07, x: 0.263, y: 0.56 },
  { height: 0.045, id: 'center-post', width: 0.012, x: 0.296, y: 0.562 },
  { height: 0.012, id: 'caster-cross', width: 0.068, x: 0.264, y: 0.57 },
  { height: 0.023, id: 'left-caster', width: 0.02, x: 0.254, y: 0.568 },
  { height: 0.023, id: 'right-caster', width: 0.02, x: 0.327, y: 0.568 },
  { height: 0.016, id: 'center-caster', width: 0.018, x: 0.292, y: 0.596 },
];

const seatOccluders = [
  ...strategyOccluders.map(rect => ({ ...rect, id: `strategy-${rect.id}` })),
  ...strategyOccluders.map(rect => ({
    ...rect,
    id: `reviewer-${rect.id}`,
    x: rect.x + REVIEWER_OFFSET_X,
  })),
] as const;

export function OfficeSeatForegroundLayer({
  sceneSize,
}: {
  sceneSize: SceneSize;
}) {
  if (sceneSize.height <= 0 || sceneSize.width <= 0) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.layer, { zIndex: OFFICE_SEAT_FOREGROUND_DEPTH }]}
    >
      {seatOccluders.map(rect => {
        const left = rect.x * sceneSize.width;
        const top = rect.y * sceneSize.height;

        return (
          <View
            key={rect.id}
            style={[
              styles.clip,
              {
                height: rect.height * sceneSize.height,
                left,
                top,
                width: rect.width * sceneSize.width,
              },
            ]}
          >
            <Image
              resizeMode="stretch"
              source={officeFloor}
              style={[
                styles.officeImage,
                {
                  height: sceneSize.height,
                  left: -left,
                  top: -top,
                  width: sceneSize.width,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    position: 'absolute',
  },
  layer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  officeImage: {
    position: 'absolute',
  },
});
