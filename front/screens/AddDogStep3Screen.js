import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddDogStep3Screen({ navigation, route }) {
  const {
    userProfile = null,
    familyProfiles = [],
    dogProfiles = [],
    photo = null,
    name = "",
    breed = "",
    birth = null,
    sex = null,          // "male" | "female"
    size = null,         // "small" | "medium" | "large"
    weight = null,       // number (kg)
    notes = null,
  } = route.params || {};

  const birthText = useMemo(() => {
    if (!birth) return "-";
    try {
      const d = new Date(birth);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch {
      return "-";
    }
  }, [birth]);

  const weightText = useMemo(() => {
    if (weight == null || Number.isNaN(Number(weight))) return "-";
    return `${Number(weight)} kg`;
  }, [weight]);

  const sizeText =
    size === "small" ? "소형견" :
    size === "medium" ? "중형견" :
    size === "large" ? "대형견" : "-";

  const newDog = {
    id: `${Date.now()}`,
    name,
    breed,
    birth,
    sex,
    size,
    weight,
    unit: "kg",
    notes,
    imageUri: photo || null,
    photo: photo || null,
  };

  const nextDogProfiles = [...dogProfiles, newDog];

  const onAddAnother = () => {
    navigation.navigate("AddDogStep1", {
      userProfile,
      familyProfiles,
      dogProfiles: nextDogProfiles,
    });
  };

  const onFinish = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "PuppySelect",
          params: {
            userProfile,
            familyProfiles,
            dogProfiles: nextDogProfiles,
          },
        },
      ],
    });
  };

  const onEditStep1 = () =>
    navigation.navigate("AddDogStep1", {
      userProfile,
      familyProfiles,
      dogProfiles,
      photo,
      name,
      breed,
      birth,
    });

  const onEditStep2 = () =>
    navigation.navigate("AddDogStep2", {
      userProfile,
      familyProfiles,
      dogProfiles,
      photo,
      name,
      breed,
      birth,
      sex,
      size,
      weight,
      unit: "kg",
      notes,
    });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 (뒤로가기 + 타이틀 + 서브타이틀 + 진행 점) */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle" size={32} color="#888" />
          </TouchableOpacity>

          <Text style={styles.title}>입력 내용을 확인해요</Text>
          <Text style={styles.subtitle}>필요하면 연필 버튼으로 수정할 수 있어요</Text>

          <View style={styles.progress}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotOn]} />
          </View>
        </View>

        {/* 아바타 */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarShadow}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="paw-outline" size={56} color="#C3C3C3" />
              </View>
            )}
          </View>
        </View>

        {/* 카드 */}
        <View style={styles.card}>
          {/* 기본 정보 */}
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>기본 정보</Text>
            <Pressable onPress={onEditStep1} hitSlop={8}>
              <Ionicons name="pencil" size={18} color="#111" />
            </Pressable>
          </View>
          <Row label="이름" value={name || "-"} />
          <Row label="견종" value={breed || "-"} />
          <Row label="생년월일" value={birthText} />

          {/* 건강 · 생활 */}
          <View style={[styles.blockHeader, { marginTop: 16 }]}>
            <Text style={styles.blockTitle}>건강 · 생활</Text>
            <Pressable onPress={onEditStep2} hitSlop={8}>
              <Ionicons name="pencil" size={18} color="#111" />
            </Pressable>
          </View>
          <Row label="성별" value={sex === "male" ? "Male" : sex === "female" ? "Female" : "-"} />
          <Row label="체형" value={sizeText} />
          <Row label="몸무게" value={weightText} />
          <Row label="특이사항" value={notes || "-"} multiline />
        </View>

        {/* 버튼들 */}
        <View style={styles.buttonGroup}>
          <Pressable onPress={onAddAnother} style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.pressed]}>
            <Ionicons name="add-circle-outline" size={18} color="#111" />
            <Text style={styles.btnSecondaryTxt}>다른 강아지 추가하기</Text>
          </Pressable>
          <Pressable onPress={onFinish} style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.btnPrimaryTxt}>저장하고 시작하기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* - 재사용 Row 컴포넌트 - */
function Row({ label, value, multiline = false }) {
  return (
    <View style={[styles.rowItem, multiline && { alignItems: "flex-start" }]}>
      <Text style={styles.key}>{label}</Text>
      <Text
        style={[styles.val, multiline && { flex: 1 }]}
        numberOfLines={multiline ? 3 : 1}
      >
        {value}
      </Text>
    </View>
  );
}

/* --------- 디자인 토큰 (블랙/화이트 무드) --------- */
const PRIMARY = "#000";
const BACKGROUND = "#fff";
const BORDER = "#E5E7EB";
const TEXT_DARK = "#111827";
const TEXT_DIM = "#475569";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 20, backgroundColor: BACKGROUND },

  /* 헤더: back 버튼을 헤더 내부 좌상단으로 */
  header: { alignItems: "center", gap: 6, marginBottom: 12 },
  backBtn: { alignSelf: "flex-start" },

  /* 진행 점: 헤더 하단(타이틀/서브타이틀 바로 아래) */
  progress: { flexDirection: "row", gap: 6, marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E5E7EB" },
  dotOn: { backgroundColor: "#111" },

  title: { fontSize: 25, fontWeight: "800", color: PRIMARY, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: "#444", textAlign: "center", opacity: 0.85, lineHeight: 20 },

  avatarWrap: { marginTop: 8, marginBottom: 8, alignItems: "center" },
  avatarShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#fff" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },

  card: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: "#fff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  blockTitle: { fontSize: 17, fontWeight: "800", color: TEXT_DARK },

  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  key: { color: TEXT_DIM, fontWeight: "700", marginRight: 10, minWidth: 90 },
  val: { color: TEXT_DARK, fontWeight: "800" },

  buttonGroup: { gap: 10, marginTop: 16 },
  btn: {
    height: 47,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
    fontWeight: "800",
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