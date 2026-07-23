import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import type { ActorPosition } from '../office/officeMotionAnimation';
import type { AppPalette } from '../theme/palette';

type DeliveryDocumentIconProps = {
  opacity: SharedValue<number>;
  palette: AppPalette;
  position: ActorPosition;
};

const ICON_SIZE = 26;

export function DeliveryDocumentIcon({
  opacity,
  palette,
  position,
}: DeliveryDocumentIconProps) {
  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: opacity.value,
      transform: [
        { translateX: position.x.value - ICON_SIZE / 2 },
        { translateY: position.y.value - ICON_SIZE },
      ],
    }),
    [],
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.icon, animatedStyle]}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor: palette.card,
            borderColor: palette.secretary,
          },
        ]}
      >
        <Text style={[styles.glyph, { color: palette.secretary }]}>▤</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: ICON_SIZE,
    left: 0,
    position: 'absolute',
    top: 0,
    width: ICON_SIZE,
    zIndex: 90,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  glyph: {
    fontSize: 13,
    fontWeight: '800',
  },
});
