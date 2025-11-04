import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PaginaInicial({ route, navigation }) {
  const { nome } = route.params || { nome: 'Professor' };
  const [codigo, setCodigo] = useState('');

  useEffect(() => {
    gerarCodigo();
  }, []);

  const gerarCodigo = () => {
    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigo(novoCodigo);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo, {nome}!</Text>
      <Text style={styles.texto}>Seu código de acesso é:</Text>
      <Text style={styles.codigo}>{codigo}</Text>

      <TouchableOpacity style={styles.botao} onPress={gerarCodigo}>
        <Text style={styles.textoBotao}>Gerar novo código</Text>
      </TouchableOpacity>

      {/* Botões adicionais */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity 
          style={[styles.botaoSecundario, { backgroundColor: '#6A0DAD' }]} 
          onPress={() => navigation.navigate('Turmas')}
        >
          <Text style={styles.textoBotao}>Turmas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.botaoSecundario, { backgroundColor: '#8E44AD' }]} 
          onPress={() => navigation.navigate('Atividades')}
        >
          <Text style={styles.textoBotao}>Atividades</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 15,
  },
  texto: {
    fontSize: 18,
    color: '#555',
  },
  codigo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginVertical: 20,
  },
  botao: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 20,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  botaoSecundario: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
  },
});
