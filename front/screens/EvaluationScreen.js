// screens/EvaluationScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---------- Design tokens ---------- */
const INK = "#0B0B0B";
const INK_DIM = "#6B7280";
const BG = "#F3F4F6";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";

/* ---------- Storage ---------- */
const STORAGE_KEY = "HEALTH_ENTRIES_V1";

/* ---------- helpers ---------- */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const toPercent = (v, min, max) => {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.round(((clamp(n, min, max) - min) / (max - min)) * 100);
};

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
function ProgressBar({ percent = 0 }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <View style={styles.pbWrap}>
      <View style={[styles.pbFill, { width: `${p}%` }]} />
    </View>
  );
}
function getLatest(entries, type) {
  const filtered = entries.filter((e) => e.type === type).sort((a, b) => b.ts - a.ts);
  return filtered[0] || null;
}

function getLastN(entries, type, n) {
  return entries
    .filter((e) => e.type === type)
    .sort((a, b) => a.ts - b.ts)       // 오래된 → 최신
    .slice(-n);                        // 뒤에서 N개
}

function fmtDate(ts) {
  try {
    const d = new Date(ts);
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${mm}.${dd}`;
  } catch {
    return "";
  }
}

/* ---------- Simple (no-SVG) Line Chart ---------- */
function SimpleLineChart({
  data = [],            // [{ x: timestamp(ms), y: number }]
  height = 180,
  padding = 16,         // 내부 여백
  pointSize = 8,
  lineWidth = 2,
  yPaddingTop = 26,     // 점 위 텍스트 위한 상단 여유
  yPaddingBottom = 24,  // x축 날짜 라벨 공간
  unit = "kg",
}) {
  const width = Math.min(Dimensions.get("window").width - 32, 600); // 카드 패딩 고려
  const innerW = width - padding * 2;
  const innerH = height - yPaddingTop - yPaddingBottom;

  if (!data.length) {
    return (
      <View style={[styles.trendCard, { height }]}>
        <Text style={{ color: INK_DIM, fontSize: 12 }}>아직 데이터가 없어요.</Text>
      </View>
    );
  }

  // y 스케일링 (min=max일 때 대비해 범위 살짝 추가)
  const ys = data.map((d) => Number(d.y)).filter((n) => !Number.isNaN(n));
  const yMinRaw = Math.min(...ys);
  const yMaxRaw = Math.max(...ys);
  const pad = Math.max(0.2, (yMaxRaw - yMinRaw) * 0.15);
  const yMin = yMinRaw - pad;
  const yMax = yMaxRaw + pad;

  // x 위치는 균등 간격 (데이터 순서대로)
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  // 좌표 변환 함수
  const xAt = (i) => padding + i * stepX;
  const yAt = (v) => {
    const ratio = (v - yMin) / (yMax - yMin || 1);
    const y = yPaddingTop + innerH * (1 - ratio);
    return y;
  };

  // 좌표 리스트
  const pts = data.map((d, i) => ({ x: xAt(i), y: yAt(Number(d.y)), raw: d }));

  return (
    <View style={[styles.trendCard, { height, width }]}>
      {/* 선들 */}
      {pts.length > 1 &&
        pts.slice(0, -1).map((p, i) => {
          const p2 = pts[i + 1];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`seg-${i}`}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: len,
                height: lineWidth,
                backgroundColor: INK,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: "left center",
                borderRadius: lineWidth,
              }}
            />
          );
        })}

      {/* 포인트 + 상단 값 라벨 + 하단 날짜 */}
      {pts.map((p, i) => (
        <React.Fragment key={`pt-${i}`}>
          {/* 상단 값 라벨 */}
          <Text
            style={{
              position: "absolute",
              left: p.x - 18,
              top: Math.max(2, p.y - 20),
              fontSize: 11,
              color: INK,
              fontWeight: "700",
              width: 48,
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {Number.isNaN(Number(p.raw.y)) ? "-" : `${p.raw.y}${unit ? unit : ""}`}
          </Text>

          {/* 점 */}
          <View
            style={{
              position: "absolute",
              left: p.x - pointSize / 2,
              top: p.y - pointSize / 2,
              width: pointSize,
              height: pointSize,
              borderRadius: pointSize / 2,
              backgroundColor: INK,
            }}
          />

          {/* 하단 날짜 라벨 */}
          <Text
            style={{
              position: "absolute",
              left: p.x - 20,
              bottom: 6,
              width: 40,
              fontSize: 11,
              color: INK_DIM,
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {fmtDate(p.raw.x)}
          </Text>
        </React.Fragment>
      ))}
    </View>
  );
}

/* ---------- Screen ---------- */
export default function EvaluationScreen() {
  const nav = useNavigation();
  const route = useRoute();
  // 홈에서 넘어온 최신값(없을 수 있음)
  const routeWeight = route.params?.weight ?? "-";
  const routeWalk = route.params?.recentWalkMin ?? "-";

  // 히스토리 로드
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        setEntries(Array.isArray(parsed) ? parsed : []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 최신값 보완 로직: 라우트 값이 유효하면 사용, 아니면 히스토리 최신값 사용
  const latestWeight = useMemo(() => getLatest(entries, "weight"), [entries]);
  const latestWalk = useMemo(() => getLatest(entries, "walk"), [entries]);

  const weightVal =
    routeWeight !== "-" && !Number.isNaN(Number(routeWeight))
      ? routeWeight
      : latestWeight?.value ?? "-";

  const walkVal =
    routeWalk !== "-" && !Number.isNaN(Number(routeWalk))
      ? routeWalk
      : latestWalk?.value ?? "-";

  const weightPct = toPercent(weightVal, 4, 9); // 4~9kg 가정
  const walkPct = toPercent(walkVal, 0, 90);    // 0~90분 가정

  const wCls = classifyWeight(weightVal);
  const walkCls = classifyWalk(walkVal);
  const overall = overallAssessment(wCls.tone, walkCls.tone);

  // === 그래프용 시리즈: 최근 6회 체중 ===
  const weightSeries = useMemo(() => {
    const last = getLastN(entries, "weight", 6);
    return last.map((e) => ({ x: e.ts, y: Number(e.value) }));
  }, [entries]);

  // (선택) 산책도 6회로 그리고 싶다면 아래처럼 만들 수 있어요.
  const walkSeries = useMemo(() => {
    const last = getLastN(entries, "walk", 6);
    return last.map((e) => ({ x: e.ts, y: Number(e.value) }));
  }, [entries]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="chevron-back" size={22} color={INK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluation</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: INK_DIM }}>로딩 중…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          {/* Top row: Left summary card + Right big text assessment (with small emoji) */}
          <View style={styles.topRow}>
            {/* Left: Summary card */}
            <View style={styles.summaryCard}>
              {/* Weight */}
              <View style={styles.rowBetween}>
                <Text style={styles.metricTitle}>Weight (kg)</Text>
                <Text style={[styles.badge, wCls.tone === "warn" ? styles.badgeWarn : styles.badgeOk]}>
                  {wCls.label}
                </Text>
              </View>
              <ProgressBar percent={weightPct} />
              <Text style={styles.hint}>
                현재 {Number.isNaN(Number(weightVal)) ? "-" : `${weightVal}kg`} · 권장 4~9kg
              </Text>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Walking */}
              <View style={styles.rowBetween}>
                <Text style={styles.metricTitle}>Walking (min)</Text>
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
                  {walkCls.label}
                </Text>
              </View>
              <ProgressBar percent={walkPct} />
              <Text style={styles.hint}>
                최근 {Number.isNaN(Number(walkVal)) ? "-" : `${walkVal}분`} · 목표 90분
              </Text>
            </View>

            {/* Right: Big assessment text + small emoji */}
            <View style={styles.assessCol}>
              <Text
                style={[
                  styles.assessText,
                  overall.tone === "warn" ? styles.assessWarn : overall.tone === "mid" ? styles.assessMid : styles.assessOk,
                ]}
                numberOfLines={1}
              >
                {overall.text}
                <Text style={styles.assessEmoji}> {overall.emoji}</Text>
              </Text>
              <Text style={styles.assessSub}>종합 평가</Text>
            </View>
          </View>

          {/* Weight Change (최근 6회 · 점+값+날짜) */}
          <Text style={styles.sectionTitleBig}>Weight Change (최근 6회)</Text>
          <SimpleLineChart data={weightSeries} unit="kg" />

          {/* Walking Time (원하면 표시) */}
          <Text style={styles.sectionTitleBig}>Walking Time (최근 6회)</Text>
          <SimpleLineChart data={walkSeries} unit="분" />
        </ScrollView>
      )}
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

  topRow: { flexDirection: "row", gap: 12, alignItems: "stretch" },

  summaryCard: {
    flex: 1.2,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricTitle: { fontSize: 13, fontWeight: "700", color: INK },
  hint: { marginTop: 6, fontSize: 12, color: INK_DIM },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 12, opacity: 0.9 },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 11, fontWeight: "700", color: "#fff" },
  badgeOk: { backgroundColor: "#111" },
  badgeMid: { backgroundColor: "#6B7280" },
  badgeWarn: { backgroundColor: "#C2410C" },

  assessCol: {
    flex: 0.8,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  assessText: { fontSize: 28, fontWeight: "800", letterSpacing: 0.5 },
  assessEmoji: { fontSize: 20 },
  assessSub: { marginTop: 6, fontSize: 12, color: INK_DIM },
  assessOk: { color: "#111" },
  assessMid: { color: "#3F3F46" },
  assessWarn: { color: "#B91C1C" },

  pbWrap: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
  },
  pbFill: { height: 10, backgroundColor: "#2563EB" },

  sectionTitleBig: { marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: "700", color: INK },

  /* Chart card (공통 컨테이너) */
  trendCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    height: 180,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
    pbWrap: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
  },
  pbFill: {
    height: 10,
    backgroundColor: "#2563EB",
  },
});