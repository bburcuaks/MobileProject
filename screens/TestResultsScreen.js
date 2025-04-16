import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://10.0.2.2:5000';

const TestResultsScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useApp();
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [uniqueTestNames, setUniqueTestNames] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [guideResults, setGuideResults] = useState({});  
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestResults();
  }, []);

  useEffect(() => {
    if (testResults.length > 0) {
      const allTests = new Set(testResults.flatMap(record => 
        record.tests.map(t => t.testName)
      ));
      
      allTests.forEach(testName => {
        checkGuideValues(testName);
      });
    }
  }, [testResults]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/tests/patient/${user.tcNo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const testHistory = result.data.testHistory || [];
        setTestResults(testHistory);

        const testNames = [...new Set(
          testHistory.flatMap(record => 
            record.tests.map(t => t.testName)
          )
        )].sort();
        
        setUniqueTestNames(testNames);
      } else {
        throw new Error(result.message || 'Test sonuçları alınamadı');
      }
    } catch (error) {
      console.error('Test sonuçları getirme hatası:', error);
      setError(error.message || 'Test sonuçları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeInMonths = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    return (today.getFullYear() - birth.getFullYear()) * 12 + 
           (today.getMonth() - birth.getMonth());
  };

  const checkGuideValues = async (testName) => {
    if (!testName) return;

    try {
      setLoading(true);
      setError(null);

      const latestResult = testResults
        .flatMap(record => record.tests)
        .find(test => test.testName === testName);

      if (!latestResult) {
        throw new Error('Test sonucu bulunamadı');
      }

      const ageInMonths = calculateAgeInMonths(user.birthDate);
      
      const response = await fetch(`${API_URL}/api/guides/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          testName: testName,
          ageInMonths: ageInMonths,
          testValue: parseFloat(latestResult.testValue)
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setGuideResults(prev => ({
          ...prev,
          [testName]: result.data
        }));
      } else {
        throw new Error(result.message || 'Kılavuz değerleri alınamadı');
      }
    } catch (error) {
      console.error('Kılavuz kontrolü hatası:', error);
      setError(error.message || 'Kılavuz değerleri kontrol edilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTestStatus = (value, guide) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) return 'Geçersiz Değer';
    
    const statuses = [];

    if (guide.geometricMean !== 0 || guide.geometricSD !== 0) {
      const geometricLow = guide.geometricMean - (2 * guide.geometricSD);
      const geometricHigh = guide.geometricMean + (2 * guide.geometricSD);
      if (numValue < geometricLow) {
        statuses.push({ type: 'Geometrik', status: 'Düşük' });
      } else if (numValue > geometricHigh) {
        statuses.push({ type: 'Geometrik', status: 'Yüksek' });
      } else {
        statuses.push({ type: 'Geometrik', status: 'Normal' });
      }
    }

    if (guide.mean !== 0 || guide.sd !== 0) {
      const meanLow = guide.mean - (2 * guide.sd);
      const meanHigh = guide.mean + (2 * guide.sd);
      if (numValue < meanLow) {
        statuses.push({ type: 'Ortalama', status: 'Düşük' });
      } else if (numValue > meanHigh) {
        statuses.push({ type: 'Ortalama', status: 'Yüksek' });
      } else {
        statuses.push({ type: 'Ortalama', status: 'Normal' });
      }
    }

    if (guide.minValue !== 0 || guide.maxValue !== 0) {
      if (numValue < guide.minValue) {
        statuses.push({ type: 'Min-Max', status: 'Düşük' });
      } else if (numValue > guide.maxValue) {
        statuses.push({ type: 'Min-Max', status: 'Yüksek' });
      } else {
        statuses.push({ type: 'Min-Max', status: 'Normal' });
      }
    }

    if (guide.confidenceLow !== 0 || guide.confidenceHigh !== 0) {
      if (numValue < guide.confidenceLow) {
        statuses.push({ type: 'Güven', status: 'Düşük' });
      } else if (numValue > guide.confidenceHigh) {
        statuses.push({ type: 'Güven', status: 'Yüksek' });
      } else {
        statuses.push({ type: 'Güven', status: 'Normal' });
      }
    }

    return statuses;
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'Düşük':
        return <Icon name="arrow-down" size={20} color="#28a745" />;
      case 'Yüksek':
        return <Icon name="arrow-up" size={20} color="#dc3545" />;
      case 'Normal':
        return <Icon name="arrow-left-right" size={20} color="#007bff" />;
      default:
        return null;
    }
  };

  const handleTestSelect = (itemValue) => {
    setSelectedTest(itemValue);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={commonStyles.header}>
        <TouchableOpacity 
          style={commonStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonStyles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Test Sonuçlarım</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Icon name="test-tube" size={24} color={colors.primary} />
              <Text style={styles.pickerLabel}>Test Seçiniz</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedTest}
                onValueChange={handleTestSelect}
                style={styles.picker}
                dropdownIconColor={colors.primary}
              >
                <Picker.Item 
                  label="Tüm Testler" 
                  value="" 
                  style={styles.pickerItem}
                  color={colors.primary}
                />
                {uniqueTestNames.map((test, index) => (
                  <Picker.Item 
                    key={index} 
                    label={test} 
                    value={test} 
                    color={colors.primary}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {testResults.map((test, index) => (
            <View key={index}>
              {test.tests
                .filter(t => !selectedTest || t.testName === selectedTest)
                .map((testItem, testIndex) => (
                <View key={`${index}-${testIndex}`} style={styles.testCard}>
                  <View style={styles.testHeader}>
                    <View>
                      <Text style={styles.testName}>{testItem.testName}</Text>
                      <Text style={styles.testDate}>
                        Numune Tarihi: {formatDate(test.sampleTime)}
                      </Text>
                    </View>
                    <Text style={styles.testValue}>
                      {testItem.testValue}
                    </Text>
                  </View>
                  {guideResults[testItem.testName] && guideResults[testItem.testName].map((guide, guideIndex) => (
                    <View key={guideIndex} style={styles.guideResultSection}>
                      <Text style={styles.guideResultTitle}>
                        {guide.guideName} ({guide.ageRange})
                      </Text>
                      <View style={styles.statusContainer}>
                        {getTestStatus(testItem.testValue, guide).map((status, statusIndex) => (
                          <View key={`${guideIndex}-${statusIndex}`} style={styles.statusRow}>
                            <Text style={styles.statusType}>{status.type}:</Text>
                            <StatusIcon status={status.status} />
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 10,
  },
  pickerWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    fontFamily: 'System',
  },
  placeholderItem: {
    fontSize: 16,
    fontFamily: 'System',
    fontStyle: 'italic',
  },
  testCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  testName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  testDate: {
    fontSize: 14,
    color: '#666',
  },
  testValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  guideResultSection: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  guideResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  statusType: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: '50%',
  },
  noSelectionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
});

export default TestResultsScreen;
