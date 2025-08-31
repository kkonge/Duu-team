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
  const [agree, setAgree] = useState(false);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const passOk = password.length >= 6;
  const matchOk = password === confirm && confirm.length > 0;

  const score = useMemo(() => {

    let s = 0;
    if (password.length >= 6) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);

  const canSubmit = emailOk && passOk && matchOk && agree;

  const onSubmit = () => {
    if (!canSubmit) return;
    console.log({ email, password });
    navigation.navigate("SignupSuccess");
  };

  const StrengthBar = () => {
    return (
      <View style={styles.strengthWrap}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthChunk,
              i < score && styles.strengthOn,
            ]}
          />
        ))}
        <Text style={styles.strengthLabel}>
          {score <= 1 ? "약함" : score === 2 ? "보통" : score === 3 ? "좋음" : "매우 좋음"}
        </Text>
      </View>
    );
  };

  const LeftIcon = ({ name }) => (
    <View style={styles.leftIcon}>
      <Ionicons name={name} size={18} color="#94A3B8" />
    </View>
  );

  const RightStateIcon = ({ ok, show }) =>
    show ? (
      <View style={styles.rightIcon}>
        <Ionicons
          name={ok ? "checkmark-circle" : "alert-circle"}
          size={18}
          color={ok ? "#10B981" : "#EF4444"}
        />
      </View>
    ) : null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >
    
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>멍로그에 가입하고 기록을 시작하세요!</Text>
        </View>

        {/* 카드 폼 */}
        <View style={styles.card}>

          {/* 이메일 */}
          <View style={styles.field}>
            <View style={styles.inputWrap}>
              <LeftIcon name="mail-outline" />
              <TextInput
                placeholder="이메일 입력"
                placeholderTextColor="#9AA4AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input]}
                returnKeyType="next"
              />
              <RightStateIcon ok={emailOk} show={email.length > 0} />
            </View>
            {email.length > 0 && !emailOk && (
              <Text style={styles.helperError}>올바른 이메일 형식을 입력해 주세요.</Text>
            )}
          </View>

          {/* 비밀번호 */}
          <View style={styles.field}>
            <View style={styles.inputWrap}>
              <LeftIcon name="lock-closed-outline" />
              <TextInput
                placeholder="비밀번호 입력 (6자 이상)"
                placeholderTextColor="#9AA4AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                textContentType="oneTimeCode"
                style={[styles.input, styles.inputWithTail]}
                returnKeyType="next"
              />
              <Pressable onPress={() => setShowPw((s) => !s)} style={styles.tailBtn}>
                <Ionicons
                  name={showPw ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#64748B"
                />
              </Pressable>
            </View>
           
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.field}>
            <View style={styles.inputWrap}>
              <LeftIcon name="repeat-outline" />
              <TextInput
                placeholder="비밀번호 재입력"
                placeholderTextColor="#9AA4AF"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPw2}
                textContentType="oneTimeCode"
                style={[styles.input, styles.inputWithTail]}
                returnKeyType="done"
              />
              <Pressable onPress={() => setShowPw2((s) => !s)} style={styles.tailBtn}>
                <Ionicons
                  name={showPw2 ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#64748B"
                />
              </Pressable>
            </View>
            {confirm.length > 0 && !matchOk && (
              <Text style={styles.helperError}>비밀번호가 일치하지 않습니다.</Text>
            )}
          </View>

          {/* 약관 동의 */}
          <Pressable style={styles.agreeRow} onPress={() => setAgree((v) => !v)}>
            <View style={[styles.checkbox, agree && styles.checkboxOn]}>
              {agree && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.agreeText}>
              이용약관 및 개인정보 처리방침에 동의합니다
            </Text>
          </Pressable>

          {/* 가입 버튼 */}
          <TouchableOpacity
            disabled={!canSubmit}
            onPress={onSubmit}
            style={[styles.submitBtn, !canSubmit && { opacity: 0.5 }]}
          >
            <Text style={styles.submitTxt}>가입하기</Text>
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
    paddingTop: 60,
  
  },
  backBtn: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    opacity: 0.85,
    lineHeight: 20,
  },

  card: {
    marginTop: 30,
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: "#fff",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    gap: 16,
  },

  field: { gap: 8 },


  inputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 44,
    borderWidth: 1.2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    fontSize: 15,
  },
  inputWithTail: { paddingRight: 44 },

  leftIcon: {
    position: "absolute",
    left: 14,
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: 12,
    zIndex: 1,
  },
  tailBtn: {
    position: "absolute",
    right: 12,
    height: 54,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  helperError: {
    marginTop: 2,
    fontSize: 12.5,
    color: "#EF4444",
  },

  
  agreeRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  agreeText: {
    fontSize: 13.5,
    color: "#374151",
  },

  
  submitBtn: {
    marginTop: 6,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitTxt: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },

  dividerRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    flex: 1,
  },
  dividerText: {
    fontSize: 12,
    color: "#6B7280",
  },
  altLink: {
    marginTop: 8,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  altLinkTxt: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
});