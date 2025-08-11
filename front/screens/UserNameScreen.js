import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserNameScreen({navigation}){
    const [userName, setUserName] = useState('');

    const handleNext = () => {
        if (userName.trim()){
            navigation.navigate('UserRelationship');
        }
    };
    return (
        <View style = {styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-circle" size={32} color="#888" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>개인 정보 입력</Text>

            <View style = {styles.progressBarContainer}>
                <View style={styles.progressActive}/>
                <View style={styles.progressInactive}/>
                <View style={styles.progressInactive}/>
            </View>

            <View style={styles.questionBox}>
                <Text style={styles.greeting}>안녕하세요!</Text>
                <Text style={styles.question}>당신의 이름은 무엇인가요? </Text>  
            </View>

            <View style ={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="이름을 입력하세요"
                    value={userName}
                    onChangeText={setUserName}
                />
            {userName.trim().length > 1 && (
                <Ionicons name="checkbox" size={24} color="#7B61FF" style={styles.checkIcon} />
        )}
            </View>

            <TouchableOpacity
        style={[styles.nextButton, userName.trim() ? styles.nextButtonActive : {}]}
        onPress={handleNext}
        disabled={!userName.trim()}
      >
        <Text style={styles.nextButtonText}>Next</Text>
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
  },
  question: {
    fontSize: 18,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingVertical: 8,
    marginBottom: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  checkIcon: {
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
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