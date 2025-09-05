//AddDogStep1Screen.js
import React, { useState, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";


const InputRow = memo(function InputRow({ icon, children }) {
  return (
    <View style={styles.inputWrap}>
      {icon ? (
        <View style={styles.leftIcon} pointerEvents="none">
          <Ionicons name={icon} size={18} color="#94A3B8" />
        </View>
      ) : null}
      {children}
    </View>
  );
});
const Divider = memo(() => <View style={styles.divider} />);


export default function AddDogStep1Screen({ navigation, route }) {
  const baseParams = route?.params || {};
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birth, setBirth] = useState(null);
  const [showDate, setShowDate] = useState(false);


  const canNext =
    !!photo &&
    name.trim().length > 0 &&
    breed.trim().length > 0 &&
    !!birth;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("사진 접근 권한이 필요합니다.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  const onNext = () => {
 
    if (!photo) {
      alert("강아지 사진을 선택해 주세요.");
      return;
    }
    if (!name.trim()) {
      alert("강아지 이름을 입력해 주세요.");
      return;
    }
    if (!breed.trim()) {
      alert("견종을 입력해 주세요.");
      return;
    }
    if (!birth) {
      alert("생년월일을 선택해 주세요.");
      return;
    }

    navigation.navigate("AddDogStep2", {
      ...baseParams,
      photo,
      name: name.trim(),
      breed: breed.trim(),
      birth: birth.toISOString(),
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >
        {/* 뒤로가기 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 28 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>강아지를 소개해 주세요</Text>
            <Text style={styles.subtitle}>사진과 기본 정보를 입력해주세요</Text>

            {/* 진행 점 */}
            <View style={styles.progress}>
              <View style={[styles.dot, styles.dotOn]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* 아바타 */}
            <View style={styles.avatarWrap}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
                <View style={styles.avatarShadow}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="paw-outline" size={56} color="#C3C3C3" />
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 카드 */}
          <View style={styles.card}>
            {/* 이름 */}
            <Text style={styles.label}>이름 *</Text>
            <InputRow icon="text-outline">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="예: Momo"
                placeholderTextColor="#9AA4AF"
                style={styles.input}
                returnKeyType="next"
              />
            </InputRow>

            {/* 견종 */}
            <Text style={styles.label}>견종 *</Text>
            <InputRow icon="list-outline">
              <TextInput
                value={breed}
                onChangeText={setBreed}
                placeholder="예: 푸들"
                placeholderTextColor="#9AA4AF"
                style={styles.input}
                returnKeyType="done"
              />
            </InputRow>

            <Divider />

            {/* 생년월일 */}
            <Text style={styles.sectionTitle}>생년월일 *</Text>
            <Pressable onPress={() => setShowDate(true)}>
              <InputRow icon="calendar-outline">
                <View style={[styles.input, styles.inputReadonly]}>
                  <Text style={{ color: birth ? "#111827" : "#9AA4AF", fontSize: 15 }}>
                    {birth ? birth.toISOString().slice(0, 10) : "YYYY-MM-DD"}
                  </Text>
                </View>
              </InputRow>
            </Pressable>

       
            <TouchableOpacity
              disabled={!canNext}
              onPress={onNext}
              style={[styles.submitBtn, !canNext && { opacity: 0.5 }]}
            >
              <Text style={styles.submitTxt}>계속하기</Text>
            </TouchableOpacity>
          </View>

         
          {Platform.OS === "ios" ? (
            <Modal
              visible={showDate}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDate(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalSheet}>
                  <DateTimePicker
                    value={birth || new Date(2022, 0, 1)}
                    mode="date"
                    display="spinner"
                    onChange={(_, d) => d && setBirth(d)}
                    maximumDate={new Date()}
                  />
                  <TouchableOpacity style={styles.modalDone} onPress={() => setShowDate(false)}>
                    <Text style={{ fontWeight: "600" }}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          ) : (
            showDate && (
              <DateTimePicker
                value={birth || new Date(2022, 0, 1)}
                mode="date"
                display="calendar"
                onChange={(_, d) => {
                  setShowDate(false);
                  d && setBirth(d);
                }}
                maximumDate={new Date()}
              />
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const PRIMARY = "#000";
const BACKGROUND = "#fff";
const BORDER = "#E5E7EB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingTop: 50,
  },

  backBtn: { position: "absolute", top: 10, left: 16, zIndex: 10 },

  header: { alignItems: "center", gap: 6, marginBottom: 12 },
  title: { fontSize: 25, fontWeight: "900", color: PRIMARY, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: "#444", textAlign: "center", opacity: 0.85, lineHeight: 20 },

  progress: { flexDirection: "row", gap: 6, marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E5E7EB" },
  dotOn: { backgroundColor: "#111" },

  avatarWrap: { marginTop: 8, marginBottom: 6 },
  avatarShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#fff" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  cameraBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    backgroundColor: "#111",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },


  card: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: "#fff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },


  label: { marginTop: 8, marginBottom: 8, color: "#1E293B", fontWeight: "700" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#111827", marginBottom: 8, opacity: 0.9 },


  inputWrap: {
    position: "relative",
    justifyContent: "center",
    height: 52,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: BORDER,
    backgroundColor: "#fff",
    paddingLeft: 44,
    paddingRight: 12,
    marginBottom: 4,
  },
  leftIcon: { position: "absolute", left: 14, zIndex: 1 },

  input: {
    height: "100%",
    fontSize: 15,
    color: "#111827",
  },
  inputReadonly: { justifyContent: "center" },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },

 
  submitBtn: {
    marginTop: 14,
    height: 47,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitTxt: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },


  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  modalSheet: { width: "86%", borderRadius: 16, backgroundColor: "#fff", paddingVertical: 12, alignItems: "center" },
  modalDone: { marginTop: 6, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#E2E8F0" },
});