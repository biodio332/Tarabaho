import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, TextInput, Modal, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = 'Select a date',
  error
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  
  // Update tempDate whenever value changes
  React.useEffect(() => {
    setTempDate(value);
  }, [value]);
  
  // Toggle date picker visibility
  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
    setTempDate(value); // Reset to current value when opening
  };
  
  // Handle date change from the picker
  const handleChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
      return;
    }
    
    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);

    if (Platform.OS === 'android') {
      setShowPicker(false);
      onChange(currentDate);
    }
  };
  
  // For iOS only - confirm button
  const confirmIOSDate = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  // For iOS only - cancel button
  const cancelIOSDate = () => {
    setTempDate(value); // Reset to the original value
    setShowPicker(false);
  };
  
  // Format the date for display
  const formattedDate = value ? value.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
        onPress={toggleDatePicker} 
        style={[
          styles.dateButton,
          error ? styles.errorInput : null
        ]}
      >
        <View style={styles.inputContainer}>
          <Text style={value ? styles.dateText : styles.placeholderText}>
            {formattedDate}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#6b7280" />
        </View>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={styles.modalContainer} 
            onPress={cancelIOSDate}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={cancelIOSDate} style={styles.headerButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmIOSDate} style={styles.headerButton}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  style={styles.datePickerIOS}
                  themeVariant="light"
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  errorInput: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 17,
    color: '#ff3b30',
    fontWeight: '500',
  },
  doneText: {
    fontSize: 17,
    color: '#007aff',
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: 'white',
    padding: 10,
  },
  datePickerIOS: {
    height: 200,
    width: '100%',
  },
  iosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  iosButton: {
    padding: 12,
    borderRadius: 8,
    width: 120,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  fallbackInput: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
  },
  fallbackHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
