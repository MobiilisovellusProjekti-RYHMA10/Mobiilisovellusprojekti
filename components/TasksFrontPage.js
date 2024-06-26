import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { firestore } from '../firebase/Config';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext'; // Import the theme context


export default function TasksWidget({ listId }) {
  const [todos, setTodos] = useState([]);
  const [listName, setListName] = useState('');
  const { theme } = useTheme(); // Use the theme context
  const isDarkMode = theme === 'dark'; // Determine if the theme is dark

  const styles = getDynamicStyles(isDarkMode); // Call to apply dynamic styles


  useEffect(() => {
    // Fetch list name
    if (listId) {
      const listRef = doc(firestore, 'lists', listId);
      getDoc(listRef).then(docSnap => {
        if (docSnap.exists()) {
          setListName(docSnap.data().name);
        } else {
          setListName('List not found');
        }
      });
    }

    // Subscribe to todos updates
    const q = query(collection(firestore, 'todos'), where('listId', '==', listId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTodos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        done: doc.data().done,
      }));
      setTodos(fetchedTodos);
    });

    return () => unsubscribe();
  }, [listId]);

  const toggleDone = async (id, done) => {
    const todoRef = doc(firestore, 'todos', id);
    await updateDoc(todoRef, { done: !done });
  };

  const renderTodo = ({ item }) => {
    return (
      <View style={styles.todoContainer}>
        <TouchableOpacity onPress={() => toggleDone(item.id, item.done)} style={styles.todo}>
          {item.done ? (
            <IconIonicons name='checkbox' size={30} color={'#00AF00'} />
          ) : (
            <IconIonicons name='square-outline' size={30} color={'#79747E'} />
          )}
          <Text style={styles.todoText}>{item.text}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {listName && <Text style={styles.listName}>{listName}</Text>}
      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id}
        extraData={todos}
      />
    </View>
  );
}

function getDynamicStyles(isDarkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      margin: 10,
    },
    listName: {
      fontSize: 20,
      padding: 10,
      textAlign: 'center',
      color: isDarkMode ? '#FFF' : '#000', // Text color changes with theme
    },
    todoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#555' : '#fff', // Background color changes with theme
      padding: 10,
      marginVertical: 6,
      borderRadius: 10,
    },
    todoText: {
      flex: 1,
      paddingHorizontal: 4,
      marginLeft: 10,
      color: isDarkMode ? '#fff' : '#000', // Text color changes with theme
    },
    todo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
}
