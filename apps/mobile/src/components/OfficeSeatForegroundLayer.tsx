import { Image, StyleSheet, View } from 'react-native';

import { OFFICE_ANCHORS } from '../office/officePhysicsModel';
import { OFFICE_SEAT_FOREGROUND_DEPTH } from '../office/officeSeatModel';

type SceneSize = Readonly<{ height: number; width: number }>;

type OccluderRect = Readonly<{
  borderRadius?: number;
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
}>;

const officeFloor = require('../assets/office/office-floor-v3.png');
const SECRETARY_OFFSET = {
  x: OFFICE_ANCHORS.secretarySeat.x - OFFICE_ANCHORS.strategySeat.x,
  y: OFFICE_ANCHORS.secretarySeat.y - OFFICE_ANCHORS.strategySeat.y,
};

const strategyOccluders: ReadonlyArray<OccluderRect> = [
  {
    borderRadius: 999,
    height: 0.05,
    id: 'backrest',
    width: 0.071,
    x: 0.1445,
    y: 0.204,
  },
  { height: 0.042, id: 'left-arm', width: 0.013, x: 0.145, y: 0.207 },
  { height: 0.042, id: 'right-arm', width: 0.013, x: 0.216, y: 0.207 },
  { height: 0.012, id: 'seat-front', width: 0.07, x: 0.145, y: 0.244 },
  { height: 0.047, id: 'center-post', width: 0.012, x: 0.179, y: 0.247 },
  { height: 0.014, id: 'caster-cross', width: 0.072, x: 0.144, y: 0.271 },
  { height: 0.023, id: 'left-caster', width: 0.018, x: 0.139, y: 0.264 },
  { height: 0.023, id: 'right-caster', width: 0.018, x: 0.214, y: 0.264 },
];

export const reviewerOccluders: ReadonlyArray<OccluderRect> = [
  {
    borderRadius: 999,
    height: 0.025,
    id: 'reviewer-backrest',
    width: 0.071,
    x: 0.3345,
    y: 0.225,
  },
  {
    height: 0.026,
    id: 'reviewer-left-arm',
    width: 0.013,
    x: 0.335,
    y: 0.229,
  },
  {
    height: 0.026,
    id: 'reviewer-right-arm',
    width: 0.013,
    x: 0.406,
    y: 0.229,
  },
  {
    height: 0.012,
    id: 'reviewer-seat-front',
    width: 0.07,
    x: 0.335,
    y: 0.247,
  },
  {
    height: 0.04,
    id: 'reviewer-center-post',
    width: 0.012,
    x: 0.369,
    y: 0.251,
  },
  {
    height: 0.014,
    id: 'reviewer-caster-cross',
    width: 0.072,
    x: 0.334,
    y: 0.271,
  },
  {
    height: 0.023,
    id: 'reviewer-left-caster',
    width: 0.018,
    x: 0.329,
    y: 0.264,
  },
  {
    height: 0.023,
    id: 'reviewer-right-caster',
    width: 0.018,
    x: 0.404,
    y: 0.264,
  },
];

const seatOccluders = [
  ...strategyOccluders.map(rect => ({ ...rect, id: `strategy-${rect.id}` })),
  ...reviewerOccluders,
  ...strategyOccluders.map(rect => ({
    ...rect,
    id: `secretary-${rect.id}`,
    x: rect.x + SECRETARY_OFFSET.x,
    y: rect.y + SECRETARY_OFFSET.y,
  })),
  {
    borderRadius: 8,
    height: 0.018,
    id: 'sofa-front',
    width: 0.21,
    x: 0.635,
    y: 0.734,
  },
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
                borderRadius: rect.borderRadius,
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
