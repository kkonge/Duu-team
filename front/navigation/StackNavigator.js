// StackNavigator.tsx (JS 또는 TSX)
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import LogScreen from '../screens/LogScreen';
import SignUpScreen from '../screens/SignUpScreen';
import YourProfileScreen from '../screens/YourProfileScreen';
import PuppyProfileScreen from '../screens/PuppyProfileScreen'; 

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Log" component={LogScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="YourProfile" component={YourProfileScreen} />
      <Stack.Screen name="PuppyProfile" component={PuppyProfileScreen} />
    </Stack.Navigator>
  );
}