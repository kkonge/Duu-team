import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable,
  SafeAreaView, KeyboardAvoidingView, Platform, Switch, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddDogStep2Screen({ navigation, route }) {
  const baseParams = route?.params || {};
  const { photo, name, breed, birth } = baseParams;

  const [sex, setSex] = useState(null);
  const [neutered, setNeutered] = useState(false);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [notes, setNotes] = useState("");

  const canNext = sex === "male" || sex === "female";

  const onNext = () => {
    if (!canNext) {
      alert("성별을 선택해 주세요.");
      return;
    }
    navigation.navigate("AddDogStep3", {
      ...baseParams,
      photo,
      name,
      breed,
      birth,
      sex,
      neutered,
      weight: weight.trim().length ? Number(weight) : null,
      unit,
      notes: notes.trim().length ? notes.trim() : null,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding" })} style={styles.flex}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#5B8DEF" />
        </TouchableOpacity>

        <View style={styles.progress}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotOn]} />
          <View style={styles.dot} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>건강 · 생활 정보</Text>
          <Text style={styles.subtitle}>성별, 몸무게 등을 입력해 주세요</Text>
        </View>

        <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
          {/* 성별 */}
          <Text style={styles.label}>Sex *</Text>
          <View style={styles.genderRow}>
            <Pressable
              style={[styles.genderBtn, sex === "male" && styles.genderOn]}
              onPress={() => setSex("male")}
            >
              <View style={[styles.radio, sex === "male" && styles.radioOn]}>
                {sex === "male" && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.genderTxt, sex === "male" && styles.genderTxtOn]}>Male</Text>
            </Pressable>

            <Pressable
              style={[styles.genderBtn, sex === "female" && styles.genderOn]}
              onPress={() => setSex("female")}
            >
              <View style={[styles.radio, sex === "female" && styles.radioOn]}>
                {sex === "female" && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.genderTxt, sex === "female" && styles.genderTxtOn]}>Female</Text>
            </Pressable>
          </View>

          {/* 중성화 여부 */}
          <View style={[styles.rowBetween, { marginTop: 12 }]}>
            <Text style={styles.labelInline}>Neutered</Text>
            <Switch
              value={neutered}
              onValueChange={setNeutered}
              trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
              thumbColor={neutered ? "#3B82F6" : "#F3F4F6"}
            />
          </View>

          {/* 몸무게 */}
          <Text style={styles.label}>Weight</Text>
          <View style={styles.row}>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder={unit === "kg" ? "예: 7.8" : "예: 17.2"}
              keyboardType="decimal-pad"
              style={[styles.input, { flex: 1 }]}
            />
            <View style={{ width: 12 }} />
            <Pressable
              onPress={() => setUnit((u) => (u === "kg" ? "lb" : "kg"))}
              style={[styles.input, styles.centerBox, styles.unitBtn]}
            >
              <Text style={styles.unitTxt}>{unit}</Text>
            </Pressable>
          </View>

          {/* 특이사항 */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="예: 닭고기 알러지가 있어요"
            multiline
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
          />

          {/* 다음 버튼 */}
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
        </ScrollView>
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
    backgroundColor: "#CBD5E1",
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
    paddingBottom: 32,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    color: "#1E293B",
    fontWeight: "700",
  },
  labelInline: {
    color: "#1E293B",
    fontWeight: "700",
    fontSize: 15,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginVertical: 8,
  },
  genderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  genderOn: {
    backgroundColor: "#E0EDFB",
  },
  genderTxt: {
    color: "#334155",
    fontSize: 16,
  },
  genderTxtOn: {
    fontWeight: "800",
    color: "#2563EB",
  },
  radio: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: {
    borderColor: "#2563EB",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  unitBtn: {
    width: 64,
    alignItems: "center",
  },
  unitTxt: {
    fontWeight: "700",
    color: "#1E3A8A",
  },
  primaryBtn: {
    marginTop: 20,
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
});