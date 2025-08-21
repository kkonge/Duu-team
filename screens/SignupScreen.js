import React, { useMemo, useState } from "react";
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

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const passOk = password.length >= 6;
  const matchOk = password === confirm && confirm.length > 0;

  const canSubmit = emailOk && passOk && matchOk;

  const onSubmit = () => {
    console.log({ email, password });
    navigation.navigate("UserProfile");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>

   
        <View style={styles.headerWrap}>
          <Text style={styles.welcome}>Welcome!</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.brand}>멍로그에</Text> 가입하세요!
          </Text>
        </View>

      
        <View style={styles.card}>
       
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#9AA4AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                styles.input,
                email.length > 0 && !emailOk && styles.inputError,
              ]}
              returnKeyType="next"
            />
          </View>

      
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#9AA4AF"
                value={password}
                onChangeText={setPassword}
                textContentType="oneTimeCode"
                secureTextEntry={!showPw}
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  password.length > 0 && !passOk && styles.inputError,
                ]}
                returnKeyType="next"
              />
              <Pressable onPress={() => setShowPw((s) => !s)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPw ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

        
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                placeholder="Re-enter your password"
                placeholderTextColor="#9AA4AF"
                value={confirm}
                onChangeText={setConfirm}
                textContentType="oneTimeCode"
                secureTextEntry={!showPw2}
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  confirm.length > 0 && !matchOk && styles.inputError,
                ]}
                returnKeyType="done"
              />
              <Pressable onPress={() => setShowPw2((s) => !s)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPw2 ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

     
          <Pressable
            disabled={!canSubmit}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.signupBtn,
              !canSubmit && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.signupTxt}>Sign up</Text>
          </Pressable>

        
          <View style={styles.footerRow}>
            <Text style={styles.footerDim}>이미 계정이 있으신가요?</Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login!</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY = "#2D5D9F";
const BACKGROUND = "#F3F6FA";

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: "flex-start"},
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
  loginTo: { fontWeight: "600", color: "#333" },
  brand: { fontWeight: "800", color: PRIMARY },

  card: {
    marginTop: 20,
    marginHorizontal: 22,
    paddingHorizontal: 18,
    paddingVertical: 24,
    borderRadius: 28,
    backgroundColor: "#ffffff",
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
  inputError: {
    borderColor: "#F87171",
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

  signupBtn: {
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
  signupTxt: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },

  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 4,
  },
  footerDim: { color: "#9AA4AF", fontSize: 14 },
  loginLink: { color: PRIMARY, fontWeight: "700", fontSize: 14 },
});