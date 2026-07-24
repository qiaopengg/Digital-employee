import { Canvas, Circle, RadialGradient } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';

import { DESK_LAMP_GLOW_RADIUS } from '../office/officeLightingModel';
import type { NormalizedPoint } from '../office/officePhysicsModel';

type DeskLampGlowProps = {
  anchor: NormalizedPoint;
  sceneSize: Readonly<{ height: number; width: number }>;
};

/** Soft radial light rendered above the ambient night mask. */
export function DeskLampGlow({ anchor, sceneSize }: DeskLampGlowProps) {
  if (sceneSize.width <= 0 || sceneSize.height <= 0) return null;

  const radius = sceneSize.width * DESK_LAMP_GLOW_RADIUS;
  const size = radius * 2;

  return (
    <Canvas
      pointerEvents="none"
      style={[
        styles.glow,
        {
          height: size,
          left: anchor.x * sceneSize.width - radius,
          top: anchor.y * sceneSize.height - radius,
          width: size,
        },
      ]}
    >
      <Circle cx={radius} cy={radius} r={radius}>
        <RadialGradient
          c={{ x: radius, y: radius }}
          colors={[
            'rgba(255, 248, 214, 0.78)',
            'rgba(255, 208, 102, 0.34)',
            'rgba(255, 176, 72, 0.12)',
            'rgba(255, 176, 72, 0)',
          ]}
          positions={[0, 0.35, 0.7, 1]}
          r={radius}
        />
      </Circle>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    zIndex: 71,
  },
});
