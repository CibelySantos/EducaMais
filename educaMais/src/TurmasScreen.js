import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Modal,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../src/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Componente do Card de Turma (TurmaCard) ---
const TurmaCard = ({ turma, onEdit, onDelete, onVisualize }) => {
  const { nome, periodo, num_alunos } = turma;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="people" size={20} color="#000" />
        <Text style={styles.nomeTurma}>{nome}</Text>
      </View>
      <Text style={styles.periodo}>{periodo}</Text>
      <Text style={styles.alunos}>{num_alunos || 0} alunos</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => onEdit(turma)}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => onDelete(turma)}>
          <Ionicons name="trash-bin-outline" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.visualizeButton]} onPress={() => onVisualize(turma)}>
          <Text style={styles.buttonText}>Visualizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


// --- Componente principal da tela de Turmas (TurmasScreen) ---
const TurmasScreen = ({navigation}) => {
  // const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Estados para o formulário (modal de Cadastro/Edição)
  const [newTurmaName, setNewTurmaName] = useState('');
  const [newTurmaPeriodo, setNewTurmaPeriodo] = useState('');
  const [newTurmaAlunos, setNewTurmaAlunos] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentTurmaId, setCurrentTurmaId] = useState(null);

  const getProfessorId = async () => {
    try {
      const id = await AsyncStorage.getItem('professor_id');
      return id;
    } catch (e) {
      console.error("Erro ao ler ID do AsyncStorage:", e);
      return null;
    }
  };

  // 1. READ: Função para buscar as turmas do professor logado
  const fetchTurmas = async () => {
    setLoading(true);
    
    // MUDANÇA CRÍTICA: LENDO DO ASYNCSTORAGE
    const professorId = await getProfessorId();
    
    if (!professorId) {
      setTurmas([]);
      setLoading(false);
      Alert.alert('Sessão Expirada', 'Você precisa fazer login novamente.');
      navigation.navigate('LoginProfessor'); 
      return;
    }

    const { data, error } = await supabase
      .from('turmas')
      .select(`
        id, 
        nome, 
        periodo, 
        num_alunos
      `)
      .eq('professor_id', professorId)
      .order('nome', { ascending: true });

    if (error) {
      Alert.alert('Erro ao carregar turmas', error.message);
    } else {
      const turmasComContagem = data.map(t => ({
        ...t,
        has_activities: t.atividades && t.atividades.length > 0 && t.atividades[0].count > 0
      }));
      setTurmas(turmasComContagem);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isFocused) {
      fetchTurmas();
    }
  }, [isFocused]);


  // 2. CREATE/UPDATE: Função para salvar (criar ou editar) uma turma
  const handleSaveTurma = async () => {
    if (!newTurmaName) {
      Alert.alert('Erro', 'O nome da turma é obrigatório.');
      return;
    }

    setLoading(true);
    // 🚨 MUDANÇA CRÍTICA: LENDO DO ASYNCSTORAGE
    const professorId = await getProfessorId();

    if (!professorId) {
      setTurmas([]);
      setLoading(false);
      Alert.alert('Sessão Expirada', 'Você precisa fazer login novamente antes de salvar.');
      navigation.navigate('LoginProfessor'); 
      return;
    }

    console.log("Usuário logado. Prosseguindo com o salvamento. Professor ID:", professorId);

    const turmaData = {
      nome: newTurmaName,
      periodo: newTurmaPeriodo || 'Não Informado',
      num_alunos: parseInt(newTurmaAlunos) || 0,
    };

    console.log("Dados da Turma a Salvar:", turmaData);
    console.log("Valor de isEditing:", isEditing); // NOVO LOG

    if (isEditing) {
      console.log("chegou no editar - (IF)");

      // UPDATE
      const { error } = await supabase
        .from('turmas')
        .update(turmaData)
        .eq('id', currentTurmaId);

      if (error) {
        console.error("Supabase Update Error:", error);
        Alert.alert('Erro ao editar', error.message);
      } else {
        Alert.alert('Sucesso', 'Turma editada com sucesso!');
        setModalVisible(false);
        fetchTurmas();
      }
    } else {
      console.log("chegou no cadastro - (ELSE)");
      // CREATE
      const dataToInsert = {
        ...turmaData,
        professor_id: professorId // <-- USANDO O ID MANUAL
      };

      console.log("Tentando Inserir:", dataToInsert);

      const { error } = await supabase
        .from('turmas')
        .insert([dataToInsert]);

      if (error) {
        // EXIBIÇÃO DE ERRO DETALHADO DO BANCO
        console.error("Supabase Insert Error DETALHADO:", error);
        Alert.alert(
          'Falha no Cadastro',
          `Erro: ${error.message}. Verifique o terminal para restrições de banco de dados.`
        );
      } else {
        Alert.alert('Sucesso', 'Turma criada com sucesso!');
        setModalVisible(false);
        setNewTurmaName('');
        setNewTurmaPeriodo('');
        setNewTurmaAlunos('');
        fetchTurmas();
      }
    }
    setLoading(false);
  };


  // 3. DELETE: Função para excluir uma turma
  const handleDelete = (turma) => {
    if (turma.has_activities) {
      Alert.alert(
        'Erro',
        'Você não pode excluir uma turma com atividades cadastradas.'
      );
      return;
    }

    Alert.alert(
      'Confirmação',
      `Tem certeza que deseja excluir a turma ${turma.nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from('turmas')
              .delete()
              .eq('id', turma.id);

            if (error) {
              console.error("Supabase Delete Error:", error);
              Alert.alert('Erro na exclusão', error.message);
            } else {
              Alert.alert('Sucesso', 'Turma excluída com sucesso.');
              fetchTurmas();
            }
            setLoading(false);
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Navega para a tela de atividades da turma
  const handleVisualize = (turma) => {
    navigation.navigate('Atividades', {
      turmaId: turma.id,
      turmaNome: turma.nome
    });
  };

  // Funções de controle de Modal
  const handleAddTurma = () => {
    setIsEditing(false);
    setNewTurmaName('');
    setNewTurmaPeriodo('');
    setNewTurmaAlunos('');
    setCurrentTurmaId(null);
    setModalVisible(true);
  };

  const handleEdit = (turma) => {
    setIsEditing(true);
    setCurrentTurmaId(turma.id);
    setNewTurmaName(turma.nome);
    setNewTurmaPeriodo(turma.periodo);
    setNewTurmaAlunos(turma.num_alunos ? turma.num_alunos.toString() : '');
    setModalVisible(true);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Turmas</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTurma} disabled={loading}>
        <Text style={styles.addButtonText}>+ Nova Turma</Text>
      </TouchableOpacity>

      {loading && turmas.length === 0 ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={turmas}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TurmaCard
              turma={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onVisualize={handleVisualize}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Você não tem turmas cadastradas.</Text>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar Turma' : 'Nova Turma'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome da Turma (Ex: 1º Ano A)"
              value={newTurmaName}
              onChangeText={setNewTurmaName}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Período (Ex: Manhã, Tarde, Noite)"
              value={newTurmaPeriodo}
              onChangeText={setNewTurmaPeriodo}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Número de Alunos"
              keyboardType="numeric"
              value={newTurmaAlunos}
              onChangeText={setNewTurmaAlunos}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveTurma}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{isEditing ? 'Salvar' : 'Criar'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: '#000' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Estilos de exemplo (Styles) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  nomeTurma: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  periodo: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
    marginLeft: 30,
  },
  alunos: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 10,
    marginLeft: 30,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 10,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  visualizeButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    width: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    marginTop: 10,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
    marginTop: 10,
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6c757d',
  }
});

export default TurmasScreen;