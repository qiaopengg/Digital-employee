import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppShell } from './src/AppShell';
import { getPalette } from './src/theme/palette';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const palette = getPalette(isDarkMode);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />
      <AppShell palette={palette} />
    </SafeAreaProvider>
  );
}

export default App;
