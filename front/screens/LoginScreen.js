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
  const nav = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length >= 6;
  const navigation = useNavigation();

  const onLogin = () => {
    //  실제 로그인 로직 연결 해야함
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
            <Text style={styles.welcome}>Welcome !</Text>
            <Text style={styles.subtitle}>
              <Text style={styles.loginTo}>Log in to{"\n"}</Text>
            <Text style={styles.brand}>Doggy</Text> is simple!
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
                autoCorrect={false}
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  placeholder="Enter your Password"
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
                    color="#6B7280"
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
                <Text style={styles.rememberTxt}>Remember Me</Text>
              </Pressable>

              <TouchableOpacity onPress={() => console.log("Forgot password")}>
                <Text style={styles.forgot}>Forgot Password ?</Text>
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
              <Text style={styles.loginTxt}>Log in</Text>
            </Pressable>

           
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  
  );
}

const CARD_BG = "#ffffff";
const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: "flex-start" },
  gradient: { flex: 1 },
  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
  },
  welcome: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.3,
    marginBottom: 20,
    

  },
  subtitle: { fontSize: 20, color: "#000000" },
  loginTo: { fontWeight: "600", color: "#000000" },
  brand: { fontWeight: "800", color: "#000000" },

  card: {
    marginTop: 20,
    marginHorizontal: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 28,
    backgroundColor: CARD_BG,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    gap: 14,
  },

  field: { gap: 8 },
  label: { color: "#111827", fontSize: 14, fontWeight: "600" },

  input: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  radioOn: { borderColor: "#22C55E" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#22C55E" },
  rememberTxt: { color: "#374151", fontSize: 13.5 },

  forgot: { color: "#6B7280", fontSize: 13.5, textDecorationLine: "underline" },

  loginBtn: {
    marginTop: 8,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F6EB",
  },
  loginTxt: { fontSize: 18, fontWeight: "700", color: "#26C05E" },

  footerRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 4,
  },
  footerDim: { color: "#9AA4AF" },
  signUp: { color: "#2F7FFF", fontWeight: "700" },
    
  
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
  },
});
