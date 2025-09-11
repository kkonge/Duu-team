//screens/AddDogStep2Screen.js
import React, { useState } from "react";
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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddDogStep2Screen({ navigation, route }) {
  const baseParams = route?.params || {};
  const { photo, name, breed, birth } = baseParams;

  const [sex, setSex] = useState(null);              
  const [size, setSize] = useState(null);           
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");


  const canNext =
    (sex === "male" || sex === "female") &&
    !!size &&
    weight.trim().length > 0;

  const onNext = () => {
    if (!(sex === "male" || sex === "female")) {
      alert("성별을 선택해 주세요.");
      return;
    }
    if (!size) {
      alert("체형(소/중/대형견)을 선택해 주세요.");
      return;
    }
    if (!weight.trim()) {
      alert("몸무게(kg)를 입력해 주세요.");
      return;
    }

    navigation.navigate("AddDogStep3", {
      ...baseParams,
      photo,
      name,
      breed,
      birth,
      sex,
      size,
      weight: Number(weight),
      unit: "kg",  
      notes: notes.trim().length ? notes.trim() : null,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding" })} style={styles.container}>
        {/* 뒤로가기 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 28 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
  
          <View style={styles.header}>
            <Text style={styles.title}>건강 · 생활 정보</Text>
            <Text style={styles.subtitle}>성별, 체형, 몸무게 등을 입력해 주세요</Text>

            {/* 진행 점 */}
            <View style={styles.progress}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotOn]} />
              <View style={styles.dot} />
            </View>
          </View>

          {/* 카드 */}
          <View style={styles.card}>
            {/* 성별 */}
            <Text style={styles.label}>성별 *</Text>
            <View style={styles.genderRow}>
              <Pressable
                style={[styles.genderPill, sex === "male" && styles.pillOn]}
                onPress={() => setSex("male")}
              >
                <Ionicons
                  name="male-outline"
                  size={16}
                  color={sex === "male" ? "#fff" : "#374151"}
                />
                <Text style={[styles.pillTxt, sex === "male" && styles.pillTxtOn]}>Male</Text>
              </Pressable>

              <Pressable
                style={[styles.genderPill, sex === "female" && styles.pillOn]}
                onPress={() => setSex("female")}
              >
                <Ionicons
                  name="female-outline"
                  size={16}
                  color={sex === "female" ? "#fff" : "#374151"}
                />
                <Text style={[styles.pillTxt, sex === "female" && styles.pillTxtOn]}>Female</Text>
              </Pressable>
            </View>


            <Text style={styles.label}>체형 *</Text>
            <View style={styles.sizeRow}>
              <Pressable
                style={[styles.sizePill, size === "small" && styles.pillOn]}
                onPress={() => setSize("small")}
              >
                <Ionicons
                  name="paw-outline"
                  size={16}
                  color={size === "small" ? "#fff" : "#374151"}
                />
                <Text style={[styles.pillTxt, size === "small" && styles.pillTxtOn]}>소형견</Text>
              </Pressable>

              <Pressable
                style={[styles.sizePill, size === "medium" && styles.pillOn]}
                onPress={() => setSize("medium")}
              >
                <Ionicons
                  name="paw-outline"
                  size={16}
                  color={size === "medium" ? "#fff" : "#374151"}
                />
                <Text style={[styles.pillTxt, size === "medium" && styles.pillTxtOn]}>중형견</Text>
              </Pressable>

              <Pressable
                style={[styles.sizePill, size === "large" && styles.pillOn]}
                onPress={() => setSize("large")}
              >
                <Ionicons
                  name="paw-outline"
                  size={16}
                  color={size === "large" ? "#fff" : "#374151"}
                />
                <Text style={[styles.pillTxt, size === "large" && styles.pillTxtOn]}>대형견</Text>
              </Pressable>
            </View>

            {/* 몸무게 */}
            <Text style={styles.label}>몸무게 (kg) *</Text>
            <View style={styles.row}>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="예: 7.8"
                keyboardType="decimal-pad"
                style={[styles.input, { flex: 1 }]}
                placeholderTextColor="#9AA4AF"
              />
        
              <Text style={[styles.unitTxt, { marginLeft: 10 }]}>kg</Text>
            </View>

            {/* 특이사항 */}
            <Text style={styles.label}>특이사항</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="예: 닭고기 알러지가 있어요"
              multiline
              style={[styles.input, { height: 90, textAlignVertical: "top" }]}
              placeholderTextColor="#9AA4AF"
            />

            {/* 다음 버튼 */}
            <TouchableOpacity
              disabled={!canNext}
              onPress={onNext}
              style={[styles.submitBtn, !canNext && { opacity: 0.5 }]}
            >
              <Text style={styles.submitTxt}>계속하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const PRIMARY = "#000";
const BACKGROUND = "#fff";
const BORDER = "#E5E7EB";
const TEXT_DARK = "#111827";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingTop: 50,
  },

  backBtn: { position: "absolute", top: 10, left: 16, zIndex: 10 },

  header: { alignItems: "center", gap: 6, marginBottom: 12 },
  title: { fontSize: 25, fontWeight: "800", color: PRIMARY, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: "#444", textAlign: "center", opacity: 0.85, lineHeight: 20 },

  progress: { flexDirection: "row", gap: 6, marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E5E7EB" },
  dotOn: { backgroundColor: "#111" },

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

  label: { marginTop: 8, marginBottom: 10, color: "#1E293B", fontWeight: "700" },

  row: { flexDirection: "row", alignItems: "center" },

  input: {
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: BORDER,
    backgroundColor: "#fff",
    fontSize: 15,
    color: TEXT_DARK,
  },


  genderRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 22,
    marginTop: 2,
    marginBottom: 6,
  },
  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  genderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.2,
    borderColor: BORDER,
  },
  sizePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.2,
    borderColor: BORDER,
    flex: 1,
    justifyContent: "center",
  },
  pillOn: { backgroundColor: "#111", borderColor: "#111" },
  pillTxt: { color: "#374151", fontSize: 14.5, fontWeight: "600" },
  pillTxtOn: { color: "#fff" },


  unitTxt: { fontWeight: "800", color: TEXT_DARK, letterSpacing: 0.2 },


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
  submitTxt: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.5},
});