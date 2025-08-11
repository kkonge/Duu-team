import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InviteCheckScreen({ navigation }) {
 

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

      <Text style={[styles.questionText]}>
        앱을 사용 중인 가족분이 있나요?
      </Text>

      <View style={[styles.buttonGroup]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PuppyNumber')}
        >
          <Text style={styles.buttonText}>아니요, 처음이에요!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <Text style={styles.buttonText}>네, 초대코드를 입력할게요!</Text>
        </TouchableOpacity>
      </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingTop:270,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 50,
  },
  buttonGroup: {
    width: '90%',
    gap: 15, 
  },
  button: {
    backgroundColor: '#ccc',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 17,
    textAlign: 'center',
  },
});