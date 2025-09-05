// screens/DiagnosisResultScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


import QDATA from "../questions.json";


const INK = "#0B0B0B";
const INK_DIM = "#6B7280";
const BG = "#F3F4F6";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";


const STORAGE_KEY_ASSESS = "HEALTH_ASSESS_V1";

/* ---------- 카테고리 라벨 ---------- */
const CAT_LABEL = QDATA?.categories || {
  GI: "소화기",
  RESP: "호흡기",
  SKIN: "피부",
  MSK: "근골격",
  ENDO: "내분비/대사",
  PRIOR: "사전위험",
};
const CATS = ["GI", "RESP", "SKIN", "MSK", "ENDO"];

/* ---------- 기본 유틸 ---------- */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const scoreOf = (q, v) => {
  if (q.type === "bool") return v === true ? 2 : 0;
  if (q.type === "choice") return v === "자주" ? 2 : v === "가끔" ? 1 : 0;
  return 0;
};

/* ---------- 결과 계산 ---------- */
function computeResult(answersObj) {
  const QUESTIONS = QDATA?.questions ?? [];
  const bucket = { GI: 0, RESP: 0, SKIN: 0, MSK: 0, ENDO: 0, PRIOR: 0 };
  const evidence = { GI: [], RESP: [], SKIN: [], MSK: [], ENDO: [] };
  const redFlags = [];
  const maxCat = { GI: 0, RESP: 0, SKIN: 0, MSK: 0, ENDO: 0 };

  const baseMax = () => 2;

  for (const q of QUESTIONS) {
    const w = q.weight ?? 1;
    for (const tag of q.tags || []) {
      if (maxCat[tag] !== undefined) maxCat[tag] += baseMax() * w;
    }
  }

  for (const q of QUESTIONS) {
    const value = answersObj[q.id];
    const base = scoreOf(q, value);
    const w = q.weight ?? 1;

    for (const tag of q.tags || []) {
      if (tag === "PRIOR") {
        bucket.PRIOR += base * w;
      } else if (bucket[tag] !== undefined) {
        bucket[tag] += base * w;
        if (base > 0) evidence[tag].push(q.text);
      }
    }

    if (q.redFlag) {
      const fired =
        (q.type === "bool" && value === true) ||
        (q.type === "choice" && value === "자주");
      if (fired) redFlags.push(q.id);
    }
  }

  const priorK = clamp(1 + bucket.PRIOR * 0.1, 1, 1.4);

  const perCat = {};
  for (const c of CATS) {
    const raw = bucket[c] * priorK;
    const max = Math.max(1, maxCat[c]);
    perCat[c] = Math.round(clamp((raw / max) * 100, 0, 100));
  }

  const vals = CATS.map((c) => perCat[c]);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const worst = Math.max(...vals);
  const scoreOverall = Math.round(clamp(avg + worst * 0.2, 0, 100));

  let level = "normal";
  if (redFlags.length > 0) level = "urgent";
  else if (scoreOverall >= 80) level = "warn";
  else if (scoreOverall >= 55) level = "mid";

  return { perCat, redFlags, scoreOverall, level, evidence };
}

/* ---------- 질환 추정 ---------- */
/** 신뢰도: 1~3 (낮음~높음) */
function inferSuspicions(answers) {
  const A = (id) => answers[id];

  const suspects = {
    GI: [],
    RESP: [],
    SKIN: [],
    MSK: [],
    ENDO: [],
  };

  // ---- (소화기)
  const vomit = A("q.gi.vomit");           // 없음/가끔/자주
  const diarrhea = A("q.gi.diarrhea");     // true/false
  const bloody = A("q.gi.bloody_stool");   // true/false
  const vaxLack = A("q.prior.vax") === true;

  if (bloody === true) {
    suspects.GI.push({
      name: "출혈성 위장염",
      reason: "혈변/검은 변 응답",
      conf: 3,
    });
  }
  if (vomit === "자주" || diarrhea === true) {
    suspects.GI.push({
      name: "급성 위장염",
      reason: "구토·설사 반응",
      conf: vomit === "자주" && diarrhea === true ? 3 : 2,
    });
  }
  if ((vomit === "자주" || diarrhea === true) && vaxLack) {
    suspects.GI.push({
      name: "바이러스성 장염(파보 등) 가능",
      reason: "구토/설사 + 최근 미접종",
      conf: 2,
    });
  }
  if (vomit === "자주" && A("q.prior.weightChange") === "자주") {
    suspects.GI.push({
      name: "췌장염 가능",
      reason: "구토 잦음 + 체중 변화",
      conf: 2,
    });
  }

  // ---- (호흡기)
  const cough = A("q.resp.cough");       // 없음/가끔/자주
  const dysp = A("q.resp.dyspnea");      // true/false
  if (dysp === true) {
    suspects.RESP.push({
      name: "기관허탈/폐렴/심장성 호흡곤란 가능",
      reason: "호흡곤란·혀색 변화",
      conf: 3,
    });
  }
  if (cough === "자주") {
    suspects.RESP.push({
      name: "켄넬코프(기관지염)",
      reason: "기침 자주",
      conf: 2,
    });
  }

  // ----  (피부)
  const itch = A("q.skin.pruritus");    // 없음/가끔/자주
  const hair = A("q.skin.hairloss");    // 없음/가끔/자주
  if (itch === "자주") {
    suspects.SKIN.push({
      name: "아토피/알레르기성 피부염",
      reason: "가려움·발적 빈번",
      conf: hair === "자주" ? 3 : 2,
    });
  }
  if (hair === "자주") {
    suspects.SKIN.push({
      name: "세균성 피부염/외부기생충",
      reason: "탈모·진물",
      conf: itch === "자주" ? 3 : 2,
    });
  }

  // ---- (근골격)
  const limp = A("q.msk.limp");
  if (limp === "자주" || limp === "가끔") {
    suspects.MSK.push({
      name: "슬개골 탈구/관절염/인대 손상",
      reason: "절뚝임·점프/계단 어려움",
      conf: limp === "자주" ? 3 : 2,
    });
  }

  // ----  (내분비)
  const poly = A("q.endo.polyuria");        // 없음/가끔/자주
  const wtchg = A("q.prior.weightChange");  // 없음/가끔/자주
  if (poly === "자주") {
    suspects.ENDO.push({
      name: "당뇨/쿠싱 가능",
      reason: "다음다뇨",
      conf: 2,
    });
  }
  if (wtchg === "자주" && poly !== "없음") {
    suspects.ENDO.push({
      name: "갑상선/대사 이상 가능",
      reason: "체중 변화 + 음수/배뇨 변화",
      conf: 2,
    });
  }


  const compact = {};
  for (const c of Object.keys(suspects)) {
    const map = new Map();
    for (const it of suspects[c]) {
      const prev = map.get(it.name);
      if (!prev || it.conf > prev.conf) map.set(it.name, it);
    }
    compact[c] = Array.from(map.values()).slice(0, 3);
  }
  return compact;
}


async function saveAssessment(assessment) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ASSESS);
    const list = raw ? JSON.parse(raw) : [];
    const arr = Array.isArray(list) ? list : [];
    const next = [...arr, assessment].slice(-20);
    await AsyncStorage.setItem(STORAGE_KEY_ASSESS, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}


function levelMeta(tone) {
  switch (tone) {
    case "urgent":
      return { text: "긴급", emoji: "❗️", color: "#B91C1C" };
    case "warn":
      return { text: "주의", emoji: "⚠️", color: "#C2410C" };
    case "mid":
      return { text: "보통", emoji: "🙂", color: "#3F3F46" };
    default:
      return { text: "정상", emoji: "👍", color: "#111" };
  }
}

/* ---------- Screen ---------- */
export default function DiagnosisResultScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const answers = (route.params && route.params.answers) || {};

  const result = useMemo(() => computeResult(answers), [answers]);
  const meta = levelMeta(result.level);

  const suspects = useMemo(() => inferSuspicions(answers), [answers]);

  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const payload = {
      id: `${Date.now()}`,
      ts: Date.now(),
      scoreOverall: result.scoreOverall,
      level: result.level,
      perCat: result.perCat,
      redFlags: result.redFlags,
      evidence: result.evidence,
      suspects, 
      version: QDATA?.version || "1.0.0",
    };
    setSaving(true);
    const ok = await saveAssessment(payload);
    setSaving(false);
    if (ok) Alert.alert("저장 완료", "이번 진단 결과를 보관했습니다.");
    else Alert.alert("저장 실패", "저장 중 문제가 발생했어요.");
  };

  const goHome = () => nav.navigate("HealthHome");
  const goEvaluation = () => nav.navigate("Evaluation");

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="chevron-back" size={22} color={INK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>진단 결과</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* 종합 카드 */}
        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>종합 평가</Text>
          <Text style={[styles.overallScore, { color: meta.color }]}>
            {result.scoreOverall}
            <Text style={styles.overallSuffix}> / 100</Text>
          </Text>
          <Text style={[styles.overallLevel, { color: meta.color }]}>
            {meta.text} <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
          </Text>

          {result.redFlags.length > 0 ? (
            <Text style={styles.redflagText}>
              레드플래그 감지됨 — 즉시 병원 방문을 권장합니다.
            </Text>
          ) : (
            <Text style={styles.hint}>
              참고용 자가진단 결과입니다. 증상이 지속되면 병원 상담을 권장해요.
            </Text>
          )}
        </View>

        {/* 카테고리별 점수 카드 */}
        {CATS.map((c) => {
          const score = result.perCat[c];
          const tone = score >= 80 ? "warn" : score >= 55 ? "mid" : "normal";
          const m = levelMeta(tone);
          const ev = result.evidence[c] || [];
          return (
            <View key={c} style={styles.catCard}>
              <View style={styles.catHeader}>
                <Text style={styles.catTitle}>{CAT_LABEL[c] || c}</Text>
                <View style={[styles.badge, { backgroundColor: m.color }]}>
                  <Text style={styles.badgeText}>
                    {m.text} {m.emoji}
                  </Text>
                </View>
              </View>

              <View style={styles.pbWrap}>
                <View style={[styles.pbFill, { width: `${score}%` }]} />
              </View>
              <Text style={styles.catScoreText}>{score} / 100</Text>

              {ev.length > 0 ? (
                <View style={styles.evidenceWrap}>
                  {ev.slice(0, 3).map((t, i) => (
                    <Text key={i} style={styles.evidenceItem}>
                      • {t}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.muted}>특이 증상 선택이 없었어요.</Text>
              )}
            </View>
          );
        })}

        {/* 의심 질환 */}
        <View style={styles.suspectCard}>
          <Text style={styles.suspectTitle}>의심 질환 (프론트 추정)</Text>
          <Text style={styles.suspectHint}>
            실제 진단이 아니며 참고용입니다. 증상이 지속/악화되면 병원에 문의하세요.
          </Text>

          {CATS.map((c) => {
            const items = suspects[c] || [];
            if (!items.length) return null;
            return (
              <View key={`sus-${c}`} style={styles.susCatBlock}>
                <Text style={styles.susCatTitle}>{CAT_LABEL[c]}</Text>
                {items.map((it, i) => (
                  <View key={i} style={styles.susRow}>
                    <View style={styles.susBadge}>
                      <Text style={styles.susBadgeText}>★{"".padEnd(it.conf - 1, "★")}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.susName}>{it.name}</Text>
                      <Text style={styles.susReason}>{it.reason}</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        {/* 주의 문구 */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            이 결과는 의료 진단이 아닌 참고용 자가 체크입니다. 지속/악화되는 증상 또는
            레드플래그가 있으면 즉시 수의사 상담을 받으세요.
          </Text>
        </View>
      </ScrollView>

      {/* 하단 액션 */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={goHome}>
          <Text style={styles.btnGhostText}>홈으로</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnAlt]} onPress={goEvaluation}>
          <Text style={styles.btnAltText}>Evaluation 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.btnPrimaryText}>
            {saving ? "저장 중…" : "저장하기"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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

  overallCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  overallLabel: { fontSize: 12, color: INK_DIM, marginBottom: 6 },
  overallScore: { fontSize: 32, fontWeight: "800" },
  overallSuffix: { fontSize: 16, color: INK_DIM, fontWeight: "600" },
  overallLevel: { marginTop: 4, fontSize: 16, fontWeight: "800" },
  hint: { marginTop: 8, color: INK_DIM, fontSize: 12 },
  redflagText: { marginTop: 8, color: "#B91C1C", fontSize: 12, fontWeight: "700" },

  catCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 12,
  },
  catHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  catTitle: { fontSize: 14, fontWeight: "800", color: INK },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  pbWrap: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 10,
  },
  pbFill: { height: 10, backgroundColor: "#111" },
  catScoreText: { marginTop: 6, fontSize: 12, color: INK_DIM, alignSelf: "flex-end" },

  evidenceWrap: { marginTop: 8, gap: 4 },
  evidenceItem: { fontSize: 12, color: INK },


  suspectCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 12,
  },
  suspectTitle: { fontSize: 14, fontWeight: "800", color: INK },
  suspectHint: { marginTop: 4, fontSize: 11, color: INK_DIM },
  susCatBlock: { marginTop: 12 },
  susCatTitle: { fontSize: 13, fontWeight: "700", color: INK, marginBottom: 6 },
  susRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  susBadge: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  susBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  susName: { fontSize: 13, fontWeight: "700", color: INK },
  susReason: { fontSize: 12, color: INK_DIM },

  noticeBox: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  noticeText: { fontSize: 12, color: INK_DIM },

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
  btnAlt: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: BORDER,
  },
  btnAltText: { color: INK, fontWeight: "700" },
  btnPrimary: { backgroundColor: "#111" },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },
});