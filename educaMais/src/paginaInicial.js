import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PaginaInicial({ route, navigation }) {
  const { nome } = route.params || { nome: 'Professor' };
  const [codigo, setCodigo] = useState('');

  useEffect(() => {
    gerarCodigo();
  }, []);

  const gerarCodigo = () => {
    // Gera um código aleatório de 6 números (ex: 482913)
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
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
  },
});