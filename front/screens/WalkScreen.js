// WalkScreen.js — single file merge of Map1, Map2, Record, and StopWatch
// Dependencies: react, react-native, expo-status-bar, react-native-maps, expo-location,
// @react-native-async-storage/async-storage, @expo/vector-icons

import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

/* ------------------------------ StopWatch ------------------------------ */
function useStopwatchCore(onChange) {
  const [elapsed, setElapsed] = useState(0); // 센티초(1/100s)
  const [isRunning, setIsRunning] = useState(false);

  const startTsRef = useRef(0); // ms
  const savedRef = useRef(0); // 누적 센티초
  const rafRef = useRef(null);

  const tick = () => {
    const now = Date.now();
    const diffMs = now - startTsRef.current;
    const centis = Math.floor(diffMs / 10);
    const next = savedRef.current + centis;
    setElapsed(next);
    onChange?.(next);
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (isRunning) {
      startTsRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      const now = Date.now();
      const diffMs = now - startTsRef.current;
      savedRef.current += Math.floor(diffMs / 10);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    savedRef.current = 0;
    setElapsed(0);
    onChange?.(0);
  };

  return { elapsed, isRunning, start, stop, reset };
}

export const formatTime = (centis) => {
  const m = Math.floor(centis / 6000);
  const s = Math.floor((centis / 100) % 60);
  const c = String(centis % 100).padStart(2, '0');
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${c}`;
};

const StopWatch = forwardRef(function StopWatch({ onChange }, ref) {
  const { elapsed, isRunning, start, stop, reset } = useStopwatchCore(onChange);

  useImperativeHandle(
    ref,
    () => ({
      start,
      stop,
      reset,
      getElapsed: () => elapsed,
      isRunning,
    }),
    [elapsed, isRunning]
  );

  // 화면에는 숨겨서 사용하므로 UI는 유지하되 보이지 않게 둘 수 있음
  return (
    <View style={{ position: 'absolute', left: -9999, width: 1, height: 1 }}>
      <Text>{formatTime(elapsed)}</Text>
    </View>
  );
});

/* ------------------------------ Record ------------------------------ */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function formatCentis(centis) {
  const m = Math.floor(centis / 6000);
  const s = Math.floor((centis / 100) % 60);
  return `${pad(m)}m ${pad(s)}s`;
}

function Record() {
  const today = useMemo(() => new Date(), []);

  // 이번 주 월요일
  const baseDate = useMemo(() => {
    const dow = today.getDay(); // 0: Sun ~ 6: Sat
    const mondayDiff = (dow + 6) % 7; // 월요일까지 거꾸로 이동
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayDiff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [today]);

  // 이번 주 7일
  const daysWithDate = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        d.setHours(0, 0, 0, 0);
        return { label: DAYS[i], day: d.getDate(), dateObj: d };
      }),
    [baseDate]
  );

  // 기본 선택: 오늘 (월=0 … 일=6)
  const [selectedIndex, setSelectedIndex] = useState((today.getDay() + 6) % 7);

  // 선택된 날짜 & 키
  const selectedDate = daysWithDate[selectedIndex]?.dateObj ?? today;
  const selectedDateKey = keyOf(selectedDate);

  // 선택된 날짜의 걷기 기록
  const [walks, setWalks] = useState([]);

  useEffect(() => {
    (async () => {
      const key = `walk_records:${selectedDateKey}`;
      const raw = await AsyncStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.sort((a, b) => a.startMs - b.startMs); // 오래된 → 최신
      setWalks(arr);
    })();
  }, [selectedDateKey]);

  return (
    <SafeAreaView style={recStyles.safe}>
      <View style={recStyles.wrap}>
        {/* 선택된 날짜 YYYY.MM.DD */}
        <Text style={recStyles.yearMonth}>
          {selectedDate.getFullYear()}.{pad(selectedDate.getMonth() + 1)}.
          {pad(selectedDate.getDate())}
        </Text>

        {/* 주간 캘린더 */}
        <View style={recStyles.weekRow}>
          {daysWithDate.map((d, i) => {
            const active = i === selectedIndex;
            return (
              <TouchableOpacity
                key={i}
                style={recStyles.weekItem}
                onPress={() => setSelectedIndex(i)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    recStyles.weekLabel,
                    active && recStyles.weekLabelActive,
                  ]}
                >
                  {d.label}
                </Text>
                <View
                  style={[
                    recStyles.dayCircle,
                    active && recStyles.dayCircleActive,
                  ]}
                >
                  <Text
                    style={[recStyles.dayNum, active && recStyles.dayNumActive]}
                  >
                    {pad(d.day)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 기록 리스트 */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {walks.length > 0 ? (
            walks.map((w, idx) => (
              <View
                key={(w.createdAt ?? '') + idx}
                style={{ marginBottom: 14 }}
              >
                {/* 각 카드 위 시간 한 줄 */}
                <Text style={recStyles.timeRange}>
                  {w.startLabel} - {w.endLabel}
                </Text>

                <View style={recStyles.card}>
                  <View style={recStyles.rowBetween}>
                    <Text style={recStyles.tagWalk}>WALK</Text>
                  </View>

                  {/* 메모 입력 */}
                  <TextInput
                    style={recStyles.noteInput}
                    placeholder='오늘 산책 한 줄 평을 남겨주세요 :-)'
                    placeholderTextColor='#aaa'
                    value={w.note ?? ''}
                    onChangeText={async (txt) => {
                      const next = [...walks];
                      next[idx] = { ...next[idx], note: txt };
                      setWalks(next);
                      await AsyncStorage.setItem(
                        `walk_records:${selectedDateKey}`,
                        JSON.stringify(next)
                      );
                    }}
                  />

                  <View style={recStyles.hr} />

                  <View style={recStyles.statsRow}>
                    <Text style={recStyles.stat}>
                      {formatCentis(w.elapsedCentis)}
                    </Text>
                    <Text style={recStyles.stat}>{`${w.distanceKm.toFixed(
                      2
                    )} km`}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={{ paddingTop: 24 }}>
              <Text style={{ color: '#666', fontWeight: '700' }}>
                {`${selectedDate.getFullYear()}.${pad(
                  selectedDate.getMonth() + 1
                )}.${pad(selectedDate.getDate())}`}{' '}
                기록이 없어요.
              </Text>
              <Text style={{ color: '#888', marginTop: 6 }}>
                산책 종료 후 “기록하기”를 누르면 이 날짜에 저장돼요.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const recStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F3F7' },
  wrap: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  yearMonth: {
    fontSize: 22,
    fontWeight: '900',
    color: '#222',
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekItem: { alignItems: 'center', width: 44 },
  weekLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
    marginBottom: 6,
  },
  weekLabelActive: { color: '#111' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: { backgroundColor: '#111' },
  dayNum: { fontSize: 14, color: '#444', fontWeight: '800' },
  dayNumActive: { color: '#fff' },
  card: {
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagWalk: { color: '#2F7FFF', fontWeight: '900', letterSpacing: 0.2 },
  timeRange: {
    color: '#1C1C1E',
    fontWeight: '800',
    marginLeft: 6,
    marginBottom: 6,
  },
  noteInput: {
    marginTop: 10,
    marginBottom: 12,
    color: '#2C2C2E',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 6,
    borderBottomColor: '#E5E5EA',
  },
  hr: { height: 1, backgroundColor: '#E5E5EA', marginBottom: 12 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stat: { fontWeight: '800', color: '#1C1C1E' },
});

/* ------------------------------ Map1 (with stopwatch & record saving) ------------------------------ */
function Map1() {
  const swRef = useRef(null);
  const mapRef = useRef(null);
  const watchRef = useRef(null);
  const startRef = useRef(null);
  const accumRef = useRef(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [location, setLocation] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [distance, setDistance] = useState(0);
  const [startLocation, setStartLocation] = useState(null);
  const [startAt, setStartAt] = useState(null);

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  useEffect(
    () => () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    },
    []
  );

  // 권한 요청 + 최초 위치
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          '권한 필요',
          '위치 권한이 거부되어 현재 위치를 가져올 수 없습니다.'
        );
        return;
      }
      await refreshLocation();
    })();
  }, []);

  const refreshLocation = async () => {
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = current.coords;
      setLocation(coords);
      if (mapRef.current && coords) {
        mapRef.current.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          600
        );
      }
    } catch (e) {
      console.warn(e);
      Alert.alert('오류', '현재 위치를 가져오지 못했습니다.');
    }
  };

  const onLocation = (coords) => {
    const { latitude, longitude } = coords;
    setLocation(coords);

    if (!startRef.current) {
      const start = { latitude, longitude };
      startRef.current = start;
      setStartLocation(start);
      setDistance(accumRef.current);
      return;
    }
    const s = startRef.current;
    const segment = haversineKm(s.latitude, s.longitude, latitude, longitude);
    setDistance(accumRef.current + segment);
  };

  const handleStart = async () => {
    setStartAt(Date.now());
    setShowPanel(true);
    swRef.current?.start();
    setIsRunning(true);

    accumRef.current = 0;
    setDistance(0);
    startRef.current = null;
    setStartLocation(null);

    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 1 },
      (loc) => onLocation(loc.coords)
    );
  };

  const handlePauseToggle = async () => {
    if (isRunning) {
      // ⏸ Pause
      swRef.current?.stop();
      setIsRunning(false);

      if (startRef.current && location) {
        const add = haversineKm(
          startRef.current.latitude,
          startRef.current.longitude,
          location.latitude,
          location.longitude
        );
        accumRef.current += add;
      }
      startRef.current = null;

      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    } else {
      // ▶ Resume
      swRef.current?.start();
      setIsRunning(true);
      startRef.current = null;

      if (!watchRef.current) {
        watchRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => onLocation(loc.coords)
        );
      }
    }
  };

  const handleEnd = () => {
    swRef.current?.stop?.();
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setShowSummary(true);
  };

  const handleSummaryClose = async () => {
    try {
      const endMs = Date.now();
      await saveWalkRecord({
        startMs: startAt ?? endMs,
        endMs,
        distanceKm: Number(distance.toFixed(2)),
        elapsedCentis: elapsed,
      });
    } catch (e) {
      console.warn('saveWalkRecord failed', e);
    }

    swRef.current?.reset?.();
    setShowPanel(false);
    setIsRunning(false);
    setElapsed(0);
    setDistance(0);
    setStartLocation(null);
    accumRef.current = 0;
    startRef.current = null;
    setShowSummary(false);
    setStartAt(null);
  };

  const initialRegion = {
    latitude: location?.latitude ?? 37.5665,
    longitude: location?.longitude ?? 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  async function saveWalkRecord({ startMs, endMs, distanceKm, elapsedCentis }) {
    const p2 = (n) => String(n).padStart(2, '0');
    const start = new Date(startMs);
    const end = new Date(endMs);

    const dateKey = `${start.getFullYear()}-${p2(start.getMonth() + 1)}-${p2(
      start.getDate()
    )}`; // 일자별 키
    const record = {
      startMs,
      endMs,
      distanceKm, // 숫자 (예: 1.23)
      elapsedCentis, // 센티초
      startLabel: `${p2(start.getHours())}:${p2(start.getMinutes())}`,
      endLabel: `${p2(end.getHours())}:${p2(end.getMinutes())}`,
      createdAt: Date.now(),
    };

    const key = `walk_records:${dateKey}`;
    const prev = await AsyncStorage.getItem(key);
    const arr = prev ? JSON.parse(prev) : [];
    arr.push(record);
    await AsyncStorage.setItem(key, JSON.stringify(arr));
  }

  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style='auto' />

      {/* 상단바 */}
      <View style={map1Styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name='chevron-back' size={24} color='#333' />
        </TouchableOpacity>
        <Text style={map1Styles.headerTitle}>Walk</Text>
        <TouchableOpacity onPress={refreshLocation} disabled={!hasPermission}>
          <Ionicons
            name='locate'
            size={22}
            color={hasPermission ? '#333' : '#bbb'}
          />
        </TouchableOpacity>
      </View>

      {/* 지도 */}
      <MapView
        ref={mapRef}
        style={map1Styles.map}
        initialRegion={initialRegion}
        showsUserLocation
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title='내 위치'
          />
        )}
      </MapView>

      {/* START 버튼 */}
      {!showPanel && (
        <TouchableOpacity onPress={handleStart} style={map1Styles.startButton}>
          <Text style={map1Styles.start}>START</Text>
        </TouchableOpacity>
      )}

      {showPanel && (
        <View style={map1Styles.panel}>
          <View style={map1Styles.infoBox}>
            <Text style={map1Styles.label}>거리</Text>
            <Text style={map1Styles.value}>{distance.toFixed(2)}km</Text>
          </View>
          <View style={map1Styles.buttonContainer}>
            <TouchableOpacity
              onPress={handlePauseToggle}
              style={map1Styles.circleButton}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={32}
                color='white'
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEnd} style={map1Styles.endButton}>
              <Text style={map1Styles.endText}>END</Text>
            </TouchableOpacity>
          </View>
          <View style={map1Styles.infoBox}>
            <Text style={map1Styles.label}>시간</Text>
            <Text style={map1Styles.value}>{formatTime(elapsed)}</Text>
          </View>
        </View>
      )}

      {/* 스톱워치 (숨김) */}
      <StopWatch ref={swRef} onChange={setElapsed} />

      {/* 요약 모달 */}
      <Modal
        visible={showSummary}
        transparent
        animationType='fade'
        onRequestClose={handleSummaryClose}
      >
        <View style={map1Styles.modalBackdrop}>
          <View style={map1Styles.modalCard}>
            {elapsed >= 0 && (
              <View style={map1Styles.summaryRow2}>
                <Text style={map1Styles.summaryLabel}>
                  권장 산책량{'\n'}'30분'을 모두 채웠습니다!
                </Text>
              </View>
            )}
            <View style={map1Styles.summaryRow}>
              <Text style={map1Styles.summaryLabel}>거리</Text>
              <Text style={map1Styles.summaryValue}>
                {distance.toFixed(2)} km
              </Text>
            </View>
            <View style={map1Styles.summaryRow}>
              <Text style={map1Styles.summaryLabel}>시간</Text>
              <Text style={map1Styles.summaryValue}>{formatTime(elapsed)}</Text>
            </View>
            <TouchableOpacity
              style={map1Styles.modalBtn}
              onPress={handleSummaryClose}
            >
              <Text style={map1Styles.modalBtnText}>기록하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const map1Styles = StyleSheet.create({
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  map: { flex: 1 },
  startButton: {
    position: 'absolute',
    bottom: 40,
    left: '25%',
    width: '50%',
    backgroundColor: 'black',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  start: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 60,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
  },
  infoBox: { alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '900', color: '#222' },
  value: { fontSize: 22, marginTop: 6, fontWeight: '800' },
  buttonContainer: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    alignItems: 'center',
  },
  circleButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  endButton: {
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: '#111',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
  },
  endText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '78%',
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: '#fff',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 15, color: '#fff', fontWeight: '700' },
  summaryValue: { fontSize: 16, color: '#fff', fontWeight: '900' },
  modalBtn: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalBtnText: { color: '#000', fontWeight: '800' },
});

/* ------------------------------ Map2 ------------------------------ */
function Map2() {
  const mapRef = useRef(null);
  const [region, setRegion] = useState(null); // 현재 위치 기반 지도 영역
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          '권한 필요',
          '현재 위치를 사용하려면 위치 권한이 필요합니다.'
        );
        // 기본 위치(서울 시청)로 세팅
        setRegion({
          latitude: 37.5665,
          longitude: 126.978,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        return;
      }
      await refreshLocation();
    })();
  }, []);

  const refreshLocation = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const nextRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(nextRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(nextRegion, 600);
      }
    } catch (e) {
      console.warn(e);
      Alert.alert('오류', '현재 위치를 가져오지 못했습니다.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={map2Styles.header}>
        <TouchableOpacity style={map2Styles.spotButton} onPress={() => {}}>
          <Text style={map2Styles.spotText}>음식점</Text>
        </TouchableOpacity>
        <TouchableOpacity style={map2Styles.spotButton} onPress={() => {}}>
          <Text style={map2Styles.spotText}>병원</Text>
        </TouchableOpacity>
        <TouchableOpacity style={map2Styles.spotButton} onPress={() => {}}>
          <Text style={map2Styles.spotText}>카페</Text>
        </TouchableOpacity>
        <TouchableOpacity style={map2Styles.spotButton} onPress={() => {}}>
          <Text style={map2Styles.spotText}>호텔</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={refreshLocation} disabled={!hasPermission}>
          <Ionicons
            name='locate'
            size={22}
            color={hasPermission ? '#333' : '#bbb'}
          />
        </TouchableOpacity>
      </View>

      {region && (
        <MapView
          ref={mapRef}
          style={map2Styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={Platform.OS === 'android'}
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title='현재 기준'
          />
        </MapView>
      )}

      <View style={map2Styles.badge}>
        <Text style={map2Styles.badgeText}>MAP 2</Text>
      </View>
    </View>
  );
}

const map2Styles = StyleSheet.create({
  map: { flex: 1 },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 50,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { color: '#fff', fontWeight: '900' },
  spotButton: {
    backgroundColor: 'black',
    borderRadius: 20,
    paddingVertical: 8,
    width: '18%',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotText: { color: 'white', fontWeight: '800', fontSize: 12 },
});

/* ------------------------------ WalkScreen (main) ------------------------------ */
export default function WalkScreen() {
  const [active, setActive] = useState(1); // 1: Map1, 2: Map2, 3: Record

  const renderScreen = () => {
    switch (active) {
      case 1:
        return <Map1 />;
      case 2:
        return <Map2 />;
      case 3:
        return <Record />;
      default:
        return <Map1 />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style='auto' />
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {/* 우측 플로팅 버튼 */}
      <View style={walkStyles.fabGroup}>
        <TouchableOpacity
          onPress={() => setActive(1)}
          style={[walkStyles.fab, active === 1 && walkStyles.fabActive]}
        >
          <Text
            style={[
              walkStyles.fabText,
              active === 1 && walkStyles.fabTextActive,
            ]}
          >
            1
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActive(2)}
          style={[walkStyles.fab, active === 2 && walkStyles.fabActive]}
        >
          <Text
            style={[
              walkStyles.fabText,
              active === 2 && walkStyles.fabTextActive,
            ]}
          >
            2
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActive(3)}
          style={[walkStyles.fab, active === 3 && walkStyles.fabActive]}
        >
          <Text
            style={[
              walkStyles.fabText,
              active === 3 && walkStyles.fabTextActive,
            ]}
          >
            3
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const walkStyles = StyleSheet.create({
  fabGroup: {
    position: 'absolute',
    right: 16,
    top: '70%',
    gap: 10,
    alignItems: 'center',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  fabActive: { backgroundColor: '#111' },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  fabTextActive: { color: '#fff' },
});
