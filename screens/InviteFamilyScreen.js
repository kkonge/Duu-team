
import React, { useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
  SafeAreaView, Alert, Share
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRoute, useNavigation } from "@react-navigation/native";


function makeCode(seed) {
  const base = (seed || Date.now()).toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (base + "DOGGY").slice(0, 6); 
}

export default function InviteFamilyScreen() {
  const route = useRoute();
  const navigation = useNavigation();

 
  const myInviteCode = useMemo(() => route.params?.myInviteCode || makeCode(), [route.params]);

  const onCopyMyCode = async () => {
    await Clipboard.setStringAsync(myInviteCode);
    Alert.alert("복사됨", "초대코드가 클립보드에 복사됐어요.");
  };

  const onShareMyCode = async () => {
    try {
      await Share.share({ message: `우리 가족에 합류해줘! 초대코드: ${myInviteCode}` });
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
  
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#7B8A7A" />
        </TouchableOpacity>


        <View style={styles.header}>
          <Text style={styles.title}>Invite Family</Text>
          <Text style={styles.subtitle}>내 초대코드를 공유해서 가족을 초대하세요</Text>
        </View>


        <View style={styles.card}>
          <Text style={styles.sectionTitle}>내 초대코드</Text>

          <View style={styles.myCodeBox}>
            <Text style={styles.myCode}>{myInviteCode}</Text>

            <View style={styles.myCodeBtns}>
              <Pressable onPress={onCopyMyCode} style={({ pressed }) => [styles.secBtn, pressed && styles.pressed]}>
                <Ionicons name="copy-outline" size={16} color="#5B6C5A" />
                <Text style={styles.secBtnTxt}>Copy</Text>
              </Pressable>
              <Pressable onPress={onShareMyCode} style={({ pressed }) => [styles.secBtn, pressed && styles.pressed]}>
                <Ionicons name="share-social-outline" size={16} color="#5B6C5A" />
                <Text style={styles.secBtnTxt}>Share</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.helperText}>
            가족에게 이 코드를 보내 가입하도록 안내하세요.{"\n"}
            (초대코드 입력 기능은 초기 가입 플로우에서만 제공됩니다)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_BG = "#fff";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF6E9", paddingHorizontal: 16, paddingTop: 8 },
  backButton: { position: "absolute", top: 10, left: 12, zIndex: 10 },

  header: { alignItems: "center", paddingTop: 38, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#5B7F6A" },
  subtitle: { marginTop: 2, color: "#6B7A6A", fontSize: 13, textAlign: "center" },

  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  sectionTitle: { color: "#415247", fontWeight: "800", marginBottom: 10 },

  myCodeBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E8DE",
    backgroundColor: "#F7FBF8",
    padding: 14,
  },
  myCode: { fontSize: 28, fontWeight: "900", color: "#415247", letterSpacing: 2, textAlign: "center" },

  myCodeBtns: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  secBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E8DE",
    backgroundColor: "#F3F6F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secBtnTxt: { color: "#5B6C5A", fontWeight: "700" },

  helperText: { marginTop: 10, color: "#6B7A6A", fontSize: 12, textAlign: "center", lineHeight: 18 },

  pressed: { transform: [{ scale: 0.99 }] },
});