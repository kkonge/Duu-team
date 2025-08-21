import React, { useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
  SafeAreaView, Image, ScrollView
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
    sex = null,
    neutered = false,
    weight = null,
    unit = "kg",
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
    const w = Number(weight);
    if (unit === "kg") {
      return `${w} kg`;
    } else {
      const kg = (w * 0.453592).toFixed(1);
      return `${w} lb  (${kg} kg)`;
    }
  }, [weight, unit]);

  const newDog = {
    id: `${Date.now()}`,
    name,
    breed,
    birth,
    sex,
    neutered,
    weight,
    unit,
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

  const onFinish = async () => {
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
      neutered,
      weight,
      unit,
      notes,
    });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#2D5D9F" />
      </TouchableOpacity>
      <View style={styles.progress}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotOn]} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <Text style={styles.title}>입력 내용을 확인해요</Text>
          <Text style={styles.subtitle}>필요하면 연필 버튼으로 수정할 수 있어요</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarShadow}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="paw-outline" size={56} color="#94A3B8" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>기본 정보</Text>
            <Pressable onPress={onEditStep1} hitSlop={8}>
              <Ionicons name="pencil" size={18} color="#2D5D9F" />
            </Pressable>
          </View>

          <View style={styles.rowItem}><Text style={styles.key}>Name</Text><Text style={styles.val}>{name || "-"}</Text></View>
          <View style={styles.rowItem}><Text style={styles.key}>Breed</Text><Text style={styles.val}>{breed || "-"}</Text></View>
          <View style={styles.rowItem}><Text style={styles.key}>Birth</Text><Text style={styles.val}>{birthText}</Text></View>

          <View style={[styles.blockHeader, { marginTop: 12 }]}>
            <Text style={styles.blockTitle}>건강 · 생활</Text>
            <Pressable onPress={onEditStep2} hitSlop={8}>
              <Ionicons name="pencil" size={18} color="#2D5D9F" />
            </Pressable>
          </View>

          <View style={styles.rowItem}><Text style={styles.key}>Sex</Text><Text style={styles.val}>{sex === "male" ? "Male" : sex === "female" ? "Female" : "-"}</Text></View>
          <View style={styles.rowItem}><Text style={styles.key}>Neutered</Text><Text style={styles.val}>{neutered ? "Yes" : "No"}</Text></View>
          <View style={styles.rowItem}><Text style={styles.key}>Weight</Text><Text style={styles.val}>{weightText}</Text></View>
          <View style={[styles.rowItem, { alignItems: "flex-start" }]}>
            <Text style={styles.key}>Notes</Text>
            <Text style={[styles.val, { flex: 1 }]} numberOfLines={3}>{notes || "-"}</Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable onPress={onAddAnother} style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}>
              <Ionicons name="add-circle-outline" size={18} color="#2D5D9F" />
              <Text style={styles.btnSecondaryTxt}>다른 강아지 추가하기</Text>
            </Pressable>
            <Pressable onPress={onFinish} style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.btnPrimaryTxt}>저장하고 시작하기</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F3F6FA", paddingHorizontal: 18, paddingTop: 40 },
  backButton: { position: "absolute", top: 10, left: 16, zIndex: 10 },
  progress: { flexDirection: "row", alignSelf: "center", marginTop: 8, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#CBD5E1" },
  dotOn: { backgroundColor: "#2D5D9F" },
  header: { alignItems: "center", paddingTop: 8, paddingBottom: 6 },
  title: { fontSize: 22, fontWeight: "800", color: "#2D5D9F" },
  subtitle: { marginTop: 4, color: "#475569", textAlign: "center" },
  card: {
    marginTop: 10, padding: 18, borderRadius: 24, backgroundColor: "#fff",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 5,
  },
  avatarWrap: { alignItems: "center", marginBottom: 12 },
  avatarShadow: {
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#fff" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  blockHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginTop: 4, marginBottom: 6
  },
  blockTitle: { color: "#1E3A8A", fontWeight: "800" },
  rowItem: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 1, borderColor: "#E2E8F0"
  },
  key: { color: "#475569", fontWeight: "600", marginRight: 10, minWidth: 90 },
  val: { color: "#0F172A", fontWeight: "700" },
  buttonRow: { gap: 10, marginTop: 14 },
  btnSecondary: {
    height: 48, borderRadius: 24, borderWidth: 1, borderColor: "#C7D2FE",
    backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 8
  },
  btnSecondaryTxt: { color: "#2D5D9F", fontSize: 16, fontWeight: "700" },
  btnPrimary: {
    height: 48, borderRadius: 24, borderWidth: 0,
    backgroundColor: "#2D5D9F", alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 8
  },
  btnPrimaryTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
  pressed: { transform: [{ scale: 0.99 }] },
});