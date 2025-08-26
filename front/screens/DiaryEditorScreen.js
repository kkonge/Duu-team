import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, StyleSheet, ScrollView, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_KEY = '@diary_local_entries';
const PROFILE_NAME_KEY = '@profile_name';
const PROFILE_EMAIL_KEY = '@profile_email';

export default function DiaryEditorScreen({ navigation }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const selected = result.assets || [result];
      setImages((prev) => [...prev, ...selected.map((it) => ({ uri: it.uri }))]);
    }
  };

  const removeImage = (index) => {
    const next = [...images];
    next.splice(index, 1);
    setImages(next);
  };

  const onSave = async () => {
    try {
      if (!text.trim() && images.length === 0) {
        Alert.alert('알림', '내용 또는 사진을 추가해주세요.');
        return;
      }
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const authorName = (await AsyncStorage.getItem(PROFILE_NAME_KEY)) || 'AUTHOR';
      const authorEmail = (await AsyncStorage.getItem(PROFILE_EMAIL_KEY)) || 'user@example.com';
      const now = new Date();
      const entry = {
        id: `local_${now.getTime()}`,
        date: now.toISOString().slice(0, 10),
        text,
        photos: images.map((it) => it.uri),
        authorName, 
        authorEmail,
        __local: true,
      };
      const next = [entry, ...list];
      await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      navigation.navigate('Diary', { didSave: true });
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={ss.root}>
      <View style={ss.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={ss.hbtn}>
          <Ionicons name="chevron-back" size={22} color="#2D5D9F" />
        </TouchableOpacity>
        <Text style={ss.hTitle}>새 일기</Text>
        <TouchableOpacity onPress={onSave} style={ss.saveBtn}>
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={ss.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={ss.sectionLabel}>오늘의 일기</Text>

        <TouchableOpacity style={ss.addImageBtn} onPress={pickImage}>
          <Ionicons name="image-outline" size={20} color="#2D5D9F" />
          <Text style={ss.addImageText}>사진 추가</Text>
        </TouchableOpacity>

        <View style={ss.imageContainer}>
          {images.map((img, idx) => (
            <View key={idx} style={ss.imageWrapper}>
              <Image source={{ uri: img.uri }} style={ss.image} />
              <TouchableOpacity style={ss.deleteIcon} onPress={() => removeImage(idx)}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TextInput
          style={ss.diaryText}
          placeholder="오늘의 감정이나 특별한 순간을 적어보세요..."
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#99A9BA"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ss = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F8FC' },
  header: { marginTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#EAF2FB' },
  hbtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F0FB', borderWidth: 1, borderColor: '#C3DAF1' },
  hTitle: { fontSize: 18, fontWeight: '900', color: '#2D5D9F' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2D5D9F', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  saveText: { color: '#fff', fontWeight: '900' },

  sectionLabel: { fontSize: 16, fontWeight: '800', color: '#2D5D9F', marginBottom: 8 },
  addImageBtn: { marginTop: 8, padding: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#E6F0FB', borderRadius: 8, borderWidth: 1, borderColor: '#C3DAF1' },
  addImageText: { marginLeft: 8, color: '#2D5D9F', fontWeight: '700' },
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  imageWrapper: { position: 'relative', width: 90, height: 90 },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  deleteIcon: { position: 'absolute', top: -6, right: -6, backgroundColor: 'white', borderRadius: 10 },

  diaryText: { marginTop: 10, fontSize: 16, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#DCEAF5', minHeight: 260, color: '#1C2B36', fontWeight: '600' },
});