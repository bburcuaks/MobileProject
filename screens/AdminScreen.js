import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { commonStyles, colors } from '../styles/commonStyles';
import { useApp } from '../context/AppContext';

const AdminScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useApp();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  return (
    <View style={[commonStyles.container, styles.container]}>
      <View style={commonStyles.header}>
        <TouchableOpacity 
          style={commonStyles.backButton}
          onPress={handleLogout}
        >
          <Text style={commonStyles.backButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Admin Paneli</Text>
      </View>

      <ScrollView style={commonStyles.contentContainer}>
        <View style={[commonStyles.card, styles.welcomeCard]}>
          <Text style={styles.welcomeText}>{user?.firstName} {user?.lastName} Hoşgeldiniz</Text>
          <Text style={styles.subtitleText}>Lütfen yapmak istediğiniz işlemi seçin</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[commonStyles.card, styles.menuButton]}
            onPress={() => navigation.navigate('AddGuide')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary }]} />
            <View style={styles.menuContent}>
              <Text style={styles.menuButtonTitle}>Kılavuz Ekle</Text>
              <Text style={styles.menuButtonDescription}>Yeni kılavuz ve dökümanlar ekleyin</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[commonStyles.card, styles.menuButton]}
            onPress={() => navigation.navigate('AddPatientTest')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]} />
            <View style={styles.menuContent}>
              <Text style={styles.menuButtonTitle}>Yeni Hasta Testi Ekle</Text>
              <Text style={styles.menuButtonDescription}>Hasta test sonuçlarını sisteme girin</Text>
            </View>
          </TouchableOpacity>


          <TouchableOpacity 
            style={[commonStyles.card, styles.menuButton]}
            onPress={() => navigation.navigate('TestQuery')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary }]} />
            <View style={styles.menuContent}>
              <Text style={styles.menuButtonTitle}>Test Sorgulama</Text>
              <Text style={styles.menuButtonDescription}>Test sonuçlarını ve istatistikleri inceleyin</Text>
            </View>
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
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    gap: 15,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuIcon: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 5,
  },
  menuButtonDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default AdminScreen;
