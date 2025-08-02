import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dog = route.params?.selectedDog;

  return (
    <ScrollView style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

      {/* 상단 프로필 */}
      <View style={styles.header}>
        {dog?.imageUri ? (
          <Image source={{ uri: dog.imageUri }} style={styles.dogImage} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <Text style={styles.dogName}>{dog?.name ?? '강아지 이름'}</Text>
      </View>

       {/* CARE */}
      <Text style={styles.sectionTitle}>CARE</Text>
      <View style={styles.cardRow}>
        <CareCard emoji="📔" label="Diary" />
        <CareCard emoji="🦴" label="Health" />
        <CareCard emoji="🚶‍♂️" label="Walk" />
        <CareCard emoji="📅" label="Calendar" screen="Calendar" navigation={navigation} />
      </View>

      {/* MEMO */}
      <Text style={styles.sectionTitle}>MEMO</Text>
      <View style={styles.box}>
        <Text style={styles.placeholderText}>메모를 입력하세요.</Text>
      </View>

      {/* SCHEDULE */}
      <Text style={styles.sectionTitle}>SCHEDULE</Text>
      <View style={styles.scheduleBox}>
        <ScheduleItem time="9:00" label="산책" emoji="👧🏻" />
        <ScheduleItem time="14:00" label="건강검진" emoji="🧑🏼‍⚕️" />
        <ScheduleItem time="18:00" label="밤 산책" emoji="🌙" disabled />
      </View>

     
    </ScrollView>
  );
}

function ScheduleItem({ time, label, emoji, disabled }) {
  return (
    <View style={[styles.scheduleItem, disabled && { opacity: 0.5 }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
function CareCard({ emoji, label, screen, navigation }) {
  return (
    <TouchableOpacity
      style={styles.careCard}
      onPress={() => {
        if (screen) {
          navigation.navigate(screen);
        }
      }}
    >
      <View style={styles.emojiCircle}>
        <Text style={styles.careEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.careLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 10,
  },
  header: {
    marginTop: 110,
    alignItems: 'center',
    position: 'relative',
  },
  dogImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 10,
  },
  box: {
    height: 100,
    backgroundColor: '#e2e2e2',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
  },
  scheduleBox: {
    gap: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  emoji: {
    fontSize: 20,
    marginRight: 10,
  },
  time: {
    width: 60,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  careCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 5,
  },
  emojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  careEmoji: {
    fontSize: 24,
  },
  careLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});