import { StyleSheet, View } from 'react-native';

import {
  DESK_LAMP_GLOW_COLOR,
  DESK_LAMP_GLOW_RADIUS,
} from '../office/officeLightingModel';
import type { NormalizedPoint } from '../office/officePhysicsModel';

type DeskLampGlowProps = {
  anchor: NormalizedPoint;
  sceneSize: Readonly<{ height: number; width: number }>;
};

/**
 * Warm highlight rendered under a workstation when its occupant is working
 * during a dark period (evening/night overtime). Purely decorative: it
 * reflects the same real-clock period and away/seated state already
 * computed for behaviour, it does not drive any business logic itself.
 */
export function DeskLampGlow({ anchor, sceneSize }: DeskLampGlowProps) {
  if (sceneSize.width <= 0 || sceneSize.height <= 0) return null;

  const size = sceneSize.width * DESK_LAMP_GLOW_RADIUS * 2;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.glow,
        {
          backgroundColor: DESK_LAMP_GLOW_COLOR,
          borderRadius: size / 2,
          height: size,
          left: anchor.x * sceneSize.width - size / 2,
          top: anchor.y * sceneSize.height - size / 2,
          width: size,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  glow: {
    opacity: 0.22,
    position: 'absolute',
    zIndex: 21,
  },
});
