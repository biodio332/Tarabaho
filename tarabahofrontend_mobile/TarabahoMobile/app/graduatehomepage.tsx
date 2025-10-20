import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import Button from '@/components/ui/Button';
import Chart from '@/components/ui/Chart';
import StatCard from '@/components/ui/StatCard';
import ToggleGroup from '@/components/ui/ToggleGroup';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface ViewStats {
  weeklyViews: number;
  monthlyViews: number;
  yearlyViews: number;
}

interface ViewTrend {
  date: string;
  label: string;
  views: number;
}

interface GraduateData {
  id: number;
  firstName: string;
  username: string;
  isVerified: boolean;
}

interface Portfolio {
  id: number;
}

export default function GraduateHomepage() {
  const router = useRouter();
  
  // State management
  const [graduateData, setGraduateData] = useState<GraduateData | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  const [viewTrends, setViewTrends] = useState<ViewTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  
  // Chart controls
  const [timeRange, setTimeRange] = useState<'3d' | '7d' | '30d' | 'month' | 'year'>('7d');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [showSimplifiedView, setShowSimplifiedView] = useState(false);

  // Helper function to generate date range with labels
  const generateDateRange = (range: '3d' | '7d' | '30d' | 'month' | 'year') => {
    const today = new Date();
    const dates: ViewTrend[] = [];
    
    switch (range) {
      case '3d':
        // Last 3 days
        for (let i = 2; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const label = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          dates.push({
            date: date.toISOString().split('T')[0],
            label: label,
            views: 0
          });
        }
        break;

      case '7d':
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const label = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          dates.push({
            date: date.toISOString().split('T')[0],
            label: label,
            views: 0
          });
        }
        break;
        
      case '30d':
        // Last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const label = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          dates.push({
            date: date.toISOString().split('T')[0],
            label: label,
            views: 0
          });
        }
        break;
        
      case 'month':
        // Current month
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        for (let i = 0; i < daysInMonth; i++) {
          const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
          const label = date.toLocaleDateString('en-US', { 
            day: 'numeric' 
          });
          dates.push({
            date: date.toISOString().split('T')[0],
            label: label,
            views: 0
          });
        }
        break;
        
      case 'year':
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const label = date.toLocaleDateString('en-US', { 
            month: 'short'
          });
          dates.push({
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: label,
            views: 0
          });
        }
        break;
    }
    
    return dates;
  };

  // Helper function to merge backend data with date range
  const mergeWithBackendData = (backendData: any[], dateRange: ViewTrend[]) => {
    const merged = dateRange.map(rangeItem => {
      const backendItem = backendData.find(item => item.date === rangeItem.date);
      return {
        ...rangeItem,
        views: backendItem ? parseInt(backendItem.views) || 0 : rangeItem.views
      };
    });
    
    // For year/month view - filter out zero views for bar chart only
    if ((timeRange === 'year' || timeRange === 'month') && chartType === 'bar') {
      return merged.filter(item => item.views > 0);
    }
    
    return merged;
  };

  // Fetch view trends
  const fetchViewTrends = useCallback(async (portfolioId: number, authToken: string, range: '3d' | '7d' | '30d' | 'month' | 'year') => {
    if (!portfolioId || !authToken) {
      console.warn("Cannot fetch trends: missing portfolioId or token");
      return;
    }
    
    setTrendsLoading(true);
    console.log(`🔄 Fetching view trends for portfolio ${portfolioId}, range: ${range}`);
    
    try {
      const trendsResponse = await fetch(
        `${BACKEND_URL}/api/portfolio-view/trends/${portfolioId}?period=${range}`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      if (!trendsResponse.ok) {
        throw new Error(`HTTP ${trendsResponse.status}: ${trendsResponse.statusText}`);
      }
      
      const trendsData = await trendsResponse.json();
      console.log("✅ View trends response:", trendsData);
      
      // Format the data for Chart.js - handle both single object and array responses
      let backendData: any[] = [];
      if (Array.isArray(trendsData)) {
        backendData = trendsData.map(item => ({
          date: item.date,
          views: parseInt(item.views) || 0
        }));
      } else if (trendsData && trendsData.date) {
        // Single item case
        backendData = [{
          date: trendsData.date,
          views: parseInt(trendsData.views) || 0
        }];
      }
      
      // Generate complete date range and merge with backend data
      const dateRange = generateDateRange(range);
      const mergedData = mergeWithBackendData(backendData, dateRange);
      
      console.log("📊 Merged trends data:", mergedData);
      setViewTrends(mergedData);
    } catch (trendsErr: any) {
      console.error("❌ Failed to fetch view trends:", trendsErr.message);
      
      if (trendsErr.message.includes('401') || trendsErr.message.includes('403')) {
        console.log("🔐 Token expired during trends fetch, redirecting to login");
        setError("Session expired. Please sign in again.");
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username']);
        router.replace('/logingraduate');
      }
      
      // Generate empty date range for no data state
      const emptyDateRange = generateDateRange(range);
      setViewTrends(emptyDateRange);
    } finally {
      setTrendsLoading(false);
      console.log("✅ Trends fetch complete for range:", range);
    }
  }, [timeRange, chartType]);

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    console.log("🟢 Initial page load - fetching all data");

    try {
      const username = await AsyncStorage.getItem('username');
      const storedToken = await AsyncStorage.getItem('authToken');
      
      if (!username || !storedToken) {
        console.log("❌ No username or token found, redirecting to login");
        setError("User not logged in. Please sign in.");
        router.replace('/logingraduate');
        return;
      }

      setToken(storedToken);
      console.log("✅ Using stored token for authentication");

      // Fetch graduate data
      console.log("👤 Fetching graduate profile");
      const graduateResponse = await fetch(
        `${BACKEND_URL}/api/graduate/username/${username}`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      if (!graduateResponse.ok) {
        throw new Error(`Graduate fetch failed: ${graduateResponse.status}`);
      }
      
      const graduateData = await graduateResponse.json();
      console.log("✅ Graduate data received:", graduateData);

      if (graduateData) {
        setGraduateData(graduateData);
        await AsyncStorage.setItem('username', graduateData.username);

        // Fetch portfolio data
        console.log("📁 Fetching portfolio");
        let portfolioData = null;
        try {
          const portfolioResponse = await fetch(
            `${BACKEND_URL}/api/portfolio/graduate/${graduateData.id}/portfolio`,
            {
              method: 'GET',
              headers: { 
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
              },
            }
          );
          
          if (portfolioResponse.ok) {
            portfolioData = await portfolioResponse.json();
            console.log("✅ Portfolio data received:", portfolioData);
            setPortfolio(portfolioData);
          } else if (portfolioResponse.status === 404) {
            console.log("ℹ️ No portfolio found for graduate ID:", graduateData.id);
            setPortfolio(null);
          } else {
            throw new Error(`Portfolio fetch failed: ${portfolioResponse.status}`);
          }
        } catch (portfolioErr: any) {
          console.error("⚠️ Portfolio fetch error:", portfolioErr.message);
          setPortfolio(null);
        }

        // Fetch view statistics if portfolio exists
        if (portfolioData && portfolioData.id) {
          console.log("📊 Fetching view statistics");
          try {
            const viewStatsResponse = await fetch(
              `${BACKEND_URL}/api/portfolio-view/stats/${portfolioData.id}`,
              {
                method: 'GET',
                headers: { 
                  'Authorization': `Bearer ${storedToken}`,
                  'Content-Type': 'application/json'
                },
              }
            );
            
            if (viewStatsResponse.ok) {
              const viewStatsData = await viewStatsResponse.json();
              console.log("✅ View stats received:", viewStatsData);
              setViewStats(viewStatsData);
            } else {
              console.error("⚠️ Failed to fetch view stats:", viewStatsResponse.status);
              setViewStats({ weeklyViews: 0, monthlyViews: 0, yearlyViews: 0 });
            }

            // Fetch initial view trends
            console.log("📈 Fetching initial view trends for period:", timeRange);
            await fetchViewTrends(portfolioData.id, storedToken, timeRange);
          } catch (viewStatsErr: any) {
            console.error("⚠️ Failed to fetch view stats:", viewStatsErr.message);
            setViewStats({ weeklyViews: 0, monthlyViews: 0, yearlyViews: 0 });
          }
        }
      } else {
        console.log("❌ Graduate profile not found");
        setError("Graduate profile not found");
      }
    } catch (err: any) {
      console.error("💥 Initial data fetch error:", err.message);
      if (err.message.includes('401') || err.message.includes('403')) {
        console.log("❌ Unauthorized request, token expired or invalid");
        setError("Session expired. Please sign in again.");
        await AsyncStorage.multiRemove(['authToken', 'isLoggedIn', 'userType', 'username']);
        router.replace('/logingraduate');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
      console.log("✅ Initial page load complete");
    }
  }, [router, timeRange, fetchViewTrends]);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Refetch trends when chart period changes
  useEffect(() => {
    if (portfolio && token) {
      console.log("📈 Time range changed to:", timeRange);
      fetchViewTrends(portfolio.id, token, timeRange);
    }
  }, [timeRange, portfolio, token, fetchViewTrends]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchInitialData();
    setIsRefreshing(false);
  }, [fetchInitialData]);

  // Navigation functions can be added here as needed

  // Prepare chart data
  const chartData = viewTrends && viewTrends.length > 0 ? {
    labels: viewTrends.map(item => item.label),
    datasets: [{
      data: viewTrends.map(item => item.views),
    }],
  } : null;

  // Time range options
  const timeRangeOptions = [
    { value: '3d', label: '3 Days', icon: <Ionicons name="time-outline" size={16} color="#6b7280" /> },
    { value: '7d', label: '7 Days', icon: <Ionicons name="calendar-outline" size={16} color="#6b7280" /> },
    { value: '30d', label: '30 Days', icon: <Ionicons name="calendar-outline" size={16} color="#6b7280" /> },
    { value: 'month', label: 'This Month', icon: <Ionicons name="calendar-outline" size={16} color="#6b7280" /> },
    { value: 'year', label: 'Last Year', icon: <Ionicons name="calendar-outline" size={16} color="#6b7280" /> },
  ];

  // Chart type options
  const chartTypeOptions = [
    { value: 'line', label: 'Line', icon: <Ionicons name="trending-up-outline" size={16} color="#6b7280" /> },
    { value: 'bar', label: 'Bar', icon: <Ionicons name="bar-chart-outline" size={16} color="#6b7280" /> },
  ];

  if (isLoading) {
    return (
      <View style={viewStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={textStyles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={viewStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={textStyles.errorText}>{error}</Text>
        <Button title="Try Again" onPress={fetchInitialData} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={viewStyles.safeArea}>
        <ScrollView
          style={viewStyles.container}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }>
        {/* Header - Enhanced Typography */}
        <View style={viewStyles.header}>
          <View style={viewStyles.headerContent}>
            <View style={viewStyles.avatarContainer}>
              <View style={viewStyles.avatarIconWrapper}>
                <Ionicons name="briefcase-outline" size={32} color="#2563eb" />
              </View>
            </View>
            <View style={viewStyles.headerText}>
              <Text style={textStyles.welcomeText}>
                Welcome back{graduateData?.firstName ? `, ${graduateData.firstName}` : ''}
              </Text>
              <Text style={textStyles.subtitleText}>
                Track your professional growth and engagement
              </Text>
            </View>
          </View>
        </View>

        {portfolio ? (
          <View style={viewStyles.dashboard}>
            {/* Statistics Cards - Modern grid layout */}
            <View style={viewStyles.statsGrid}>
              <View style={[viewStyles.statCard, viewStyles.statCardHighlight]}>
                <View style={viewStyles.statHeader}>
                  <Text style={textStyles.statTitle}>Last 7 days</Text>
                  <View style={[viewStyles.statIconWrapper, { backgroundColor: '#dcfce7' }]}>
                    <Ionicons name="time-outline" size={24} color="#16a34a" />
                  </View>
                </View>
                <Text style={textStyles.statValue}>{viewStats?.weeklyViews ?? 0}</Text>
                <Text style={textStyles.statSubtitle}>
                  {(viewStats?.weeklyViews ?? 0) > 0 
                    ? 'Active visitors this week' 
                    : 'Share your portfolio to get noticed'}
                </Text>
                {(viewStats?.weeklyViews ?? 0) > 0 && (
                  <View style={viewStyles.trendIndicator}>
                    <Ionicons name="trending-up" size={16} color="#16a34a" />
                    <Text style={textStyles.trendText}>Active Week</Text>
                  </View>
                )}
              </View>

              <View style={[viewStyles.statCard, viewStyles.statCardSecondary]}>
                <View style={viewStyles.statHeader}>
                  <Text style={textStyles.statTitle}>This month</Text>
                  <View style={[viewStyles.statIconWrapper, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="calendar-outline" size={24} color="#2563eb" />
                  </View>
                </View>
                <Text style={[textStyles.statValue, { color: theme.colors.primary }]}>
                  {viewStats?.monthlyViews ?? 0}
                </Text>
                <Text style={textStyles.statSubtitle}>
                  {(viewStats?.monthlyViews ?? 0) > 0 
                    ? 'Total monthly engagement' 
                    : 'Start building your presence'}
                </Text>
              </View>

              <View style={[viewStyles.statCard, viewStyles.statCardSecondary]}>
                <View style={viewStyles.statHeader}>
                  <Text style={textStyles.statTitle}>All time</Text>
                  <View style={[viewStyles.statIconWrapper, { backgroundColor: '#f3e8ff' }]}>
                    <Ionicons name="eye-outline" size={24} color="#9333ea" />
                  </View>
                </View>
                <Text style={[textStyles.statValue, { color: '#9333ea' }]}>
                  {viewStats?.yearlyViews ?? 0}
                </Text>
                <Text style={textStyles.statSubtitle}>
                  {(viewStats?.yearlyViews ?? 0) > 0 
                    ? 'Career profile views' 
                    : 'Time to shine — create content!'}
                </Text>
              </View>
            </View>

            {/* Chart Section - Clean, modern card */}
            <View style={viewStyles.chartCard}>
              <View style={viewStyles.chartHeader}>
                <Text style={textStyles.chartTitle}>Portfolio View Trends</Text>
                <Text style={textStyles.chartSubtitle}>
                  {viewTrends.length} data points • {viewTrends.reduce((sum, item) => sum + item.views, 0)} total views
                  {trendsLoading && ' • updating...'}
                </Text>
                
                <View style={viewStyles.chartControls}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                  >
                    <ToggleGroup
                      options={timeRangeOptions}
                      value={timeRange}
                      onValueChange={(value) => setTimeRange(value as '3d' | '7d' | '30d' | 'month' | 'year')}
                      variant="compact"
                    />
                  </ScrollView>
                  
                  <ToggleGroup
                    options={chartTypeOptions}
                    value={chartType}
                    onValueChange={(value) => setChartType(value as 'line' | 'bar')}
                    variant="compact"
                  />
                </View>
              </View>

              {/* Chart with empty state handling */}
              <View style={viewStyles.chartWrapper}>
                {chartData ? (
                  viewTrends.some(trend => trend.views > 0) ? (
                    <Chart
                      data={{
                        labels: (() => {
                          const step = timeRange === 'year' ? 1 : timeRange === 'month' ? 3 : timeRange === '30d' ? 3 : 2;
                          return chartData.labels.map((label, idx) => (idx % step === 0 ? label : ''));
                        })(),
                        datasets: chartData.datasets,
                      }}
                      type={chartType}
                      height={240}
                      loading={trendsLoading}
                      rotateLabels={timeRange !== '3d'}
                      formatXLabel={(label) => label.split(' ').join('\n')}
                    />
                  ) : (
                    <View style={viewStyles.chartEmptyState}>
                      <Ionicons name="analytics-outline" size={48} color={theme.colors.text.tertiary} />
                      <Text style={textStyles.chartEmptyTitle}>No Portfolio Views Yet</Text>
                      <Text style={textStyles.chartEmptyText}>
                        Share your portfolio with potential employers to start tracking engagement.
                        Keep your profile updated to increase visibility!
                      </Text>
                      <View style={viewStyles.chartEmptyActions}>
                        <Button
                          title="Share Portfolio"
                          onPress={() => router.push('/portfolio')}
                          variant="outline"
                        />
                      </View>
                    </View>
                  )
                ) : (
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                )}
              </View>

              {/* Action Button */}
              <View style={viewStyles.actionButtonsRow}>
                <Button
                  title="View Portfolio"
                  onPress={() => router.push('/portfolio')}
                  variant="primary"
                  style={viewStyles.primaryButton}
                  textStyle={textStyles.buttonTextPrimary}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={viewStyles.emptyState}>
            <View style={viewStyles.centeredContent}>
              <Text style={textStyles.emptyStateTitle}>Create Your Portfolio</Text>
              <Text style={textStyles.emptyStateText}>
                Showcase your skills and start getting discovered by potential employers
              </Text>
              <Button
                title="CREATE PORTFOLIO"
                onPress={() => router.push('/createportfolio')}
                variant="primary"
                style={viewStyles.createPortfolioButton}
                textStyle={textStyles.buttonTextPrimary}
              />
            </View>
          </View>
        )}
        </ScrollView>
      </SafeAreaView>
      
      {/* Bottom Navigation - Fixed at bottom */}
      <View style={viewStyles.bottomNavContainer}>
        <SafeAreaView style={viewStyles.bottomNavSafeArea}>
          <View style={viewStyles.bottomNav}>
            <TouchableOpacity 
              style={viewStyles.bottomNavItem} 
              onPress={() => router.push('/graduatehomepage')}
            >
              <Ionicons name="home" size={24} color={theme.colors.primary} />
              <Text style={textStyles.bottomNavText}>Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={viewStyles.bottomNavItem} 
              onPress={() => router.push('/graduateprofile')}
            >
              <Ionicons name="settings-outline" size={24} color={theme.colors.text.secondary} />
              <Text style={textStyles.bottomNavTextInactive}>Settings</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

import { ViewStyle, TextStyle } from 'react-native';

// Theme constants
const theme = {
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: {
      primary: '#1f2937',
      secondary: '#64748b',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    border: {
      light: '#e2e8f0',
      default: '#cbd5e1',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  typography: {
    heading1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: 'bold',
    },
    heading2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: 'bold',
    },
    heading3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: 'normal',
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 'normal',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

const viewStyles = StyleSheet.create<Record<string, ViewStyle>>({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    // Add padding to account for the bottom navigation bar plus safe area
    paddingBottom: Platform.OS === 'ios' ? 90 : 70,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  loadingIndicator: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  errorContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    ...theme.shadows.lg,
  },

  // Header
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.xl + (StatusBar.currentHeight || 0),
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.xl,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.success,
    borderRadius: theme.radii.full,
    padding: 4,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  headerText: {
    flex: 1,
  },

  // Dashboard
  dashboard: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  statsGrid: {
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.md,
  },
  statCardHighlight: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  statCardSecondary: {
    backgroundColor: theme.colors.surface,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },

  // Chart Card
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.lg,
  },
  chartHeader: {
    marginBottom: theme.spacing.xl,
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  chartWrapper: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    minHeight: 240,
  },
  chartEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  chartEmptyActions: {
    marginTop: theme.spacing.lg,
  },

  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  createPortfolioButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    ...theme.shadows.md,
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.shadows.md,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    minWidth: 140,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  destructiveButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: 0.8,
  },

  // Logout Section
  // Bottom Navigation
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    ...theme.shadows.lg,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
    // Handle iPhone X+ bottom area
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  bottomNavSafeArea: {
    backgroundColor: theme.colors.surface,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingTop: theme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    minWidth: 80,
  },
});

const textStyles = StyleSheet.create<Record<string, TextStyle>>({
  // Loading State
  loadingText: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    fontWeight: 'normal' as const,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  loadingIndicatorText: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: 'normal' as const,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.md,
  },

  // Error State
  errorText: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    fontWeight: 'normal' as const,
    color: theme.colors.danger,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },

  // Header
  welcomeText: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    fontWeight: '400' as const,
    color: theme.colors.text.secondary,
    letterSpacing: 0.1,
  },

  // Stats
  statTitle: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.xs,
  },
  statSubtitle: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: 'normal' as const,
    color: theme.colors.text.secondary,
  },
  trendText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: '#16a34a',
    marginLeft: theme.spacing.xs,
  },

  // Chart
  chartTitle: {
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  chartSubtitle: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: 'normal' as const,
    color: theme.colors.text.secondary,
  },
  chartEmptyTitle: {
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  chartEmptyText: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight * 1.2,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
  },

  // Empty States
  emptyStateTitle: {
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    fontWeight: 'normal' as const,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },

  // Button Text Styles
  buttonTextPrimary: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.inverse,
  },
  buttonTextSecondary: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.primary,
  },
  buttonTextOutline: {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
  },
  buttonTextDestructive: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.danger,
  },
  // Bottom Nav Text Styles
  bottomNavText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  bottomNavTextInactive: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
});


