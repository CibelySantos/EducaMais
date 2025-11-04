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

<<<<<<< HEAD
    try {
      // Busca o professor pelo e-mail
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome, senha')
        .eq('email', email)
        .single();
=======
    if (error || !data) { // Adicionei a verificação !data caso a consulta não retorne nada
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }
>>>>>>> f32df5602bf01fa48d5d3e3098f00bb6cd67f1bd

      if (error || !data) {
        Alert.alert('Erro', 'Usuário não encontrado');
        setLoading(false);
        return;
      }

<<<<<<< HEAD
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
=======
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
>>>>>>> f32df5602bf01fa48d5d3e3098f00bb6cd67f1bd
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
