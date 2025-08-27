import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const onLogin = () => {
    console.log({ email, password, remember });
    navigation.navigate("PuppySelect");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>

      
        <View style={styles.headerWrap}>
          <Text style={styles.welcome}>Welcome!</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.brand}>멍로그</Text>에 오신 것을 환영합니다!
          </Text>
        </View>

   
        <View style={styles.card}>
    
          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              placeholder="이메일 입력"
              placeholderTextColor="#9AA4AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="next"
            />
          </View>

      
          <View style={styles.field}>
            <Text style={styles.label}>비밀번호</Text>
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
                accessibilityLabel={secure ? "Show password" : "Hide password"}
                onPress={() => setSecure((s) => !s)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

 
          <View style={styles.helperRow}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRemember((r) => !r)}
            >
              <View style={[styles.radio, remember && styles.radioOn]}>
                {remember && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.rememberTxt}>기억하기</Text>
            </Pressable>

            <TouchableOpacity onPress={() => console.log("Forgot password")}>
              <Text style={styles.forgot}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>
          </View>

         
          <Pressable
            disabled={!canSubmit}
            onPress={onLogin}
            style={({ pressed }) => [
              styles.loginBtn,
              !canSubmit && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.loginTxt}>로그인</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY = "#2D5D9F";
const BACKGROUND = "#F3F6FA";

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-start",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 10,
  },
  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 16,
  },
  welcome: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "800",
    color: PRIMARY,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 18,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
    opacity: 0.85,
  },
  loginTo: {
    fontWeight: "600",
    color: "#333",
  },
  brand: {
    fontWeight: "800",
    color: PRIMARY,
  },
  card: {
    marginTop: 20,
    marginHorizontal: 22,
    paddingHorizontal: 18,
    paddingVertical: 24,
    borderRadius: 28,
    backgroundColor: "#fff",
    shadowColor: "#2D5D9F",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 20,
  },
  field: { gap: 8 },
  label: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    fontSize: 15,
  },
  passwordRow: { position: "relative" },
  inputWithIcon: { paddingRight: 42 },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 20,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  helperRow: {
    marginTop: 4,
    marginBottom: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  radio: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: PRIMARY },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  rememberTxt: { color: "#374151", fontSize: 13.5 },
  forgot: {
    color: PRIMARY,
    fontSize: 13.5,
    textDecorationLine: "underline",
  },
  loginBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  loginTxt: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
});