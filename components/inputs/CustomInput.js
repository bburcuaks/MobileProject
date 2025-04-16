import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const CustomInput = ({ 
    value, 
    onChangeText, 
    placeholder, 
    secureTextEntry = false,
    ...props 
}) => {
    return (
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#666"
            secureTextEntry={secureTextEntry}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
});

export default CustomInput;
