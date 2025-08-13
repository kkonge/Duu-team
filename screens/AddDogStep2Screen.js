import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable,
  SafeAreaView, KeyboardAvoidingView, Platform, Switch, ScrollView
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
          <Ionicons name="arrow-back-circle" size={32} color="#7B8A7A" />
        </TouchableOpacity>
        <View style={styles.progress}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotOn]} />
          <View style={styles.dot} />
        </View>

   
        <View style={styles.header}>
          <Text style={styles.title}>건강 · 생활 정보</Text>
          <Text style={styles.subtitle}>성별, 중성화여부, 몸무게를 입력해주세요</Text>
        </View>

      
        <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
          {/* Sex */}
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

          {/* Neutered */}
          <View style={[styles.rowBetween, { marginTop: 8 }]}>
            <Text style={styles.labelInline}>Neutered</Text>
            <Switch value={neutered} onValueChange={setNeutered} />
          </View>

          {/* Weight*/}
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
              style={[styles.input, styles.centerBox]}
            >
              <Text style={{ fontWeight: "700" }}>{unit}</Text>
            </Pressable>
          </View>

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="알러지/특이사항 메모"
            multiline
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
          />

       
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

const CARD_BG = "#fff";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#EEF6E9", paddingHorizontal: 18, paddingTop: 40 },
  backButton: { position: "absolute", top: 10, left: 16, zIndex: 10 },

  progress: { flexDirection: "row", alignSelf: "center", marginTop: 8, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#CFE2CF" },
  dotOn: { backgroundColor: "#5B7F6A" },

  header: { alignItems: "center", paddingTop: 8, paddingBottom: 6 },
  title: { fontSize: 22, fontWeight: "800", color: "#5B7F6A" },
  subtitle: { marginTop: 4, color: "#6B7A6A" },

  card: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    marginTop: 10,
    paddingBottom: 20,
  },

  label: { marginTop: 6, marginBottom: 6, color: "#415247", fontWeight: "700" },
  labelInline: { color: "#415247", fontWeight: "700" },

  input: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#CFE2CF",
    backgroundColor: "#fff",
  },
  centerBox: { justifyContent: "center", paddingVertical: 0 },

  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  genderRow: { flexDirection: "row", justifyContent: "center", gap: 24, marginVertical: 8 },
  genderBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  genderOn: { backgroundColor: "#EAF4EE" },
  genderTxt: { color: "#5B6C5A", fontSize: 16 },
  genderTxtOn: { fontWeight: "800", color: "#3F8C74" },

  radio: {
    height: 18, width: 18, borderRadius: 9, borderWidth: 1.5, borderColor: "#B7C8B7",
    alignItems: "center", justifyContent: "center",
  },
  radioOn: { borderColor: "#3F8C74" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3F8C74" },

  primaryBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4F1E7",
    borderWidth: 1,
    borderColor: "#D7E8DB",
  },
  primaryTxt: { color: "#3F8C74", fontWeight: "800", fontSize: 16 },
  skip: { color: "#6B7A6A", textDecorationLine: "underline" },
});