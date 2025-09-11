// screens/DiagnosisScreen.js
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";


import QDATA from "../questions.json";


const INK = "#0B0B0B";
const INK_DIM = "#6B7280";
const BG = "#F3F4F6";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";


function shouldShow(question, answers) {
  const cond = question.showIf;
  if (!cond) return true;

  const check = (rule) => {
    // rule: { is: true|false|"없음"|"가끔"|"자주" }
    const val = answers[rule.qid];
    return val === rule.is;
  };

  if (cond.any) return cond.any.some(check);
  if (cond.all) return cond.all.every(check);
  return true;
}


const CHOICES = ["없음", "가끔", "자주"];

/* ---------- Screen ---------- */
export default function DiagnosisScreen() {
  const nav = useNavigation();
  const QUESTIONS = QDATA?.questions ?? [];

  // 사용자가 선택한 답변을 누적
  const [answers, setAnswers] = useState({});

  const visibleQuestions = useMemo(
    () => QUESTIONS.filter((q) => shouldShow(q, answers)),
    [QUESTIONS, answers]
  );

  // 현재 인덱스
  const [idx, setIdx] = useState(0);


  useEffect(() => {
    if (idx > visibleQuestions.length - 1) {
      setIdx(Math.max(0, visibleQuestions.length - 1));
    }
  }, [visibleQuestions, idx]);

  const total = visibleQuestions.length;
  const current = visibleQuestions[idx];

  const onSelectBool = (val) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: val }));
  };

  const onSelectChoice = (opt) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: opt }));
  };

  const goPrev = () => setIdx((i) => Math.max(0, i - 1));

  const goNext = () => {
    // 현재 질문이 있고, 아직 응답이 없는데 강제 진행 막기
    if (current && answers[current.id] === undefined) {
      Alert.alert("응답이 필요해요", "다음으로 넘어가기 전에 선택해 주세요.");
      return;
    }
    // 결과로 이동
    if (idx >= total - 1) {
      if (total === 0) {
        Alert.alert("표시할 문항이 없어요", "설문 구성이 아직 준비되지 않았습니다.");
        return;
      }
      nav.navigate("DiagnosisResult", { answers, version: QDATA?.version });
    } else {
      setIdx((i) => i + 1);
    }
  };

  const skipThis = () => {
    // 건너뛰기
    if (idx >= total - 1) {
      nav.navigate("DiagnosisResult", { answers, version: QDATA?.version });
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="chevron-back" size={22} color={INK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>건강 진단</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width:
                  total > 0 ? `${Math.round(((idx + 1) / total) * 100)}%` : "0%",
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {total > 0 ? `${idx + 1} / ${total}` : "0 / 0"}
        </Text>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={styles.card}>
          {current ? (
            <>
              <Text style={styles.qText}>{current.text}</Text>

              {/* 답변 */}
              {current.type === "bool" ? (
                <View style={styles.row}>
                  <ChoiceButton
                    label="예"
                    active={answers[current.id] === true}
                    onPress={() => onSelectBool(true)}
                  />
                  <ChoiceButton
                    label="아니오"
                    active={answers[current.id] === false}
                    onPress={() => onSelectBool(false)}
                  />
                </View>
              ) : (
                <View style={[styles.row, { flexWrap: "wrap" }]}>
                  {CHOICES.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={answers[current.id] === c}
                      onPress={() => onSelectChoice(c)}
                    />
                  ))}
                </View>
              )}

              {/* 태그/가중치(디버그용, 필요 없으면 제거) */}
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  카테고리: {current.tags?.join(", ") || "-"}
                </Text>
                {current.weight ? (
                  <Text style={styles.metaText}>중요도: {current.weight}</Text>
                ) : null}
              </View>
            </>
          ) : (
            <Text style={styles.muted}>표시할 문항이 없습니다.</Text>
          )}
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={goPrev}
          disabled={idx === 0}
        >
          <Text style={[styles.btnGhostText, idx === 0 && { opacity: 0.5 }]}>
            이전
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnSkip]} onPress={skipThis}>
          <Text style={styles.btnSkipText}>건너뛰기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={goNext}>
          <Text style={styles.btnPrimaryText}>
            {idx >= total - 1 ? "결과 보기" : "다음"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


function ChoiceButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.choiceBtn,
        active && { backgroundColor: "#111", borderColor: "#111" },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.choiceBtnText, active && { color: "#fff" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active && { backgroundColor: "#111", borderColor: "#111" },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && { color: "#fff" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: INK },

  progressWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#111",
    borderRadius: 999,
  },
  progressText: { marginTop: 6, fontSize: 12, color: INK_DIM, alignSelf: "flex-end" },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  qText: { fontSize: 16, color: INK, fontWeight: "700", marginBottom: 14 },

  row: { flexDirection: "row", gap: 10 },
  choiceBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  choiceBtnText: { color: INK, fontWeight: "700" },

 chip: {
   flex: 1,                
   marginHorizontal: 4,         
   borderRadius: 12,
   borderWidth: 1,
   borderColor: BORDER,
   height: 42,                  
   alignItems: "center",
   justifyContent: "center",
   backgroundColor: "#fff",
 },
  chipText: { color: INK, fontWeight: "700" },

  metaRow: { marginTop: 16, flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaText: { fontSize: 11, color: INK_DIM },

  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    backgroundColor: "#fff",
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnGhost: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
  },
  btnGhostText: { color: INK, fontWeight: "700" },
  btnSkip: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: BORDER,
  },
  btnSkipText: { color: INK, fontWeight: "700" },
  btnPrimary: { backgroundColor: "#111" },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },
});