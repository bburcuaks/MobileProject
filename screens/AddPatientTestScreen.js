import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { commonStyles, colors } from '../styles/commonStyles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../context/AppContext';

const AddPatientTestScreen = () => {
  const navigation = useNavigation();
  const { token } = useApp();
  const [testNames, setTestNames] = useState([]);
  const [patientData, setPatientData] = useState({
    tcNo: '',
    fullName: '',
    birthDate: new Date(),
    gender: 'erkek',
    birthPlace: '',
    sampleTime: new Date(),
    tests: [] // Test dizisi
  });

  const [currentTest, setCurrentTest] = useState({
    testName: '',
    testValue: ''
  });

  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showSampleTimePicker, setShowSampleTimePicker] = useState(false);

  // Test isimlerini getir
  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/guides/test-names', {
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
          setCurrentTest(prev => ({ ...prev, testName: data[0] }));
        }
      } catch (error) {
        console.error('Test isimleri getirme hatası:', error);
        Alert.alert('Hata', 'Test isimleri alınırken bir hata oluştu');
      }
    };

    fetchTestNames();
  }, [token]);

  // Test ekleme fonksiyonu
  const handleAddTest = () => {
    if (!currentTest.testName || !currentTest.testValue) {
      Alert.alert('Hata', 'Lütfen test adı ve değerini giriniz!');
      return;
    }

    setPatientData(prev => ({
      ...prev,
      tests: [...prev.tests, { ...currentTest }]
    }));

    // Test eklendikten sonra değeri sıfırla
    setCurrentTest(prev => ({
      ...prev,
      testValue: ''
    }));

    Alert.alert('Başarılı', 'Test eklendi');
  };

  // Test silme fonksiyonu
  const handleRemoveTest = (index) => {
    setPatientData(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index)
    }));
  };

  const onBirthDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || patientData.birthDate;
    setShowBirthDatePicker(Platform.OS === 'ios');
    setPatientData({ ...patientData, birthDate: currentDate });
  };

  const onSampleTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || patientData.sampleTime;
    setShowSampleTimePicker(Platform.OS === 'ios');
    setPatientData({ ...patientData, sampleTime: currentDate });
  };

  const handleSaveTests = async () => {
    if (!patientData.tcNo || !patientData.fullName || patientData.tests.length === 0) {
      Alert.alert('Hata', 'Lütfen tüm gerekli alanları doldurun ve en az bir test ekleyin!');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        throw new Error('Test sonuçları kaydedilemedi');
      }

      Alert.alert('Başarılı', 'Test sonuçları başarıyla kaydedildi');
      navigation.goBack();
    } catch (error) {
      console.error('Test kaydetme hatası:', error);
      Alert.alert('Hata', 'Test sonuçları kaydedilirken bir hata oluştu');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR');
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('tr-TR');
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
        <Text style={commonStyles.headerTitle}>Yeni Test Ekle</Text>
      </View>

      <ScrollView style={commonStyles.contentContainer}>
        <View style={[commonStyles.card, styles.welcomeCard]}>
          <Text style={styles.welcomeText}>Yeni Hasta Testi Ekleme</Text>
          <Text style={styles.descriptionText}>
            Bu sayfada hastalara ait yeni test sonuçlarını sisteme ekleyebilirsiniz.
          </Text>
        </View>

        <View style={[commonStyles.card, styles.formCard]}>
          <Text style={styles.sectionTitle}>Hasta Bilgileri</Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>T.C. Kimlik No</Text>
            <TextInput
              style={styles.textInput}
              value={patientData.tcNo}
              onChangeText={(value) => setPatientData({ ...patientData, tcNo: value })}
              placeholder="T.C. Kimlik No giriniz"
              keyboardType="numeric"
              maxLength={11}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Adı Soyadı</Text>
            <TextInput
              style={styles.textInput}
              value={patientData.fullName}
              onChangeText={(value) => setPatientData({ ...patientData, fullName: value })}
              placeholder="Hasta adı ve soyadını giriniz"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Doğum Tarihi</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowBirthDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formatDate(patientData.birthDate)}
              </Text>
            </TouchableOpacity>
            {showBirthDatePicker && (
              <DateTimePicker
                testID="birthDatePicker"
                value={patientData.birthDate}
                mode="date"
                display="default"
                onChange={onBirthDateChange}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cinsiyet</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={patientData.gender}
                onValueChange={(value) => setPatientData({ ...patientData, gender: value })}
                style={styles.picker}
              >
                <Picker.Item label="Erkek" value="erkek" />
                <Picker.Item label="Kadın" value="kadin" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Doğum Yeri</Text>
            <TextInput
              style={styles.textInput}
              value={patientData.birthPlace}
              onChangeText={(value) => setPatientData({ ...patientData, birthPlace: value })}
              placeholder="Doğum yerini giriniz"
            />
          </View>

          <Text style={[styles.sectionTitle, styles.marginTop]}>Test Bilgileri</Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Test Adı</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={currentTest.testName}
                onValueChange={(itemValue) =>
                  setCurrentTest({ ...currentTest, testName: itemValue })
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
            <Text style={styles.inputLabel}>Test Değeri</Text>
            <View style={styles.testInputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={currentTest.testValue}
                onChangeText={(value) => setCurrentTest({ ...currentTest, testValue: value })}
                placeholder="Test değerini giriniz"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTest}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {patientData.tests.length > 0 && (
            <View style={[commonStyles.card, styles.testsCard]}>
              <Text style={styles.sectionTitle}>Eklenen Testler</Text>
              <View style={styles.divider} />
              {patientData.tests.map((test, index) => (
                <View key={index} style={styles.testItem}>
                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>{test.testName}</Text>
                    <Text style={styles.testValue}>Değer: {test.testValue}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveTest(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Numune Zamanı</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowSampleTimePicker(true)}
            >
              <Text style={styles.dateText}>
                {formatDateTime(patientData.sampleTime)}
              </Text>
            </TouchableOpacity>
            {showSampleTimePicker && (
              <DateTimePicker
                testID="sampleTimePicker"
                value={patientData.sampleTime}
                mode="datetime"
                display="default"
                onChange={onSampleTimeChange}
              />
            )}
          </View>

          <TouchableOpacity 
            style={[commonStyles.button, styles.submitButton]} 
            onPress={handleSaveTests}
          >
            <Text style={[commonStyles.buttonText, styles.submitButtonText]}>Kaydet</Text>
          </TouchableOpacity>

          <View style={[commonStyles.card, styles.infoCard]}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>i</Text>
            </View>
            <Text style={styles.infoText}>
              Test sonuçları sisteme eklendikten sonra düzenlenemez. Lütfen bilgileri 
              dikkatli bir şekilde kontrol ediniz.
            </Text>
          </View>
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
  marginTop: {
    marginTop: 30,
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
    fontSize: 16,
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: '#FFF9C4',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FBC02D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#795548',
    lineHeight: 20,
  },
  testInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  testsCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  testValue: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AddPatientTestScreen;
