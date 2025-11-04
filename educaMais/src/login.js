import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';
// 🚨 CORREÇÃO CRÍTICA DO IMPORT
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function LoginProfessor({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);


    try {
      // Busca o professor pelo e-mail
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome, senha')
        .eq('email', email)
        .single();


      if (error || !data) {
        Alert.alert('Erro', 'Usuário não encontrado');
        setLoading(false);
        return;
      }


      // Compara senha com hash
      const senhaCorreta = bcrypt.compareSync(senha, data.senha);
      if (!senhaCorreta) {
        Alert.alert('Erro', 'Senha incorreta');
        setLoading(false);
        return;
      }

      // Login OK → vai pra tela inicial (Drawer)
      navigation.replace('MainContent', {
        screen: 'HomeDrawer', // tela inicial dentro do Drawer
        params: { nome: data.nome, professorId: data.id },
      });

    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao tentar login.');
    } finally {
      setLoading(false);

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
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Botão para Cadastro */}
      <TouchableOpacity
        style={styles.cadastroButton}
        onPress={() => navigation.navigate('CadastroProfessor')}
      >
        <Text style={styles.cadastroText}>Não tem uma conta? Cadastre-se</Text>
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
    padding: 20 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#6A0DAD', 
    marginBottom: 25 
  },
  input: { 
    width: '100%', 
    backgroundColor: '#f2f2f2', 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 12 
  },
  button: { 
    width: '100%', 
    backgroundColor: '#6A0DAD', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  cadastroButton: {
    marginTop: 15,
  },
  cadastroText: {
    color: '#6A0DAD',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
