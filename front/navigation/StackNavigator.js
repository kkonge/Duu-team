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
import InviteFamilyScreen from '../screens/InviteFamilyScreen';
import ChatBotScreen from '../screens/ChatBotScreen'; 
import DiaryScreen from '../screens/DiaryScreen';
import DiaryEditorScreen from '../screens/DiaryEditorScreen';
import DiaryList from '../screens/DiaryList';
import DiaryView from '../screens/DiaryView';
import DiaryDetailScreen from '../screens/DiaryDetailScreen';
import GalleryView from '../screens/GalleryView';
import SignupSuccessScreen from '../screens/SignupSuccessScreen';
import HealthCareScreen from '../screens/HealthCareScreen';
import EvaluationScreen from '../screens/EvaluationScreen';
import DiagnosisScreen from '../screens/DiagnoisisScreen';
import DiagnosisResultScreen from '../screens/DiagnosisResultScreen';
import IdCardStack from '../screens/IdCardScreen';
import WalkScreen from '../screens/WalkScreen';
import ApiTestScreen from '../screens/ApiTestScreen';
import SettingsScreen from '../screens/SettingScreen';





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
            <Stack.Screen name='InviteFamily' component={InviteFamilyScreen} />
            <Stack.Screen name='ChatBot' component={ChatBotScreen} />
            <Stack.Screen name='Diary' component={DiaryScreen} />
            <Stack.Screen name='DiaryEditor' component={DiaryEditorScreen} />
            <Stack.Screen name='DiaryList' component={DiaryList} />
            <Stack.Screen name='DiaryView' component={DiaryView} />
            <Stack.Screen name='DiaryDetail' component={DiaryDetailScreen} />
            <Stack.Screen name='GalleryView' component={GalleryView} />
            <Stack.Screen name='SignupSuccess' component={SignupSuccessScreen} />
            <Stack.Screen name='HealthCare' component={HealthCareScreen} />
            <Stack.Screen name='Evaluation' component={EvaluationScreen} />
            <Stack.Screen name='DiagnosisResult' component={DiagnosisResultScreen} />
            <Stack.Screen name='Diagnosis' component={DiagnosisScreen} />
            <Stack.Screen name='IdCard' component={IdCardStack} />
            <Stack.Screen name='Walk' component={WalkScreen} />
            <Stack.Screen name='ApiTest' component={ApiTestScreen} />
            <Stack.Screen name='Settings' component={SettingsScreen} />



    
           
            
           
            


        </Stack.Navigator>
    )
}