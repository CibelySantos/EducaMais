import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';
// 🚨 CORREÇÃO CRÍTICA DO IMPORT
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function LoginProfessor({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const { data, error } = await supabase
      .from('professores')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) { // Adicionei a verificação !data caso a consulta não retorne nada
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    const senhaCorreta = bcrypt.compareSync(senha, data.senha);

    if (senhaCorreta) {
      // ✅ SALVANDO O ID DO PROFESSOR MANUALMENTE
      try {
        // Garantindo que 'data.id' seja string antes de salvar
        await AsyncStorage.setItem('professor_id', data.id.toString());
        await AsyncStorage.setItem('professor_nome', data.nome);
        console.log("ID do Professor Salvo:", data.id);
      } catch (e) {
        // Se este log aparecer, o problema é de instalação/cache, não de código
        console.error("Erro ao salvar ID no AsyncStorage:", e); 
      }

      Alert.alert('Sucesso', `Bem-vindo, ${data.nome}!`);
      navigation.navigate('Home', { nome: data.nome });
    } else {
      Alert.alert('Erro', 'Senha incorreta');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login do Professor</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    backgroundColor: '#6A0DAD',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

