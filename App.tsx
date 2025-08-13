import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './navigation/StackNavigator';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.ttf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-Light': require('./assets/fonts/Pretendard-Light.ttf'),
    'Pretendard-ExtraBold': require('./assets/fonts/Pretendard-ExtraBold.ttf'),
    'Pretendard-ExtraLight': require('./assets/fonts/Pretendard-ExtraLight.ttf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Thin': require('./assets/fonts/Pretendard-Thin.ttf'),
    'Pretendard-Black': require('./assets/fonts/Pretendard-Black.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}