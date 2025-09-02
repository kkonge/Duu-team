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
import { useNavigation, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const Stack = createNativeStackNavigator();

/* ───────────── Reusable Header Buttons ───────────── */

function HeaderIconButton({ icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name={icon} size={20} color="#111" />
    </TouchableOpacity>
  );
}

function HeaderLeftBack() {
  const navigation = useNavigation();
  return <HeaderIconButton icon="chevron-back" onPress={() => navigation.goBack()} />;
}

function HeaderRightEllipsis({ onPress }) {
  return <HeaderIconButton icon="ellipsis-horizontal" onPress={onPress || (() => {})} />;
}

/* ───────────── Screens ───────────── */

function IdScreen({ navigation }) {
  // ✅ AddDogStep1에서 넘어온 photo만 받음
  const route = useRoute();
  const { photo } = route.params || {};

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
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
          onPress={() => navigation.navigate('Detail', { photo })}
          style={styles.registerButtonWrapper}
          activeOpacity={0.9}
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
  // ✅ AddDogStep1에서 넘어온 photo만 받음
  const route = useRoute();
  const { photo } = route?.params || {};
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
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
            source={photo ? { uri: photo } : require('../assets/ID.png')}
          />
        </View>

        <View style={styles.qrContainer}>
          <QRCode value="123451234512345" size={150} color="black" backgroundColor="white" />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

/* ───────────── Nested Stack ───────────── */

export default function IdCardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitle: '',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#f2f2f7' },
        contentStyle: { backgroundColor: '#f2f2f7' },
      }}
    >
      <Stack.Screen
        name="Id"
        component={IdScreen}
        options={{
          headerLeft: () => <HeaderLeftBack />,
          headerRight: () => <HeaderRightEllipsis />,
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
          headerLeft: () => <HeaderLeftBack />,
          headerRight: () => <HeaderRightEllipsis />,
        }}
      />
    </Stack.Navigator>
  );
}

/* ───────────── styles ───────────── */
const styles = StyleSheet.create({
  /* Header Icon Button (공통) */
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  /* Screen */
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
    padding: 10,
  },

  /* Card */
  card: {
    width: '100%',
    backgroundColor: '#589F5D',
    borderRadius: 16,
    paddingLeft: 22,
    paddingRight: 24,
    paddingTop: 24,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },

  small: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '800', letterSpacing: 1, marginTop: 6 },
  big: { fontSize: 20, color: '#fff', fontWeight: '900', marginBottom: 14 },

  cardImage: {
    width: '45%',
    height: width * 0.45,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#E6F2E7',
  },

  /* QR */
  qrContainer: {
    alignItems: 'center',
    marginTop: 14,
    marginHorizontal: width * 0.18,
    overflow: 'hidden',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  /* Notice & CTA */
  yebang: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
  },
  registerButtonWrapper: {
    width: '100%',
    marginTop: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButtonInner: {
    width: '64%',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  registerButtonText: { fontSize: 15, fontWeight: '900', color: 'white', letterSpacing: 0.3 },
});