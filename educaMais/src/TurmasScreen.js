import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Modal,
  TextInput, Alert, ActivityIndicator, Platform
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

      {/* 1. Cabeçalho/Título Principal */}
      <View style={styles.cardHeader}>
        <Ionicons name="people-circle" size={30} color={styles.nomeTurma.color} />
        <Text style={styles.nomeTurma}>{nome}</Text>
      </View>

      {/* 2. Detalhes da Turma */}
      <View style={styles.cardContent}>
        <Text style={styles.periodo}>
          <Text style={styles.detailLabel}>Período:</Text> {periodo}
        </Text>
        <Text style={styles.alunos}>
          <Text style={styles.detailLabel}>Alunos:</Text> {num_alunos || 0}
        </Text>
      </View>


      {/* 3. Ações (Rodapé) */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.button, styles.visualizeButton]} onPress={() => onVisualize(turma)}>
          <Text style={styles.buttonText}>Visualizar</Text>
          <Ionicons name="arrow-forward-outline" size={16} color="#fff" style={{ marginLeft: 5 }} />
        </TouchableOpacity>

        {/* Botões de Ação Secundária */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => onEdit(turma)}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => onDelete(turma)}>
            <Ionicons name="trash-bin-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


// --- Componente principal da tela de Turmas (TurmasScreen) ---
const TurmasScreen = ({ navigation }) => {
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

    const turmaData = {
      nome: newTurmaName,
      periodo: newTurmaPeriodo || 'Não Informado',
      num_alunos: parseInt(newTurmaAlunos) || 0,
    };

    if (isEditing) {
      // UPDATE
      const { error } = await supabase
        .from('turmas')
        .update(turmaData)
        .eq('id', currentTurmaId);

      if (error) {
        Alert.alert('Erro ao editar', error.message);
      } else {
        Alert.alert('Sucesso', 'Turma editada com sucesso!');
        setModalVisible(false);
        fetchTurmas();
      }
    } else {
      // CREATE
      const dataToInsert = {
        ...turmaData,
        professor_id: professorId
      };

      const { error } = await supabase
        .from('turmas')
        .insert([dataToInsert]);

      if (error) {
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
  // Navega para a tela de atividades da turma
  const handleVisualize = (turma) => {
    navigation.navigate('Atividades', {
      turmaId: turma.id,  // <-- ID da turma sendo passado
      turmaNome: turma.nome // <-- Nome da turma sendo passado
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
      <Text style={styles.header}>Gerenciar Turmas</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddTurma} disabled={loading}>
        <Text style={styles.addButtonText}>+ Nova Turma</Text>
      </TouchableOpacity>

      {loading && turmas.length === 0 ? (
        <ActivityIndicator size="large" color="#1e88e5" style={{ marginTop: 50 }} />
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

            {/* --- Campo Nome da Turma --- */}
            <Text style={styles.inputLabel}>Nome da turma*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1º Ano A"
              value={newTurmaName}
              onChangeText={setNewTurmaName}
              editable={!loading}
              placeholderTextColor="#999"
            />

            {/* --- Campo Período --- */}
            <Text style={styles.inputLabel}>Período*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Manhã, Tarde, Noite"
              value={newTurmaPeriodo}
              onChangeText={setNewTurmaPeriodo}
              editable={!loading}
              placeholderTextColor="#999"
            />

            {/* --- Campo Número de Alunos --- */}
            <Text style={styles.inputLabel}>Número de alunos*</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={newTurmaAlunos}
              onChangeText={setNewTurmaAlunos}
              editable={!loading}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[styles.button, styles.saveButton, { minWidth: '100%' }]}
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
              style={[styles.button, styles.cancelButton, { minWidth: '100%' }]}
              onPress={() => setModalVisible(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  // 1. GERAL/CONTAINER
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7', // Fundo claro para contraste
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 34, // Título maior e impactante
    fontWeight: '900', // Ultra negrito
    marginBottom: 25,
    color: '#1565c0', // Azul Escuro
  },

  // 2. BOTÃO DE ADICIONAR (Main CTA)
  addButton: {
    backgroundColor: '#1e88e5', // Azul Primário
    paddingVertical: 16, // Mais alto
    borderRadius: 12, // Cantos suaves
    alignItems: 'center',
    marginBottom: 30, // Mais espaço após o botão
    // Sombra mais profunda
    ...Platform.select({
      ios: {
        shadowColor: '#1e88e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    textTransform: 'uppercase', // Para dar mais destaque
  },

  listContainer: {
    paddingBottom: 40,
  },

  // 3. CARD DE TURMA
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 18,
    // Sombra mais sutil para o card
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e3f2fd', // Linha divisória suave
  },
  nomeTurma: {
    fontSize: 22,
    fontWeight: '800', // Mais negrito para o nome
    marginLeft: 15,
    color: '#1565c0',
  },
  cardContent: {
    marginBottom: 15,
    paddingLeft: 45, // Alinha os detalhes com o texto do nome
  },
  detailLabel: {
    fontWeight: '700',
    color: '#333',
  },
  periodo: {
    fontSize: 15,
    color: '#607d8b',
    marginBottom: 5,
  },
  alunos: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e88e5',
  },

  // 4. AÇÕES DO CARD
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e3f2fd',
    paddingTop: 15,
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  // Base Button
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#29b6f6', // Ciano
    paddingHorizontal: 10, // Mais compacto, só ícone
  },
  deleteButton: {
    backgroundColor: '#e53935', // Vermelho
    paddingHorizontal: 10, // Mais compacto, só ícone
  },
  visualizeButton: {
    backgroundColor: '#1e88e5', // Azul Primário
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  // 5. MODAL (Cadastro/Edição)
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 101, 192, 0.7)', // Fundo mais escuro
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalTitle: {
    fontSize: 28, // Título maior
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#1565c0',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#b0c4de',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9', // Levemente cinza para indicar o campo
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#1e88e5',
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginTop: 10,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#1565c0',
    fontWeight: '700', // Mais peso
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#607d8b',
    paddingHorizontal: 30,
  }
});
export default TurmasScreen;