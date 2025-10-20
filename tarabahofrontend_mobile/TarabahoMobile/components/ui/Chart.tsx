import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native'
import { LineChart, BarChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width

interface ChartData {
  labels: string[]
  datasets: Array<{
    data: number[]
    color?: (opacity: number) => string
    strokeWidth?: number
  }>
}

interface ChartDimensions {
  width: number
  minWidth: number
  height: number
}

interface ChartProps {
  data: ChartData | null
  type: 'line' | 'bar'
  height?: number
  loading?: boolean
  timeRange?: string
  onTimeRangeChange?: (range: string) => void
  simplified?: boolean
}

interface ChartProps {
  data: ChartData | null
  type: 'line' | 'bar'
  height?: number
  title?: string
  subtitle?: string
  loading?: boolean
  formatXLabel?: (label: string) => string
  rotateLabels?: boolean
}

const Chart: React.FC<ChartProps> = ({
  data,
  type,
  height = 220,
  title,
  subtitle,
  loading = false,
  formatXLabel,
  rotateLabels = false
}) => {
  // Calculate width based on data points
  const chartWidth = useMemo(() => {
    if (!data?.labels) return screenWidth - 32;
    const minWidth = screenWidth - 32; // Default width with padding
    const widthPerDataPoint = 50; // Minimum width per data point
    const calculatedWidth = data.labels.length * widthPerDataPoint;
    return Math.max(minWidth, calculatedWidth);
  }, [data?.labels]);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
      paddingRight: 16, // Add extra padding for rotated labels
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3b82f6',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
    barPercentage: 0.7,
    categoryPercentage: 0.8,
    formatXLabel: formatXLabel || ((label) => label),
    horizontalLabelRotation: rotateLabels ? -45 : 0,
    verticalLabelRotation: 0,
    formatYLabel: (value: string) => Math.round(parseFloat(value)).toString(),
    propsForLabels: {
      fontSize: 10,
      fontWeight: '500',
    },
  }

  if (loading) {
    return (
      <View style={[styles.container, { height }]}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={[styles.chartContainer, { height: height - 60 }]}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading chart...</Text>
          </View>
        </View>
      </View>
    )
  }

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={[styles.chartContainer, { height: height - 60 }]}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
            <Text style={styles.emptySubtext}>Share your portfolio to start tracking views</Text>
          </View>
        </View>
      </View>
    )
  }

  // Calculate chart dimensions
  const dimensions = useMemo((): ChartDimensions => {
    if (!data?.labels) {
      return {
        width: screenWidth - 32,
        minWidth: screenWidth - 32,
        height: height - 80
      };
    }
    const minWidth = screenWidth - 32;
    const widthPerPoint = 50; // Minimum width per data point
    const calculatedWidth = Math.max(minWidth, data.labels.length * widthPerPoint);
    
    return {
      width: calculatedWidth,
      minWidth,
      height: height - 80
    };
  }, [data?.labels, height]);

  return (
    <View style={[styles.container, { height }]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View style={[styles.chartContainer, { height: dimensions.height }]}>
          {type === 'line' ? (
            <LineChart
              data={data}
              width={dimensions.width}
              height={dimensions.height}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withHorizontalLines={true}
              yAxisInterval={1}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
            />
          ) : (
            <BarChart
              data={data}
              width={dimensions.width}
              height={dimensions.height}
              chartConfig={chartConfig}
              style={styles.chart}
              withInnerLines={true}
              showBarTops={false}
              showValuesOnTopOfBars={false}
              yAxisInterval={1}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderWidth: 3,
    borderColor: '#e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: 16,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
})

export default Chart
