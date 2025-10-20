import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ImageBackground,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');

export default function UserHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [graduates, setGraduates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [popularGraduates, setPopularGraduates] = useState<any[]>([]);

  useEffect(() => {
    console.log('UserHomePage - useEffect triggered, loading data...');
    loadUserData();
    loadPopularGraduates();
  }, []);

  const loadUserData = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      const userType = await AsyncStorage.getItem('userType');
      const username = await AsyncStorage.getItem('username');
      const authToken = await AsyncStorage.getItem('authToken');
      
      console.log('UserHomePage - Auth check:', { isLoggedIn, userType, username, hasToken: !!authToken });
      
      if (!isLoggedIn || userType !== 'user' || !authToken) {
        console.log('UserHomePage - Redirecting to login, auth failed');
        router.replace('/login');
        return;
      }

      console.log('UserHomePage - Auth passed, loading user data...');

      // Try to fetch user profile using Authorization header
      console.log('UserHomePage - Fetching user profile for username:', username);
      const response = await fetch(`${BACKEND_URL}/api/user/profile/${username}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('UserHomePage - API response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('UserHomePage - User data loaded successfully:', userData);
        setUser(userData);
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid, redirect to login
        console.log('UserHomePage - Auth error, redirecting to login');
        await AsyncStorage.multiRemove(['isLoggedIn', 'userType', 'username', 'authToken']);
        router.replace('/login');
        return;
      } else {
        // If profile endpoint doesn't work, create basic user object from stored data
        console.log('UserHomePage - Profile API failed, using stored username');
        const basicUser = {
          id: Date.now(), // temporary ID
          firstName: username?.split('')[0]?.toUpperCase() + (username?.slice(1) || ''),
          lastName: 'User',
          username: username,
          email: `${username}@example.com`
        };
        setUser(basicUser);
      }
    } catch (error) {
      console.error('UserHomePage - Error loading user data:', error);
      
      // Fallback to basic user data from AsyncStorage
      const username = await AsyncStorage.getItem('username');
      if (username) {
        const basicUser = {
          id: Date.now(),
          firstName: username?.split('')[0]?.toUpperCase() + (username?.slice(1) || ''),
          lastName: 'User', 
          username: username,
          email: `${username}@example.com`
        };
        setUser(basicUser);
      }
    } finally {
      console.log('UserHomePage - Setting loading to false');
      setLoading(false);
    }
  };

  const loadPopularGraduates = async () => {
    try {
      console.log('UserHomePage - Loading portfolios...');
      
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        console.log('UserHomePage - No auth token, cannot load portfolios');
        return;
      }
      
      // First, try to get available graduates and then fetch their portfolios
      console.log('UserHomePage - Fetching available graduates first...');
      
      const graduatesResponse = await fetch(`${BACKEND_URL}/api/graduate/available`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('UserHomePage - Available graduates response:', graduatesResponse.status);
      
      let allPortfolios: any[] = [];
      
      if (graduatesResponse.ok) {
        const graduates = await graduatesResponse.json();
        console.log('UserHomePage - Found graduates:', graduates.length);
        
        // For each graduate, try to fetch their portfolio
        for (const graduate of graduates.slice(0, 10)) { // Limit to first 10 to avoid too many requests
          try {
            const portfolioResponse = await fetch(`${BACKEND_URL}/api/portfolio/public/graduate/${graduate.id}/portfolio`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (portfolioResponse.ok) {
              const portfolioData = await portfolioResponse.json();
              console.log('UserHomePage - Found portfolio for graduate:', graduate.id);
              
              // Transform to search result format
              allPortfolios.push({
                id: portfolioData.id || graduate.id,
                fullName: graduate.fullName || `${graduate.firstname || ''} ${graduate.lastname || ''}`.trim(),
                professionalTitle: graduate.professionalTitle || graduate.profession || 'Professional',
                primaryCourseType: graduate.primaryCourseType || graduate.specialization,
                professionalSummary: graduate.professionalSummary || graduate.bio,
                avatar: graduate.profilePicture,
                profilePicture: graduate.profilePicture,
                graduateId: graduate.id,
                shareToken: graduate.shareToken || portfolioData.shareToken,
                viewCount: Math.floor(Math.random() * 200) + 50,
                rating: graduate.rating || 0
              });
            }
          } catch (error) {
            console.log(`UserHomePage - Portfolio fetch failed for graduate ${graduate.id}:`, error);
          }
        }
      }
      
      // Also try the search approach as backup
      if (allPortfolios.length < 3) {
        console.log('UserHomePage - Not enough portfolios from graduates, trying search...');
        const searchTerms = ['developer', 'designer', 'engineer'];
        
        for (const term of searchTerms) {
          try {
            const response = await fetch(`${BACKEND_URL}/api/portfolio/search?query=${encodeURIComponent(term)}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const portfolios = await response.json();
              if (Array.isArray(portfolios)) {
                allPortfolios = allPortfolios.concat(portfolios);
              }
            }
          } catch (error) {
            console.log(`UserHomePage - Search failed for term: ${term}`, error);
          }
        }
      }

      console.log('UserHomePage - Total portfolios found:', allPortfolios.length);

      if (allPortfolios.length > 0) {
        // Remove duplicates based on graduateId
        const uniquePortfolios = allPortfolios.filter((portfolio, index, self) => 
          index === self.findIndex(p => p.graduateId === portfolio.graduateId)
        );
        
        // Transform portfolio data to display format
        const transformedPortfolios = uniquePortfolios.map((portfolio: any, index: number) => ({
          id: portfolio.id || portfolio.graduateId || index + 1,
          fullName: portfolio.fullName || portfolio.graduateName || 'Professional',
          professionalTitle: portfolio.professionalTitle || portfolio.profession || 'Professional',
          primaryCourseType: portfolio.primaryCourseType || portfolio.field || portfolio.specialization || 'General',
          professionalSummary: portfolio.professionalSummary || portfolio.summary || portfolio.description || 'Experienced professional with diverse skills.',
          avatar: portfolio.avatar || portfolio.profilePicture || portfolio.graduateProfilePicture,
          profilePicture: portfolio.profilePicture || portfolio.avatar || portfolio.graduateProfilePicture,
          graduateId: portfolio.graduateId,
          shareToken: portfolio.shareToken,
          viewCount: portfolio.viewCount || Math.floor(Math.random() * 200) + 50,
          rating: portfolio.rating || portfolio.averageRating || 0,
          hasPortfolio: true // Mark that this item has a portfolio
        }));
        
        setPopularGraduates(transformedPortfolios);
        console.log('UserHomePage - Portfolios loaded successfully:', transformedPortfolios.length);
        if (transformedPortfolios.length > 0) {
          console.log('UserHomePage - Sample portfolio data:', transformedPortfolios[0]);
          console.log('UserHomePage - Profile picture URLs:', transformedPortfolios.map(p => p.avatar || p.profilePicture));
        }
      } else {
        // Add a test portfolio to verify the display works
        console.log('UserHomePage - Adding test data to verify display...');
        allPortfolios.push({
          id: 'test-1',
          fullName: 'Test Professional',
          professionalTitle: 'Software Developer',
          primaryCourseType: 'Computer Science',
          professionalSummary: 'Experienced software developer with 5+ years of experience.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          graduateId: 'test-graduate-1',
          shareToken: 'test-token',
          viewCount: 125,
          rating: 4.5,
          hasPortfolio: true
        });
        
        // Fallback: try to get available graduates who might have portfolios
        console.log('UserHomePage - No portfolios found, trying all graduates as fallback...');
        
        const allGraduatesResponse = await fetch(`${BACKEND_URL}/api/graduate/all`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (allGraduatesResponse.ok) {
          const allGraduatesData = await allGraduatesResponse.json();
          console.log('UserHomePage - All graduates loaded as fallback:', allGraduatesData.length);
          
          // Show first few graduates regardless of portfolio status
          const graduatesForDisplay = (Array.isArray(allGraduatesData) ? allGraduatesData : [])
            .slice(0, 6)
            .map((grad: any, index: number) => ({
              id: grad.id || index + 1,
              fullName: grad.fullName || `${grad.firstname || grad.firstName || ''} ${grad.lastname || grad.lastName || ''}`.trim(),
              professionalTitle: grad.professionalTitle || grad.title || grad.profession || 'Professional',
              primaryCourseType: grad.primaryCourseType || grad.course || grad.field || grad.specialization || 'General',
              professionalSummary: grad.professionalSummary || grad.summary || grad.description || grad.bio || 'Experienced professional with diverse skills.',
              avatar: grad.avatar || grad.profilePicture,
              profilePicture: grad.profilePicture || grad.avatar,
              graduateId: grad.id,
              shareToken: grad.shareToken,
              viewCount: grad.viewCount || Math.floor(Math.random() * 200) + 50,
              rating: grad.rating || grad.averageRating || 0,
              hasPortfolio: false // Mark that this might not have a portfolio
            }));
          
          console.log('UserHomePage - Sample graduate data:', graduatesForDisplay[0]);
          if (graduatesForDisplay.length > 0) {
            console.log('UserHomePage - Graduate profile pictures:', graduatesForDisplay.map(g => g.avatar || g.profilePicture));
          }
          
          setPopularGraduates(graduatesForDisplay);
        } else {
          console.log('UserHomePage - All loading methods failed');
          console.log('UserHomePage - Available graduates status:', graduatesResponse.status);
          console.log('UserHomePage - All graduates status:', allGraduatesResponse.status);
          setPopularGraduates([]);
        }
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
      setPopularGraduates([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a search query.');
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    setSearchResults([]);

    try {
      console.log('UserHomePage - Searching for:', searchQuery);
      
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        Alert.alert('Authentication Error', 'Please login again to search.');
        return;
      }
      
      // Try the portfolio search endpoint with Authorization header
      const response = await fetch(`${BACKEND_URL}/api/portfolio/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('UserHomePage - Search API response:', response.status);

      if (response.ok) {
        const results = await response.json();
        console.log('UserHomePage - Search results received:', results);
        setSearchResults(Array.isArray(results) ? results : []);
      } else {
        // Fallback to filtering available graduates by search query
        console.log('UserHomePage - Portfolio search failed, trying to filter graduates');
        
        const fallbackResponse = await fetch(`${BACKEND_URL}/api/graduate/available`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (fallbackResponse.ok) {
          const allGraduates = await fallbackResponse.json();
          
          // Filter graduates based on search query
          const filteredGraduates = (Array.isArray(allGraduates) ? allGraduates : [])
            .filter((grad: any) => {
              const searchText = searchQuery.toLowerCase();
              const fullName = `${grad.firstname || grad.firstName || ''} ${grad.lastname || grad.lastName || ''}`.toLowerCase();
              const profession = (grad.professionalTitle || grad.title || grad.profession || '').toLowerCase();
              const field = (grad.primaryCourseType || grad.course || grad.field || grad.specialization || '').toLowerCase();
              const summary = (grad.professionalSummary || grad.summary || grad.description || grad.bio || '').toLowerCase();
              
              return fullName.includes(searchText) || 
                     profession.includes(searchText) || 
                     field.includes(searchText) || 
                     summary.includes(searchText);
            });

          // Transform graduate data to search result format
          const transformedResults = filteredGraduates.map((grad: any) => ({
            id: grad.id,
            fullName: `${grad.firstname || grad.firstName || ''} ${grad.lastname || grad.lastName || ''}`.trim(),
            professionalTitle: grad.professionalTitle || grad.title || grad.profession || 'Professional',
            primaryCourseType: grad.primaryCourseType || grad.course || grad.field || grad.specialization,
            professionalSummary: grad.professionalSummary || grad.summary || grad.description || grad.bio,
            avatar: grad.avatar || grad.profilePicture,
            profilePicture: grad.profilePicture || grad.avatar,
            graduateId: grad.id,
            shareToken: grad.shareToken
          }));
          
          setSearchResults(transformedResults);
          console.log('UserHomePage - Filtered search results:', transformedResults.length);
        } else {
          throw new Error('Graduate search failed');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search professionals. Please check your connection and try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadPopularGraduates()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['isLoggedIn', 'userType', 'username', 'authToken']);
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const navigateToGraduateProfile = (graduateId: string, shareToken?: string) => {
    // Navigate to view portfolio page with graduate ID and optional share token
    const url = shareToken 
      ? `/viewportfolio?id=${graduateId}&shareToken=${shareToken}`
      : `/viewportfolio?id=${graduateId}`;
    router.push(url as any);
  };

  console.log('UserHomePage - Render state:', { loading, user, popularGraduatesCount: popularGraduates.length });

  if (loading) {
    console.log('UserHomePage - Showing loading spinner');
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  console.log('UserHomePage - Rendering main content');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#ffffff'
      }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
            TARABAHO
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2, letterSpacing: 2 }}>
            TARA! TRABAHO
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/userprofile' as any)}>
          <Ionicons name="settings-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!showResults ? (
          <>
            {/* Simplified Hero Section */}
            <View style={{
              backgroundColor: '#1e40af',
              paddingHorizontal: 24,
              paddingVertical: 48,
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: 32,
                fontWeight: '600',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: 12
              }}>
                Discover Professional Portfolios
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: '#bfdbfe',
                textAlign: 'center',
                marginBottom: 20,
                paddingHorizontal: 16
              }}>
                Browse portfolios and connect with talented professionals
              </Text>
            </View>

            {/* Simplified Search Section */}
            <View style={{
              backgroundColor: '#ffffff',
              paddingHorizontal: 20,
              paddingVertical: 24
            }}>
              {/* Clean Search Bar */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 4,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#e2e8f0'
              }}>
                <Ionicons name="search-outline" size={20} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#1e293b',
                    paddingVertical: 12
                  }}
                  placeholder="Search portfolios..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  editable={!isSearching}
                />
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#1e40af',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginLeft: 8
                  }}
                  onPress={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                      Search
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Simplified Popular Tags */}
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8
              }}>
                {['Web Development', 'Graphic Design', 'IT Support', 'Content Writing'].map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: '#f1f5f9',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#e2e8f0'
                    }}
                    onPress={() => {
                      setSearchQuery(term);
                      setTimeout(() => handleSearch(), 100);
                    }}
                  >
                    <Text style={{
                      color: '#475569',
                      fontSize: 12,
                      fontWeight: '500'
                    }}>
                      {term}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Portfolios Section */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: 16,
                paddingHorizontal: 4
              }}>
                Featured Portfolios
              </Text>

              {popularGraduates.length === 0 ? (
                <View style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: 24, 
                  borderRadius: 12, 
                  alignItems: 'center',
                  marginHorizontal: 4
                }}>
                  <Ionicons name="people-outline" size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                  <Text style={{ color: '#64748b', fontSize: 16 }}>
                    No portfolios found
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                    Check your connection or try refreshing
                  </Text>
                  <TouchableOpacity
                    onPress={loadPopularGraduates}
                    style={{
                      backgroundColor: '#1e40af',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      marginTop: 12
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {popularGraduates.slice(0, 3).map((graduate, index) => (
                    <TouchableOpacity
                      key={graduate.id || index}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#000000',
                        shadowOpacity: 0.05,
                        shadowOffset: { width: 0, height: 1 },
                        shadowRadius: 4,
                        elevation: 2,
                        borderWidth: 1,
                        borderColor: '#f1f5f9'
                      }}
                      onPress={() => navigateToGraduateProfile(graduate.graduateId, graduate.shareToken)}
                    >
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: graduate.hasPortfolio ? '#1e40af' : '#6b7280',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {graduate.avatar || graduate.profilePicture ? (
                          <Image
                            source={{ uri: graduate.avatar || graduate.profilePicture }}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 24,
                            }}
                            resizeMode="cover"
                            onError={(error) => console.log('UserHomePage - Image load error:', error.nativeEvent.error)}
                            onLoad={() => console.log('UserHomePage - Image loaded successfully:', graduate.avatar || graduate.profilePicture)}
                          />
                        ) : (
                          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                            {graduate.fullName?.[0]?.toUpperCase() || '?'}
                          </Text>
                        )}
                        {graduate.hasPortfolio && (
                          <View style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: '#10b981',
                            borderWidth: 2,
                            borderColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Ionicons name="checkmark" size={8} color="white" />
                          </View>
                        )}
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          fontSize: 16, 
                          fontWeight: '600', 
                          color: '#1e293b', 
                          marginBottom: 2 
                        }}>
                          {graduate.fullName}
                        </Text>
                        
                        <Text style={{ 
                          fontSize: 14, 
                          color: '#64748b',
                          marginBottom: graduate.viewCount ? 4 : 0
                        }}>
                          {graduate.professionalTitle || 'Professional'}
                        </Text>
                        
                        {graduate.viewCount && (
                          <Text style={{ 
                            fontSize: 12, 
                            color: '#94a3b8'
                          }}>
                            {graduate.viewCount} views
                          </Text>
                        )}
                      </View>
                      
                      <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (

          /* Search Results Section */
          <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1e293b'
              }}>
                {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </Text>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 6
                }}
                onPress={clearSearch}
              >
                <Text style={{ color: '#475569', fontSize: 13, fontWeight: '500' }}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                <ActivityIndicator size="large" color="#1e40af" />
                <Text style={{ marginTop: 12, fontSize: 16, color: '#64748b' }}>
                  Searching...
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                <Ionicons name="search-outline" size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 16, color: '#64748b', marginBottom: 4 }}>
                  No results found
                </Text>
                <Text style={{ fontSize: 14, color: '#94a3b8' }}>
                  Try different keywords
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={result.id || index}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#000000',
                      shadowOpacity: 0.05,
                      shadowOffset: { width: 0, height: 1 },
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: '#f1f5f9'
                    }}
                    onPress={() => navigateToGraduateProfile(result.graduateId, result.shareToken)}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#1e40af',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      overflow: 'hidden'
                    }}>
                      {result.avatar || result.profilePicture ? (
                        <Image
                          source={{ uri: result.avatar || result.profilePicture }}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                          }}
                          resizeMode="cover"
                          onError={(error) => console.log('UserHomePage - Search image load error:', error.nativeEvent.error)}
                          onLoad={() => console.log('UserHomePage - Search image loaded:', result.avatar || result.profilePicture)}
                        />
                      ) : (
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                          {result.fullName?.[0]?.toUpperCase() || '?'}
                        </Text>
                      )}
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600', 
                        color: '#1e293b', 
                        marginBottom: 2 
                      }}>
                        {result.fullName}
                      </Text>
                      
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#64748b'
                      }}>
                        {result.professionalTitle || 'Professional'}
                      </Text>
                      
                      {result.professionalSummary && (
                        <Text style={{ 
                          fontSize: 12, 
                          color: '#94a3b8',
                          marginTop: 2
                        }} numberOfLines={1}>
                          {result.professionalSummary}
                        </Text>
                      )}
                    </View>
                    
                    <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}