import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface StatCardProps {
  title: string
  value: number
  subtitle?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue'
}) => {
  const getColorStyles = (color: string) => {
    switch (color) {
      case 'green':
        return {
          container: '#f0fdf4',
          border: '#22c55e',
          text: '#16a34a',
          value: '#15803d',
        }
      case 'purple':
        return {
          container: '#faf5ff',
          border: '#a855f7',
          text: '#9333ea',
          value: '#7c3aed',
        }
      case 'orange':
        return {
          container: '#fff7ed',
          border: '#f97316',
          text: '#ea580c',
          value: '#c2410c',
        }
      default: // blue
        return {
          container: '#eff6ff',
          border: '#3b82f6',
          text: '#2563eb',
          value: '#1d4ed8',
        }
    }
  }

  const colors = getColorStyles(color)

  return (
    <View style={[styles.container, { backgroundColor: colors.container, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      <Text style={[styles.value, { color: colors.value }]}>{value}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.text }]}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  iconContainer: {
    marginLeft: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
})

export default StatCard
