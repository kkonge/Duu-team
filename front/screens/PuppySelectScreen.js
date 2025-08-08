import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function PuppySelectScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const dogProfiles = route.params?.dogProfiles || [];

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

      <Text style={styles.title}>Puppy's Profile</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {dogProfiles.map((dog, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => {navigation.navigate('Home', { selectedDog: dog })}}
          >
        
            {dog.imageUri ? (
              <Image source={{ uri: dog.imageUri }} style={styles.dogImage} />
            ) : (
              <View style={styles.dogImagePlaceholder} />
            )}
            <Text style={styles.dogName}>{dog.name}</Text>
          </TouchableOpacity>
        ))}

        {/* + 버튼 */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('OneDogProfile')}
        >
          <Text style={styles.plus}>＋</Text>
        </TouchableOpacity>
      </ScrollView>

  
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  card: {
    width: '90%',
    height: 160,
    backgroundColor: '#eee',
    borderRadius: 12,
    marginBottom: 20,
    marginTop:10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  dogImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
    borderRadius: 12,
  },
  dogName: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    marginTop: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabBar: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});