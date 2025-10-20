import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { DatePicker } from '@/components/ui/DatePicker';

export default function DatePickerExample() {
  const [birthDate, setBirthDate] = useState(new Date());
  const [eventDate, setEventDate] = useState(new Date());
  const [deadline, setDeadline] = useState<Date | null>(null);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Date Picker Example',
          headerStyle: { backgroundColor: '#f4f4f4' },
        }}
      />
      
      <Text style={styles.header}>Date Picker Examples</Text>
      
      {/* Example 1: Birth Date with past dates */}
      <DatePicker
        label="Birth Date"
        value={birthDate}
        onChange={setBirthDate}
        minimumDate={new Date(1950, 0, 1)}
        maximumDate={new Date()}
      />
      
      {/* Example 2: Event Date with future dates */}
      <DatePicker
        label="Event Date"
        value={eventDate}
        onChange={setEventDate}
        minimumDate={new Date()}
        maximumDate={new Date(2030, 11, 31)}
      />
      
      {/* Example 3: Optional deadline date */}
      <DatePicker
        label="Project Deadline (Optional)"
        value={deadline || new Date()}
        onChange={setDeadline}
        minimumDate={new Date()}
        placeholder="No deadline set"
      />
      
      <View style={styles.selectedDatesContainer}>
        <Text style={styles.sectionTitle}>Selected Dates:</Text>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Birth Date:</Text>
          <Text style={styles.dateValue}>{birthDate.toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Event Date:</Text>
          <Text style={styles.dateValue}>{eventDate.toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Deadline:</Text>
          <Text style={styles.dateValue}>
            {deadline ? deadline.toLocaleDateString() : 'None'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  selectedDatesContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateLabel: {
    fontSize: 16,
    color: '#555',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
