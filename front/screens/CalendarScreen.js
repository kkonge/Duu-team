
import React, { useEffect, useState } from 'react';
import { Image, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';

export default function DetailScreen({ route }) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const date = `${yyyy}-${mm}-${dd}`;
  const STORAGE_KEY = `@toDos-${date}`; 
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState({});

  const onChange = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(saved) || {});
  };

  const addToDo = async () => {
    if (text === '') return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, done: false }
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };

  const toggleDone = async (key) => {
    const updated = { ...toDos };
    updated[key].done = !updated[key].done;
    setToDos(updated);
    await saveToDos(updated);
  };

  const deleteToDo = async (key) => {
    Alert.alert('Delete', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = { ...toDos };
          delete updated[key];
          setToDos(updated);
          await saveToDos(updated);
        }
      }
    ]);
  };

  useEffect(() => {
    loadToDos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{date}</Text>
      <Image
        source={require('../assets/dog.webp')}
        style={styles.img}
      />
      <ScrollView>
      <Text style={styles.title}>Today Is...</Text>
      <View style = {styles.WalkingTime}>
        <Text style={styles.title}>Walking Time</Text>
        <Text style={styles.title}>2H</Text>
      </View>
      <Text style={styles.title}>To Do List</Text>
      <TextInput
        returnKeyType="done"
        onSubmitEditing={addToDo}
        onChangeText={onChange}
        value={text}
        placeholder="Add a To Do"
        style={styles.input}
      />
      <View>
        {Object.keys(toDos).map((key) => (
          <View style={styles.toDos} key={key}>
            <TouchableOpacity
              onPress={() => toggleDone(key)}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <Feather
                name={toDos[key].done ? 'check-square' : 'square'}
                size={24}
                color="black"
                style={styles.checkBox}
              />
              <Text
                style={[
                  styles.toDoText,
                  toDos[key].done && {
                    textDecorationLine: 'line-through',
                    color: 'gray',
                  },
                ]}
              >
                {toDos[key].text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteToDo(key)}>
              <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f2f2f7' 
    },
  date: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: 50
    },
  title: { 
    fontSize: 20, 
    fontWeight: '600', 
    marginTop: 20 
},
  input: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 15,
    fontSize: 16,
  },
  toDos: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 10,
  },
  toDoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkBox: {
    marginRight: 10,
  },
  img : {
    marginTop: 20,
    width: '100%',
    height : '30%',
    borderRadius: 10,
  },
  WalkingTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    },
});