// screens/HealthScreens.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


const INK = "#0B0B0B";
const INK_DIM = "#6B7280";
const BG = "#FFFFFF";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const SURFACE = "#F3F4F6";
const SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

/* --------- Storage Keys --------- */
const STORAGE_KEY = "HEALTH_ENTRIES_V1";
const STORAGE_KEY_ASSESS = "HEALTH_ASSESS_V1";


function Section({ title, children }) {
  return (
    <View style={[styles.section, SHADOW]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}
function StatTile({ label, value }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}


const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
function getLatest(entries, type) {
  const filtered = entries.filter((e) => e.type === type).sort((a, b) => b.ts - a.ts);
  return filtered[0] || null;
}
function toPercent(v, min, max) {
  const n = Number(v);
  if (isNaN(n)) return 0;
  const clamped = Math.max(min, Math.min(max, n));
  return Math.round(((clamped - min) / (max - min)) * 100);
}
const classifyWeight = (w) => {
  const n = Number(w);
  if (Number.isNaN(n)) return { label: "정보없음", tone: "muted", emoji: "❔" };
  if (n < 4 || n > 9) return { label: "주의", tone: "warn", emoji: "⚠️" };
  return { label: "정상", tone: "ok", emoji: "👍" };
};
const classifyWalk = (m) => {
  const pct = toPercent(m, 0, 90);
  if (pct >= 70) return { label: "권장", tone: "ok", emoji: "💪" };
  if (pct >= 40) return { label: "보통", tone: "mid", emoji: "🙂" };
  return { label: "부족", tone: "warn", emoji: "⚠️" };
};
const overallAssessment = (wTone, walkTone) => {
  if (wTone === "warn" || walkTone === "warn") return { text: "주의", emoji: "⚠️", tone: "warn" };
  if (wTone === "mid" || walkTone === "mid") return { text: "보통", emoji: "🙂", tone: "mid" };
  return { text: "정상", emoji: "👍", tone: "ok" };
};
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


async function loadEntries() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
async function saveEntries(list) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
async function loadAssessments() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_ASSESS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => (b?.ts || 0) - (a?.ts || 0))
      : [];
  } catch {
    return [];
  }
}



export function HealthHome() {
  const nav = useNavigation();

  const [entries, setEntries] = useState([]);
  const [assessList, setAssessList] = useState([]);

  const latestWeight = useMemo(() => getLatest(entries, "weight"), [entries]);
  const latestWalk   = useMemo(() => getLatest(entries, "walk"), [entries]);
  const latestCond   = useMemo(() => getLatest(entries, "condition"), [entries]);
  const latestVac    = useMemo(() => getLatest(entries, "vaccine"), [entries]);

  const weight        = latestWeight ? latestWeight.value : "-";
  const recentWalkMin = latestWalk ? latestWalk.value : "-";
  const condition     = latestCond ? latestCond.value : "좋음";
  const nextVaccine   = latestVac ? latestVac.value : "-";

  const wCls   = classifyWeight(weight);
  const walkCls= classifyWalk(recentWalkMin);
  const overall= overallAssessment(wCls.tone, walkCls.tone);

  useEffect(() => {
    (async () => {
      const [loadedEntries, loadedAssess] = await Promise.all([loadEntries(), loadAssessments()]);
      setEntries(loadedEntries);
      setAssessList(loadedAssess);
    })();
  }, []);

  const latestAssess = assessList?.[0] || null;
  const latestMeta   = latestAssess ? levelMeta(latestAssess.level) : null;

  // 의심 질환 Top 3
  const topSuspects = useMemo(() => {
    if (!latestAssess?.suspects) return [];
    const arr = Object.values(latestAssess.suspects)
      .flat()
      .filter(Boolean)
      .sort((a, b) => (b.conf || 0) - (a.conf || 0));
    const seen = new Set();
    const dedup = [];
    for (const it of arr) {
      if (seen.has(it.name)) continue;
      seen.add(it.name);
      dedup.push(it);
      if (dedup.length >= 3) break;
    }
    return dedup;
  }, [latestAssess]);


  const [openEdit, setOpenEdit] = useState(false);
  const [bufWeight, setBufWeight] = useState("");
  const [bufWalk, setBufWalk] = useState("");
  const [bufCond, setBufCond] = useState("좋음");
  const [bufVaccine, setBufVaccine] = useState("");

  const openRecorder = () => {
    setBufWeight(weight === "-" ? "" : String(weight));
    setBufWalk(recentWalkMin === "-" ? "" : String(recentWalkMin));
    setBufCond(condition || "좋음");
    setBufVaccine(nextVaccine === "-" ? "" : String(nextVaccine));
    setOpenEdit(true);
  };

  const saveRecorder = async () => {
    const now = Date.now();
    const newOnes = [];

    const w = toNum(bufWeight);
    if (w !== null) {
      newOnes.push({ id: `${now}-weight`, type: "weight", value: Number(w.toFixed(1)), unit: "kg", ts: now });
    }
    const m = toNum(bufWalk);
    if (m !== null) {
      newOnes.push({ id: `${now}-walk`, type: "walk", value: Math.max(0, Math.round(m)), unit: "min", ts: now });
    }
    if (bufCond) {
      newOnes.push({ id: `${now}-cond`, type: "condition", value: bufCond, unit: "", ts: now });
    }
    if (bufVaccine && /^\d{4}-\d{2}-\d{2}$/.test(bufVaccine)) {
      newOnes.push({ id: `${now}-vac`, type: "vaccine", value: bufVaccine, unit: "", ts: now });
    }

    if (newOnes.length === 0) {
      Alert.alert("입력 없음", "저장할 값이 없어요.");
      return;
    }

    const updated = [...entries, ...newOnes].sort((a, b) => b.ts - a.ts);
    setEntries(updated);
    await saveEntries(updated);
    setOpenEdit(false);
  };

 
  const goEvaluation = () => {
    nav.navigate("Evaluation", { weight, recentWalkMin, condition, nextVaccine });
  };
  const goDiagnosis = () => {
    nav.navigate("Diagnosis", { weight, recentWalkMin, condition, nextVaccine });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="chevron-back" size={22} color={INK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HEALTH</Text>
        <TouchableOpacity onPress={goDiagnosis}>
          <Ionicons name="pulse-outline" size={22} color={INK} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
 
        <Section>
          <Text style={styles.caption}>콩이의 건강 요약</Text>
          <View style={styles.statGrid}>
            <StatTile label="체중" value={weight === "-" ? "-" : `${weight} kg`} />
            <StatTile label="최근 산책" value={recentWalkMin === "-" ? "-" : `${recentWalkMin} 분`} />
            <StatTile label="컨디션" value={condition} />
            <StatTile label="다음 접종" value={nextVaccine} />
          </View>

          <TouchableOpacity style={styles.simpleAction} onPress={openRecorder}>
            <Ionicons name="add-circle-outline" size={18} color={INK} />
            <Text style={styles.simpleActionText}>기록하기</Text>
          </TouchableOpacity>
        </Section>

   
        <Pressable onPress={goEvaluation}>
          <View style={[styles.evalPreviewCard, SHADOW]}>
            <View style={styles.evalPreviewHeader}>
              <Text style={styles.evalPreviewTitle}>지표·추이</Text>
              <Ionicons name="chevron-forward" size={18} color={INK_DIM} />
            </View>

            <View style={styles.evalRowInline}>
              <Text style={styles.evalInlineLabel}>체중</Text>
              <Text style={styles.evalInlineValue}>{weight === "-" ? "-" : `${weight} kg`}</Text>
            </View>
            <View style={styles.evalRowInline}>
              <Text style={styles.evalInlineLabel}>주간 산책</Text>
              <Text style={styles.evalInlineValue}>
                {recentWalkMin === "-" ? "-" : `${recentWalkMin} 분`}
              </Text>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.evalMiniCaption}>체중 범위 (4~9kg 가정)</Text>
              <ProgressBar percent={toPercent(weight, 4, 9)} />
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.evalMiniCaption}>산책 목표 (0~90분 가정)</Text>
              <ProgressBar percent={toPercent(recentWalkMin, 0, 90)} />
            </View>
          </View>
        </Pressable>


        <Section title="최근 진단">
          {assessList?.[0] ? (
            (() => {
              const latestAssess = assessList[0];
              const latestMeta = levelMeta(latestAssess.level);
              const topSuspects = Object.values(latestAssess.suspects || {})
                .flat()
                .filter(Boolean)
                .sort((a, b) => (b.conf || 0) - (a.conf || 0));
              const seen = new Set();
              const dedup = [];
              for (const it of topSuspects) {
                if (seen.has(it.name)) continue;
                seen.add(it.name);
                dedup.push(it);
                if (dedup.length >= 3) break;
              }

              return (
                <>
                  <View style={styles.assessRow}>
                    <Text style={[styles.assessText, { color: latestMeta.color }]}>
                      {latestMeta.text} <Text style={styles.assessEmoji}>{latestMeta.emoji}</Text>
                    </Text>
                    <Text style={{ fontSize: 14, color: INK }}>
                      {latestAssess.scoreOverall} <Text style={{ color: INK_DIM }}>/ 100</Text>
                    </Text>
                  </View>

                  {dedup.length > 0 ? (
                    <View style={styles.badgeRow}>
                      {dedup.map((s, i) => (
                        <Text
                          key={`${s.name}-${i}`}
                          style={[styles.badge, styles.badgeOk]}
                          numberOfLines={1}
                        >
                          {s.name} · {"★".repeat(Math.max(1, Math.min(3, s.conf || 1)))}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.mutedSmall}>의심 질병 표시할 항목이 없어요.</Text>
                  )}

                  {latestAssess.perCat ? (
                    <View style={[styles.badgeRow, { marginTop: 8 }]}>
                      {Object.entries(latestAssess.perCat)
                        .filter(([, v]) => (v || 0) >= 55)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <Text key={k} style={[styles.badge, v >= 80 ? styles.badgeWarn : styles.badgeMid]}>
                            {k} · {v}
                          </Text>
                        ))}
                    </View>
                  ) : null}

                  <Text style={styles.mutedSmall} numberOfLines={2}>
                    최근 자가진단 결과 요약입니다. 상세 근거와 레드플래그는 결과 화면에서 확인하세요.
                  </Text>
                </>
              );
            })()
          ) : (
            <>
              <View style={styles.assessRow}>
                <Text
                  style={[
                    styles.assessText,
                    overall.tone === "warn"
                      ? styles.assessWarn
                      : overall.tone === "mid"
                      ? styles.assessMid
                      : styles.assessOk,
                  ]}
                >
                  {overall.text} <Text style={styles.assessEmoji}>{overall.emoji}</Text>
                </Text>
                <TouchableOpacity onPress={goDiagnosis}>
                  <Text style={styles.link}>자가진단 시작</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.badgeRow}>
                <Text
                  style={[
                    styles.badge,
                    wCls.tone === "warn"
                      ? styles.badgeWarn
                      : wCls.tone === "mid"
                      ? styles.badgeMid
                      : styles.badgeOk,
                  ]}
                >
                  체중 · {wCls.label}
                </Text>
                <Text
                  style={[
                    styles.badge,
                    walkCls.tone === "warn"
                      ? styles.badgeWarn
                      : walkCls.tone === "mid"
                      ? styles.badgeMid
                      : styles.badgeOk,
                  ]}
                >
                  산책 · {walkCls.label}
                </Text>
              </View>
              <Text style={styles.mutedSmall}>
                최신 입력 기준 자동 평가입니다. 자가진단을 진행하면 상세 결과가 저장돼요.
              </Text>
            </>
          )}
        </Section>

        {/* 담당 병원 */}
        <Section title="담당 병원">
          <Text style={styles.muted}>병원 정보를 등록해 주세요.</Text>
        </Section>
      </ScrollView>


      <TouchableOpacity style={styles.primaryCta} onPress={goDiagnosis}>
        <Text style={styles.primaryCtaText}>콩이의 건강진단 하러가기</Text>
      </TouchableOpacity>


      <Modal
        visible={openEdit}
        animationType="slide"
        transparent
        onRequestClose={() => setOpenEdit(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>기록하기</Text>
              <TouchableOpacity onPress={() => setOpenEdit(false)}>
                <Ionicons name="close" size={22} color={INK} />
              </TouchableOpacity>
            </View>

            {/* 체중 */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>체중 (kg)</Text>
              <TextInput
                value={bufWeight}
                onChangeText={setBufWeight}
                placeholder="예: 6.2"
                keyboardType="decimal-pad"
                style={styles.input}
                returnKeyType="done"
              />
            </View>

            {/* 최근 산책 */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>최근 산책 (분)</Text>
              <TextInput
                value={bufWalk}
                onChangeText={setBufWalk}
                placeholder="예: 40"
                keyboardType="number-pad"
                style={styles.input}
                returnKeyType="done"
              />
            </View>

            {/* 컨디션 */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>컨디션</Text>
              <View style={styles.radioRow}>
                {["좋음", "보통", "주의"].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.radioChip,
                      bufCond === opt && { borderColor: INK, backgroundColor: "#F3F4F6" },
                    ]}
                    onPress={() => setBufCond(opt)}
                  >
                    <Text style={[styles.radioText, bufCond === opt && { fontWeight: "700" }]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 다음 접종 */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>다음 접종 (YYYY-MM-DD)</Text>
              <TextInput
                value={bufVaccine}
                onChangeText={setBufVaccine}
                placeholder="예: 2026-03-15"
                keyboardType="numbers-and-punctuation"
                style={styles.input}
                returnKeyType="done"
              />
            </View>

           
            <View style={styles.sheetBtns}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setOpenEdit(false)}>
                <Text style={styles.btnGhostText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={saveRecorder}>
                <Text style={styles.btnPrimaryText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


export function Evaluation() {
  const nav = useNavigation();
  const route = useRoute();
  const { weight = "-", recentWalkMin = "-", condition = "좋음" } = route.params || {};
  const weightPct = toPercent(weight, 4, 9);
  const walkPct = toPercent(recentWalkMin, 0, 90);

  return (
    <SafeAreaView style={styles.safeEval}>
      <View style={styles.evalHeader}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.evalTitle}>Evaluation</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={[styles.evalCard, styles.shadow]}>
          <View style={styles.evalRow}>
            <Text style={styles.evalLabel}>Weight (kg)</Text>
            <Text style={styles.evalBadgeText}>{condition === "주의" ? "주의" : "정상"}</Text>
          </View>
          <ProgressBar percent={weightPct} />
          <Text style={styles.evalHint}>
            현재 {isNaN(Number(weight)) ? "-" : `${weight}kg`} / 목표 범위 4~9kg
          </Text>

          <View style={[styles.evalRow, { marginTop: 14 }]}>
            <Text style={styles.evalLabel}>Walking (min)</Text>
            <Text style={styles.evalBadgeText}>
              {walkPct >= 70 ? "권장" : walkPct >= 40 ? "보통" : "부족"}
            </Text>
          </View>
          <ProgressBar percent={walkPct} />
          <Text style={styles.evalHint}>
            최근 산책 {isNaN(Number(recentWalkMin)) ? "-" : `${recentWalkMin}분`} / 목표 90분
          </Text>
        </View>

        <View style={[styles.chartCard, styles.shadow]}>
          <Text style={{ color: INK_DIM, fontSize: 12 }}>
            그래프/추이는 나중에 붙여도 됨 (현재는 진행바만 표시)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


function ProgressBar({ percent = 50 }) {
  const p = Math.max(0, Math.min(100, isNaN(Number(percent)) ? 0 : Number(percent)));
  return (
    <View style={styles.pbWrap}>
      <View style={[styles.pbFill, { width: `${p}%` }]} />
    </View>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", letterSpacing: 1, color: INK },

  section: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 13, color: INK_DIM, marginBottom: 8, fontWeight: "600" },
  caption: { fontSize: 12, color: INK_DIM, marginBottom: 10 },

  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statTile: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    width: "48%",
    backgroundColor: BG,
  },
  statLabel: { fontSize: 12, color: INK_DIM, marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: "700", color: INK },

  simpleAction: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignSelf: "flex-start",
    backgroundColor: "#F9FAFB",
  },
  simpleActionText: { marginLeft: 6, fontSize: 14, fontWeight: "600", color: INK },

  evalPreviewCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginTop: 2,
    marginBottom: 14,
  },
  evalPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  evalPreviewTitle: { fontSize: 14, fontWeight: "700", color: INK },
  evalRowInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  evalInlineLabel: { fontSize: 13, color: INK },
  evalInlineValue: { fontSize: 13, color: INK_DIM },
  evalMiniCaption: { fontSize: 11, color: INK_DIM },

  assessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  assessText: { fontSize: 18, fontWeight: "800" },
  assessEmoji: { fontSize: 16 },
  assessOk: { color: "#111" },
  assessMid: { color: "#3F3F46" },
  assessWarn: { color: "#B91C1C" },

  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeOk: { backgroundColor: "#111" },
  badgeMid: { backgroundColor: "#6B7280" },
  badgeWarn: { backgroundColor: "#C2410C" },

  muted: { color: INK_DIM, fontSize: 13 },
  mutedSmall: { color: INK_DIM, fontSize: 12, marginTop: 8 },

  link: { color: INK, textDecorationLine: "underline", fontWeight: "700" },

  primaryCta: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: INK,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryCtaText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    borderTopWidth: 1,
    borderColor: BORDER,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: INK },
  field: { marginTop: 10 },
  fieldLabel: { fontSize: 13, color: INK_DIM, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: INK,
    backgroundColor: "#FAFAFA",
  },
  radioRow: { flexDirection: "row", gap: 8 },
  radioChip: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF",
  },
  radioText: { color: INK, fontSize: 14 },
  sheetBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 4,
  },
  btnGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  btnGhostText: { color: INK, fontWeight: "700" },
  btnPrimary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: INK,
  },
  btnPrimaryText: { color: "#FFF", fontWeight: "800" },

  safeEval: { flex: 1, backgroundColor: SURFACE },
  evalHeader: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SURFACE,
  },
  evalTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  evalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  evalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  evalLabel: { fontSize: 13, color: "#374151" },
  evalBadgeText: { fontSize: 13, fontWeight: "700", color: "#111" },
  evalHint: { marginTop: 6, fontSize: 12, color: INK_DIM },

  pbWrap: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
  },
  pbFill: { height: 10, backgroundColor: "#111" },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  shadow: SHADOW,
});


export default HealthHome;