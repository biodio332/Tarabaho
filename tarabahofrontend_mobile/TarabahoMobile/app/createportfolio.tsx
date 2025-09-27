import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function CreatePortfolio() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    professionalTitle: '',
    professionalSummary: '',
    primaryCourseType: '',
    scholarScheme: '',
    designTemplate: 'default',
    customSectionJson: '',
    visibility: 'PUBLIC',
    email: '',
    phone: '',
    website: '',
    portfolioCategory: '',
    preferredWorkLocation: '',
    workScheduleAvailability: '',
    salaryExpectations: '',
  });

  const [skills, setSkills] = useState<Array<{ name: string; type: string; proficiencyLevel?: string }>>([]);
  const [skillDraft, setSkillDraft] = useState<{ name: string; type: string; proficiencyLevel?: string }>({ name: '', type: 'TECHNICAL', proficiencyLevel: '' });
  const [experiences, setExperiences] = useState<Array<{ jobTitle: string; company: string; duration?: string; responsibilities?: string }>>([]);
  const [expDraft, setExpDraft] = useState<{ jobTitle: string; company: string; duration?: string; responsibilities?: string }>({ jobTitle: '', company: '', duration: '', responsibilities: '' });
  const [awards, setAwards] = useState<Array<{ title: string; issuer?: string; dateReceived?: string }>>([]);
  const [awardDraft, setAwardDraft] = useState<{ title: string; issuer?: string; dateReceived?: string }>({ title: '', issuer: '', dateReceived: '' });
  const [educations, setEducations] = useState<Array<{ courseName: string; institution?: string; completionDate?: string }>>([]);
  const [eduDraft, setEduDraft] = useState<{ courseName: string; institution?: string; completionDate?: string }>({ courseName: '', institution: '', completionDate: '' });
  const [memberships, setMemberships] = useState<Array<{ organization: string; membershipType?: string; startDate?: string }>>([]);
  const [memDraft, setMemDraft] = useState<{ organization: string; membershipType?: string; startDate?: string }>({ organization: '', membershipType: '', startDate: '' });
  const [references, setReferences] = useState<Array<{ name: string; position?: string; company?: string; contact?: string; email?: string }>>([]);
  const [refDraft, setRefDraft] = useState<{ name: string; position?: string; company?: string; contact?: string; email?: string }>({ name: '', position: '', company: '', contact: '', email: '' });
  const [certificateIds, setCertificateIds] = useState<number[]>([]);
  const [certDraft, setCertDraft] = useState<{ courseName: string; certificateNumber?: string; issueDate?: string }>({ courseName: '', certificateNumber: '', issueDate: '' });
  const [certFile, setCertFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  const onChange = (key: keyof typeof form, value: string) => { setForm((prev) => ({ ...prev, [key]: value })); setError(''); };

  const addSkill = () => { if (!skillDraft.name) { setError('Skill name is required.'); return; } setSkills((prev) => [...prev, { name: skillDraft.name, type: skillDraft.type, proficiencyLevel: skillDraft.proficiencyLevel }]); setSkillDraft({ name: '', type: 'TECHNICAL', proficiencyLevel: '' }); };
  const addExperience = () => { if (!expDraft.jobTitle || !expDraft.company) { setError('Experience needs job title and company.'); return; } setExperiences((prev) => [...prev, { ...expDraft }]); setExpDraft({ jobTitle: '', company: '', duration: '', responsibilities: '' }); };
  const addAward = () => { if (!awardDraft.title) { setError('Award title is required.'); return; } setAwards((prev) => [...prev, { ...awardDraft }]); setAwardDraft({ title: '', issuer: '', dateReceived: '' }); };
  const addEducation = () => { if (!eduDraft.courseName) { setError('Course name is required.'); return; } setEducations((prev) => [...prev, { ...eduDraft }]); setEduDraft({ courseName: '', institution: '', completionDate: '' }); };
  const addMembership = () => { if (!memDraft.organization) { setError('Organization is required.'); return; } setMemberships((prev) => [...prev, { ...memDraft }]); setMemDraft({ organization: '', membershipType: '', startDate: '' }); };
  const addReference = () => { if (!refDraft.name) { setError('Reference name is required.'); return; } setReferences((prev) => [...prev, { ...refDraft }]); setRefDraft({ name: '', position: '', company: '', contact: '', email: '' }); };

  const pickCertificateFile = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission required', 'Media library permission is required.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: false, quality: 1 });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      const name = asset.fileName || 'certificate.jpg';
      const type = asset.mimeType || 'image/jpeg';
      setCertFile({ uri: asset.uri, name, type });
    } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed to pick image'); }
  };

  const uploadCertificate = async (graduateId: number, token: string) => {
    if (!certDraft.courseName) { setError('Certificate course name is required.'); return null; }
    const formData = new FormData();
    formData.append('courseName', certDraft.courseName);
    if (certDraft.certificateNumber) formData.append('certificateNumber', certDraft.certificateNumber);
    if (certDraft.issueDate) formData.append('issueDate', certDraft.issueDate);
    if (certFile) { formData.append('certificateFile', { uri: certFile.uri, name: certFile.name, type: certFile.type } as any); }
    const res = await fetch(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include', body: formData as any });
    if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.message || data.error || 'Failed to upload certificate'); }
    const created = await res.json();
    return created;
  };

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) throw new Error('Missing username. Please log in again.');
      let token = await AsyncStorage.getItem('authToken');
      if (!token) { const tokenRes = await fetch(`${BACKEND_URL}/api/graduate/get-token`, { credentials: 'include' }); const tokenJson = await tokenRes.json().catch(() => ({} as any)); token = tokenJson?.token; }
      if (!token) throw new Error('Authentication token is missing. Please sign in again.');
      const gradRes = await fetch(`${BACKEND_URL}/api/graduate/username/${encodeURIComponent(username)}`, { credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
      if (!gradRes.ok) { const data = await gradRes.json().catch(() => ({})); throw new Error(data.message || data.error || 'Failed to resolve graduate'); }
      const graduate = await gradRes.json();
      const graduateId = graduate?.id;
      if (!graduateId) throw new Error('Graduate ID not found.');
      const certRes = await fetch(`${BACKEND_URL}/api/certificate/graduate/${graduateId}`, { credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
      if (!certRes.ok && certRes.status !== 404) { const data = await certRes.json().catch(() => ({})); throw new Error(data.message || data.error || 'Failed to verify certificates'); }
      const existingCertificates = certRes.ok ? await certRes.json() : [];
      const hasAtLeastOneCertificate = Array.isArray(existingCertificates) && existingCertificates.length > 0;
      if (!hasAtLeastOneCertificate) { setError('Graduate must be verified with at least one certificate.'); return; }
      const payload: any = {
        graduateId,
        professionalSummary: form.professionalSummary,
        primaryCourseType: form.primaryCourseType,
        scholarScheme: form.scholarScheme || 'None',
        designTemplate: form.designTemplate,
        customSectionJson: form.customSectionJson || null,
        visibility: form.visibility,
        avatar: null,
        fullName: form.fullName,
        professionalTitle: form.professionalTitle || null,
        ncLevel: null,
        trainingCenter: null,
        scholarshipType: null,
        trainingDuration: null,
        tesdaRegistrationNumber: null,
        email: form.email || null,
        phone: form.phone || null,
        website: form.website || null,
        portfolioCategory: form.portfolioCategory || null,
        preferredWorkLocation: form.preferredWorkLocation || null,
        workScheduleAvailability: form.workScheduleAvailability || null,
        salaryExpectations: form.salaryExpectations || null,
        skills: skills.map((s) => ({ name: s.name, type: s.type, proficiencyLevel: s.proficiencyLevel || null })),
        experiences: experiences.map((e) => ({ jobTitle: e.jobTitle, company: e.company, duration: e.duration || null, responsibilities: e.responsibilities || null })),
        projectIds: [],
        awardsRecognitions: awards.map((a) => ({ title: a.title, issuer: a.issuer || null, dateReceived: a.dateReceived || null })),
        continuingEducations: educations.map((edu) => ({ courseName: edu.courseName, institution: edu.institution || null, completionDate: edu.completionDate || null })),
        professionalMemberships: memberships.map((m) => ({ organization: m.organization, membershipType: m.membershipType || null, startDate: m.startDate || null })),
        references: references.map((r) => ({ name: r.name, position: r.position || null, company: r.company || null, contact: r.contact || null, email: r.email || null })),
        certificateIds: certificateIds,
      };
      const res = await fetch(`${BACKEND_URL}/api/portfolio`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, credentials: 'include', body: JSON.stringify(payload) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.message || data.error || 'Failed to create portfolio'); }
      Alert.alert('Success', 'Portfolio created', [{ text: 'OK', onPress: () => router.replace('/portfolio') }]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unknown error'); } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
      <Button title="Back" onPress={() => router.back()} />
      <Text style={{ fontSize: 18, marginVertical: 12 }}>Create Portfolio</Text>
      {loading && <ActivityIndicator />}
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <ScrollView>
        <Text>Full Name</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.fullName} onChangeText={(t) => onChange('fullName', t)} />
        <Text>Professional Title</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.professionalTitle} onChangeText={(t) => onChange('professionalTitle', t)} />
        <Text>Professional Summary</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.professionalSummary} onChangeText={(t) => onChange('professionalSummary', t)} multiline />
        <Text>Primary Course Type</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.primaryCourseType} onChangeText={(t) => onChange('primaryCourseType', t)} />
        <Text>Scholar Scheme</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.scholarScheme} onChangeText={(t) => onChange('scholarScheme', t)} />
        <Text>Email</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} autoCapitalize="none" value={form.email} onChangeText={(t) => onChange('email', t)} />
        <Text>Phone</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.phone} onChangeText={(t) => onChange('phone', t)} />
        <Text>Website</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} autoCapitalize="none" value={form.website} onChangeText={(t) => onChange('website', t)} />
        <Text>Portfolio Category</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.portfolioCategory} onChangeText={(t) => onChange('portfolioCategory', t)} />
        <Text>Preferred Work Location</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.preferredWorkLocation} onChangeText={(t) => onChange('preferredWorkLocation', t)} />
        <Text>Work Schedule Availability</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.workScheduleAvailability} onChangeText={(t) => onChange('workScheduleAvailability', t)} />
        <Text>Salary Expectations</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={form.salaryExpectations} onChangeText={(t) => onChange('salaryExpectations', t)} />
        <Text>Add Certificate</Text>
        <Text>Course Name</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={certDraft.courseName} onChangeText={(t) => setCertDraft((p) => ({ ...p, courseName: t }))} />
        <Text>Certificate Number</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={certDraft.certificateNumber} onChangeText={(t) => setCertDraft((p) => ({ ...p, certificateNumber: t }))} />
        <Text>Issue Date</Text>
        <TextInput placeholder="YYYY-MM-DD" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={certDraft.issueDate} onChangeText={(t) => setCertDraft((p) => ({ ...p, issueDate: t }))} />
        <Button title={certFile ? 'Change File' : 'Pick File'} onPress={pickCertificateFile} />
        <View style={{ height: 8 }} />
        <Button title="Upload Certificate" onPress={async () => {
          try {
            setLoading(true);
            const username = await AsyncStorage.getItem('username');
            if (!username) throw new Error('Missing username');
            let token = await AsyncStorage.getItem('authToken');
            if (!token) { const tokenRes = await fetch(`${BACKEND_URL}/api/graduate/get-token`, { credentials: 'include' }); const tokenJson = await tokenRes.json().catch(() => ({} as any)); token = tokenJson?.token; }
            if (!token) throw new Error('Missing token');
            const gradRes = await fetch(`${BACKEND_URL}/api/graduate/username/${encodeURIComponent(username)}`, { credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
            if (!gradRes.ok) throw new Error('Failed resolving graduate');
            const grad = await gradRes.json();
            const gid = grad?.id;
            if (!gid) throw new Error('Missing graduateId');
            const created = await uploadCertificate(gid, token);
            if (created?.id) setCertificateIds((prev) => [...prev, created.id]);
            Alert.alert('Success', 'Certificate uploaded');
          } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed to upload certificate'); } finally { setLoading(false); }
        }} />
        <Text>Add Skill</Text>
        <Text>Name</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={skillDraft.name} onChangeText={(t) => setSkillDraft((p) => ({ ...p, name: t }))} />
        <Text>Type</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={skillDraft.type} onChangeText={(t) => setSkillDraft((p) => ({ ...p, type: t }))} />
        <Text>Proficiency</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={skillDraft.proficiencyLevel} onChangeText={(t) => setSkillDraft((p) => ({ ...p, proficiencyLevel: t }))} />
        <Button title="Add Skill" onPress={addSkill} />
        <Text>Add Experience</Text>
        <Text>Job Title</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={expDraft.jobTitle} onChangeText={(t) => setExpDraft((p) => ({ ...p, jobTitle: t }))} />
        <Text>Company</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={expDraft.company} onChangeText={(t) => setExpDraft((p) => ({ ...p, company: t }))} />
        <Text>Duration</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={expDraft.duration} onChangeText={(t) => setExpDraft((p) => ({ ...p, duration: t }))} />
        <Text>Responsibilities</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={expDraft.responsibilities} onChangeText={(t) => setExpDraft((p) => ({ ...p, responsibilities: t }))} />
        <Button title="Add Experience" onPress={addExperience} />
        <Text>Add Awards</Text>
        <Text>Title</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={awardDraft.title} onChangeText={(t) => setAwardDraft((p) => ({ ...p, title: t }))} />
        <Text>Issuer</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={awardDraft.issuer} onChangeText={(t) => setAwardDraft((p) => ({ ...p, issuer: t }))} />
        <Text>Date Received</Text>
        <TextInput placeholder="YYYY-MM-DD" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={awardDraft.dateReceived} onChangeText={(t) => setAwardDraft((p) => ({ ...p, dateReceived: t }))} />
        <Button title="Add Award" onPress={addAward} />
        <Text>Add Education</Text>
        <Text>Course Name</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={eduDraft.courseName} onChangeText={(t) => setEduDraft((p) => ({ ...p, courseName: t }))} />
        <Text>Institution</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={eduDraft.institution} onChangeText={(t) => setEduDraft((p) => ({ ...p, institution: t }))} />
        <Text>Completion Date</Text>
        <TextInput placeholder="YYYY-MM-DD" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={eduDraft.completionDate} onChangeText={(t) => setEduDraft((p) => ({ ...p, completionDate: t }))} />
        <Button title="Add Education" onPress={addEducation} />
        <Text>Add Membership</Text>
        <Text>Organization</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={memDraft.organization} onChangeText={(t) => setMemDraft((p) => ({ ...p, organization: t }))} />
        <Text>Membership Type</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={memDraft.membershipType} onChangeText={(t) => setMemDraft((p) => ({ ...p, membershipType: t }))} />
        <Text>Start Date</Text>
        <TextInput placeholder="YYYY-MM-DD" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={memDraft.startDate} onChangeText={(t) => setMemDraft((p) => ({ ...p, startDate: t }))} />
        <Button title="Add Membership" onPress={addMembership} />
        <Text>Add Reference</Text>
        <Text>Name</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={refDraft.name} onChangeText={(t) => setRefDraft((p) => ({ ...p, name: t }))} />
        <Text>Position</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={refDraft.position} onChangeText={(t) => setRefDraft((p) => ({ ...p, position: t }))} />
        <Text>Company</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={refDraft.company} onChangeText={(t) => setRefDraft((p) => ({ ...p, company: t }))} />
        <Text>Contact</Text>
        <TextInput style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={refDraft.contact} onChangeText={(t) => setRefDraft((p) => ({ ...p, contact: t }))} />
        <Text>Email</Text>
        <TextInput autoCapitalize="none" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} value={refDraft.email} onChangeText={(t) => setRefDraft((p) => ({ ...p, email: t }))} />
        <Button title="Add Reference" onPress={addReference} />
        <Button title={loading ? 'Creating...' : 'Create Portfolio'} onPress={handleCreate} disabled={loading} />
      </ScrollView>
    </View>
  );
}


