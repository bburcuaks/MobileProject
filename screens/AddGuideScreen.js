import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { commonStyles, colors } from '../styles/commonStyles';
import { useApp } from '../context/AppContext';

const AddGuideScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useApp();
  const [guideName, setGuideName] = useState('');
  const [tests, setTests] = useState([
    {
      id: Date.now(),
      testName: '',
      ageRanges: [
        {
          id: Date.now(),
          minAge: '',
          maxAge: '',
          geometricMean: '',
          geometricSD: '',
          mean: '',
          sd: '',
          minValue: '',
          maxValue: '',
          confidenceLow: '',
          confidenceHigh: ''
        }
      ]
    }
  ]);

  const addNewTest = () => {
    setTests([...tests, {
      id: Date.now(),
      testName: '',
      ageRanges: [
        {
          id: Date.now(),
          minAge: '',
          maxAge: '',
          geometricMean: '',
          geometricSD: '',
          mean: '',
          sd: '',
          minValue: '',
          maxValue: '',
          confidenceLow: '',
          confidenceHigh: ''
        }
      ]
    }]);
  };

  const removeTest = (testId) => {
    if (tests.length > 1) {
      setTests(tests.filter(test => test.id !== testId));
    }
  };

  const updateTestName = (testId, value) => {
    setTests(tests.map(test =>
      test.id === testId ? { ...test, testName: value } : test
    ));
  };

  const addNewAgeRange = (testId) => {
    setTests(tests.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          ageRanges: [...test.ageRanges, {
            id: Date.now(),
            minAge: '',
            maxAge: '',
            geometricMean: '',
            geometricSD: '',
            mean: '',
            sd: '',
            minValue: '',
            maxValue: '',
            confidenceLow: '',
            confidenceHigh: ''
          }]
        };
      }
      return test;
    }));
  };

  const removeAgeRange = (testId, rangeId) => {
    setTests(tests.map(test => {
      if (test.id === testId && test.ageRanges.length > 1) {
        return {
          ...test,
          ageRanges: test.ageRanges.filter(range => range.id !== rangeId)
        };
      }
      return test;
    }));
  };

  const updateAgeRangeValue = (testId, rangeId, field, value) => {
    setTests(tests.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          ageRanges: test.ageRanges.map(range =>
            range.id === rangeId ? { ...range, [field]: value } : range
          )
        };
      }
      return test;
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!guideName.trim()) {
        Alert.alert('Hata', 'Lütfen kılavuz adını giriniz');
        return;
      }

      // Test verilerini kontrol et
      const validTests = tests.filter(test => test.testName.trim());
      if (validTests.length === 0) {
        Alert.alert('Hata', 'En az bir test eklemelisiniz');
        return;
      }

      // API'ye gönderilecek veriyi hazırla
      const guideData = {
        guideName: guideName.trim(),
        tests: validTests.map(test => ({
          testName: test.testName.trim(),
          ageRanges: test.ageRanges.map(range => ({
            minAge: Number(range.minAge),
            maxAge: Number(range.maxAge),
            geometricMean: Number(range.geometricMean),
            geometricSD: Number(range.geometricSD),
            mean: Number(range.mean),
            sd: Number(range.sd),
            minValue: Number(range.minValue),
            maxValue: Number(range.maxValue),
            confidenceLow: Number(range.confidenceLow),
            confidenceHigh: Number(range.confidenceHigh)
          }))
        }))
      };

      const response = await fetch('http://10.0.2.2:5000/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(guideData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kılavuz eklenirken bir hata oluştu');
      }

      Alert.alert('Başarılı', 'Kılavuz başarıyla eklendi');
      navigation.goBack();
    } catch (error) {
      console.error('Kılavuz ekleme hatası:', error);
      Alert.alert('Hata', error.message || 'Kılavuz eklenirken bir hata oluştu');
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
        <Text style={commonStyles.headerTitle}>Kılavuz Ekle</Text>
      </View>

      <ScrollView style={commonStyles.contentContainer}>
        <View style={[commonStyles.card, styles.welcomeCard]}>
          <Text style={styles.welcomeText}>Kılavuz Ekleme Sayfası</Text>
          <Text style={styles.descriptionText}>
            Bu sayfada sisteme yeni kılavuzlar ve referans değerler ekleyebilirsiniz.
          </Text>
        </View>

        <View style={[commonStyles.card, styles.formCard]}>
          <Text style={styles.sectionTitle}>Yeni Kılavuz</Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Kılavuz Adı</Text>
            <TextInput
              style={styles.textInput}
              value={guideName}
              onChangeText={setGuideName}
              placeholder="Kılavuz adını giriniz"
            />
          </View>

          {tests.map((test, testIndex) => (
            <View key={test.id} style={styles.testContainer}>
              <View style={styles.testHeader}>
                <Text style={styles.testTitle}>Tetkik {testIndex + 1}</Text>
                {tests.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeTest(test.id)}
                  >
                    <Text style={styles.removeButtonText}>Tetkiki Sil</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tetkik Adı</Text>
                <TextInput
                  style={styles.textInput}
                  value={test.testName}
                  onChangeText={(value) => updateTestName(test.id, value)}
                  placeholder="Tetkik adını giriniz"
                />
              </View>

              {test.ageRanges.map((range, index) => (
                <View key={range.id} style={styles.ageRangeContainer}>
                  <View style={styles.ageRangeHeader}>
                    <Text style={styles.ageRangeTitle}>Ay Aralığı {index + 1}</Text>
                    {test.ageRanges.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeButton} 
                        onPress={() => removeAgeRange(test.id, range.id)}
                      >
                        <Text style={styles.removeButtonText}>Sil</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.valueContainer}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Minimum Ay</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.minAge}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'minAge', value)}
                        placeholder="Örn: 25"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Maximum Ay</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.maxAge}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'maxAge', value)}
                        placeholder="Örn: 36"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.sectionSubtitle}>Geometric mean ± SD</Text>
                  <View style={styles.valueContainer}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Alt Sınır</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.geometricMean}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'geometricMean', value)}
                        placeholder="Örn: 137.88"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Üst Sınır</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.geometricSD}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'geometricSD', value)}
                        placeholder="Örn: 38.59"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.sectionSubtitle}>Mean ± SD</Text>
                  <View style={styles.valueContainer}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Alt Sınır</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.mean}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'mean', value)}
                        placeholder="Örn: 141.98"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Üst Sınır</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.sd}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'sd', value)}
                        placeholder="Örn: 38.59"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.sectionSubtitle}>Min–max</Text>
                  <View style={styles.valueContainer}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Alt Sınır</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.minValue}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'minValue', value)}
                        placeholder="Örn: 87.6"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Üst Sınır</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.maxValue}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'maxValue', value)}
                        placeholder="Örn: 289"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.sectionSubtitle}>95% confidence interval</Text>
                  <View style={styles.valueContainer}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Alt Sınır</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.confidenceLow}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'confidenceLow', value)}
                        placeholder="Örn: 127.57"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Üst Sınır</Text>
                      <TextInput
                        style={styles.textInput}
                        value={range.confidenceHigh}
                        onChangeText={(value) => updateAgeRangeValue(test.id, range.id, 'confidenceHigh', value)}
                        placeholder="Örn: 156.39"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => addNewAgeRange(test.id)}
              >
                <Text style={styles.addButtonText}>+ Yeni Ay Aralığı Ekle</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity 
            style={[styles.addButton, styles.addTestButton]} 
            onPress={addNewTest}
          >
            <Text style={styles.addButtonText}>+ Yeni Tetkik Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Kılavuzu Kaydet</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  formCard: {
    marginTop: 20,
    paddingBottom: 20,
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  testContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ageRangeContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 15,
  },
  ageRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ageRangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  addTestButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    marginTop: 20,
  },
  addButtonText: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: '#f1f3f4',
    padding: 8,
    borderRadius: 4,
  },
});

export default AddGuideScreen;
