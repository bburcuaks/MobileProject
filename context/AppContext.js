import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    // Kullanıcı girişi
    const login = async (userData, userToken) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', userToken);
            setUser(userData);
            setToken(userToken);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    // Çıkış yapma
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Uygulama başladığında kullanıcı durumunu kontrol et
    const loadUserData = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const storedToken = await AsyncStorage.getItem('token');
            
            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
        } catch (error) {
            console.error('Load user data error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Kullanıcı bilgilerini güncelle
    const updateUser = async (userData) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Update user error:', error);
        }
    };

    return (
        <AppContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            loadUserData,
            updateUser
        }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
