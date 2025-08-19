import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable,
  SafeAreaView, KeyboardAvoidingView, Platform, Image, Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddDogStep1Screen({ navigation, route }) {
  const baseParams = route?.params || {};
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birth, setBirth] = useState(null);
  const [showDate, setShowDate] = useState(false);

  const canNext = name.trim().length > 0;

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
    if (!canNext) {
      alert("강아지 이름을 입력해 주세요.");
      return;
    }
    navigation.navigate("AddDogStep2", {
      ...baseParams,
      photo,
      name: name.trim(),
      breed: breed.trim(),
      birth: birth ? birth.toISOString() : null,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding" })}
        style={styles.flex}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-circle" size={32} color="#5B8DEF" />
        </TouchableOpacity>

        <View style={styles.progress}>
          <View style={[styles.dot, styles.dotOn]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>강아지를 소개해 주세요</Text>
          <Text style={styles.subtitle}>사진과 기본 정보를 입력해주세요</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
              <View style={styles.avatarShadow}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="paw-outline" size={56} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="예: Momo"
            style={styles.input}
            returnKeyType="next"
          />

          <Text style={styles.label}>Breed</Text>
          <TextInput
            value={breed}
            onChangeText={setBreed}
            placeholder="예: Poodle"
            style={styles.input}
            returnKeyType="done"
          />

          <Text style={styles.label}>Birth</Text>
          <Pressable
            style={[styles.input, styles.centerBox]}
            onPress={() => setShowDate(true)}
          >
            <Text style={{ color: birth ? "#1E293B" : "#9AA4AF" }}>
              {birth ? birth.toISOString().slice(0, 10) : "YYYY-MM-DD"}
            </Text>
          </Pressable>

          <Pressable
            disabled={!canNext}
            onPress={onNext}
            style={({ pressed }) => [
              styles.primaryBtn,
              !canNext && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.primaryTxt}>Continue</Text>
          </Pressable>
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
                <TouchableOpacity
                  style={styles.modalDone}
                  onPress={() => setShowDate(false)}
                >
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F3F6FA",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 20,
    zIndex: 10,
  },
  progress: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotOn: {
    backgroundColor: "#3A6FA1",
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D5D9F",
  },
  subtitle: {
    marginTop: 4,
    color: "#475569",
    fontSize: 14,
  },
  card: {
    marginTop: 12,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF2FB",
  },
  cameraBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    backgroundColor: "#5B8DEF",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    color: "#1E293B",
    fontWeight: "700",
  },
  input: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
    fontSize: 15,
  },
  centerBox: {
    justifyContent: "center",
    paddingVertical: 0,
  },
  primaryBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E1ECF9",
    borderWidth: 1,
    borderColor: "#C3D7F3",
  },
  primaryTxt: {
    color: "#2D5D9F",
    fontWeight: "800",
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSheet: {
    width: "86%",
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingVertical: 12,
    alignItems: "center",
  },
  modalDone: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
});