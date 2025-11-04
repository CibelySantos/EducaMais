import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Se você tiver o arquivo do logo, substitua o 'Logo Placeholder' pelo componente <Image> correto.

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
        Alert.alert('Erro', 'Usuário não encontrado ou senha incorreta'); // Mensagem genérica por segurança
        setLoading(false);
        return;
      }

      // Compara senha com hash
      const senhaCorreta = bcrypt.compareSync(senha, data.senha);
      if (!senhaCorreta) {
        Alert.alert('Erro', 'Usuário não encontrado ou senha incorreta'); // Mensagem genérica por segurança
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
     
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>EducaMais</Text>
      </View>

      <Text style={styles.welcomeText}>Bem-Vindo(a)</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#999" // Cor do placeholder ajustada
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
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

// --- 🎨 Estilos Baseados na Imagem ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Fundo azul claro da imagem
    backgroundColor: '#EAF5FF',
    padding: 30, // Aumenta o padding para dar mais espaço
  },
  // --- Estilo do Logo (Placeholder) ---
  logoPlaceholder: {
    // Substitua por seu <Image> se tiver o arquivo
    width: 100, // Reduzido de 150 para 100
    height: 100, // Reduzido de 150 para 100
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32, // Reduzido de 28 para 22
    fontWeight: 'bold',
    color: '#4A90E2', // Cor similar ao texto EducaMais
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    fontWeight: '600'
  },
  // --- Estilo dos Inputs ---
  input: {
    width: '100%',
    // Fundo branco e borda suave
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15, // Padding maior
    marginBottom: 15,
    fontSize: 16,
    // Sombra e borda sutis para replicar o efeito da imagem
    borderWidth: 1,
    borderColor: '#ccc', // Borda cinza clara
    shadowColor: '#70866bff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // --- Estilo do Botão Entrar ---
  button: {
    width: '100%',
    // Cor do botão azul claro da imagem
    backgroundColor: '#75A3D5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    // Sombra sutil para replicar o efeito da imagem
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  // --- Estilo do Link Cadastre-se ---
  cadastroButton: {
    marginTop: 25,
    // Alinhado ao centro (já é o default, mas garante)
    alignItems: 'center',
  },
  cadastroText: {
    // Cor do link azul claro/cinza na imagem
    color: '#75A3D5',
    fontSize: 14,
    // O sublinhado parece mais suave na imagem, usamos o default
    textDecorationLine: 'underline',
  },
});