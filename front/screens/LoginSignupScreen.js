import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

export default function LoginSignupScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* 상단 로고 및 소개 */}
      <View style={styles.header}>
        <Text style={styles.logo}>MUNG LOG</Text>
        <Text style={styles.tagline}>Daily Care For Your Dog</Text>

        {/* 로고 이미지 삽입 */}
        <Image
          source={require('../assets/logo.png')} // ← 경로 확인!
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      

      {/* 로그인 / 회원가입 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupBtn} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>계정 만들기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 110,
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 43,
    fontWeight: '900',
    color: '#2D5D9F',
    letterSpacing: 0.8,
  },
  tagline: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '400',
    opacity: 0.85,
    lineHeight: 20,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginTop: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
  },
  bottomContainer: {
    marginBottom: 80,
    gap: 16,
  },
  loginBtn: {
    backgroundColor: '#2D5D9F',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signupBtn: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3A6FA1',
  },
  signupText: {
    color: '#3A6FA1',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});