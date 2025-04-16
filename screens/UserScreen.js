import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { commonStyles, colors } from '../styles/commonStyles';

const UserScreen = () => {
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
        <Text style={commonStyles.headerTitle}>Kullanıcı Paneli</Text>
      </View>

      <ScrollView style={commonStyles.contentContainer}>
        <View style={[commonStyles.card, styles.welcomeCard]}>
          <Text style={styles.welcomeText}>{user?.firstName} {user?.lastName} Hoşgeldiniz</Text>
          <Text style={styles.descriptionText}>
            E-Lab sisteminde test sonuçlarınızı görüntüleyebilir ve geçmiş kayıtlarınıza erişebilirsiniz.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[commonStyles.card, styles.menuButton]}
            onPress={() => navigation.navigate('TestResults')}
          >
            <Text style={styles.buttonTitle}>Test Sonuçlarım</Text>
            <Text style={styles.buttonDescription}>
              Laboratuvar test sonuçlarınızı görüntüleyin
            </Text>
          </TouchableOpacity>

          

        

          <TouchableOpacity 
            style={[commonStyles.card, styles.menuButton]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.buttonTitle}>Profilim</Text>
            <Text style={styles.buttonDescription}>
              Profil bilgilerinizi görüntüleyin ve düzenleyin
            </Text>
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
  buttonContainer: {
    padding: 10,
  },
  menuButton: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  buttonDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default UserScreen;
