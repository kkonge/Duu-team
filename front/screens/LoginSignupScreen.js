// screens/LoginSignupScreen.tsx (or .js)
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginSignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const onLogin = () => {
    if (!canSubmit) return;
    // TODO: 실제 인증 로직 연결
    console.log({ email, password });
    navigation.navigate('PuppySelect'); // 필요 시 목적지 화면 변경
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>우리 강아지의 모든 것, 멍로그!</Text>
          <Text style={styles.tagline}>매일의 강아지를 기록하고, 산책하고, 관리하세요</Text>

          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* 입력 카드 + 버튼들 */}
        <View style={styles.bottomContainer}>
          {/* 입력 폼 */}
          <View style={styles.card}>
            {/* 이메일 */}
            <View style={styles.field}>
         
              <TextInput
                placeholder="이메일 입력"
                placeholderTextColor="#9AA4AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            {/* 비밀번호 */}
            <View style={styles.field}>
         
              <View style={styles.passwordRow}>
                <TextInput
                  placeholder="비밀번호 입력"
                  placeholderTextColor="#9AA4AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secure}
                  style={[styles.input, styles.inputWithIcon]}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => setSecure((s) => !s)}
                  style={styles.eyeBtn}
                  accessibilityLabel={secure ? '비밀번호 보이기' : '비밀번호 숨기기'}
                >
                  <Ionicons
                    name={secure ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* 로그인 / 회원가입 버튼 */}
          <TouchableOpacity
            style={[styles.loginBtn, !canSubmit && { opacity: 0.5 }]}
            disabled={!canSubmit}
            onPress={onLogin}
          >
            <Text style={styles.loginText}>로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>계정 만들기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 23,
    fontWeight: '900',
    color: '#000',
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
    marginTop: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    
  },

  bottomContainer: {
    marginBottom: 60,
    gap: 16,
  },

  /* 폼 카드 */
  card: {
    marginTop:20,
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    gap: 16,
  },
  field: { gap: 8 },
  label: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    fontSize: 15,
  },
  passwordRow: { position: 'relative' },
  inputWithIcon: { paddingRight: 44 },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 17,
    height: 20,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 버튼 */
  loginBtn: {
    backgroundColor: '#000',
    paddingVertical: 17,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signupBtn: {
    backgroundColor: '#E3E3E3',
    paddingVertical: 17,
    borderRadius: 10,
    alignItems: 'center',
  
  },
  signupText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});