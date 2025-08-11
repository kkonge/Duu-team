import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginSignupScreen from '../screens/LoginSignupScreen';
import LoginScreen from '../screens/LoginScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import FamilyCheckScreen from '../screens/FamilyCheckScreen';
import PuppySelectScreen from '../screens/PuppySelectScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HomeScreen from '../screens/HomeScreen';
import UserRelationshipScreen from '../screens/UserRelationshipScreen';
import SignupScreen from '../screens/SignupScreen';
import AddDogStep1Screen from '../screens/AddDogStep1Screen';
import AddDogStep2Screen from '../screens/AddDogStep2Screen'; 
import AddDogStep3Screen from '../screens/AddDogStep3Screen'; 
import InviteFamiltScreen from '../screens/InviteFamilyScreen';
const Stack= createNativeStackNavigator();

export default function StackNavigator(){
    return(
        <Stack.Navigator initialRouteName='LoginSignup' screenOptions={{headerShown: false}}>
            <Stack.Screen name='LoginSignup' component={LoginSignupScreen} />
            <Stack.Screen name='Login' component={LoginScreen} />
            <Stack.Screen name='UserProfile' component={UserProfileScreen} />
            <Stack.Screen name='FamilyCheck' component={FamilyCheckScreen} />
            <Stack.Screen name='PuppySelect' component={PuppySelectScreen} />
            <Stack.Screen name='Calendar' component={CalendarScreen} />
            <Stack.Screen name='Home' component={HomeScreen} />
            <Stack.Screen name='UserRelationship' component={UserRelationshipScreen} />
            <Stack.Screen name='Signup' component={SignupScreen} />
            <Stack.Screen name='AddDogStep1' component={AddDogStep1Screen} />
            <Stack.Screen name='AddDogStep2' component={AddDogStep2Screen} />
            <Stack.Screen name='AddDogStep3' component={AddDogStep3Screen} />
            <Stack.Screen name='InviteFamily' component={InviteFamiltScreen} />
        </Stack.Navigator>
    )
}