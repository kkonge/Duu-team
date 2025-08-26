import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import DiaryList from './DiaryList';
import GalleryView from './GalleryView';

const DIARY_KEY = '@diary_tab_is_diary';

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

  // 저장 후 돌아오면 리스트 새로고침
  const [reloadKey, setReloadKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      if (route.params?.didSave) {
        setReloadKey((k) => k + 1);
        navigation.setParams({ didSave: undefined });
      }
    }, [route.params?.didSave])
  );

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

        {diary ? (
          <DiaryList
            key={reloadKey}
            onPressItem={(entry) => navigation.navigate('DiaryDetail', { diaryId: entry.id })}
            onPressWrite={() => navigation.navigate('DiaryEditor')}
          />
        ) : (
          <GalleryView />
        )}
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
  tabHeader: { flexDirection: 'row', backgroundColor: '#DCE9F7', borderRadius: 16, padding: 6, marginBottom: 16 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  tabText: { fontSize: 16, fontWeight: '600', color: '#5A7698' },
  tabSelected: { backgroundColor: '#fff' },
  tabTextSelected: { color: '#2D5D9F' },
});