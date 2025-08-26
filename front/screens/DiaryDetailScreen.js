import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const LOCAL_KEY = '@diary_local_entries';

export default function DiaryDetailScreen({ route, navigation }) {
  const { diaryId } = route.params || {};
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 로컬에서 찾기
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        const local = raw ? JSON.parse(raw) : [];
        const found = local.find((it) => String(it.id) === String(diaryId));
        setEntry(found || null);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [diaryId]);

  if (loading) return <View style={st.center}><ActivityIndicator size="large" /></View>;
  if (!entry) return <View style={st.center}><Text>일기를 불러오지 못했습니다.</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F8FC' }}>
      <View style={st.header}>
        <TouchableOpacity style={st.hbtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#2D5D9F" />
        </TouchableOpacity>
        <Text style={st.hTitle}>{formatDate(entry.date)}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!!entry.photos?.length && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={st.carousel}>
            {entry.photos.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={st.slide} />
            ))}
          </ScrollView>
        )}

        {!!entry.text && <Text style={st.body}>{entry.text}</Text>}
      </ScrollView>
    </View>
  );
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#EAF2FB' },
  hbtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F0FB', borderWidth: 1, borderColor: '#C3DAF1' },
  hTitle: { fontSize: 18, fontWeight: '900', color: '#2D5D9F' },
  carousel: { marginBottom: 12 },
  slide: { width: width - 32, height: (width - 32) * 0.66, borderRadius: 12, marginRight: 8, backgroundColor: '#eee' },
  body: { fontSize: 16, lineHeight: 24, color: '#1C2B36', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#DCEAF5' },
});