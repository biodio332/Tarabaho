import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface ToggleOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface ToggleGroupProps {
  options: ToggleOption[]
  value: string
  onValueChange: (value: string) => void
  variant?: 'default' | 'compact'
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({
  options,
  value,
  onValueChange,
  variant = 'default'
}) => {
  const isCompact = variant === 'compact'

  return (
    <View style={[styles.container, isCompact && styles.compactContainer]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            isCompact && styles.compactOption,
            value === option.value && styles.activeOption,
            value === option.value && isCompact && styles.compactActiveOption,
          ]}
          onPress={() => onValueChange(option.value)}
          activeOpacity={0.7}
        >
          {option.icon && (
            <View style={styles.iconContainer}>
              {option.icon}
            </View>
          )}
          <Text
            style={[
              styles.optionText,
              isCompact && styles.compactOptionText,
              value === option.value && styles.activeOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  compactContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 2,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  compactOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeOption: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  compactActiveOption: {
    backgroundColor: '#2563eb',
  },
  iconContainer: {
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  compactOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeOptionText: {
    color: '#ffffff',
  },
})

export default ToggleGroup
