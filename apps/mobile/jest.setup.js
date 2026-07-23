/* eslint-env jest */

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const ReactNative = require('react-native');
  const identity = value => value;

  return {
    __esModule: true,
    default: {
      Image: ReactNative.Image,
      View: ReactNative.View,
    },
    Easing: {
      cubic: identity,
      inOut: identity,
      linear: identity,
      quad: identity,
    },
    cancelAnimation: jest.fn(),
    runOnJS: callback => callback,
    useAnimatedStyle: updater => updater(),
    useSharedValue: initialValue =>
      React.useRef({ value: initialValue }).current,
    withRepeat: value => value,
    withSequence: (...values) => values.at(-1),
    withTiming: (value, _config, callback) => {
      callback?.(true);
      return value;
    },
  };
});
