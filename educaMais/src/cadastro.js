import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { supabase } from './supabaseClient'; // Ajuste o caminho conforme a sua estrutura de pastas
import bcrypt from 'bcryptjs';
bcrypt.setRandomFallback((len) => {
  const random = [];
  for (let i = 0; i < len; i++) {
    random.push(Math.floor(Math.random() * 256));
  }
  return random;
});


// 🎨 Cores e URL do logo (devem ser as mesmas usadas no LoginProfessor.js)
const TURQUOISE_COLOR = '#4db6ac';
const GREEN_COLOR = '#66bb6a';
const BACKGROUND_COLOR = '#fff';
const logoUri = 'https://i.imgur.com/k9b6I0G.png'; // Substitua pelo caminho real do seu logo

export default function CadastroProfessor({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      // 🔐 Gera o hash da senha
      const salt = bcrypt.genSaltSync(10);
      const senhaHash = bcrypt.hashSync(senha, salt);

      const { data, error } = await supabase
        .from('professores')
        .insert([{ nome, email, senha: senhaHash }])
        .select();

      if (error) {
        console.error('Erro Supabase:', error);
        // Tratamento para e-mail duplicado
        if (error.code === '23505') {
          Alert.alert('Erro ao cadastrar', 'Este e-mail já está em uso.');
        } else {
          Alert.alert('Erro ao cadastrar', error.message);
        }
      } else {
        Alert.alert('Sucesso', 'Professor cadastrado com sucesso! Faça login para continuar.');
        navigation.navigate('LoginProfessor');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo da aplicação */}
      <Image
        source={require('../assets/EducaLogo.png')} // 🔁 Altere o caminho e nome da imagem conforme o seu projeto
        style={styles.logoImage}
        resizeMode="contain"
      />

      {/* Texto "Educa Mais" */}
      <View style={styles.logoTextContainer}>
        <Text style={styles.logoTextGreen}>Educa</Text>
        <Text style={styles.logoTextBlue}>Mais</Text>
      </View>

      {/* Título */}
      <Text style={styles.welcomeText}>Crie sua conta</Text>

      {/* Input Nome */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Seu Nome Completo"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
        />
        <Text style={styles.inputLabel}>Nome</Text>
      </View>

      {/* Input E-mail */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="exemplo@dominio.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.inputLabel}>E-mail</Text>
      </View>

      {/* Input Senha */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        <Text style={styles.inputLabel}>Senha</Text>
      </View>

      {/* Botão Cadastrar */}
      <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      {/* Link para Login */}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('LoginProfessor')}>
        <Text style={styles.loginText}>Já tem uma conta? <Text style={{ fontWeight: 'bold' }}>Faça Login</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    padding: 30,
    paddingTop: 70,
  },

  logoImage: {
    width: 150,
    height: 100,
    marginBottom: 10,
  },

  logoTextContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  logoTextGreen: {
    fontSize: 28,
    fontWeight: 'bold',
    color: GREEN_COLOR,
  },
  logoTextBlue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TURQUOISE_COLOR,
  },

  welcomeText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 40,
    fontWeight: '600',
  },

  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    paddingLeft: 100,
  },
  inputLabel: {
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    width: 80,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    height: 50,
    lineHeight: 50,
  },

  button: {
    width: '100%',
    backgroundColor: TURQUOISE_COLOR,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  loginButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: TURQUOISE_COLOR,
    fontSize: 14,
  },
});
