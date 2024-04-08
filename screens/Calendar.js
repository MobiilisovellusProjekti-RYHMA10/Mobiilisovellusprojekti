import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Modal, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Icon
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'




// Locale configuration for Finnish
LocaleConfig.locales['fi'] = {
  monthNames: [
    'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu',
    'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu',
    'Marraskuu', 'Joulukuu'
  ],
  monthNamesShort: [
    'Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko',
    'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka',
    'Marras', 'Joulu'
  ],
  dayNames: [
    'Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko',
    'Torstai', 'Perjantai', 'Lauantai'
  ],
  dayNamesShort: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
};
LocaleConfig.defaultLocale = 'fi';

const NoteContainer = ({ note, onOpen }) => {
  return (
    <TouchableOpacity onPress={onOpen} style={styles.noteContainer}>
      <Text style={styles.noteText}>
        <Text style={{ color: '#5A906D' }}>{note.time}  </Text>
        <Text>{note.text}</Text>
      </Text>
    </TouchableOpacity>
  );
};


export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState({});
  const [noteText, setNoteText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeNote, setActiveNote] = useState({ date: '', index: -1, text: '' });
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [timeInput, setTimeInput] = useState('');


  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem('notes');
        if (savedNotes !== null) {
          setNotes(JSON.parse(savedNotes));
        }
      } catch (error) {
        console.error("Failed to load the notes from AsyncStorage", error);
      }
    };
    loadNotes();
  }, []);

  const onDayPress = day => {
    setSelectedDate(day.dateString);
    setNoteText('');
  };

  const saveNote = async () => {
    const newNote = { text: noteText, time: timeInput }; // Use object with text and time
    const updatedNotes = {
      ...notes,
      [selectedDate]: [...(notes[selectedDate] || []), newNote] // Save the newNote object
    };
    try {
      setNotes(updatedNotes);
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to save the note to AsyncStorage", error);
    }
  };

  const deleteNote = async (date, noteIndex) => {
    const updatedNotesForDate = notes[date].filter((_, index) => index !== noteIndex);
    const updatedNotes = { ...notes, [date]: updatedNotesForDate };

    try {
      setNotes(updatedNotes);
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      setDetailsModalVisible(false); // Close details modal after deletion
    } catch (error) {
      console.error("Failed to delete the note from AsyncStorage", error);
    }
  };

  const getMarkedDates = () => {
    const marked = Object.keys(notes).reduce((acc, date) => {
      if (notes[date] && notes[date].length > 0) {
        acc[date] = { marked: true, dotColor: '#ABD7AA' };
      }
      return acc;
    }, {});

    if (selectedDate) {
      marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: '#5A906D' };
    }
    return marked;
  };

  const openNoteDetails = (date, index, note) => {
    setActiveNote({
      date,
      index,
      text: note.text,
      time: note.time // Ensure the time is set here
    });
    setDetailsModalVisible(true);
  };

  const updateNote = async () => {
    // Copy the notes object
    const updatedNotes = { ...notes };
    // Update the specific note with the new text and time
    if (activeNote.date in updatedNotes && activeNote.index !== -1) {
      updatedNotes[activeNote.date][activeNote.index] = {
        text: activeNote.text,
        time: activeNote.time,
      };
      try {
        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
        setNotes(updatedNotes); // Update state
        setDetailsModalVisible(false); // Close the modal
      } catch (error) {
        console.error("Failed to update the note in AsyncStorage", error);
      }
    }
  };

  const formatTimeInput = (text) => {
    const newText = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    let formattedTime = '';

    // Format string as "HH:MM"
    if (newText.length <= 2) {
      formattedTime = newText;
    } else if (newText.length <= 4) {
      formattedTime = `${newText.slice(0, 2)}:${newText.slice(2)}`;
    }

    return formattedTime;
  };

  // Function to convert time "HH:MM" to minutes since midnight
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };




  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <RNCalendar
              onDayPress={onDayPress}
              markedDates={getMarkedDates()}
              theme={{
                arrowColor: '#1a8f3f',
                selectedDayBackgroundColor: '#1a8f3f',
                todayTextColor: '#1a8f3f',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 16,
              }}
            />
            {selectedDate && Array.isArray(notes[selectedDate]) && (
              <View style={styles.notesSection}>
                {notes[selectedDate]
                  .slice() // Create a shallow copy of the array to avoid mutating the original array
                  .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort notes by time
                  .map((note, index) => (
                    <NoteContainer
                      key={index}
                      note={note}
                      onOpen={() => openNoteDetails(selectedDate, index, note)}
                    />
                  ))}
              </View>
            )}

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={24} color="#FBFADA" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContent}>
          <TouchableOpacity 
        onPress={() => setModalVisible(false)}
        style={styles.closeButtonStyle}
      >
  <Text style={styles.closeButtonText}>Kumoa</Text>
      </TouchableOpacity>
            <TextInput
              style={styles.noteInput}
              placeholder="Lisää tapahtuma..."
              placeholderTextColor="#9C9C9C"
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={styles.timeInput}
              placeholder="Kellonaika (HH:MM)"
              placeholderTextColor="#9C9C9C"
              keyboardType="numeric"
              maxLength={5}
              value={timeInput}
              onChangeText={(text) => setTimeInput(formatTimeInput(text))}
            />
            <Button title="Tallenna" onPress={saveNote} color="#1a8f3f" />
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
  animationType="slide"
  transparent={true}
  visible={detailsModalVisible}
  onRequestClose={() => setDetailsModalVisible(false)}
>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.modalContent}>
      <TouchableOpacity 
        onPress={() => setDetailsModalVisible(false)} 
        style={styles.closeButtonStyle}
      >
        <Text style={styles.closeButtonText}>Kumoa</Text>
      </TouchableOpacity>

      {/* The rest of your modal content */}
      <TextInput
        style={styles.noteInput}
        value={activeNote.text}
        onChangeText={(text) => setActiveNote(prev => ({ ...prev, text }))}
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={styles.timeInput}
        placeholder="Kellonaika (HH:MM)"
        placeholderTextColor="#9C9C9C"
        keyboardType="numeric"
        maxLength={5}
        value={activeNote.time}
        onChangeText={(text) => setActiveNote(prevState => ({
          ...prevState,
          time: formatTimeInput(text)
        }))}
      />

      <Button title="Tallenna" onPress={updateNote} color="#1a8f3f" />
      <Button title="Poista" onPress={() => deleteNote(activeNote.date, activeNote.index)} color="#ff6347" />
    </View>
  </TouchableWithoutFeedback>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '30%',
    marginBottom: '30%',
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#12372A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    position: 'absolute', // Position absolutely to place it on top left
    top: 0, // Align to the top of the modal
    left: 0, // Align to the left of the modal
    width: '100%', // Ensure it spans the width of the modal for alignment
    padding: 10, // Add some padding around the content
    alignItems: 'flex-start', // Align items (buttons, etc.) to the start (left)
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#436850', // Medium Green for add button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  noteInput: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: '#436850', // Medium Green for border
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    fontSize: 20, // Slightly larger font

  },
  notesSection: {
    padding: 10,
    marginTop: 10,
  },
  noteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FFF', // Light Greenish-Gray for note container
    borderWidth: 1, // Sets the thickness of the border
    borderColor: '#12372A', // Sets the color of the border, choose a color that fits your design
    borderStyle: 'solid', // Optional, specifies the style of the border, defaults to 'solid'
  },
  noteText: {
    flex: 1,
    fontSize: 16,
  },
  timeInput: {
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: '#436850', // Using the same green as for the note input
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#FFFFFF', // Matching the note input background
    textAlign: 'left', // Align text to the left to match the note input (or 'center' if you prefer)
    fontSize: 18, // Slightly larger font

  },

  closeButtonStyle: {
    position: 'absolute', // Position the button absolutely
    top: 10, // Distance from the top of the modal
    left: 10, // Distance from the left side of the modal
    backgroundColor: 'transparent', // Or any background color
    padding: 10, // Padding for touch area
    
  },

  closeButtonText: {
    color: '#ff6347', // Example text color
    fontSize: 16, // Adjust font size as needed
  },
  


});