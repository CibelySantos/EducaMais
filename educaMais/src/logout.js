import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient'; // ajuste o caminho se necessário

export default function Logout() {
  const navigation = useNavigation();

  useEffect(() => {
    const fazerLogout = async () => {
      try {
        await supabase.auth.signOut(); // encerra sessão (caso esteja usando auth)
      } catch (error) {
        console.log('Erro ao fazer logout:', error.message);
      } finally {
        // volta pra tela de login
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginProfessor' }],
        });
      }
    };

    fazerLogout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6A0DAD" />
      <Text style={styles.text}>Saindo da conta...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#6A0DAD',
  },
});
