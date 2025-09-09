import {Stack} from "expo-router";
import {PaperProvider} from "react-native-paper";
import {SafeAreaProvider} from "react-native-safe-area-context";
import TrackPlayer from 'react-native-track-player';

// register player service
TrackPlayer.registerPlaybackService(() => require('../config/PlaybackService'));


export default function RootLayout() {
  return (
      <SafeAreaProvider>
        <PaperProvider>
          <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="(tabs)"/>
            <Stack.Screen name="musicList"/>
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
  );
}
