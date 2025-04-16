import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { commonStyles, colors } from '../styles/commonStyles';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user,token, updateUser } = useApp();

  const [tcNo, setTcNo] = useState(user?.tcNo || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = async () => {
    try {
      // Sadece değişen alanları updateData'ya ekle
      const updateData = {};
      
      if (firstName !== user.firstName) updateData.firstName = firstName;
      if (lastName !== user.lastName) updateData.lastName = lastName;
      if (email !== user.email) updateData.email = email;
      if (newPassword) updateData.newPassword = newPassword;

      // Eğer hiçbir değişiklik yoksa uyarı ver
      if (Object.keys(updateData).length === 0) {
        Alert.alert('Bilgi', 'Değişiklik yapmadınız.');
        return;
      }
      const response = await fetch('http://10.0.2.2:5000/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profil güncelleme başarısız');
      }

      const data = await response.json();

      // Context'teki kullanıcı bilgilerini güncelle
      updateUser({
        ...user,
        ...data
      });

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi!');
      setNewPassword('');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Güncelleme sırasında bir hata oluştu.');
    }
  };

  return (
    <View style={[commonStyles.container, styles.container]}>
      <View style={commonStyles.header}>
        <TouchableOpacity 
          style={commonStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonStyles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Profilim</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <TextInput
            style={styles.input}
            placeholder="TC Kimlik No"
            value={tcNo}
            onChangeText={setTcNo}
            keyboardType="numeric"
            maxLength={11}
            editable={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Ad"
            value={firstName}
            onChangeText={setFirstName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Soyad"
            value={lastName}
            onChangeText={setLastName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.sectionTitle}>Şifre Güncelleme</Text>
          <TextInput
            style={styles.input}
            placeholder="Yeni Şifre"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Güncelle</Text>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
