import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { commonStyles, colors } from '../styles/commonStyles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../context/AppContext';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const API_URL = 'http://10.0.2.2:5000';

const TestQueryScreen = () => {
  const navigation = useNavigation();
  const { token } = useApp();
  const [activeTab, setActiveTab] = useState('test'); // 'test' veya 'patient'
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [testNames, setTestNames] = useState([]);
  const [searchParams, setSearchParams] = useState({
    testName: '',
    startDate: new Date(),
    endDate: new Date(),
  });
  const [tcNo, setTcNo] = useState('');
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [guideResults, setGuideResults] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [testHistory, setTestHistory] = useState([]); // Yeni state ekle
  const [availableTests, setAvailableTests] = useState([]); // Mevcut test adları
  const [selectedTests, setSelectedTests] = useState([]); // Seçili test adları
  const [referenceValues, setReferenceValues] = useState({}); // Test referans değerleri için
  const [testStatuses, setTestStatuses] = useState({});
  const [referenceRanges, setReferenceRanges] = useState({});

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
  };

  const calculateAge = () => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    
    let months = (today.getFullYear() - birthDateObj.getFullYear()) * 12;
    months -= birthDateObj.getMonth();
    months += today.getMonth();
    
    // Günleri de hesaba katarak daha doğru bir sonuç elde edelim
    if (today.getDate() < birthDateObj.getDate()) {
      months--;
    }
    
    return months <= 0 ? 0 : months;
  };

  // Test isimlerini getir
  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        const response = await fetch(`${API_URL}/api/guides/test-names`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Test isimleri alınamadı');
        }

        const data = await response.json();
        setTestNames(data);

        // İlk test ismini varsayılan olarak seç
        if (data.length > 0) {
          setSearchParams(prev => ({ ...prev, testName: data[0] }));
        }
      } catch (error) {
        console.error('Test isimleri getirme hatası:', error);
        Alert.alert('Hata', 'Test isimleri alınırken bir hata oluştu');
      }
    };

    fetchTestNames();
  }, [token]);

  const handleSubmitResult = async () => {
    if (!testResult) {
      Alert.alert('Hata', 'Lütfen test sonucunu giriniz');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tests/update-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          testName: searchParams.testName,
          birthDate: birthDate.toISOString(),
          result: testResult
        })
      });

      if (!response.ok) {
        throw new Error('Test sonucu güncellenemedi');
      }

      Alert.alert('Başarılı', 'Test sonucu başarıyla kaydedildi');
      setTestResult('');
    } catch (error) {
      console.error('Test sonucu güncelleme hatası:', error);
      Alert.alert('Hata', 'Test sonucu kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const evaluateTestResult = async () => {
    if (!testResult) {
      Alert.alert('Hata', 'Lütfen test sonucunu giriniz');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/guides/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          testName: searchParams.testName,
          ageInMonths: calculateAge(),
          testValue: parseFloat(testResult)
        })
      });

      if (!response.ok) {
        throw new Error('Test değerlendirme hatası');
      }

      const result = await response.json();
      
      if (!result.success || !result.data || result.data.length === 0) {
        setGuideResults(null);
      } else {
        setGuideResults(result.data);
      }
    } catch (error) {
      console.error('Test değerlendirme hatası:', error);
      Alert.alert('Hata', error.message || 'Test değerlendirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientInfo = async () => {
    if (!tcNo.trim()) {
      Alert.alert('Uyarı', 'Lütfen TC Kimlik numarası giriniz');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tests/patient/${tcNo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setPatientInfo(result.data.patientInfo);
        setTestHistory(result.data.testHistory || []);
      } else {
        Alert.alert('Hata', result.message || 'Hasta bilgileri getirilemedi');
        setPatientInfo(null);
        setTestHistory([]);
      }
    } catch (error) {
      console.error('Hasta bilgileri getirme hatası:', error);
      Alert.alert('Hata', 'Hasta bilgileri getirilemedi');
      setPatientInfo(null);
      setTestHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestNames = async () => {
    if (!tcNo.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/tests/test-names/${tcNo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setAvailableTests(result.data.testNames);
      } else {
        console.error('Test isimleri getirme hatası:', result.message);
        setAvailableTests([]);
      }
    } catch (error) {
      console.error('Test isimleri getirme hatası:', error);
      setAvailableTests([]);
    }
  };

  const handlePatientSearch = async () => {
    if (tcNo.length !== 11) {
      Alert.alert('Uyarı', 'Geçerli bir TC Kimlik numarası giriniz');
      return;
    }

    await fetchPatientInfo();
    await fetchTestNames();
  };

  const fetchTestResults = async () => {
    if (!tcNo.trim()) {
      Alert.alert('Uyarı', 'Lütfen TC Kimlik numarası giriniz');
      return;
    }
    
    try {
      setLoading(true);
      
      // Önce test adlarını getir
      await fetchTestNames();
      
      const response = await fetch(`${API_URL}/api/tests/patient/${tcNo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestHistory(data.testHistory || []);
      } else {
        Alert.alert('Hata', data.message || 'Test sonuçları getirilemedi');
        setTestHistory([]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkReferenceValue = async (testName, testValue) => {
    const age = calculateAge();
    try {
      console.log(`Referans değeri kontrol ediliyor - Test: ${testName}, Değer: ${testValue}, Yaş: ${age}`);
      
      const response = await fetch(`${API_URL}/api/guides/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testName,
          ageInMonths: age,
        }),
      });

      if (!response.ok) {
        console.error('API yanıt hatası:', response.status, response.statusText);
        throw new Error('Referans değerleri alınamadı');
      }

      const result = await response.json();
      console.log('API yanıtı:', result);

      if (!result.success || !result.data || result.data.length === 0) {
        return 'Belirsiz';
      }

      // Tüm kılavuzları sakla
      setReferenceRanges(prev => ({
        ...prev,
        [`${testName}`]: result.data
      }));

      // İlk kılavuza göre durumu belirle (gerekirse değiştirilebilir)
      const guide = result.data[0];
      const numericValue = parseFloat(testValue);
      let status = 'Normal';

      // Referans değerlerini sakla
      if (guide.geometricMean && guide.geometricSD) {
        const lower = guide.geometricMean - (2 * guide.geometricSD);
        const upper = guide.geometricMean + (2 * guide.geometricSD);
        if (numericValue < lower) status = 'Düşük';
        else if (numericValue > upper) status = 'Yüksek';
      }
      else if (guide.mean && guide.sd) {
        const lower = guide.mean - (2 * guide.sd);
        const upper = guide.mean + (2 * guide.sd);
        if (numericValue < lower) status = 'Düşük';
        else if (numericValue > upper) status = 'Yüksek';
      }
      else if (guide.minValue !== undefined && guide.maxValue !== undefined) {
        if (numericValue < guide.minValue) status = 'Düşük';
        else if (numericValue > guide.maxValue) status = 'Yüksek';
      }
      else if (guide.confidenceLow !== undefined && guide.confidenceHigh !== undefined) {
        if (numericValue < guide.confidenceLow) status = 'Düşük';
        else if (numericValue > guide.confidenceHigh) status = 'Yüksek';
      }

      return status;
    } catch (error) {
      console.error('Referans değer kontrolü hatası:', error);
      return 'Belirsiz';
    }
  };

  const checkValueStatus = (value, reference, type) => {
    const numericValue = parseFloat(value);
    let status = 'Normal';
    
    switch(type) {
      case 'geometric':
        if (reference.geometricMean && reference.geometricSD) {
          const lower = reference.geometricMean - (2 * reference.geometricSD);
          const upper = reference.geometricMean + (2 * reference.geometricSD);
          if (numericValue < lower) status = 'Düşük';
          else if (numericValue > upper) status = 'Yüksek';
        }
        break;
      case 'mean':
        if (reference.mean && reference.sd) {
          const lower = reference.mean - (2 * reference.sd);
          const upper = reference.mean + (2 * reference.sd);
          if (numericValue < lower) status = 'Düşük';
          else if (numericValue > upper) status = 'Yüksek';
        }
        break;
      case 'minmax':
        if (reference.minValue !== undefined && reference.maxValue !== undefined) {
          if (numericValue < reference.minValue) status = 'Düşük';
          else if (numericValue > reference.maxValue) status = 'Yüksek';
        }
        break;
      case 'confidence':
        if (reference.confidenceLow !== undefined && reference.confidenceHigh !== undefined) {
          if (numericValue < reference.confidenceLow) status = 'Düşük';
          else if (numericValue > reference.confidenceHigh) status = 'Yüksek';
        }
        break;
    }
    
    return status;
  };

  useEffect(() => {
    const checkAllTestResults = async () => {
      if (!testHistory || !testHistory.length) return;

      const newStatuses = {};
      for (const record of testHistory) {
        for (const test of record.tests) {
          const status = await checkReferenceValue(test.testName, test.testValue);
          newStatuses[`${record.sampleTime}-${test.testName}`] = status;
        }
      }
      setTestStatuses(newStatuses);
    };

    checkAllTestResults();
  }, [testHistory]);

  const renderTestQuery = () => (
    <>
      <View style={[commonStyles.card, styles.searchCard]}>
        <Text style={styles.sectionTitle}>Test Ara</Text>
        <View style={styles.divider} />
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Doğum Tarihi</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {birthDate.toLocaleDateString('tr-TR')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Test Adı</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={searchParams.testName}
              onValueChange={(itemValue) =>
                setSearchParams({ ...searchParams, testName: itemValue })
              }
              style={styles.picker}
            >
              {testNames.map((testName, index) => (
                <Picker.Item key={index} label={testName} value={testName} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Test Sonucu</Text>
          <TextInput
            style={styles.input}
            value={testResult}
            onChangeText={setTestResult}
            placeholder="Test sonucunu giriniz"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={evaluateTestResult}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Değerlendiriliyor...' : 'Değerlendir'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.basicInfoContainer}>
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Icon name="calendar" size={24} color="#3498db" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Yaş</Text>
            <Text style={styles.infoValue}>{calculateAge()} aylık</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Icon name="flask" size={24} color="#2ecc71" />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Test</Text>
            <Text style={styles.infoValue}>{searchParams.testName}</Text>
          </View>
        </View>

        {testResult && (
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="chart-bar" size={24} color="#e74c3c" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Değer</Text>
              <Text style={styles.infoValue}>{testResult}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={[commonStyles.card, styles.queryCard]}>
        <Text style={styles.sectionTitle}>Test Sorgula</Text>
        <View style={styles.divider} />
        
        <View style={styles.infoContainer}>
          
          {/* Kılavuz sonuçları */}
          {guideResults && guideResults.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Test Değerlendirmesi</Text>
              {guideResults.map((guide, index) => (
                <View key={index} style={styles.guideCard}>
                  <Text style={styles.guideName}>{guide.guideName}</Text>
                  <Text style={styles.ageRange}>Yaş Aralığı: {guide.ageRange}</Text>
                  
                  {/* Geometrik Ortalama */}
                  {(guide.geometricMean !== 0 || guide.geometricSD !== 0) && (
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Geometrik:</Text>
                      <Text style={styles.rangeValue}>
                        {(guide.geometricMean - (2 * guide.geometricSD)).toFixed(2)} - {(guide.geometricMean + (2 * guide.geometricSD)).toFixed(2)}
                      </Text>
                      <Icon 
                        name={getStatusIcon(testResult, guide.geometricMean - (2 * guide.geometricSD), guide.geometricMean + (2 * guide.geometricSD))}
                        size={20}
                        color={getStatusColor(testResult, guide.geometricMean - (2 * guide.geometricSD), guide.geometricMean + (2 * guide.geometricSD))}
                      />
                    </View>
                  )}

                  {/* Ortalama */}
                  {(guide.mean !== 0 || guide.sd !== 0) && (
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Ortalama:</Text>
                      <Text style={styles.rangeValue}>
                        {(guide.mean - (2 * guide.sd)).toFixed(2)} - {(guide.mean + (2 * guide.sd)).toFixed(2)}
                      </Text>
                      <Icon 
                        name={getStatusIcon(testResult, guide.mean - (2 * guide.sd), guide.mean + (2 * guide.sd))}
                        size={20}
                        color={getStatusColor(testResult, guide.mean - (2 * guide.sd), guide.mean + (2 * guide.sd))}
                      />
                    </View>
                  )}

                  {/* Min-Max */}
                  {(guide.minValue !== 0 || guide.maxValue !== 0) && (
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Min-Max:</Text>
                      <Text style={styles.rangeValue}>
                        {guide.minValue} - {guide.maxValue}
                      </Text>
                      <Icon 
                        name={getStatusIcon(testResult, guide.minValue, guide.maxValue)}
                        size={20}
                        color={getStatusColor(testResult, guide.minValue, guide.maxValue)}
                      />
                    </View>
                  )}

                  {/* Güven Aralığı */}
                  {(guide.confidenceLow !== 0 || guide.confidenceHigh !== 0) && (
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Güven:</Text>
                      <Text style={styles.rangeValue}>
                        {guide.confidenceLow} - {guide.confidenceHigh}
                      </Text>
                      <Icon 
                        name={getStatusIcon(testResult, guide.confidenceLow, guide.confidenceHigh)}
                        size={20}
                        color={getStatusColor(testResult, guide.confidenceLow, guide.confidenceHigh)}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      
    </>
  );

  const renderPatientQuery = () => (
    <View style={styles.patientQueryContainer}>
      {renderPatientSearch()}
      {patientInfo && (
        <View style={styles.patientInfoContainer}>
          <View style={styles.patientInfoHeader}>
            <Icon name="user" size={24} color="#3498db" />
            <Text style={styles.patientInfoTitle}>Hasta Bilgileri</Text>
          </View>
          
          <View style={styles.patientInfoCard}>
            <View style={styles.patientInfoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="id-card" size={20} color="#3498db" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.patientInfoLabel}>Ad Soyad:</Text>
                <Text style={styles.patientInfoValue}>{patientInfo.fullName}</Text>
              </View>
            </View>

            <View style={styles.patientInfoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="calendar" size={20} color="#2ecc71" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.patientInfoLabel}>Doğum Tarihi:</Text>
                <Text style={styles.patientInfoValue}>
                  {new Date(patientInfo.birthDate).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>

            <View style={styles.patientInfoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="venus-mars" size={20} color="#e74c3c" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.patientInfoLabel}>Cinsiyet:</Text>
                <Text style={styles.patientInfoValue}>{patientInfo.gender}</Text>
              </View>
            </View>

            <View style={styles.patientInfoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="map-marker" size={20} color="#9b59b6" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.patientInfoLabel}>Doğum Yeri:</Text>
                <Text style={styles.patientInfoValue}>{patientInfo.birthPlace}</Text>
              </View>
            </View>

            <View style={styles.patientInfoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="clock-o" size={20} color="#f1c40f" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.patientInfoLabel}>Yaş:</Text>
                <Text style={styles.patientInfoValue}>{calculateAge()} ay</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {testHistory && testHistory.length > 0 && (
        <View style={styles.testHistoryContainer}>
          <View style={styles.testHistoryHeader}>
            <Icon name="flask" size={24} color="#3498db" />
            <Text style={styles.testHistoryTitle}>Test Geçmişi</Text>
          </View>

          <View style={[styles.testPickerContainer, styles.pickerCard]}>
            <Picker
              selectedValue={selectedTests}
              style={styles.testPicker}
              onValueChange={(itemValue) => setSelectedTests(itemValue === "" ? [] : [itemValue])}
            >
              <Picker.Item label="Tüm Testler" value="" />
              {availableTests.map((testName) => (
                <Picker.Item key={testName} label={testName} value={testName} />
              ))}
            </Picker>
          </View>

          {testHistory
            .filter(record => selectedTests.length === 0 || record.tests.some(test => selectedTests.includes(test.testName)))
            .map((record, index) => (
            <View key={index} style={styles.testHistoryCard}>
              <Text style={styles.testHistoryDate}>
                Örnek Alım Zamanı: {new Date(record.sampleTime).toLocaleDateString('tr-TR')}
              </Text>
              {record.tests
                .filter(test => selectedTests.length === 0 || selectedTests.includes(test.testName))
                .map((test, testIndex) => (
                <View key={testIndex} style={styles.testHistoryTest}>
                  <View style={styles.testHeaderRow}>
                    <Text style={styles.testHistoryTestName}>{test.testName}</Text>
                    <Text style={styles.testHistoryTestValue}>{test.testValue}</Text>
                  </View>
                  
                  {testStatuses[`${record.sampleTime}-${test.testName}`] && referenceRanges[test.testName] && (
                    <View>
                      {referenceRanges[test.testName].map((guide, guideIndex) => (
                        <View key={guideIndex} style={styles.guideContainer}>
                          <Text style={styles.guideTitle}>
                            {guide.guideName} ({guide.ageRange})
                          </Text>
                          {guide.geometricMean && guide.geometricSD && 
                           guide.geometricMean !== 0 && guide.geometricSD !== 0 && (
                            <View style={styles.guideRow}>
                              <View style={styles.guideValueContainer}>
                                <Text style={styles.guideLabel}>Geometrik:</Text>
                                <Text style={styles.guideValue}>
                                  {guide.geometricMean} ± {guide.geometricSD}
                                </Text>
                              </View>
                              <View style={styles.statusContainer}>
                                <Icon 
                                  name={getStatusIcon(test.testValue, guide.geometricMean - (2 * guide.geometricSD), guide.geometricMean + (2 * guide.geometricSD))}
                                  size={20}
                                  color={getStatusColor(test.testValue, guide.geometricMean - (2 * guide.geometricSD), guide.geometricMean + (2 * guide.geometricSD))}
                                />
                              </View>
                            </View>
                          )}
                          {guide.mean && guide.sd && 
                           guide.mean !== 0 && guide.sd !== 0 && (
                            <View style={styles.guideRow}>
                              <View style={styles.guideValueContainer}>
                                <Text style={styles.guideLabel}>Ortalama:</Text>
                                <Text style={styles.guideValue}>
                                  {guide.mean} ± {guide.sd}
                                </Text>
                              </View>
                              <View style={styles.statusContainer}>
                                <Icon 
                                  name={getStatusIcon(test.testValue, guide.mean - (2 * guide.sd), guide.mean + (2 * guide.sd))}
                                  size={20}
                                  color={getStatusColor(test.testValue, guide.mean - (2 * guide.sd), guide.mean + (2 * guide.sd))}
                                />
                              </View>
                            </View>
                          )}
                          {(guide.minValue !== undefined) && (guide.maxValue !== undefined) && 
                           guide.minValue !== 0 && guide.maxValue !== 0 && (
                            <View style={styles.guideRow}>
                              <View style={styles.guideValueContainer}>
                                <Text style={styles.guideLabel}>Min-Max:</Text>
                                <Text style={styles.guideValue}>
                                  {guide.minValue} - {guide.maxValue}
                                </Text>
                              </View>
                              <View style={styles.statusContainer}>
                                <Icon 
                                  name={getStatusIcon(test.testValue, guide.minValue, guide.maxValue)}
                                  size={20}
                                  color={getStatusColor(test.testValue, guide.minValue, guide.maxValue)}
                                />
                              </View>
                            </View>
                          )}
                          {(guide.confidenceLow !== undefined) && (guide.confidenceHigh !== undefined) && 
                           guide.confidenceLow !== 0 && guide.confidenceHigh !== 0 && (
                            <View style={styles.guideRow}>
                              <View style={styles.guideValueContainer}>
                                <Text style={styles.guideLabel}>Güven:</Text>
                                <Text style={styles.guideValue}>
                                  {guide.confidenceLow} - {guide.confidenceHigh}
                                </Text>
                              </View>
                              <View style={styles.statusContainer}>
                                <Icon 
                                  name={getStatusIcon(test.testValue, guide.confidenceLow, guide.confidenceHigh)}
                                  size={20}
                                  color={getStatusColor(test.testValue, guide.confidenceLow, guide.confidenceHigh)}
                                />
                              </View>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPatientSearch = () => (
    <View style={styles.patientSearchContainer}>
      <TextInput
        style={styles.patientSearchInput}
        value={tcNo}
        onChangeText={setTcNo}
        placeholder="T.C. Kimlik No giriniz"
        keyboardType="numeric"
        maxLength={11}
      />
      <TouchableOpacity
        style={styles.patientSearchButton}
        onPress={handlePatientSearch}
        disabled={loading || !tcNo || tcNo.length !== 11}
      >
        <Text style={styles.patientSearchButtonText}>
          {loading ? 'Yükleniyor...' : 'Hasta Ara'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getStatusIcon = (value, lower, upper) => {
    const numericValue = parseFloat(value);
    if (numericValue < lower) return 'arrow-down';  // Düşük için aşağı ok
    if (numericValue > upper) return 'arrow-up';    // Yüksek için yukarı ok
    return 'arrows-h';                              // Normal için yatay çift ok
  };

  const getStatusColor = (value, lower, upper) => {
    const numericValue = parseFloat(value);
    if (numericValue < lower) return '#2ecc71';     // Yeşil (Düşük)
    if (numericValue > upper) return '#e74c3c';     // Kırmızı (Yüksek)
    return '#3498db';                               // Mavi (Normal)
  };

  const checkTestStatus = (guide, testValue) => {
    const numericValue = parseFloat(testValue);
    let status = 'Normal';

    if (guide.geometricMean && guide.geometricSD) {
      const lower = guide.geometricMean - (2 * guide.geometricSD);
      const upper = guide.geometricMean + (2 * guide.geometricSD);
      if (numericValue < lower) status = 'Düşük';
      else if (numericValue > upper) status = 'Yüksek';
    }
    else if (guide.mean && guide.sd) {
      const lower = guide.mean - (2 * guide.sd);
      const upper = guide.mean + (2 * guide.sd);
      if (numericValue < lower) status = 'Düşük';
      else if (numericValue > upper) status = 'Yüksek';
    }
    else if (guide.minValue !== undefined && guide.maxValue !== undefined) {
      if (numericValue < guide.minValue) status = 'Düşük';
      else if (numericValue > guide.maxValue) status = 'Yüksek';
    }
    else if (guide.confidenceLow !== undefined && guide.confidenceHigh !== undefined) {
      if (numericValue < guide.confidenceLow) status = 'Düşük';
      else if (numericValue > guide.confidenceHigh) status = 'Yüksek';
    }

    return status;
  };

  const toggleTestSelection = (testName) => {
    setSelectedTests(prev => {
      if (prev.includes(testName)) {
        return prev.filter(name => name !== testName);
      } else {
        return [...prev, testName];
      }
    });
  };

  const filterTestResults = (results) => {
    if (!selectedTests.length) return results; // Hiç test seçilmemişse tümünü göster

    return results.map(record => ({
      ...record,
      tests: record.tests.filter(test => selectedTests.includes(test.testName))
    })).filter(record => record.tests.length > 0); // Boş kayıtları çıkar
  };

  const fetchReferenceValues = async (testName, birthDateStr) => {
    try {
      const birthDate = new Date(birthDateStr);
      const response = await fetch(`${API_URL}/api/guides/reference-values`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testName,
          birthDate: birthDate.toISOString(),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setReferenceValues(prev => ({
          ...prev,
          [testName]: data
        }));
      } else {
        Alert.alert('Hata', 'Referans değerleri getirilemedi');
      }
    } catch (error) {
      console.error('Referans değerleri hatası:', error);
      Alert.alert('Hata', 'Referans değerleri alınırken bir hata oluştu');
    }
  };

  return (
    <View style={[commonStyles.container, styles.container]}>
      <View style={commonStyles.header}>
        <TouchableOpacity 
          style={commonStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonStyles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Test Sorgulama</Text>
      </View>

      <ScrollView 
        style={[commonStyles.contentContainer]}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={[commonStyles.card, styles.welcomeCard]}>
          <Text style={styles.welcomeText}>Test Sorgulama</Text>
          <Text style={styles.descriptionText}>
            Bu sayfada laboratuvar test sonuçlarını ve istatistiklerini sorgulayabilirsiniz.
          </Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeTab === 'test' && styles.activeFilter]}
            onPress={() => setActiveTab('test')}
          >
            <Text style={activeTab === 'test' ? styles.activeFilterText : styles.filterText}>
              Test Sorgulama
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeTab === 'patient' && styles.activeFilter]}
            onPress={() => setActiveTab('patient')}
          >
            <Text style={activeTab === 'patient' ? styles.activeFilterText : styles.filterText}>
              Hasta Sorgulama
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'test' ? renderTestQuery() : renderPatientQuery()}

        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  welcomeCard: {
    backgroundColor: colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  filterContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    paddingHorizontal: 5,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  searchCard: {
    marginBottom: 20,
  },
  resultCard: {
    marginBottom: 20,
  },
  queryCard: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 15,
  },
  resultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 5,
  },
  guideContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  guideNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  evaluationContainer: {
    marginTop: 20,
  },
  evaluationSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  evaluationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  basicInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: '30%',
    flex: 1,
    marginHorizontal: 5,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultSection: {
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  patientInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  patientInfoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  testResultCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  testInfoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  tabContent: {
    padding: 20,
  },
  patientInfoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  patientInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  patientInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  patientInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  patientInfoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  patientInfoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  testHistoryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  testHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  testHistoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  pickerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  testPicker: {
    height: 50,
  },
  testHistoryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  testHistoryDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  testHistoryTest: {
    marginBottom: 5,
  },
  testHistoryTestName: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  testHistoryTestValue: {
    fontSize: 14,
    color: '#666',
  },
  patientQueryContainer: {
    padding: 20,
  },
  patientSearchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  patientSearchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  patientSearchButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  patientSearchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guideCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  guideName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  ageRange: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 14,
    color: '#333',
  },
  rangeValue: {
    fontSize: 14,
    color: '#666',
  },
  testSelectionContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  checkboxRow: {
    width: '50%', // İki sütun halinde göster
    paddingVertical: 8,
    paddingRight: 10,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  clearSelectionButton: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  clearSelectionText: {
    color: '#666',
    fontSize: 14,
  },
  referenceButton: {
    backgroundColor: colors.secondary,
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  referenceButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  referenceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 2,
  },
  referenceUnit: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 2,
  },
  testPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testPicker: {
    height: 50,
    width: '100%',
  },
  ageText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  testResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testStatusText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 10,
  },
  testHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  guideContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  guideGrid: {
    gap: 8,
  },
  guideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guideLabel: {
    fontSize: 13,
    color: '#666',
  },
  guideValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  guideTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  guideValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 30,
  },
});

export default TestQueryScreen;
