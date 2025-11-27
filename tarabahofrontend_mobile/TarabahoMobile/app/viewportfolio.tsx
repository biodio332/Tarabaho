import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL || 'https://tarabaho-backend.onrender.com').replace(/\/$/, '');

interface Certificate {
  id: string;
  courseName?: string;
  certificateNumber?: string;
  issueDate?: string;
  certificateFilePath?: string;
}

interface Project {
  id?: number;
  name: string;
  description?: string;
  technologies?: string[];
  projectImageFilePath?: string;
}

interface Skill {
  id?: number;
  name: string;
  type?: string;
  proficiencyLevel?: string;
}

interface Experience {
  id?: number;
  jobTitle: string;
  employer: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface Award {
  id?: number;
  title: string;
  issuer: string;
  dateReceived?: string;
  description?: string;
}

interface Education {
  id?: number;
  courseName: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Reference {
  id?: number;
  name: string;
  position: string;
  company: string;
  contact?: string;
  email?: string;
}

interface Portfolio {
  id?: number;
  fullName: string;
  professionalTitle?: string;
  professionalSummary?: string;
  primaryCourseType?: string;
  email?: string;
  phone?: string;
  website?: string;
  avatar?: string;
  preferredWorkLocation?: string;
  workScheduleAvailability?: string;
  salaryExpectations?: string;
  ncLevel?: string;
  trainingCenter?: string;
  scholarshipType?: string;
  trainingDuration?: string;
  skills: Skill[];
  experiences: Experience[];
  awardsRecognitions: Award[];
  continuingEducations: Education[];
  references: Reference[];
  projects: Project[];
}

interface Graduate {
  id: number;
  fullName: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

// Certificate Image Component
interface CertificateImageProps {
  filePath: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
}

function CertificateImage({ filePath, style, resizeMode }: CertificateImageProps) {
  if (!filePath || !filePath.startsWith('http')) {
    return null;
  }

  return (
    <Image
      source={{ uri: filePath }}
      style={style}
      resizeMode={resizeMode || 'cover'}
    />
  );
}

export default function ViewPortfolio() {
  const router = useRouter();
  const { id: graduateId, shareToken } = useLocalSearchParams();
  const { width: screenWidth } = Dimensions.get('window');

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [graduate, setGraduate] = useState<Graduate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    loadPortfolioData();
  }, [graduateId, shareToken]);

  const normalizePortfolioData = (data: any) => {

    const normalized: Portfolio = {
      id: data.id,
      fullName: data.fullName || 'Unknown User',
      professionalTitle: data.professionalTitle || '',
      professionalSummary: data.professionalSummary || '',
      primaryCourseType: data.primaryCourseType || '',
      email: data.email || '',
      phone: data.phone || '',
      website: data.website || '',
      avatar: data.avatar || '',
      preferredWorkLocation: data.preferredWorkLocation || '',
      workScheduleAvailability: data.workScheduleAvailability || '',
      salaryExpectations: data.salaryExpectations || '',
      ncLevel: data.ncLevel || '',
      trainingCenter: data.trainingCenter || '',
      scholarshipType: data.scholarshipType || '',
      trainingDuration: data.trainingDuration || '',
      
      skills: Array.isArray(data.skills) ? data.skills.map((skill: any) => ({
        id: skill.id,
        name: skill.name || 'Unknown Skill',
        type: skill.type || skill.skillType || '',
        proficiencyLevel: skill.proficiencyLevel || ''
      })) : [],
      
      experiences: Array.isArray(data.experiences) ? data.experiences.map((exp: any) => ({
        id: exp.id,
        jobTitle: exp.jobTitle || exp.title || 'Unknown Position',
        employer: exp.employer || exp.company || '',
        description: exp.description || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || ''
      })) : [],
      
      awardsRecognitions: Array.isArray(data.awardsRecognitions) ? data.awardsRecognitions.map((award: any) => ({
        id: award.id,
        title: award.title || award.name || 'Unknown Award',
        issuer: award.issuer || award.issuedBy || '',
        dateReceived: award.dateReceived || award.date || '',
        description: award.description || ''
      })) : [],
      
      continuingEducations: Array.isArray(data.continuingEducations) ? data.continuingEducations.map((edu: any) => ({
        id: edu.id,
        courseName: edu.courseName || edu.name || 'Unknown Course',
        institution: edu.institution || edu.school || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || edu.completionDate || '',
        description: edu.description || ''
      })) : [],
      
      references: Array.isArray(data.references) ? data.references.map((ref: any) => ({
        id: ref.id,
        name: ref.name || 'Unknown Reference',
        position: ref.position || ref.relationship || '',
        company: ref.company || '',
        contact: ref.contact || ref.phone || '',
        email: ref.email || ''
      })) : [],
      
      projects: Array.isArray(data.projects) ? data.projects.map((proj: any) => ({
        id: proj.id,
        name: proj.name || proj.title || 'Unknown Project',
        description: proj.description || '',
        technologies: proj.technologies || [],
        projectImageFilePath: proj.projectImageFilePath || proj.imageUrl || ''
      })) : []
    };

    return normalized;
  };

  const loadPortfolioData = async () => {
    if (!graduateId) {
      setError('Graduate ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Step 0: If we have a share token from URL, try public access first
      if (shareToken && typeof shareToken === 'string') {
        try {
          const publicResponse = await fetch(`${BACKEND_URL}/api/portfolio/public/graduate/${graduateId}/portfolio?share=${shareToken}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            
            // Handle CompletePublicPortfolioResponse structure
            const portfolioData = publicData.portfolio || publicData;
            const graduateData = publicData.graduate || {
              id: graduateId,
              fullName: portfolioData.fullName,
              profilePicture: portfolioData.avatar
            };
            const certificatesData = publicData.certificates || [];
            
            const normalized = normalizePortfolioData(portfolioData);
            setPortfolio(normalized);
            setGraduate(graduateData);
            
            if (certificatesData.length > 0) {
              setCertificates(certificatesData);
            }
            
            setLoading(false);
            return; // Success! Exit early
          }
        } catch (publicErr) {
          // Fall back to authenticated access
        }
      }

      // Step 1: Try to get a session-based token (like web version does)
      let accessToken = null;
      
      try {
        const tokenResponse = await fetch(`${BACKEND_URL}/api/graduate/get-token`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          accessToken = tokenData.token;
        }
      } catch (tokenErr) {
        // Session token failed, will try stored token
      }

      // Step 2: Fallback to stored auth token if session token failed
      if (!accessToken) {
        accessToken = await AsyncStorage.getItem('authToken');
      }

      if (!accessToken) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      // Step 3: Try to load portfolio using the access token
      let portfolioResponse = await fetch(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      // If private portfolio access fails with 403/404, try public access
      if (!portfolioResponse.ok && (portfolioResponse.status === 403 || portfolioResponse.status === 404)) {
        
        try {
          // Try to get the portfolio's share token first
          const shareTokenResponse = await fetch(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio/share-token`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (shareTokenResponse.ok) {
            const shareData = await shareTokenResponse.json();
            
            // Try public endpoint with share token
            portfolioResponse = await fetch(`${BACKEND_URL}/api/portfolio/public/graduate/${graduateId}/portfolio?share=${shareData.shareToken}`, {
              credentials: 'include',
            });
            

          } else {

          }
        } catch (publicErr) {

        }
      }
      
      if (portfolioResponse.ok) {
        const rawData = await portfolioResponse.json();
        
        // Handle different response structures: direct PortfolioRequest vs CompletePublicPortfolioResponse
        let portfolioData;
        let graduateData;
        let certificatesData = [];
        
        if (rawData.portfolio && rawData.graduate) {
          // CompletePublicPortfolioResponse structure (from public endpoint)
          portfolioData = rawData.portfolio;
          graduateData = rawData.graduate;
          certificatesData = rawData.certificates || [];
        } else {
          // Direct PortfolioRequest structure (from private endpoint)
          portfolioData = rawData;
          graduateData = rawData.graduate || {
            id: graduateId,
            fullName: portfolioData.fullName,
            profilePicture: portfolioData.avatar
          };
          certificatesData = rawData.certificates || [];
        }
        
        const normalized = normalizePortfolioData(portfolioData);
        setPortfolio(normalized);
        setGraduate(graduateData);
        
        // Set certificates from the response
        if (certificatesData.length > 0) {
          setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
        }

        // Step 4: Load certificates separately if not already loaded from portfolio response
        if (certificatesData.length === 0) {
          try {
            const certificatesResponse = await fetch(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (certificatesResponse.ok) {
              const separateCertificatesData = await certificatesResponse.json();
              setCertificates(Array.isArray(separateCertificatesData) ? separateCertificatesData : []);
            }
          } catch (certErr) {
            setCertificates([]);
          }
        }

      } else {
        // Portfolio access failed - provide detailed error handling
        let errorMessage = 'Failed to load portfolio';
        if (portfolioResponse.status === 403) {
          errorMessage = 'This portfolio is private or you do not have permission to view it.';
        } else if (portfolioResponse.status === 404) {
          errorMessage = 'No portfolio found for this graduate.';
        } else if (portfolioResponse.status === 401) {
          errorMessage = 'Authentication failed. Please try logging in again.';
        }
        
        setError(errorMessage);
        setPortfolio(null);

        // Still try to load basic graduate info for name display
        try {
          const graduateResponse = await fetch(`${BACKEND_URL}/api/graduate/${graduateId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (graduateResponse.ok) {
            const graduateData = await graduateResponse.json();
            setGraduate(graduateData);
          }
        } catch (gradErr) {
          // Could not load basic graduate info
        }
      }

    } catch (err) {
      setError('Failed to load portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadGraduateInfo = async (accessToken: string) => {
    try {
      const graduateResponse = await fetch(`${BACKEND_URL}/api/graduate/${graduateId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (graduateResponse.ok) {
        const graduateData = await graduateResponse.json();
        setGraduate(graduateData);
      }
    } catch (err) {
      // Graduate info loading failed
    }
  };

  const loadCertificates = async (accessToken: string) => {
    try {
      const certificatesResponse = await fetch(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (certificatesResponse.ok) {
        const certificatesData = await certificatesResponse.json();
        setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      setCertificates([]);
    }
  };

  const handleContactPress = (type: 'email' | 'phone', value: string) => {
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value}`);
    }
  };

  const handleCertificatePress = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const closeCertificateModal = () => {
    setSelectedCertificate(null);
  };

  const renderHeader = () => (
    <View style={{ position: 'relative' }}>
      {/* Modern Hero Background */}
      <View style={{
        height: 220,
        backgroundColor: '#1e40af',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Enhanced Background Pattern */}
        <View style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
        }} />
        <View style={{
          position: 'absolute',
          top: -20,
          right: 20,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
        }} />
        <View style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: 'rgba(147, 197, 253, 0.12)',
        }} />
        <View style={{
          position: 'absolute',
          bottom: 20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(191, 219, 254, 0.08)',
        }} />
      </View>

      {/* Professional Profile Card */}
      <View style={{
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: -70,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
      }}>
        {/* Enhanced Profile Image */}
        <View style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          marginTop: -60,
          marginBottom: 20,
          backgroundColor: '#f8fafc',
          borderWidth: 4,
          borderColor: 'white',
          shadowColor: '#1e40af',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
        }}>
          {graduate?.profilePicture || portfolio?.avatar ? (
            <Image
              source={{ uri: graduate?.profilePicture || portfolio?.avatar }}
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: '#1e40af',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: 40,
                fontWeight: '700',
                color: 'white'
              }}>
                {(portfolio?.fullName || graduate?.fullName || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Enhanced Name and Title */}
        <Text style={{
          fontSize: 26,
          fontWeight: '800',
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: 8,
          lineHeight: 32,
        }}>
          {portfolio?.fullName || graduate?.fullName || 'Unknown User'}
        </Text>

        {portfolio?.professionalTitle && (
          <View style={{
            backgroundColor: '#eff6ff',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 24,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#dbeafe',
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '700',
              color: '#1e40af',
              textAlign: 'center',
            }}>
              {portfolio.professionalTitle}
            </Text>
          </View>
        )}

        {portfolio?.primaryCourseType && (
          <View style={{
            backgroundColor: '#f0fdf4',
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 20,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#bbf7d0',
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#16a34a',
              textAlign: 'center',
            }}>
              {portfolio.primaryCourseType}
            </Text>
          </View>
        )}

        {/* Location */}
        {portfolio?.preferredWorkLocation && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text style={{
              fontSize: 14,
              color: '#6b7280',
              marginLeft: 4,
            }}>
              {portfolio.preferredWorkLocation}
            </Text>
          </View>
        )}

        {/* Enhanced Contact Buttons */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
          marginTop: 8,
        }}>
          {(portfolio?.email || graduate?.email) && (
            <TouchableOpacity
              onPress={() => handleContactPress('email', portfolio?.email || graduate?.email || '')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1e40af',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                shadowColor: '#1e40af',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 2,
                minWidth: 70,
                justifyContent: 'center',
              }}
            >
              <Ionicons name="mail" size={16} color="white" />
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: 'white',
                marginLeft: 6,
              }}>
                Email
              </Text>
            </TouchableOpacity>
          )}

          {(portfolio?.phone || graduate?.phoneNumber) && (
            <TouchableOpacity
              onPress={() => handleContactPress('phone', portfolio?.phone || graduate?.phoneNumber || '')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#10b981',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 2,
                minWidth: 70,
                justifyContent: 'center',
              }}
            >
              <Ionicons name="call" size={16} color="white" />
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: 'white',
                marginLeft: 6,
              }}>
                Call
              </Text>
            </TouchableOpacity>
          )}

          {portfolio?.website && (
            <TouchableOpacity
              onPress={() => {
                if (portfolio?.website) {
                  const url = portfolio.website.startsWith('http') ? portfolio.website : `https://${portfolio.website}`;
                  Linking.openURL(url);
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f59e0b',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                shadowColor: '#f59e0b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 2,
                minWidth: 70,
                justifyContent: 'center',
              }}
            >
              <Ionicons name="globe" size={16} color="white" />
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: 'white',
                marginLeft: 6,
              }}>
                Website
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <View style={{
      backgroundColor: 'white',
      marginHorizontal: 16,
      marginBottom: 20,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#f1f5f9',
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
      }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: '#1e40af',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}>
          <Ionicons name={icon as any} size={22} color="#ffffff" />
        </View>
        <Text style={{
          fontSize: 19,
          fontWeight: '700',
          color: '#1e293b',
          letterSpacing: -0.3,
        }}>
          {title}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        {children}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
            Loading portfolio...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        {/* Back Button */}
        <View style={{ position: 'absolute', top: 60, left: 20, zIndex: 10 }}>
          <TouchableOpacity
            onPress={() => router.push('/userhomepage')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginTop: 16, textAlign: 'center' }}>
            Oops! Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadPortfolioData}
            style={{
              backgroundColor: '#4f46e5',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 24,
              marginTop: 24,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
          
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
            Graduate ID: {String(graduateId)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Enhanced Back Button */}
      <View style={{ position: 'absolute', top: 60, left: 20, zIndex: 10 }}>
        <TouchableOpacity
          onPress={() => router.push('/userhomepage')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#1e40af',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#1e40af" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {renderHeader()}

        <View style={{ marginTop: 32, backgroundColor: '#f8fafc' }}>
          {/* Professional About Section */}
          {portfolio?.professionalSummary && renderSection(
            'About Me',
            'person-circle-outline',
            <Text style={{
              fontSize: 15,
              lineHeight: 26,
              color: '#475569',
              fontWeight: '500',
              textAlign: 'left',
              letterSpacing: 0.2,
            }}>
              {portfolio.professionalSummary}
            </Text>
          )}

          {/* Professional Skills Section */}
          {portfolio?.skills && portfolio.skills.length > 0 && renderSection(
            'Skills & Expertise',
            'construct-outline',
            <View style={{ gap: 10 }}>
              {portfolio.skills.map((skill, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#fafbfc',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: 10,
                  }}>
                    {skill.name}
                  </Text>
                  
                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    alignItems: 'center',
                  }}>
                    {skill.type && (
                      <View style={{
                        backgroundColor: '#1e40af',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}>
                        <Text style={{
                          color: 'white',
                          fontSize: 11,
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}>
                          {skill.type.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    )}
                    
                    {skill.proficiencyLevel && (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                      }}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          marginRight: 6,
                          backgroundColor: 
                            skill.proficiencyLevel.toLowerCase().includes('beginner') ? '#eab308' : 
                            skill.proficiencyLevel.toLowerCase().includes('intermediate') ? '#f97316' : 
                            skill.proficiencyLevel.toLowerCase().includes('advanced') ? '#10b981' :
                            '#3b82f6',
                        }} />
                        <Text style={{
                          color: '#64748b',
                          fontSize: 12,
                          fontWeight: '600',
                        }}>
                          {skill.proficiencyLevel}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Professional Experience Section */}
          {portfolio?.experiences && portfolio.experiences.length > 0 && renderSection(
            'Work Experience',
            'briefcase-outline',
            <View style={{ gap: 16 }}>
              {portfolio.experiences.map((experience, index) => (
                <View 
                  key={index} 
                  style={{ 
                    backgroundColor: '#fafbfc',
                    padding: 18,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                  }}
                >
                  <Text style={{
                    fontSize: 17,
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: 8,
                    lineHeight: 24,
                  }}>
                    {experience.jobTitle}
                  </Text>
                  
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#1e40af',
                    marginBottom: 8,
                  }}>
                    {experience.employer}
                  </Text>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons name="calendar-outline" size={15} color="#94a3b8" />
                    <Text style={{
                      fontSize: 13,
                      color: '#64748b',
                      marginLeft: 6,
                      fontWeight: '500',
                    }}>
                      {experience.startDate} - {experience.endDate || 'Present'}
                    </Text>
                  </View>
                  
                  {experience.description && (
                    <Text style={{
                      fontSize: 14,
                      lineHeight: 22,
                      color: '#64748b',
                      fontWeight: '500',
                    }}>
                      {experience.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Enhanced Projects Section */}
          {portfolio?.projects && portfolio.projects.length > 0 && renderSection(
            'Featured Projects',
            'code-slash-outline',
            <View style={{ gap: 24 }}>
              {portfolio.projects.map((project, index) => (
                <View 
                  key={index} 
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                    overflow: 'hidden',
                  }}
                >
                  {project.projectImageFilePath && (
                    <View style={{
                      overflow: 'hidden',
                      marginBottom: 0,
                    }}>
                      <Image
                        source={{ uri: project.projectImageFilePath }}
                        style={{
                          width: '100%',
                          height: screenWidth * 0.5,
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  
                  <View style={{ padding: 20 }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '800',
                      color: '#1e293b',
                      marginBottom: 12,
                      lineHeight: 24,
                    }}>
                      {project.name}
                    </Text>
                    
                    {project.description && (
                      <Text style={{
                        fontSize: 13,
                        lineHeight: 22,
                        color: '#475569',
                        marginBottom: 16,
                        fontWeight: '500',
                      }}>
                        {project.description}
                      </Text>
                    )}
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <View>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: '#64748b',
                          marginBottom: 8,
                        }}>
                          Technologies Used:
                        </Text>
                        <View style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}>
                          {project.technologies.map((tech, techIndex) => (
                            <View
                              key={techIndex}
                              style={{
                                backgroundColor: '#eff6ff',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: '#dbeafe',
                              }}
                            >
                              <Text style={{
                                fontSize: 11,
                                fontWeight: '700',
                                color: '#1e40af',
                              }}>
                                {tech}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Certificates Section */}
          {certificates && certificates.length > 0 && renderSection(
            'Certifications',
            'ribbon-outline',
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {certificates.map((cert, index) => (
                <TouchableOpacity
                  key={cert.id || index}
                  onPress={() => handleCertificatePress(cert)}
                  style={{
                    width: screenWidth * 0.6,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: '#f8fafc',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                  }}
                >
                  {cert.certificateFilePath ? (
                    <CertificateImage
                      filePath={cert.certificateFilePath}
                      style={{
                        width: '100%',
                        height: screenWidth * 0.4,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{
                      width: '100%',
                      height: screenWidth * 0.4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f3f4f6',
                    }}>
                      <Ionicons name="document-outline" size={32} color="#9ca3af" />
                    </View>
                  )}
                  <View style={{ padding: 12 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: 4,
                    }} numberOfLines={1}>
                      {cert.courseName || 'Certificate'}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: '#6b7280',
                    }}>
                      {cert.issueDate || 'No date available'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Awards Section */}
          {portfolio?.awardsRecognitions && portfolio.awardsRecognitions.length > 0 && renderSection(
            'Awards & Recognition',
            'trophy-outline',
            <View style={{ gap: 12 }}>
              {portfolio.awardsRecognitions.map((award, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#fef7cd',
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#fde047',
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: 4,
                  }}>
                    {award.title}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#ca8a04',
                    marginBottom: 4,
                  }}>
                    {award.issuer}
                  </Text>
                  {award.dateReceived && (
                    <Text style={{
                      fontSize: 12,
                      color: '#6b7280',
                      marginBottom: 8,
                    }}>
                      {award.dateReceived}
                    </Text>
                  )}
                  {award.description && (
                    <Text style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: '#4b5563',
                    }}>
                      {award.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Education Section */}
          {portfolio?.continuingEducations && portfolio.continuingEducations.length > 0 && renderSection(
            'Education',
            'school-outline',
            <View style={{ gap: 16 }}>
              {portfolio.continuingEducations.map((education, index) => (
                <View key={index} style={{ paddingBottom: index < portfolio.continuingEducations.length - 1 ? 16 : 0, borderBottomWidth: index < portfolio.continuingEducations.length - 1 ? 1 : 0, borderBottomColor: '#f3f4f6' }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: 4,
                  }}>
                    {education.courseName}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#4f46e5',
                    marginBottom: 4,
                  }}>
                    {education.institution}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#6b7280',
                    marginBottom: 8,
                  }}>
                    {education.startDate} - {education.endDate || 'Present'}
                  </Text>
                  {education.description && (
                    <Text style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: '#4b5563',
                    }}>
                      {education.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* TESDA Information */}
          {portfolio?.ncLevel && renderSection(
            'TESDA Certification',
            'medal-outline',
            <View style={{
              backgroundColor: '#f0f9ff',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#0ea5e9',
            }}>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#0369a1' }}>NC Level:</Text>
                  <Text style={{ fontSize: 14, color: '#1f2937' }}>{portfolio.ncLevel}</Text>
                </View>
                {portfolio.trainingCenter && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#0369a1' }}>Training Center:</Text>
                    <Text style={{ fontSize: 14, color: '#1f2937', flex: 1, textAlign: 'right' }}>{portfolio.trainingCenter}</Text>
                  </View>
                )}
                {portfolio.trainingDuration && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#0369a1' }}>Duration:</Text>
                    <Text style={{ fontSize: 14, color: '#1f2937' }}>{portfolio.trainingDuration}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Empty State */}
          {!portfolio && (
            <View style={{
              alignItems: 'center',
              paddingVertical: 80,
              paddingHorizontal: 24,
              backgroundColor: '#ffffff',
              borderRadius: 16,
              marginHorizontal: 16,
              marginVertical: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <Ionicons name="document-outline" size={36} color="#6b7280" />
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                No Portfolio Available
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#6b7280',
                marginBottom: 16,
                textAlign: 'center',
                lineHeight: 24,
              }}>
                This professional hasn't shared their portfolio yet.
              </Text>
              {graduate && (
                <View style={{
                  backgroundColor: '#f8fafc',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  marginTop: 8,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: '#475569',
                    textAlign: 'center',
                    fontWeight: '500',
                  }}>
                    {graduate.fullName || graduate.username || 'Unknown User'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Certificate Modal */}
      <Modal
        visible={selectedCertificate !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCertificateModal}
        statusBarTranslucent={true}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity
            onPress={closeCertificateModal}
            style={{
              position: 'absolute',
              top: 60,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {selectedCertificate && (
            <View style={{ width: '90%', alignItems: 'center' }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: 'white',
                textAlign: 'center',
                marginBottom: 20,
              }}>
                {selectedCertificate.courseName || 'Certificate'}
              </Text>

              {selectedCertificate.certificateFilePath ? (
                <CertificateImage
                  filePath={selectedCertificate.certificateFilePath}
                  style={{
                    width: screenWidth - 40,
                    height: screenWidth * 0.75,
                    borderRadius: 12,
                  }}
                  resizeMode="contain"
                />
              ) : (
                <View style={{
                  width: screenWidth - 40,
                  height: screenWidth * 0.75,
                  backgroundColor: '#374151',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="document-outline" size={64} color="#9ca3af" />
                  <Text style={{ color: '#9ca3af', marginTop: 16 }}>
                    Certificate image not available
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={closeCertificateModal}
                style={{
                  marginTop: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 24,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '500' }}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}