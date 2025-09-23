import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Button, Image, Alert, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

type Portfolio = {
  id?: number;
  fullName?: string;
  professionalTitle?: string;
  professionalSummary?: string;
  primaryCourseType?: string;
  scholarScheme?: string;
  designTemplate?: string;
  customSectionJson?: string;
  visibility?: string;
  email?: string;
  phone?: string;
  website?: string;
  portfolioCategory?: string;
  preferredWorkLocation?: string;
  workScheduleAvailability?: string;
  salaryExpectations?: string;
  avatar?: string;
  skills?: Array<{ id?: number; name?: string; type?: string; proficiencyLevel?: string }>;
  experiences?: Array<{ id?: number; jobTitle?: string; employer?: string; description?: string; startDate?: string; endDate?: string }>;
  awardsRecognitions?: Array<{ id?: number; title?: string; issuer?: string; dateReceived?: string }>;
  continuingEducations?: Array<{ id?: number; courseName?: string; institution?: string; completionDate?: string }>;
  professionalMemberships?: Array<{ id?: number; organization?: string; membershipType?: string; startDate?: string }>;
  references?: Array<{ id?: number; name?: string; position?: string; company?: string; contact?: string; email?: string }>;
};

export default function PortfolioScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [graduateName, setGraduateName] = useState<string>('');
  const [graduate, setGraduate] = useState<any>(null);
  const [graduateId, setGraduateId] = useState<number | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      setError('');
      setLoading(true);
      try {
        const username = await AsyncStorage.getItem('username');
        if (!username) {
          throw new Error('Missing username. Please log in again.');
        }
        setGraduateName(username);

        // resolve graduate id by username first (reusing web logic pattern)
        let token = await AsyncStorage.getItem('authToken');
        if (!token) {
          const tokenRes = await fetch(`${BACKEND_URL}/api/graduate/get-token`, { credentials: 'include' });
          const tokenJson = await tokenRes.json().catch(() => ({} as any));
          token = tokenJson?.token;
        }
        if (!token) throw new Error('Authentication token is missing. Please sign in again.');

        const gradRes = await fetch(`${BACKEND_URL}/api/graduate/username/${encodeURIComponent(username)}`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!gradRes.ok) {
          const data = await gradRes.json().catch(() => ({}));
          throw new Error(data.message || data.error || 'Failed to resolve graduate');
        }
        const graduate = await gradRes.json();
        setGraduate(graduate);
        const graduateId = graduate?.id;
        setGraduateId(graduateId || null);
        if (!graduateId) throw new Error('Graduate ID not found.');

        const portRes = await fetch(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (portRes.status === 404) {
          setPortfolio(null);
        } else if (!portRes.ok) {
          const data = await portRes.json().catch(() => ({}));
          throw new Error(data.message || data.error || 'Failed to load portfolio');
        } else {
          const data: Portfolio = await portRes.json();
          setPortfolio(data);
        }

        // Fetch certificates for this graduate
        const certRes = await fetch(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (certRes.ok) {
          const certs = await certRes.json();
          setCertificates(Array.isArray(certs) ? certs : []);
        } else if (certRes.status !== 404) {
          // ignore 404 (no certificates yet)
          const data = await certRes.json().catch(() => ({}));
          console.log('Certificates load error:', data);
        }

        setAuthToken(token);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, []);

  const handleDeletePortfolio = async () => {
    Alert.alert(
      'Delete Portfolio',
      'Are you sure you want to delete this portfolio? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!graduateId || !authToken) {
              setError('Missing authentication or graduate ID.');
              return;
            }
            try {
              const res = await fetch(`${BACKEND_URL}/api/portfolio/graduate/${graduateId}/portfolio`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` },
                credentials: 'include',
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || data.error || 'Failed to delete portfolio');
              }
              Alert.alert('Success', 'Portfolio deleted successfully.');
              router.push('/GraduateHomepage');
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Unknown error');
            }
          },
        },
      ]
    );
  };

  const handleCertificatePress = (certificate: any) => {
    setSelectedCertificate(certificate);
  };

  const closeCertificateModal = () => {
    setSelectedCertificate(null);
  };


  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
      <Button title="Back" onPress={() => router.back()} />
      <Text style={{ fontSize: 20, marginVertical: 12 }}>Portfolio</Text>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: 'red' }}>{error}</Text>
      ) : !portfolio ? (
        <View>
          <Text>Create Portfolio.</Text>
          <Button title="Create Portfolio" onPress={() => router.push('/CreatePortfolio')} />
        </View>
      ) : (
        <ScrollView>
          {/* Portfolio Header with Edit and Delete Buttons */}
          <View style={styles.portfolioHeader}>
            <Text style={{ fontSize: 20, marginVertical: 12, flex: 1 }}>Portfolio</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => router.push('/CreatePortfolio')}
              >
                <Text style={styles.editButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeletePortfolio}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {graduate?.profilePicture ? (
            <Image source={{ uri: graduate.profilePicture }} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 12 }} />
          ) : null}

          <Text>Basic Information</Text>
          <Text>Full Name: {portfolio.fullName || graduateName}</Text>
          <Text>Professional Title: {portfolio.professionalTitle || ''}</Text>
          <Text>Professional Summary: {portfolio.professionalSummary || ''}</Text>
          <Text>Primary Course Type: {portfolio.primaryCourseType || ''}</Text>
          <Text>Scholar Scheme: {portfolio.scholarScheme || ''}</Text>
          <Text>Design Template: {portfolio.designTemplate || ''}</Text>
          <Text>Custom Section: {portfolio.customSectionJson || ''}</Text>
          <Text>Visibility: {portfolio.visibility || ''}</Text>

          <Text>Contact Information</Text>
          <Text>Email: {portfolio.email || ''}</Text>
          <Text>Phone: {portfolio.phone || ''}</Text>
          <Text>Website: {portfolio.website || ''}</Text>
          <Text>Preferred Work Location: {portfolio.preferredWorkLocation || ''}</Text>
          <Text>Work Schedule Availability: {portfolio.workScheduleAvailability || ''}</Text>
          <Text>Salary Expectations: {portfolio.salaryExpectations || ''}</Text>

          <Text>Skills</Text>
          {(portfolio.skills || []).map((s, idx) => (
            <Text key={`skill-${s.id || idx}`}>{s.name} {s.type ? `(${s.type})` : ''} {s.proficiencyLevel ? `- ${s.proficiencyLevel}` : ''}</Text>
          ))}

          <Text>Experience</Text>
          {(portfolio.experiences || []).map((e, idx) => (
            <View key={`exp-${e.id || idx}`}>
              <Text>{e.jobTitle || ''} @ {e.employer || ''}</Text>
              <Text>{e.startDate || ''} - {e.endDate || ''}</Text>
              <Text>{e.description || ''}</Text>
            </View>
          ))}

          <Text>Awards & Recognition</Text>
          {(portfolio.awardsRecognitions || []).map((a, idx) => (
            <View key={`award-${a.id || idx}`}>
              <Text>{a.title || ''} - {a.issuer || ''}</Text>
              <Text>{a.dateReceived || ''}</Text>
            </View>
          ))}

          <Text>Continuing Information</Text>
          {(portfolio.continuingEducations || []).map((c, idx) => (
            <View key={`cont-${c.id || idx}`}>
              <Text>{c.courseName || ''} - {c.institution || ''}</Text>
              <Text>{c.completionDate || ''}</Text>
            </View>
          ))}

          <Text>Professional Membership</Text>
          {(portfolio.professionalMemberships || []).map((m, idx) => (
            <View key={`mem-${m.id || idx}`}>
              <Text>{m.organization || ''} {m.membershipType ? `- ${m.membershipType}` : ''}</Text>
              <Text>{m.startDate || ''}</Text>
            </View>
          ))}

          <Text>References</Text>
          {(portfolio.references || []).map((r, idx) => (
            <View key={`ref-${r.id || idx}`}>
              <Text>{r.name || ''}</Text>
              <Text>{r.position || ''} {r.company ? `@ ${r.company}` : ''}</Text>
              <Text>{r.email || ''} {r.contact ? ` | ${r.contact}` : ''}</Text>
            </View>
          ))}

          {/* Certificates Section - View Only */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Certificates</Text>
            {certificates.length > 0 ? (
              <View style={styles.certificateGrid}>
                {certificates.map((certificate, idx) => (
                  <TouchableOpacity
                    key={`cert-${certificate.id || idx}`}
                    style={styles.certificateItem}
                    onPress={() => handleCertificatePress(certificate)}
                  >
                    {certificate.certificateFilePath ? (
                      <Image
                        source={{ uri: certificate.certificateFilePath }}
                        style={styles.certificateThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.certificatePlaceholder}>
                        <Text style={styles.placeholderText}>📄</Text>
                      </View>
                    )}
                    <Text style={styles.certificateTitle} numberOfLines={2}>
                      {certificate.courseName || 'Unnamed Certificate'}
                    </Text>
                    <Text style={styles.certificateNumber} numberOfLines={1}>
                      {certificate.certificateNumber || 'No number'}
                    </Text>
                    <Text style={styles.certificateDate} numberOfLines={1}>
                      {certificate.issueDate || 'No date'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No certificates available</Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* Certificate Modal */}
      <Modal
        visible={selectedCertificate !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCertificateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeCertificateModal}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            {selectedCertificate && (
              <View style={styles.certificateModalContent}>
                <Text style={styles.modalTitle}>
                  {selectedCertificate.courseName || 'Certificate'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedCertificate.certificateNumber || 'No certificate number'}
                </Text>
                <Text style={styles.modalDate}>
                  Issued: {selectedCertificate.issueDate || 'No date'}
                </Text>
                {selectedCertificate.certificateFilePath ? (
                  <Image
                    source={{ uri: selectedCertificate.certificateFilePath }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.noImageText}>No certificate image available</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  certificateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  certificateItem: {
    width: (screenWidth - 80) / 2,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certificateThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
  },
  certificatePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 32,
    color: '#6c757d',
  },
  certificateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  certificateNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  certificateDate: {
    fontSize: 12,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxHeight: screenWidth * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  certificateModalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalImage: {
    width: '100%',
    height: screenWidth * 0.6,
    borderRadius: 8,
  },
  noImageText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
});


