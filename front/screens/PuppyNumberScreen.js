import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NumberOfDogsScreen() {
  const navigation = useNavigation();
  const [selectedNumber, setSelectedNumber] = useState(null);

  const isValid = selectedNumber !== null;

  const handleNext = () => {
  if (!isValid) return;

  if (selectedNumber === 1) {
    navigation.navigate('OneDogProfile'); 
  } else {
    navigation.navigate('MultipleDogProfile', { numberOfDogs: selectedNumber });
  }
};

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

      {/* 프로그레스 바 */}
      <View style={styles.progressBar}>
        <View style={styles.progressDot} />
        <View style={styles.progressTrail} />
      </View>

      {/* 안내 텍스트 */}
      <Text style={styles.title}>몇 마리의 강아지를{'\n'}등록할까요?</Text>

      {/* 선택 박스 */}
      <View style={styles.boxContainer}>
        {[1, 2, 3, 4].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.box,
              selectedNumber === num && styles.boxSelected,
            ]}
            onPress={() => setSelectedNumber(num)}
          >
            <Text
              style={[
                styles.boxText,
                selectedNumber === num && styles.boxTextSelected,
              ]}
            >
              {num}마리
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 다음 버튼 */}
      <Pressable
        style={[styles.nextButton, { backgroundColor: isValid ? '#000' : '#eee' }]}
        onPress={handleNext}
        disabled={!isValid}
      >
        <Text style={[styles.nextButtonText, { color: isValid ? '#fff' : '#aaa' }]}>
          다음
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  progressTrail: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#eee',
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 60,
  },
  box: {
    flex: 1,
    paddingVertical: 20,
    marginHorizontal: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
  },
  boxSelected: {
    backgroundColor: '#000',
  },
  boxText: {
    fontSize: 16,
    color: '#444',
  },
  boxTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});