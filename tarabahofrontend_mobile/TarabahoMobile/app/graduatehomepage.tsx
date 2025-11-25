import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Linking,
  Modal,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';

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
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [showSimplifiedView, setShowSimplifiedView] = useState(false);
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  


  // Helper function to generate date range with labels
  const generateDateRange = (range: 'week' | 'month' | 'year') => {
    const today = new Date();
    const dates: ViewTrend[] = [];
    
    switch (range) {
      case 'week':
        // Last 7 days (including today)
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
        
      case 'month':
        // Last 30 days, but only show last 3 days if no views (similar to web implementation)
        const hasViews = viewTrends.some(item => parseInt(item.views.toString()) > 0);
        const daysToShow = hasViews ? 30 : 7; // Show at least 7 days for mobile
        
        for (let i = daysToShow - 1; i >= 0; i--) {
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
        
      case 'year':
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const label = date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
          dates.push({
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: label,
            views: 0
          });
        }
        break;
        
      default:
        // Default to week
        return generateDateRange('week');
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
    
    // For year view - filter out zero views for bar chart only
    if (timeRange === 'year' && chartType === 'bar') {
      return merged.filter(item => item.views > 0);
    }
    
    return merged;
  };

  // Fetch view trends
  const fetchViewTrends = useCallback(async (portfolioId: number, authToken: string, range: 'week' | 'month' | 'year') => {
    if (!portfolioId || !authToken) {
      return;
    }
    
    setTrendsLoading(true);
    
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

  // Set Android navigation bar color
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#ffffff');
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, []);

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

  // Debug logging for chart data
  useEffect(() => {
    console.log('📊 Chart Debug Info:');
    console.log('- viewTrends length:', viewTrends?.length);
    console.log('- chartData exists:', !!chartData);
    console.log('- viewStats:', viewStats);
    console.log('- portfolio ID:', portfolio?.id);
    if (viewTrends?.length > 0) {
      console.log('- Sample trend data:', viewTrends[0]);
      console.log('- Total views in trends:', viewTrends.reduce((sum, t) => sum + t.views, 0));
    }
  }, [viewTrends, chartData, viewStats, portfolio]);

  // Time range options - Define before early returns
  const timeRangeOptions = [
    { value: 'week', label: 'Last 7 Days', icon: <Ionicons name="time-outline" size={18} color="#6b7280" /> },
    { value: 'month', label: 'This Month', icon: <Ionicons name="calendar-outline" size={18} color="#6b7280" /> },
    { value: 'year', label: 'This Year', icon: <Ionicons name="stats-chart-outline" size={18} color="#6b7280" /> },
  ];

  // Chart type options - Define before early returns
  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart', icon: <Ionicons name="trending-up-outline" size={18} color="#6b7280" /> },
    { value: 'bar', label: 'Bar Chart', icon: <Ionicons name="bar-chart-outline" size={18} color="#6b7280" /> },
  ];

  // Render loading state without early return
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }} edges={['top']}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={theme.colors.background}
        />
        <View style={viewStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={textStyles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state without early return
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }} edges={['top']}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={theme.colors.background}
        />
        <View style={viewStyles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={textStyles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={fetchInitialData} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }} edges={['top']}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ 
          paddingBottom: 0,
        }}
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
            {/* Statistics Cards - Mobile-optimized grid */}
            <View style={viewStyles.statsSection}>
              <Text style={textStyles.sectionTitle}>Portfolio Analytics</Text>
              
              <View style={viewStyles.statsGrid}>
                <View style={[viewStyles.statCard, viewStyles.statCardPrimary]}>
                  <View style={viewStyles.statIconContainer}>
                    <Ionicons name="time-outline" size={28} color="#ffffff" />
                  </View>
                  <View style={viewStyles.statContent}>
                    <Text style={textStyles.statValue}>{viewStats?.weeklyViews ?? 0}</Text>
                    <Text style={textStyles.statLabel}>Last 7 Days</Text>
                    <Text style={textStyles.statDescription}>
                      {(viewStats?.weeklyViews ?? 0) > 0 ? 'Recent activity' : 'No recent views'}
                    </Text>
                  </View>
                </View>

                <View style={[viewStyles.statCard, viewStyles.statCardSecondary]}>
                  <View style={[viewStyles.statIconContainer, { backgroundColor: '#3b82f6' }]}>
                    <Ionicons name="calendar-outline" size={28} color="#ffffff" />
                  </View>
                  <View style={viewStyles.statContent}>
                    <Text style={[textStyles.statValue, { color: '#3b82f6' }]}>
                      {viewStats?.monthlyViews ?? 0}
                    </Text>
                    <Text style={textStyles.statLabel}>This Month</Text>
                    <Text style={textStyles.statDescription}>
                      {(viewStats?.monthlyViews ?? 0) > 0 ? 'Monthly total' : 'Start sharing'}
                    </Text>
                  </View>
                </View>

                <View style={[viewStyles.statCard, viewStyles.statCardSecondary]}>
                  <View style={[viewStyles.statIconContainer, { backgroundColor: '#8b5cf6' }]}>
                    <Ionicons name="eye-outline" size={28} color="#ffffff" />
                  </View>
                  <View style={viewStyles.statContent}>
                    <Text style={[textStyles.statValue, { color: '#8b5cf6' }]}>
                      {viewStats?.yearlyViews ?? 0}
                    </Text>
                    <Text style={textStyles.statLabel}>All Time</Text>
                    <Text style={textStyles.statDescription}>
                      {(viewStats?.yearlyViews ?? 0) > 0 ? 'Total views' : 'Build presence'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Chart Section - Clean Single Card */}
            <View style={viewStyles.chartCard}>
              {/* Header with Period Badge */}
              <View style={viewStyles.chartHeader}>
                <Text style={textStyles.sectionTitle}>Portfolio Views</Text>
                <View style={viewStyles.periodBadge}>
                  <Text style={textStyles.periodBadgeText}>
                    {timeRangeOptions.find(option => option.value === timeRange)?.label}
                  </Text>
                </View>
              </View>

              {/* Quick Stats Row */}
              <View style={viewStyles.quickStats}>
                <View style={viewStyles.quickStatItem}>
                  <Text style={textStyles.quickStatValue}>{viewTrends.length}</Text>
                  <Text style={textStyles.quickStatLabel}>Points</Text>
                </View>
                <View style={viewStyles.quickStatItem}>
                  <Text style={textStyles.quickStatValue}>
                    {viewTrends.reduce((sum, item) => sum + item.views, 0)}
                  </Text>
                  <Text style={textStyles.quickStatLabel}>Total Views</Text>
                </View>
                {trendsLoading && (
                  <View style={viewStyles.quickStatItem}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={textStyles.quickStatLabel}>Loading</Text>
                  </View>
                )}
              </View>

              {/* Chart Display Area */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[textStyles.controlTitle, { fontSize: 18, fontWeight: '700' }]}>Portfolio Analytics</Text>
              </View>
              
              {chartData && chartData.datasets && chartData.datasets.length > 0 ? (
                <View style={viewStyles.chartDisplay}>
                  <Chart
                    data={{
                      labels: (() => {
                        // Smart label formatting and limiting for mobile
                        const labels = chartData.labels;
                        let step = 1;
                        let maxLabels = 6;
                        
                        if (timeRange === 'year') {
                          step = 1;
                          maxLabels = 6;
                        } else if (timeRange === 'month') {
                          step = Math.ceil(labels.length / maxLabels);
                        } else {
                          step = Math.ceil(labels.length / maxLabels);
                        }
                        
                        return labels.map((label, idx) => {
                          if (idx % step !== 0) return '';
                          
                          // Format labels for mobile readability
                          if (timeRange === 'year') {
                            // Format: "Jan '25"
                            const parts = label.split(' ');
                            if (parts.length >= 2) {
                              const month = parts[0];
                              const year = parts[1].slice(-2);
                              return `${month} '${year}`;
                            }
                            return label;
                          } else {
                            // Format: "Aug 15" -> "Aug 15"
                            const parts = label.split(' ');
                            if (parts.length >= 3) {
                              return `${parts[1]} ${parts[2]}`;
                            }
                            return label.length > 8 ? label.split(' ')[0] : label;
                          }
                        });
                      })(),
                      datasets: chartData.datasets,
                    }}
                    type={chartType}
                    height={260}
                    loading={trendsLoading}
                    rotateLabels={true}
                    formatXLabel={(label) => label}
                  />
                  {viewTrends.every(trend => trend.views === 0) && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <Text style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
                        No views recorded yet. Share your portfolio to start tracking!
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={viewStyles.chartLoadingState}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={textStyles.loadingText}>Loading chart...</Text>
                </View>
              )}

              {/* Controls Section */}
              <View style={viewStyles.controlsSection}>
                {/* Dropdown for Time Period */}
                <View style={viewStyles.dropdownContainer}>
                  <Text style={textStyles.controlTitle}>Time Period</Text>
                  <TouchableOpacity
                    style={viewStyles.dropdown}
                    onPress={() => setShowTimeRangeModal(true)}
                  >
                    <View style={viewStyles.dropdownContent}>
                      <View style={viewStyles.dropdownIcon}>
                        {timeRangeOptions.find(opt => opt.value === timeRange)?.icon}
                      </View>
                      <Text style={textStyles.dropdownText}>
                        {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
                    </View>
                  </TouchableOpacity>
                </View>
                
                {/* Full-width segmented control for chart type */}
                <View style={viewStyles.chartTypeContainer}>
                  <Text style={textStyles.controlTitle}>Chart Type</Text>
                  <View style={viewStyles.segmentedControl}>
                    {chartTypeOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          viewStyles.segmentedOption,
                          chartType === option.value && viewStyles.segmentedOptionActive
                        ]}
                        onPress={() => setChartType(option.value as 'line' | 'bar')}
                      >
                        {option.icon}
                        <Text style={[
                          textStyles.segmentedOptionText,
                          chartType === option.value && textStyles.segmentedOptionTextActive
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
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


        
        {/* Sticky View Portfolio Button */}
        {portfolio && (
          <View style={viewStyles.stickyButtonContainer}>
              <TouchableOpacity 
                style={viewStyles.stickyActionButton}
                onPress={() => router.push('/portfolio')}
              >
                <Ionicons name="eye-outline" size={24} color="#ffffff" />
                <Text style={textStyles.stickyButtonText}>View Portfolio</Text>
                <Ionicons name="chevron-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
          </View>
        )}
        
        {/* Bottom Navigation */}
        <View style={viewStyles.bottomNavContainer}>
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
        </View>
      </ScrollView>
      
      {/* Time Range Modal */}
      <Modal
        visible={showTimeRangeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeRangeModal(false)}
      >
        <Pressable 
          style={viewStyles.modalOverlay}
          onPress={() => setShowTimeRangeModal(false)}
        >
          <View style={viewStyles.modalContent}>
            <View style={viewStyles.modalHeader}>
              <Text style={textStyles.modalTitle}>Select Time Period</Text>
              <TouchableOpacity onPress={() => setShowTimeRangeModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            {timeRangeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  viewStyles.modalOption,
                  timeRange === option.value && viewStyles.modalOptionActive
                ]}
                onPress={() => {
                  setTimeRange(option.value as 'week' | 'month' | 'year');
                  setShowTimeRangeModal(false);
                }}
              >
                <View style={viewStyles.modalOptionIcon}>
                  {option.icon}
                </View>
                <Text style={[
                  textStyles.modalOptionText,
                  timeRange === option.value && textStyles.modalOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {timeRange === option.value && (
                  <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
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
  rootContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  
  // Statistics Section
  statsSection: {
    marginBottom: theme.spacing.xxl,
  },
  statsGrid: {
    gap: theme.spacing.lg,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.md,
    minHeight: 100,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  statCardSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: '#e5e7eb',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  statContent: {
    flex: 1,
  },

  // Chart Card - Single Clean Container
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  periodBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartDisplay: {
    marginVertical: theme.spacing.md,
    minHeight: 280,
    // Remove extra padding to make chart more responsive
    marginHorizontal: -theme.spacing.sm,
  },
  controlsSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  dropdownContainer: {
    gap: theme.spacing.sm,
  },
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
    ...theme.shadows.sm,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dropdownIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  controlScroll: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  chartTypeContainer: {
    gap: theme.spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    padding: 4,
  },
  segmentedOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
    gap: theme.spacing.xs,
    minHeight: 44,
  },
  segmentedOptionActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  chartEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  chartLoadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    minHeight: 300,
    gap: theme.spacing.md,
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

  // Sticky Action Button
  stickyButtonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },

  stickyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
    minHeight: 56,
  },

  // Share Portfolio Section
  shareSection: {
    marginTop: 0,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  shareButtonsContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.sm,
    minHeight: 44,
    ...theme.shadows.sm,
  },
  shareButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  shareButtonSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  shareTokenContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: '#f0f9ff',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  shareTokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  regenerateTokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.xs,
  },

  // Action Section (legacy)
  actionSection: {
    marginTop: theme.spacing.lg,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
    minHeight: 56,
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

  // Bottom Navigation
  bottomNavContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    ...theme.shadows.lg,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
    paddingBottom: 0,
    marginBottom: 0,
  },

  bottomNav: {
    flexDirection: 'row',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    minHeight: 60,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    minWidth: 80,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.lg,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalOptionActive: {
    backgroundColor: theme.colors.primary + '10',
  },
  modalOptionIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Section Titles
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  
  // Stats
  statValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statDescription: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: theme.colors.text.secondary,
  },

  // Chart Text Styles
  periodBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: '#ffffff',
  },
  quickStatValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
  },
  quickStatLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  controlTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    minWidth: 80,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
  },
  emptyTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 200,
  },
  emptyActionText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: '#ffffff',
  },
  emptyStateTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  emptyStateButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: '#ffffff',
  },

  primaryActionText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: '#ffffff',
  },

  // Empty States (legacy - for create portfolio section)
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

  // Text Styles
  segmentedOptionText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '500',
    textAlign: 'center',
  },
  segmentedOptionTextActive: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  stickyButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
  },

  // Share Section Text Styles
  shareSectionTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  shareSectionSubtitle: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.body2.lineHeight,
  },
  shareButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '600',
  },
  shareButtonTextSecondary: {
    color: theme.colors.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '600',
  },
  shareTokenTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  regenerateTokenText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  shareTokenText: {
    fontSize: theme.typography.body2.fontSize,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  shareTokenNote: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  
  // Modal Text Styles
  modalTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight,
    color: theme.colors.text.primary,
  },
  modalOptionText: {
    flex: 1,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
  },
  modalOptionTextActive: {
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.primary,
  },
});
