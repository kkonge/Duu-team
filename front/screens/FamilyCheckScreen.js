import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InviteCheckScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 뒤로가기 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 28 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ overflow: "visible" }}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>Family & Invite</Text>
            <Text style={styles.subtitle}>앱을 사용 중인 가족이 있나요?</Text>
          </View>

          
          <View style={styles.shadowWrap}>
            <View style={styles.card}>
              <Text style={styles.question}>초대코드로 계정을 연결할 수 있어요.</Text>

              <View style={styles.buttonGroup}>
                {/* Secondary: 처음 시작 */}
                <Pressable
                  onPress={() => navigation.navigate("AddDogStep1")}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnSecondary,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="sparkles-outline" size={18} color="#111" />
                  <Text style={styles.btnSecondaryTxt}>아니요, 처음이에요</Text>
                </Pressable>

            
                <Pressable
                  onPress={() => navigation.navigate("UserProfile")}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnPrimary,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="key-outline" size={18} color="#fff" />
                  <Text style={styles.btnPrimaryTxt}>네, 초대코드 입력할게요</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


const PRIMARY = "#000";
const BACKGROUND = "#fff";
const CARD_BG = "#fff";
const BORDER = "#E5E7EB";
const TEXT_DARK = "#111827";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: {
    flex: 1,
    paddingTop: 50,       
    backgroundColor: BACKGROUND,
  },

  backBtn: { position: "absolute", top: 10, left: 16, zIndex: 10 },

  header: { alignItems: "center", gap: 6, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: PRIMARY, letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: "#444", textAlign: "center", opacity: 0.85, lineHeight: 20 },


  shadowWrap: {
    marginTop: 16,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },


  card: {
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: CARD_BG,
  },

  question: {
    fontSize: 15.5,
    color: TEXT_DARK,
    marginBottom: 16,
    lineHeight: 22,
  },

  buttonGroup: { gap: 12 },


  btn: {
    height: 47,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },


  btnSecondary: {
    backgroundColor: "#fff",
    borderColor: BORDER,
  },
  btnSecondaryTxt: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },


  btnPrimary: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  btnPrimaryTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  pressed: { transform: [{ scale: 0.98 }] },
});