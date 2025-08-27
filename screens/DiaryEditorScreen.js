import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, StyleSheet, ScrollView, Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_KEY = "@diary_local_entries";
const DRAFT_KEY = "@diary_draft";
const PROFILE_NAME_KEY = "@profile_name";
const PROFILE_EMAIL_KEY = "@profile_email";

const BG = "#fff";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_DIM = "#6B7280";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

const MOOD_OPTIONS = [
  { key: "happy",  icon: "happy-outline",  label: "기분좋음" },
  { key: "walk",   icon: "walk-outline",   label: "산책" },
  { key: "health", icon: "medkit-outline", label: "건강" },
  { key: "note",   icon: "sparkles-outline", label: "메모" },
];

export default function DiaryEditorScreen({ navigation, route }) {
  const selectedDog = route.params?.selectedDog;

  const [text, setText]   = useState("");
  const [images, setImages] = useState([]);
  const [mood, setMood]   = useState(null);
  const [tags, setTags]   = useState([]);

  // 드래프트 복구
  useEffect(() => {
    (async () => {
      const draftRaw = await AsyncStorage.getItem(DRAFT_KEY);
      if (!draftRaw) return;
      try {
        const d = JSON.parse(draftRaw);
        if (d?.text || d?.images?.length) {
          setText(d.text || "");
          setImages(d.images || []);
          setMood(d.mood || null);
          setTags(d.tags || []);
        }
      } catch {}
    })();
  }, []);

  // 오토세이브
  useEffect(() => {
    const timer = setTimeout(() => {
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ text, images, mood, tags }));
    }, 400);
    return () => clearTimeout(timer);
  }, [text, images, mood, tags]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const selected = result.assets || [result];
      setImages((prev) => [...prev, ...selected.map((it) => ({ uri: it.uri }))]);
    }
  };

  const removeImage = (index) => {
    const next = [...images];
    next.splice(index, 1);
    setImages(next);
  };

  const addTag = (t) => {
    if (!t) return;
    const value = t.replace(/^#/, "").trim();
    if (!value) return;
    if (tags.includes(value)) return;
    setTags((prev) => [...prev, value]);
  };
  const removeTag = (value) => setTags((prev) => prev.filter((v) => v !== value));

  const onSave = async () => {
    try {
      if (!text.trim() && images.length === 0) {
        Alert.alert("알림", "내용 또는 사진을 추가해주세요.");
        return;
      }
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      const list = raw ? JSON.parse(raw) : [];

      const authorName = (await AsyncStorage.getItem(PROFILE_NAME_KEY)) || "AUTHOR";
      const authorEmail = (await AsyncStorage.getItem(PROFILE_EMAIL_KEY)) || "user@example.com";

      const now = new Date();
      const entry = {
        id: `local_${now.getTime()}`,
        date: now.toISOString(),
        text,
        photos: images.map((it) => it.uri),
        tags,
        mood,
        authorName,
        authorEmail,
        __local: true,
      };

      const next = [entry, ...list];
      await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      await AsyncStorage.removeItem(DRAFT_KEY);
      navigation.navigate("Diary", { didSave: true, selectedDog });
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "저장에 실패했습니다.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={ss.root}>
      {/* 헤더 */}
      <View style={ss.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={ss.hbtn}>
          <Ionicons name="chevron-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <Text style={ss.hTitle}>새 일기</Text>
        <TouchableOpacity onPress={onSave} style={ss.saveBtn}>
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={ss.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* 무드 */}
        <Text style={ss.label}>무드</Text>
        <View style={ss.moodRow}>
          {MOOD_OPTIONS.map((m) => {
            const active = mood === m.key;
            return (
              <TouchableOpacity key={m.key} onPress={() => setMood(active ? null : m.key)} style={[ss.moodChip, active && ss.moodChipOn]}>
                <Ionicons name={m.icon} size={14} color={TEXT} />
                <Text style={ss.moodTxt}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 사진 */}
        <View style={ss.card}>
          <View style={ss.rowBetween}>
            <Text style={ss.cardTitle}>사진</Text>
            <TouchableOpacity style={ss.iconGhost} onPress={pickImage}>
              <Ionicons name="image-outline" size={16} color={TEXT} />
              <Text style={ss.iconGhostTxt}>추가</Text>
            </TouchableOpacity>
          </View>

          <View style={ss.imageContainer}>
            {images.map((img, idx) => (
              <View key={idx} style={ss.imageWrapper}>
                <Image source={{ uri: img.uri }} style={ss.image} />
                <TouchableOpacity style={ss.deleteIcon} onPress={() => removeImage(idx)}>
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length === 0 && (
              <View style={ss.imageEmpty}>
                <Ionicons name="images-outline" size={22} color={TEXT_DIM} />
                <Text style={{ marginTop: 6, color: TEXT_DIM, fontWeight: "700" }}>사진을 추가하세요</Text>
              </View>
            )}
          </View>
        </View>

        {/* 본문 */}
        <View style={ss.card}>
          <Text style={ss.cardTitle}>본문</Text>
          <TextInput
            style={ss.diaryText}
            placeholder="오늘의 감정이나 특별한 순간을 적어보세요..."
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
            placeholderTextColor={TEXT_DIM}
          />
        </View>

        {/* 태그 */}
        <View style={ss.card}>
          <View style={ss.rowBetween}>
            <Text style={ss.cardTitle}>태그</Text>
            <TouchableOpacity style={ss.iconGhost} onPress={() => addTag("산책")}>
              <Ionicons name="pricetags-outline" size={16} color={TEXT} />
              <Text style={ss.iconGhostTxt}>#산책</Text>
            </TouchableOpacity>
          </View>

          <View style={ss.tagsRow}>
            {tags.map((t) => (
              <TouchableOpacity key={t} style={ss.tagChip} onPress={() => removeTag(t)}>
                <Text style={ss.tagTxt}>#{t}</Text>
                <Ionicons name="close" size={12} color={TEXT_DIM} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={ss.tagInputRow}>
            <Ionicons name="add" size={16} color={TEXT_DIM} />
            <TextInput
              style={ss.tagInput}
              placeholder="태그 입력 후 엔터 (예: 산책, 병원, 간식)"
              placeholderTextColor={TEXT_DIM}
              onSubmitEditing={(e) => addTag(e.nativeEvent.text)}
              returnKeyType="done"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ss = StyleSheet.create({
  root: { marginTop: 50, flex: 1, backgroundColor: BG },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, marginTop: 8 },
  hbtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER },
  hTitle: { fontSize: 16, fontWeight: "900", color: TEXT },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#111", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  saveText: { color: "#fff", fontWeight: "900" },

  label: { fontSize: 12, color: TEXT_DIM, fontWeight: "900", marginBottom: 8, marginLeft: 2 },

  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12, paddingHorizontal: 2 },
  moodChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: BORDER, backgroundColor: "#F9FAFB", flexDirection: "row", alignItems: "center", gap: 6 },
  moodChipOn: { backgroundColor: "#fff", borderColor: TEXT },
  moodTxt: { fontSize: 12, fontWeight: "900", color: TEXT },

  card: { borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 12, ...CARD_SHADOW },
  cardTitle: { fontSize: 13, fontWeight: "900", color: TEXT, marginBottom: 8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  iconGhost: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: BORDER, backgroundColor: "#F9FAFB" },
  iconGhostTxt: { fontSize: 12, fontWeight: "900", color: TEXT },

  imageContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, minHeight: 92 },
  imageWrapper: { position: "relative", width: 92, height: 92 },
  image: { width: "100%", height: "100%", borderRadius: 8 },
  deleteIcon: { position: "absolute", top: -6, right: -6, backgroundColor: "#fff", borderRadius: 10 },

  imageEmpty: { height: 92, borderRadius: 8, borderWidth: 1, borderColor: BORDER, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" },

  diaryText: { fontSize: 16, backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER, minHeight: 220, color: TEXT, fontWeight: "600" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  tagChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: BORDER, backgroundColor: "#F9FAFB" },
  tagTxt: { fontSize: 12, fontWeight: "900", color: TEXT },
  tagInputRow: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: BORDER, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  tagInput: { flex: 1, color: TEXT, fontWeight: "700" },
});