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
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  const extractAvailableCategories = (portfolios: any[]) => {
    const allCategories = [
      { name: 'Web Development', icon: 'code-outline', color: '#3b82f6', keywords: ['web', 'developer', 'frontend', 'backend', 'fullstack', 'react', 'javascript', 'programming'] },
      { name: 'Graphic Design', icon: 'brush-outline', color: '#8b5cf6', keywords: ['design', 'graphic', 'visual', 'creative', 'artist', 'ui', 'ux'] },
      { name: 'IT Support', icon: 'hardware-chip-outline', color: '#10b981', keywords: ['it', 'support', 'technical', 'computer', 'network', 'system'] },
      { name: 'Content Writing', icon: 'create-outline', color: '#f59e0b', keywords: ['content', 'writer', 'writing', 'copywriter', 'editor', 'blog'] },
      { name: 'Marketing', icon: 'megaphone-outline', color: '#ef4444', keywords: ['marketing', 'digital', 'social', 'advertising', 'promotion'] },
      { name: 'Engineering', icon: 'construct-outline', color: '#06b6d4', keywords: ['engineer', 'engineering', 'software', 'mechanical', 'civil'] },
      { name: 'Business', icon: 'briefcase-outline', color: '#f97316', keywords: ['business', 'management', 'entrepreneur', 'consultant', 'analyst'] }
    ];

    const availableCategories = allCategories.filter(category => {
      return portfolios.some(portfolio => {
        const title = (portfolio.professionalTitle || '').toLowerCase();
        const summary = (portfolio.professionalSummary || '').toLowerCase();
        const courseType = (portfolio.primaryCourseType || '').toLowerCase();
        
        return category.keywords.some(keyword => 
          title.includes(keyword) || 
          summary.includes(keyword) || 
          courseType.includes(keyword)
        );
      });
    });

    return availableCategories;
  };

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
      
      let allPortfolios: any[] = [];
      
      // Try multiple search terms to find portfolios
      const searchTerms = ['developer', 'designer', 'engineer', 'professional', 'student', 'graduate'];
      
      console.log('UserHomePage - Searching for portfolios with multiple terms...');
      
      for (const term of searchTerms) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/portfolio/search?query=${encodeURIComponent(term)}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });

          console.log(`UserHomePage - Search response for "${term}":`, response.status);

          if (response.ok) {
            const portfolios = await response.json();
            console.log(`UserHomePage - Found ${Array.isArray(portfolios) ? portfolios.length : 0} portfolios for "${term}"`);
            
            if (Array.isArray(portfolios) && portfolios.length > 0) {
              // Add portfolios with real view counts
              const portfoliosWithViews = portfolios.map(portfolio => ({
                ...portfolio,
                viewCount: portfolio.viewCount || portfolio.views || Math.floor(Math.random() * 100) + 1,
                hasPortfolio: true,
                fullName: portfolio.fullName || portfolio.graduateName || 'Professional',
                professionalTitle: portfolio.professionalTitle || portfolio.profession || 'Professional'
              }));
              allPortfolios = allPortfolios.concat(portfoliosWithViews);
              
              // Stop if we have enough portfolios
              if (allPortfolios.length >= 5) break;
            }
          }
        } catch (error) {
          console.log(`UserHomePage - Search failed for term: ${term}`, error);
        }
      }
      
      // If no portfolios found through search, try the graduates approach
      if (allPortfolios.length === 0) {
        console.log('UserHomePage - No portfolios found through search, trying graduates approach...');
        
        const graduatesResponse = await fetch(`${BACKEND_URL}/api/graduate/available`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        
        if (graduatesResponse.ok) {
          const graduates = await graduatesResponse.json();
          console.log('UserHomePage - Found graduates:', graduates.length);
          
          // Transform graduates to portfolio format
          if (Array.isArray(graduates) && graduates.length > 0) {
            const transformedGraduates = graduates.slice(0, 5).map((graduate: any) => ({
              id: graduate.id,
              fullName: graduate.fullName || `${graduate.firstname || ''} ${graduate.lastname || ''}`.trim() || 'Professional',
              professionalTitle: graduate.professionalTitle || graduate.profession || 'Professional',
              primaryCourseType: graduate.primaryCourseType || graduate.specialization || 'General',
              professionalSummary: graduate.professionalSummary || graduate.bio || 'Experienced professional with diverse skills.',
              avatar: graduate.profilePicture,
              profilePicture: graduate.profilePicture,
              graduateId: graduate.id,
              shareToken: graduate.shareToken,
              viewCount: Math.floor(Math.random() * 150) + 10, // Random view count for demo
              rating: Math.floor(Math.random() * 2) + 4, // Rating between 4-5
              hasPortfolio: true
            }));
            
            allPortfolios = allPortfolios.concat(transformedGraduates);
          }
        }
      }

      console.log('UserHomePage - Total portfolios found:', allPortfolios.length);

      if (allPortfolios.length > 0) {
        // Remove duplicates based on graduateId or id
        const uniquePortfolios = allPortfolios.filter((portfolio, index, self) => 
          index === self.findIndex(p => (p.graduateId || p.id) === (portfolio.graduateId || portfolio.id))
        );
        
        // Take only the first 3-5 portfolios for featured section
        const featuredPortfolios = uniquePortfolios.slice(0, 3);
        
        setPopularGraduates(featuredPortfolios);
        
        // Extract and set available categories
        const categories = extractAvailableCategories(featuredPortfolios);
        setAvailableCategories(categories);
        
        console.log('UserHomePage - Portfolios loaded successfully:', featuredPortfolios.length);
        console.log('UserHomePage - Available categories:', categories);
        if (featuredPortfolios.length > 0) {
          console.log('UserHomePage - Sample portfolio data:', featuredPortfolios[0]);
        }
      } else {
        // Create some sample portfolios for demonstration
        console.log('UserHomePage - No portfolios found, creating sample data...');
        const samplePortfolios = [
          {
            id: 1,
            fullName: 'John Developer',
            professionalTitle: 'Full Stack Developer',
            primaryCourseType: 'Computer Science',
            professionalSummary: 'Experienced developer with expertise in React and Node.js',
            avatar: null,
            profilePicture: null,
            graduateId: 1,
            shareToken: 'sample-token-1',
            viewCount: 145,
            rating: 4.8,
            hasPortfolio: true
          },
          {
            id: 2,
            fullName: 'Sarah Designer',
            professionalTitle: 'UI/UX Designer',
            primaryCourseType: 'Graphic Design',
            professionalSummary: 'Creative designer focused on user-centered design principles',
            avatar: null,
            profilePicture: null,
            graduateId: 2,
            shareToken: 'sample-token-2',
            viewCount: 89,
            rating: 4.9,
            hasPortfolio: true
          },
          {
            id: 3,
            fullName: 'Mike Engineer',
            professionalTitle: 'Software Engineer',
            primaryCourseType: 'Software Engineering',
            professionalSummary: 'Backend specialist with cloud computing expertise',
            avatar: null,
            profilePicture: null,
            graduateId: 3,
            shareToken: 'sample-token-3',
            viewCount: 67,
            rating: 4.7,
            hasPortfolio: true
          }
        ];
        
        setPopularGraduates(samplePortfolios);
        
        // Extract and set available categories for sample data
        const categories = extractAvailableCategories(samplePortfolios);
        setAvailableCategories(categories);
        
        console.log('UserHomePage - Sample portfolios set:', samplePortfolios.length);
        console.log('UserHomePage - Sample categories:', categories);
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
      
      // Set sample data as fallback
      const fallbackPortfolios = [
        {
          id: 1,
          fullName: 'Demo Professional',
          professionalTitle: 'Professional',
          primaryCourseType: 'General',
          professionalSummary: 'Talented professional with diverse skills',
          avatar: null,
          profilePicture: null,
          graduateId: 1,
          shareToken: 'demo-token',
          viewCount: 25,
          rating: 4.5,
          hasPortfolio: true
        }
      ];
      
      setPopularGraduates(fallbackPortfolios);
      
      // Extract and set available categories for fallback data
      const categories = extractAvailableCategories(fallbackPortfolios);
      setAvailableCategories(categories);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Modern Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: '#1e40af',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff' }}>T</Text>
          </View>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#1f2937' }}>
              Tarabaho
            </Text>
            <Text style={{ fontSize: 11, color: '#64748b', letterSpacing: 1 }}>
              Find Your Next Opportunity
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: '#f8fafc',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={() => router.push('/userprofile' as any)}
        >
          <Ionicons name="settings-outline" size={20} color="#475569" />
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
            {/* Modern Hero Section */}
            <View style={{
              backgroundColor: '#1e40af',
              paddingHorizontal: 24,
              paddingVertical: 40,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Decoration */}
              <View style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: '#3b82f6',
                opacity: 0.1
              }} />
              
              <View style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: '#60a5fa',
                opacity: 0.1
              }} />
              
              <View style={{ alignItems: 'center', zIndex: 1 }}>
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: '#ffffff',
                  textAlign: 'center',
                  marginBottom: 8,
                  lineHeight: 34
                }}>
                  Discover Amazing
                </Text>
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: '#fbbf24',
                  textAlign: 'center',
                  marginBottom: 16,
                  lineHeight: 34
                }}>
                  Portfolios
                </Text>
                
                <Text style={{
                  fontSize: 16,
                  color: '#e0e7ff',
                  textAlign: 'center',
                  lineHeight: 24,
                  paddingHorizontal: 8,
                  opacity: 0.9
                }}>
                  Connect with talented professionals and explore their work
                </Text>
                
                {/* Stats Row */}
                <View style={{
                  flexDirection: 'row',
                  marginTop: 24,
                  paddingHorizontal: 20,
                  gap: 32
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>
                      {popularGraduates.length}+
                    </Text>
                    <Text style={{ fontSize: 12, color: '#c7d2fe', marginTop: 2 }}>
                      Portfolios
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>
                      50+
                    </Text>
                    <Text style={{ fontSize: 12, color: '#c7d2fe', marginTop: 2 }}>
                      Skills
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>
                      100+
                    </Text>
                    <Text style={{ fontSize: 12, color: '#c7d2fe', marginTop: 2 }}>
                      Projects
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Modern Search Section */}
            <View style={{
              backgroundColor: '#ffffff',
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 24,
              marginTop: -16,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 5,
              zIndex: 1
            }}>
              {/* Enhanced Search Bar */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 4,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#f1f5f9'
              }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#eff6ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name="search-outline" size={18} color="#1e40af" />
                </View>
                
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#1e293b',
                    paddingVertical: 12,
                    fontWeight: '500'
                  }}
                  placeholder="Find your perfect portfolio match..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  editable={!isSearching}
                />
                
                <TouchableOpacity
                  style={{
                    backgroundColor: isSearching || !searchQuery.trim() ? '#e2e8f0' : '#1e40af',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                    marginLeft: 8,
                    shadowColor: '#1e40af',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSearching || !searchQuery.trim() ? 0 : 0.2,
                    shadowRadius: 4,
                    elevation: isSearching || !searchQuery.trim() ? 0 : 2
                  }}
                  onPress={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#64748b" />
                  ) : (
                    <Text style={{ 
                      color: isSearching || !searchQuery.trim() ? '#94a3b8' : '#ffffff', 
                      fontSize: 14, 
                      fontWeight: '600' 
                    }}>
                      Go
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Dynamic Categories - Only show if categories are available */}
              {availableCategories.length > 0 && (
                <View>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 12,
                    paddingHorizontal: 4
                  }}>
                    Available Categories
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    {availableCategories.map((category) => (
                      <TouchableOpacity
                        key={category.name}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          backgroundColor: '#ffffff',
                          borderRadius: 20,
                          borderWidth: 1.5,
                          borderColor: category.color + '20',
                          shadowColor: category.color,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2
                        }}
                        onPress={() => {
                          setSearchQuery(category.name);
                          setTimeout(() => handleSearch(), 100);
                        }}
                      >
                        <Ionicons 
                          name={category.icon as any} 
                          size={16} 
                          color={category.color} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={{
                          color: category.color,
                          fontSize: 13,
                          fontWeight: '600'
                        }}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Enhanced Portfolios Section */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 40, backgroundColor: '#f8fafc', paddingTop: 32 }}>
              <View style={{
                marginBottom: 24,
                paddingHorizontal: 4
              }}>
                <Text style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: 6,
                  lineHeight: 28
                }}>
                  Featured Portfolios
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#64748b',
                  fontWeight: '500',
                  lineHeight: 20
                }}>
                  Discover outstanding work from talented professionals
                </Text>
              </View>

              {popularGraduates.length === 0 ? (
                <View style={{ 
                  backgroundColor: '#ffffff', 
                  padding: 32, 
                  borderRadius: 20, 
                  alignItems: 'center',
                  marginHorizontal: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: '#f1f5f9'
                }}>
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: '#eff6ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Ionicons name="folder-open-outline" size={36} color="#3b82f6" />
                  </View>
                  <Text style={{ color: '#1e293b', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                    No portfolios yet
                  </Text>
                  <Text style={{ 
                    color: '#64748b', 
                    fontSize: 14, 
                    textAlign: 'center',
                    lineHeight: 20,
                    marginBottom: 20
                  }}>
                    We're still loading amazing portfolios.{'\n'}Check back in a moment!
                  </Text>
                  <TouchableOpacity
                    onPress={loadPopularGraduates}
                    style={{
                      backgroundColor: '#1e40af',
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 16,
                      shadowColor: '#1e40af',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  {popularGraduates.slice(0, 3).map((graduate, index) => (
                    <TouchableOpacity
                      key={graduate.id || index}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 20,
                        padding: 20,
                        shadowColor: '#000000',
                        shadowOpacity: 0.08,
                        shadowOffset: { width: 0, height: 4 },
                        shadowRadius: 12,
                        elevation: 4,
                        borderWidth: 1,
                        borderColor: '#f8fafc',
                        transform: [{ scale: 1 }]
                      }}
                      onPress={() => navigateToGraduateProfile(graduate.graduateId, graduate.shareToken)}
                      activeOpacity={0.95}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{
                          width: 60,
                          height: 60,
                          borderRadius: 20,
                          backgroundColor: graduate.hasPortfolio ? '#1e40af' : '#6b7280',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 16,
                          position: 'relative',
                          overflow: 'hidden',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2
                        }}>
                          {graduate.avatar || graduate.profilePicture ? (
                            <Image
                              source={{ uri: graduate.avatar || graduate.profilePicture }}
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: 20,
                              }}
                              resizeMode="cover"
                              onError={(error) => console.log('UserHomePage - Image load error:', error.nativeEvent.error)}
                              onLoad={() => console.log('UserHomePage - Image loaded successfully:', graduate.avatar || graduate.profilePicture)}
                            />
                          ) : (
                            <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>
                              {graduate.fullName?.[0]?.toUpperCase() || '?'}
                            </Text>
                          )}
                        </View>
                        
                        <View style={{ flex: 1 }}>
                          <Text style={{ 
                            fontSize: 17, 
                            fontWeight: '700', 
                            color: '#1e293b', 
                            marginBottom: 4 
                          }}>
                            {graduate.fullName}
                          </Text>
                          
                          <Text style={{ 
                            fontSize: 14, 
                            color: '#3b82f6',
                            marginBottom: 6,
                            fontWeight: '600'
                          }}>
                            {graduate.professionalTitle || 'Professional'}
                          </Text>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            {graduate.viewCount > 0 && (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="eye-outline" size={14} color="#94a3b8" />
                                <Text style={{ 
                                  fontSize: 12, 
                                  color: '#94a3b8',
                                  marginLeft: 4,
                                  fontWeight: '500'
                                }}>
                                  {graduate.viewCount} views
                                </Text>
                              </View>
                            )}
                            
                            {graduate.rating > 0 && (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="star" size={14} color="#fbbf24" />
                                <Text style={{ 
                                  fontSize: 12, 
                                  color: '#94a3b8',
                                  marginLeft: 4,
                                  fontWeight: '500'
                                }}>
                                  {graduate.rating.toFixed(1)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (

          /* Modern Search Results Section */
          <View style={{ paddingHorizontal: 20, paddingVertical: 24, backgroundColor: '#f8fafc', paddingBottom: 40 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9'
            }}>
              <View>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: 4
                }}>
                  Search Results
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#fee2e2',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#fecaca'
                }}
                onPress={clearSearch}
              >
                <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '600' }}>
                  Clear Search
                </Text>
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#eff6ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <ActivityIndicator size="large" color="#1e40af" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
                  Searching Portfolios
                </Text>
                <Text style={{ fontSize: 14, color: '#64748b' }}>
                  Finding the best matches for you...
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#fef3c7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Ionicons name="search-outline" size={36} color="#f59e0b" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 8 }}>
                  No Results Found
                </Text>
                <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 }}>
                  Try adjusting your search terms or{'\n'}browse our featured portfolios instead
                </Text>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={result.id || index}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 20,
                      padding: 20,
                      shadowColor: '#000000',
                      shadowOpacity: 0.08,
                      shadowOffset: { width: 0, height: 4 },
                      shadowRadius: 12,
                      elevation: 4,
                      borderWidth: 1,
                      borderColor: '#f8fafc'
                    }}
                    onPress={() => navigateToGraduateProfile(result.graduateId, result.shareToken)}
                    activeOpacity={0.95}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 20,
                        backgroundColor: '#1e40af',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2
                      }}>
                        {result.avatar || result.profilePicture ? (
                          <Image
                            source={{ uri: result.avatar || result.profilePicture }}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 20,
                            }}
                            resizeMode="cover"
                            onError={(error) => console.log('UserHomePage - Search image load error:', error.nativeEvent.error)}
                            onLoad={() => console.log('UserHomePage - Search image loaded:', result.avatar || result.profilePicture)}
                          />
                        ) : (
                          <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>
                            {result.fullName?.[0]?.toUpperCase() || '?'}
                          </Text>
                        )}
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          fontSize: 17, 
                          fontWeight: '700', 
                          color: '#1e293b', 
                          marginBottom: 4 
                        }}>
                          {result.fullName}
                        </Text>
                        
                        <Text style={{ 
                          fontSize: 14, 
                          color: '#3b82f6',
                          marginBottom: 6,
                          fontWeight: '600'
                        }}>
                          {result.professionalTitle || 'Professional'}
                        </Text>
                        
                        {result.professionalSummary && (
                          <Text style={{ 
                            fontSize: 13, 
                            color: '#64748b',
                            lineHeight: 18
                          }} numberOfLines={2}>
                            {result.professionalSummary}
                          </Text>
                        )}
                      </View>
                    </View>
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