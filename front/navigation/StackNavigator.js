import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginSignupScreen from '../screens/LoginSignupScreen';
import LoginScreen from '../screens/LoginScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import FamilyCheckScreen from '../screens/FamilyCheckScreen';
import PuppyNumberScreen from '../screens/PuppyNumberScreen';
import OneDogProfileScreen from '../screens/OneDogProfileScreen';
import MultipleDogProfileScreen from '../screens/MultipleDogProfileScreen';
import PuppySelectScreen from '../screens/PuppySelectScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HomeScreen from '../screens/HomeScreen';
const Stack= createNativeStackNavigator();

export default function StackNavigator(){
    return(
        <Stack.Navigator initialRouteName='LoginSignup' screenOptions={{headerShown: false}}>
            <Stack.Screen name='LoginSignup' component={LoginSignupScreen} />
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='UserProfile' component={UserProfileScreen} />
            <Stack.Screen name='FamilyCheck' component={FamilyCheckScreen} />
            <Stack.Screen name='PuppyNumber' component={PuppyNumberScreen} />
            <Stack.Screen name='OneDogProfile' component={OneDogProfileScreen} />
            <Stack.Screen name='MultipleDogProfile' component={MultipleDogProfileScreen} />
            <Stack.Screen name='PuppySelect' component={PuppySelectScreen} />
            <Stack.Screen name='Calendar' component={CalendarScreen} />
            <Stack.Screen name='Home' component={HomeScreen} />
        </Stack.Navigator>
    )
}