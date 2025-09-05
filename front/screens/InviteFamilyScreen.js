// screens/InviteFamilyScreen.js
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRoute, useNavigation } from "@react-navigation/native";


function makeCode(seed) {
  const base = (seed || Date.now())
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return (base + "DOGGY").slice(0, 6);
}


export default function InviteFamilyScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const myInviteCode = useMemo(
    () => route.params?.myInviteCode || makeCode(),
    [route.params]
  );

  const onCopyMyCode = async () => {
    await Clipboard.setStringAsync(myInviteCode);
    Alert.alert("복사됨", "초대코드가 클립보드에 복사됐어요.");
  };

  const onShareMyCode = async () => {
    try {
      await Share.share({
        message: `우리 가족에 합류해줘! 초대코드: ${myInviteCode}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>


        <View style={s.header}>
          <Text style={s.title}>Invite Family</Text>
          <Text style={s.subtitle}>
            내 초대코드를 공유해서 가족을 초대하세요
          </Text>
        </View>


        <View style={s.card}>
          <Text style={s.sectionTitle}>내 초대코드</Text>

          <View style={s.codeBox}>
            <Text style={s.codeText}>{myInviteCode}</Text>

            <View style={s.btnRow}>
              <Pressable
                onPress={onCopyMyCode}
                hitSlop={6}
                style={({ pressed }) => [
                  s.secBtn,
                  pressed && s.pressed,
                ]}
              >
                <Ionicons name="copy-outline" size={16} color={TEXT_DARK} />
                <Text style={s.secBtnTxt}>Copy</Text>
              </Pressable>

              <Pressable
                onPress={onShareMyCode}
                hitSlop={6}
                style={({ pressed }) => [
                  s.secBtn,
                  pressed && s.pressed,
                ]}
              >
                <Ionicons
                  name="share-social-outline"
                  size={16}
                  color={TEXT_DARK}
                />
                <Text style={s.secBtnTxt}>Share</Text>
              </Pressable>
            </View>
          </View>

          <Text style={s.helper}>
            가족에게 이 코드를 보내 가입하도록 안내하세요.{"\n"}
            (초대코드 입력 기능은 초기 가입 플로우에서만 제공됩니다)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


const PRIMARY = "#000";
const BACKGROUND = "#fff";
const BORDER = "#E5E7EB";
const TEXT_DARK = "#111827";
const TEXT_DIM = "#6B7280";

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

/* ---------- Styles ---------- */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: { flex: 1, backgroundColor: BACKGROUND, paddingHorizontal: 28, paddingTop: 20 },

  backBtn: { alignSelf: "flex-start" },

  header: { alignItems: "center", marginTop: 6, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "800", color: PRIMARY, letterSpacing: 0.3 },
  subtitle: { marginTop: 6, fontSize: 14, color: TEXT_DIM, textAlign: "center" },

  card: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: BACKGROUND,
    borderWidth: 1,
    borderColor: BORDER,
    ...CARD_SHADOW,
  },

  sectionTitle: { fontSize: 15, fontWeight: "900", color: TEXT_DARK, marginBottom: 10 },

  codeBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#F9FAFB",
    padding: 14,
  },
  codeText: {
    fontSize: 30,
    fontWeight: "900",
    color: TEXT_DARK,
    letterSpacing: 6,
    textAlign: "center",
    paddingVertical: 6,
  },

  btnRow: { marginTop: 12, flexDirection: "row", justifyContent: "center", gap: 10 },
  secBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: BACKGROUND,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secBtnTxt: { color: TEXT_DARK, fontWeight: "800" },

  helper: {
    marginTop: 12,
    color: TEXT_DIM,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },

  pressed: { transform: [{ scale: 0.98 }] },
});