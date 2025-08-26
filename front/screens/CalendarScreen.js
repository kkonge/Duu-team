// CalendarScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen({ navigation, onBack }) {

  const [selectedDate, setSelectedDate] = useState('');
  const [summaries, setSummaries] = useState({}); 
  const [visibleYear, setVisibleYear] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(null);

  // 디테일 상태
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [inputWeight, setInputWeight] = useState('');
  const [weights, setWeights] = useState({}); // { 'YYYY-MM-DD': 'NN.N' }

  const today = new Date().toISOString().split('T')[0];
  const pad2 = (n) => String(n).padStart(2, '0');

  // 키
  const TODO_KEY = selectedDate ? `@toDos-${selectedDate}` : null;
  const WEIGHT_KEY = selectedDate ? `@weight-${selectedDate}` : null;

  // 한 달치 요약
  const loadMonthTodos = useCallback(async (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const next = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${pad2(month)}-${pad2(d)}`;
      try {
        const raw = await AsyncStorage.getItem(`@toDos-${ds}`);
        if (!raw) continue;
        const obj = JSON.parse(raw) || {};
        const keys = Object.keys(obj);
        if (!keys.length) continue;
        const sorted = keys
          .map(Number)
          .filter((n) => !Number.isNaN(n))
          .sort((a, b) => a - b);
        const texts = sorted
          .map((k) => obj[String(k)]?.text ?? '')
          .filter(Boolean);
        if (texts.length) next[ds] = texts;
      } catch {}
    }
    setSummaries(next);
  }, []);

  // 선택 날짜 디테일
  const loadSelectedDateData = useCallback(async () => {
    if (!selectedDate) return;
    try {
      const saved = await AsyncStorage.getItem(TODO_KEY);
      setToDos(JSON.parse(saved) || {});
      const storedWeight = await AsyncStorage.getItem(WEIGHT_KEY);
      setWeights((prev) => ({ ...prev, [selectedDate]: storedWeight || '' }));
      setInputWeight(storedWeight || '');
    } catch (e) {
      console.error('loadSelectedDateData failed:', e);
    }
  }, [selectedDate, TODO_KEY, WEIGHT_KEY]);

  // 초기: 오늘 기준
  useEffect(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    setVisibleYear(y);
    setVisibleMonth(m);
    setSelectedDate(today);
    loadMonthTodos(y, m);
  }, [loadMonthTodos, today]);

  // 선택 날짜 바뀌면 디테일 로드
  useEffect(() => {
    loadSelectedDateData();
    setText('');
    setEditingKey(null);
    setEditingText('');
  }, [selectedDate, loadSelectedDateData]);

  // 월 바뀌면 다시 로드
  useEffect(() => {
    if (visibleYear && visibleMonth) loadMonthTodos(visibleYear, visibleMonth);
  }, [visibleYear, visibleMonth, loadMonthTodos]);

  // 날짜
  const handleDayPress = useCallback((ymd) => setSelectedDate(ymd), []);

  // 뒤로가기
  const handleBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else if (typeof onBack === 'function') onBack();
    else setSelectedDate(''); 
  };

  const onChange = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    if (!TODO_KEY) return;
    await AsyncStorage.setItem(TODO_KEY, JSON.stringify(toSave));
    const texts = Object.keys(toSave)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => toSave[k]?.text ?? '')
      .filter(Boolean);
    setSummaries((prev) => ({ ...prev, [selectedDate]: texts }));
  };

  const addToDo = async () => {
    if (!text.trim()) return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text: text.trim(), done: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };

  const startEdit = (key) => {
    setEditingKey(key);
    setEditingText(toDos[key].text);
  };

  const correct = async (key) => {
    const updated = { ...toDos, [key]: { ...toDos[key], text: editingText } };
    setToDos(updated);
    await saveToDos(updated);
    setEditingKey(null);
    setEditingText('');
  };

  const toggleDone = async (key) => {
    const updated = {
      ...toDos,
      [key]: { ...toDos[key], done: !toDos[key].done },
    };
    setToDos(updated);
    await saveToDos(updated);
  };

  const deleteToDo = async (key) => {
    Alert.alert('Delete To Do', 'Are you sure you want to delete this?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = { ...toDos };
          delete updated[key];
          setToDos(updated);
          await saveToDos(updated);
        },
      },
    ]);
  };

  const saveWeight = async () => {
    if (!WEIGHT_KEY) return;
    const trimmed = (inputWeight || '').trim();
    await AsyncStorage.setItem(WEIGHT_KEY, trimmed);
    setWeights((prev) => ({ ...prev, [selectedDate]: trimmed }));
  };
  const todayLocal = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`; // 로컬 기준 YYYY-MM-DD
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF6E9' }}>
      <StatusBar style='auto' />

      // 상단바
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <Ionicons name='chevron-back' size={22} color='#5B7F6A' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedDate || 'Today'}</Text>
        <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
          <Ionicons
            name='ellipsis-horizontal-circle'
            size={22}
            color='#5B7F6A'
          />
        </TouchableOpacity>
      </View>
      <ScrollView>
        // 캘린더
        <View style={calendarStyles.container}>
          <Calendar
            style={calendarStyles.calendar}
            current={todayLocal}
            onMonthChange={(m) => {
              setVisibleYear(m.year);
              setVisibleMonth(m.month);
              loadMonthTodos(m.year, m.month);
            }}
            hideExtraDays
            enableSwipeMonths
            dayComponent={({ date, state }) => {
              const ymd = date.dateString;
              const todos = summaries[ymd] || [];
              const isSelected = ymd === selectedDate;
              const isDisabled = state === 'disabled';
              const isToday = ymd === todayLocal;

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDayPress(ymd)}
                  style={[
                    dayCell.wrap,
                    isSelected && dayCell.selectedWrap,
                    isDisabled && { opacity: 0.35 },
                    // isToday && { borderColor: '#007AFF', borderWidth: 1, borderRadius: 8 },
                  ]}
                >
                  <Text
                    style={[
                      dayCell.dayNum,
                      isSelected && { color: 'grey' },
                      isToday && { color: 'green' , fontWeight : '800'}, 
                    ]}
                  >
                    {date.day}
                  </Text>
                  {todos.map((t, idx) => (
                    <Text
                      key={idx}
                      numberOfLines={1}
                      ellipsizeMode='tail'
                      style={dayCell.todoText}
                    >
                      {t}
                    </Text>
                  ))}
                </TouchableOpacity>
              );
            }}
            theme={{
              textDayFontWeight: '500',
              textMonthFontSize: 20,
              textMonthFontWeight: 'bold',
              monthTextColor: '#000',
              todayTextColor: '#007AFF', // 기본 셀용(커스텀 셀에선 직접 스타일링 필요)
              arrowColor: 'black',
            }}
          />
        </View>


        {!!selectedDate && (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          >
            // 체중
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={detailStyles.title}>Today's Weight</Text>
              {weights[selectedDate] ? (
                <Text style={detailStyles.title}>
                  {weights[selectedDate]} kg
                </Text>
              ) : null}
            </View>
            <TextInput
              style={detailStyles.input}
              value={inputWeight}
              onChangeText={setInputWeight}
              placeholder='체중 입력 (kg)'
              returnKeyType='done'
              onSubmitEditing={saveWeight}
            />

            // todos
            <Text style={detailStyles.title}>To Do List</Text>
            <TextInput
              returnKeyType='done'
              onSubmitEditing={addToDo}
              onChangeText={onChange}
              value={text}
              placeholder='Add a To Do'
              style={detailStyles.input}
            />

            <View>
              {Object.keys(toDos).map((key) => (
                <View
                  key={key}
                  style={[
                    detailStyles.toDos,
                    editingKey === key && {
                      borderColor: 'gray',
                      borderWidth: 1,
                    },
                  ]}
                >
                  {editingKey === key ? (
                    <TouchableOpacity
                      onPress={() => toggleDone(key)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                      }}
                    >
                      <Feather
                        name={toDos[key].done ? 'check-square' : 'square'}
                        size={24}
                        color='gray'
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        value={editingText}
                        onChangeText={setEditingText}
                        style={[
                          detailStyles.toDoText,
                          { color: 'gray', flex: 1 },
                        ]}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                      }}
                    >
                      <TouchableOpacity onPress={() => toggleDone(key)}>
                        <Feather
                          name={toDos[key].done ? 'check-square' : 'square'}
                          size={24}
                          color='black'
                          style={{ marginRight: 10 }}
                        />
                      </TouchableOpacity>
                      <Text
                        style={[
                          detailStyles.toDoText,
                          toDos[key].done && {
                            textDecorationLine: 'line-through',
                            color: 'gray',
                          },
                        ]}
                      >
                        {toDos[key].text}
                      </Text>
                    </View>
                  )}

                  {editingKey === key ? (
                    <TouchableOpacity onPress={() => correct(key)}>
                      <SimpleLineIcons name='pencil' size={20} color='gray' />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => startEdit(key)}>
                      <SimpleLineIcons name='pencil' size={20} color='black' />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <Entypo
                      name='cross'
                      size={24}
                      color={editingKey === key ? 'gray' : 'black'}
                      style={detailStyles.x}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#EEF6E9',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4EE',
    borderWidth: 1,
    borderColor: '#D7E8DB',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#5B7F6A' },
});

const dayCell = StyleSheet.create({
  wrap: {
    width: 45,
    height: 70,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 2,
    borderRadius: 10,
  },
  selectedWrap: { backgroundColor: '#EEF6E9' },
  dayNum: { fontSize: 14, color: '#111', fontWeight: '600', lineHeight: 18 },
  todoText: { marginTop: 2, fontSize: 10, color: '#666', maxWidth: 42 },
});

const calendarStyles = StyleSheet.create({
  container: { backgroundColor: '#EEF6E9' },
  calendar: { marginHorizontal: 20, borderRadius: 15, marginTop: 20 },
});

const detailStyles = StyleSheet.create({
  date: { fontSize: 28, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '800', marginTop: 20 , color : '#5B7F6A'},
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
  toDoText: { fontSize: 16, fontWeight: '500' },
  x: { marginLeft: 10 },
});
