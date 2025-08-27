// IdCardScreen.js
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

/* ───────────── Screens ───────────── */

function IdScreen({ navigation, route }) {
  // ✅ AddDogStep1에서 넘어온 photo만 받음
  const { photo } = route.params || {};

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style='auto' />
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.small}>NAME</Text>
            <Text style={styles.big}>JOY</Text>
            <Text style={styles.small}>AGE</Text>
            <Text style={styles.big}>8</Text>
            <Text style={styles.small}>GENDER</Text>
            <Text style={styles.big}>FEMALE</Text>
            <Text style={styles.small}>BREED</Text>
            <Text style={styles.big}>BICHON FRISE</Text>
          </View>

          <Image
            style={styles.cardImage}
            // ✅ photo 있으면 그거, 없으면 기본 이미지
            source={photo ? { uri: photo } : require('../assets/ID.png')}
          />
        </View>

        <Text style={styles.yebang}>
          {`앗, 아직 예방접종 등록을
안하셨나요?`}
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Detail')}
          style={styles.registerButtonWrapper}
        >
          <View style={styles.registerButtonInner}>
            <Text style={styles.registerButtonText}>등록하러 가기!</Text>
          </View>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

function DetailScreen() {
  const navigation = useNavigation();
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style='auto' />
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.small}>NAME</Text>
            <Text style={styles.big}>JOY</Text>
            <Text style={styles.small}>AGE</Text>
            <Text style={styles.big}>8</Text>
            <Text style={styles.small}>GENDER</Text>
            <Text style={styles.big}>FEMALE</Text>
            <Text style={styles.small}>BREED</Text>
            <Text style={styles.big}>BICHON FRISE</Text>
          </View>

          <Image
            style={styles.cardImage}
            source={require('../assets/ID.png')}
          />
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value='123451234512345'
            size={150}
            color='black'
            backgroundColor='white'
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

function HeaderLeftButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Text style={styles.done}>Done</Text>
    </TouchableOpacity>
  );
}

/* ───────────── Nested Stack ───────────── */

export default function IdCardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Id'
        component={IdScreen}
        options={{
          title: '',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={() => {}}>
              <Ionicons
                style={styles.ellipsis}
                name='ellipsis-horizontal-circle-outline'
                size={24}
                color='black'
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name='Detail'
        component={DetailScreen}
        options={{
          title: '',
          presentation: 'modal',
          animation: 'slide_from_right',
          headerLeft: () => <HeaderLeftButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => {}}>
              <Ionicons
                style={styles.ellipsis}
                name='ellipsis-horizontal-circle-outline'
                size={24}
                color='black'
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

/* ───────────── styles ───────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
    padding: 10,
  },
  card: {
    width: '100%',
    backgroundColor: '#589F5D',
    borderRadius: 10,
    paddingLeft: 25,
    paddingRight: 30,
    paddingTop: 30,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { fontSize: 15, color: 'lightgray', fontWeight: '500' },
  big: { fontSize: 20, color: 'white', fontWeight: '600', marginBottom: 15 },
  cardImage: {
    width: '45%',
    height: width * 0.45,
    borderRadius: 10,
    marginTop: 10,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: width * 0.18,
    overflow: 'hidden',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  done: { fontSize: 16, fontWeight: 'bold' },
  ellipsis: { paddingRight: 10, marginTop: -5 },
  yebang: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
  },
  registerButtonWrapper: {
    width: '100%',
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonInner: {
    width: '60%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: 'white',
  },
  registerButtonText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
});