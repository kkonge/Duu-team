// screens/SignUpScreen.tsx
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const emailOk = useMemo(
    () => /\S+@\S+\.\S+/.test(email.trim()),
    [email]
  );
  const passOk = password.length >= 6;
  const matchOk = password === confirm && confirm.length > 0;

  const canSubmit = emailOk && username.trim().length > 1 && passOk && matchOk;

  const onSubmit = () => {
    console.log({ email, username, password });
    navigation.navigate("UserProfile")
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
          <Text style={styles.welcome}>Welcome !</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.loginTo}>Sign up to{"\n"}</Text>
            <Text style={styles.brand}>Doggy</Text> is simple!
          </Text>
        </View>

        <View style={styles.card}>
          {/* Email */}
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

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter your user name"
              placeholderTextColor="#9AA4AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                placeholder="Enter your Password"
                placeholderTextColor="#9AA4AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  password.length > 0 && !passOk && styles.inputError,
                ]}
                returnKeyType="next"
              />
              <Pressable
                onPress={() => setShowPw((s) => !s)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPw ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                placeholder="Enter your Password"
                placeholderTextColor="#9AA4AF"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPw2}
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  confirm.length > 0 && !matchOk && styles.inputError,
                ]}
                returnKeyType="done"
              />
              <Pressable
                onPress={() => setShowPw2((s) => !s)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPw2 ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>
          </View>

          {/* Submit */}
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

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerDim}>Already have an account?</Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login!</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const CARD_BG = "#ffffff";
const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: "flex-start" },
  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  welcome: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  subtitle: { fontSize: 18, color: "#000", textAlign: "left" },
  loginTo: { fontWeight: "600", color: "#000" },
  brand: { fontWeight: "800", color: "#000" },

  card: {
    marginTop: 16,
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
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9F6EB",
  },
  signupTxt: { fontSize: 18, fontWeight: "700", color: "#26C05E" },

  footerRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 4,
  },
  footerDim: { color: "#9AA4AF" },
  loginLink: { color: "#2F7FFF", fontWeight: "700" },

  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 10,
  },
});