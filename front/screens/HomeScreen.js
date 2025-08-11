import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dog = route.params?.selectedDog;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
\
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

     
      <Text style={styles.date}>2025.08.03</Text>

  
      <View style={styles.profileSection}>
        <View style={styles.nameBox}>
          <Text style={styles.hello}>HELLO</Text>
          <Text style={styles.nameLine}>
            MY NAME IS <Text style={styles.name}>{dog?.name ?? 'KKONG'}!</Text>
          </Text>
        </View>
        {dog?.imageUri ? (
          <Image source={{ uri: dog.imageUri }} style={styles.dogImage} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>


      <View style={styles.gridSection}>
        <CareCard emoji="📔" label="DIARY" />
        <CareCard emoji="🚶" label="WALK" />
        <CareCard emoji="💊" label="HEALTH CARE" />
        <CareCard emoji="📅" label="CALENDAR" />
      </View>

  
      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleTitle}>TODAY’s SCHEDULE  <Text style={{ fontWeight: 'bold' }}>+</Text></Text>
        <View style={styles.scheduleRow}>
          <ScheduleItem label="MEAL" />
          <ScheduleItem label="WALK" />
          <ScheduleItem label="TREAT" />
        </View>
      </View>
    </ScrollView>
  );
}

function CareCard({ emoji, label }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
    </View>
  );
}

function ScheduleItem({ label }) {
  return (
    <View style={styles.scheduleBox}>
      <Text style={styles.scheduleLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 25,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    zIndex: 10,
  },
  date: {
    marginTop: 120,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  nameBox: {
    flex: 1,
  },
  hello: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },
  nameLine: {
    fontSize: 25,
    marginTop: 2,
  },
  name: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  dogImage: {
    width: 130,
    height: 130,
    borderRadius: 16,
    marginLeft: 10,
  },
  imagePlaceholder: {
    width: 130,
    height: 130,
    backgroundColor: '#ccc',
    borderRadius: 16,
    marginLeft: 10,
  },
  gridSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 25,
    justifyContent: 'space-between',
    gap: 15,
  },
  card: {
  width: '47%',
  aspectRatio: 1,
  backgroundColor: '#f8f8f8',
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#ddd',
},

cardContent: {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 30,
},

cardEmoji: {
  fontSize: 28,
  marginBottom: 8, 
},

cardLabel: {
  fontSize: 14,
  fontWeight: '600',
},
  scheduleSection: {
   
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  scheduleBox: {
    flex: 1,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});