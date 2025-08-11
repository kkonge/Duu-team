import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NumberOfDogScreen() {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const navigation = useNavigation();

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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

      <Text style={styles.topTitle}>반려견 정보 입력</Text>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressActive} />
        <View style={styles.progressInactive} />
        <View style={styles.progressInactive} />
      </View>

      <View style={styles.questionBox}>
        <Text style={styles.greeting}>몇 마리의 강아지를{'\n'}등록할까요?</Text>
      </View>

      <View style={styles.boxContainer}>
        {[1, 2, 3, 4].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.box, selectedNumber === num && styles.boxSelected]}
            onPress={() => setSelectedNumber(num)}
          >
            <Text style={[styles.boxText, selectedNumber === num && styles.boxTextSelected]}>
              {num}마리
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.nextButton, isValid ? styles.nextButtonActive : {}]}
        onPress={handleNext}
        disabled={!isValid}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  topTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressActive: {
    width: 60,
    height: 4,
    backgroundColor: '#69DA00',
    borderRadius: 2,
    marginHorizontal: 4,
  },
  progressInactive: {
    width: 60,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginHorizontal: 4,
  },
  questionBox: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 50,
  },
  greeting: {
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
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
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonActive: {
    backgroundColor: '#000',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 10,
  },
});
/*
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

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>


      <View style={styles.progressBar}>
        <View style={styles.progressDot} />
        <View style={styles.progressTrail} />
      </View>


      <Text style={styles.title}>몇 마리의 강아지를{'\n'}등록할까요?</Text>


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
*/