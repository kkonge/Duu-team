import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import DiaryView from './DiaryView';

const DIARY_KEY = '@diary_tab_is_diary';
const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageGap = 2;
const imageSize = Math.floor((screenWidth - imageGap * (numColumns - 1)) / numColumns);

function GalleryView() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://서버주소/diary_photo';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          if (mounted) setLoading(false);
          console.warn('토큰이 없습니다. 로그인 후 이용하세요.');
          return;
        }
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.warn('서버 응답 오류:', res.status);
          if (mounted) setLoading(false);
          return;
        }
        const data = await res.json();
        if (mounted) {
          setPhotos(Array.isArray(data?.photos) ? data.photos : []);
        }
      } catch (e) {
        console.error('사진 불러오기 실패:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const renderPhoto = ({ item }) => (
    <Image
      source={{ uri: item.photo_url }}
      style={styles.photo}
      resizeMode="cover"
    />
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (!photos.length) return <View style={styles.center}><Text>등록된 사진이 없습니다.</Text></View>;

  return (
    <FlatList
      data={photos}
      renderItem={renderPhoto}
      keyExtractor={(item, index) => (item.diary_id?.toString?.() ?? `noid`) + '_' + index}
      numColumns={numColumns}
      style={styles.galleryContainer}
      columnWrapperStyle={{ gap: imageGap }}
      contentContainerStyle={{ gap: imageGap }}
    />
  );
}

export default function DiaryScreen({ navigation }) {
  const [diary, setDiary] = useState(true);
  const route = useRoute();
  const selectedDog = route.params?.selectedDog;

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(DIARY_KEY);
      if (saved !== null) setDiary(JSON.parse(saved));
    })();
  }, []);

  const toggleTab = async (isDiary) => {
    setDiary(isDiary);
    await AsyncStorage.setItem(DIARY_KEY, JSON.stringify(isDiary));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EAF2FB' }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#2D5D9F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diary</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>
          {selectedDog?.name ? `${selectedDog.name.toUpperCase()}'s DIARY` : "MY DOG'S DIARY"}
        </Text>

        <View style={styles.tabHeader}>
          <TouchableOpacity onPress={() => toggleTab(true)} style={[styles.tabButton, diary && styles.tabSelected]}>
            <Text style={[styles.tabText, diary && styles.tabTextSelected]}>DIARY</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleTab(false)} style={[styles.tabButton, !diary && styles.tabSelected]}>
            <Text style={[styles.tabText, !diary && styles.tabTextSelected]}>GALLERY</Text>
          </TouchableOpacity>
        </View>

        {diary ? <DiaryView /> : <GalleryView />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6, backgroundColor: '#EAF2FB',
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#E6F0FB', borderWidth: 1, borderColor: '#C3DAF1',
  },
  headerTitle: { fontSize: 25, fontWeight: '900', color: '#2D5D9F' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 25, fontWeight: '700', marginBottom: 12, color: '#1D3557' },
  tabHeader: {
    flexDirection: 'row', backgroundColor: '#DCE9F7', borderRadius: 16, padding: 6, marginBottom: 16,
  },
  tabButton: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
  },
  tabText: {
    fontSize: 16, fontWeight: '600', color: '#5A7698',
  },
  tabSelected: {
    backgroundColor: '#fff',
  },
  tabTextSelected: {
    color: '#2D5D9F',
  },
  galleryContainer: { flex: 1 },
  photo: { width: imageSize, height: imageSize, backgroundColor: '#eee' },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
});