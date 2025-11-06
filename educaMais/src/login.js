import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { supabase } from './supabaseClient'; // Mantenha se precisar
import bcrypt from 'bcryptjs'; // Mantenha se precisar
import AsyncStorage from '@react-native-async-storage/async-storage'; 


const logoUri = 'https://i.imgur.com/k9b6I0G.png'; // URL de exemplo (apenas para simulação do visual)

export default function LoginProfessor({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // ... sua lógica de login
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      // SIMULAÇÃO DE LOGIN BEM-SUCEDIDO APÓS 1 SEGUNDO
      await new Promise(resolve => setTimeout(resolve, 1000));
      // REMOVA ESTAS LINHAS E DESCOMENTE SUA LÓGICA DE SUPABASE QUANDO FOR USAR O CÓDIGO REAL
      

      const { data, error } = await supabase
        .from('professores')
        .select('id, nome, senha')
        .eq('email', email)
        .single();

      if (error || !data) {
        Alert.alert('Erro', 'Usuário não encontrado ou senha incorreta');
        setLoading(false);
        return;
      }

      // Compara senha com hash
      const senhaCorreta = bcrypt.compareSync(senha, data.senha);
      if (!senhaCorreta) {
        Alert.alert('Erro', 'Usuário não encontrado ou senha incorreta');
        setLoading(false);
        return;
      }

      // Login OK → vai pra tela inicial (Drawer)
      navigation.replace('MainContent', {
        screen: 'HomeDrawer',
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

      {/* Texto "Bem - vindo!" */}
      <Text style={styles.welcomeText}>Bem - vindo!</Text>

      {/* Input E-mail */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
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
          placeholder="Senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        <Text style={styles.inputLabel}>Senha</Text>
      </View>

      {/* Botão Entrar */}
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
const TURQUOISE_COLOR = '#4db6ac'; // Cor turquesa similar ao botão/link
const GREEN_COLOR = '#66bb6a'; // Cor verde similar ao 'Educa'
const BACKGROUND_COLOR = '#fff'; // Fundo branco da imagem

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    padding: 30,
    paddingTop: 100,
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
    paddingHorizontal: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    height: 50,
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
  cadastroButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cadastroText: {
    color: TURQUOISE_COLOR,
    fontSize: 14,
  },
});
