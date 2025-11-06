import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, Modal, TouchableOpacity, Alert, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from './supabaseClient';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importação do componente de seleção nativo do React Native
import { Picker } from '@react-native-picker/picker'; 


// --- Modal de Criação/Edição ---
// NOVO: Recebe 'turmas' (lista de turmas)
const NovaAtividadeModal = ({ visible, onClose, activityToEdit, onSave, turmaContext, turmas }) => { 
  const [titulo, setTitulo] = useState(activityToEdit ? activityToEdit.nome : '');
  const [descricao, setDescricao] = useState(activityToEdit ? activityToEdit.descricao : '');
  const [dataEntrega, setDataEntrega] = useState(activityToEdit ? activityToEdit.data : '');
  
  // NOVO: Estado para a turma selecionada no Picker
  const [turmaSelecionada, setTurmaSelecionada] = useState('');

  // Seta o valor inicial da turma
  useEffect(() => {
    if (visible) {
        if (activityToEdit) {
            setTitulo(activityToEdit.nome);
            setDescricao(activityToEdit.descricao);
            setDataEntrega(activityToEdit.data);
            // Edição: usa a turma já salva
            setTurmaSelecionada(activityToEdit.turma); 
        } else {
            setTitulo('');
            setDescricao('');
            setDataEntrega('');
            // Criação: usa a turma que veio da navegação como padrão
            setTurmaSelecionada(turmaContext?.turmaNome || turmas[0]?.nome || ''); 
        }
    }
  }, [activityToEdit, visible, turmaContext, turmas]);

  const isEditing = !!activityToEdit;

  const handleSave = () => {
    if (!titulo || !descricao || !dataEntrega || !turmaSelecionada) {
      Alert.alert('Erro', 'Preencha Título, Descrição, Data de Entrega e selecione uma Turma.');
      return;
    }
    
    const newActivity = {
      id: activityToEdit?.id,
      nome: titulo,
      descricao,
      turma: turmaSelecionada, // Usa a turma SELECIONADA
      data: dataEntrega,
    };

    onSave(newActivity);
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={modalStyles.modalTitle}>
            {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
          </Text>

          <Text style={modalStyles.label}>Título</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="Ex: Trabalho de Matemática"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={modalStyles.label}>Descrição</Text>
          <TextInput
            style={[modalStyles.input, modalStyles.textArea]}
            placeholder="Descreva a atividade..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
          />

          {/* NOVO: Picker para seleção da turma */}
          <Text style={modalStyles.label}>Turma Selecionada</Text>
          <View style={modalStyles.pickerContainer}>
            <Picker
              selectedValue={turmaSelecionada}
              onValueChange={(itemValue) => setTurmaSelecionada(itemValue)}
              style={modalStyles.picker}
            >
              {turmas.map((turma) => (
                <Picker.Item key={turma.nome} label={turma.nome} value={turma.nome} />
              ))}
            </Picker>
          </View>

          <Text style={modalStyles.label}>Data de Entrega</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="aaaa-mm-dd"
            value={dataEntrega}
            onChangeText={setDataEntrega}
          />

          <TouchableOpacity style={modalStyles.createButton} onPress={handleSave}>
            <Text style={modalStyles.createButtonText}>
              {isEditing ? 'Salvar' : 'Criar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Tela Principal ---
export default function AtividadesScreen() {
    const route = useRoute();
    const { turmaNome } = route.params || {}; 

  const [atividades, setAtividades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  
  // NOVO: Estado para armazenar todas as turmas
  const [turmas, setTurmas] = useState([]); 

  // --- Função para buscar todas as turmas do professor ---
  const getProfessorId = async () => {
    try {
      const id = await AsyncStorage.getItem('professor_id');
      return id;
    } catch (e) {
      console.error("Erro ao ler ID do AsyncStorage:", e);
      return null;
    }
  };

  const fetchTurmas = async () => {
    const professorId = await getProfessorId();
    if (!professorId) return;

    const { data, error } = await supabase
      .from('turmas')
      .select('nome') // Seleciona apenas o nome
      .eq('professor_id', professorId)
      .order('nome', { ascending: true });

    if (error) {
        console.error('Erro ao carregar lista de turmas:', error);
    } else {
        setTurmas(data);
    }
  };

  // --- Carregar atividades e turmas ao focar na tela ---
  const carregarAtividades = async () => {
    if (!turmaNome) {
        setAtividades([]);
        return;
    }

    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .eq('turma', turmaNome) 
      .order('data', { ascending: true });
      
    if (error) {
      console.error('Erro ao carregar atividades:', error);
    } else {
      setAtividades(data);
    }
  };

  useEffect(() => {
    fetchTurmas(); // Carrega a lista de turmas
    carregarAtividades(); 
  }, [turmaNome]);

  // --- Salvar nova ou editar atividade ---
  const handleSaveActivity = async (atividade) => {
    const dataToSave = { ...atividade, turma: atividade.turma }; 
    const { id, status, ...dataWithoutId } = dataToSave; 
    
    try {
        if (id) {
          const { error } = await supabase
            .from('atividades')
            .update(dataWithoutId)
            .eq('id', id);

          if (error) throw error;
          Alert.alert('Sucesso', 'Atividade atualizada.');
        } else {
          const { error } = await supabase.from('atividades').insert([dataWithoutId]);
          
          if (error) throw error;
          Alert.alert('Sucesso', 'Atividade criada.');
        }
        
        setModalVisible(false);
        // Otimização: Se a turma selecionada no modal for diferente da turma atual,
        // a atividade sumirá daqui, o que é o comportamento esperado.
        // Recarrega a lista baseada no 'turmaNome' da rota (filtro atual da tela)
        carregarAtividades(); 

    } catch (error) {
        console.error('Erro ao salvar atividade:', error);
        Alert.alert('Erro no Banco de Dados', `Falha ao salvar. ${error.message}`);
    }
  };

  // ... (handleDelete e renderActivityCard permanecem iguais) ...
  const handleDelete = async (id) => {
    if (!id) {
      Alert.alert('Erro', 'ID da atividade inválido.');
      return;
    }

    Alert.alert('Excluir', 'Tem certeza que deseja excluir esta atividade?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('atividades').delete().eq('id', id);

          if (error) {
            console.error('Erro ao excluir:', error);
            Alert.alert('Erro', 'Não foi possível excluir a atividade.');
          } else {
            setAtividades((prev) => prev.filter((a) => a.id !== id)); 
            Alert.alert('Sucesso', 'Atividade excluída com sucesso.');
          }
        },
      },
    ]);
  };

  const renderActivityCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pendente</Text> 
        </View>
      </View>

      <Text style={styles.cardDescription}>{item.descricao}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardInfoText}>Turma: {item.turma}</Text>
        <Text style={styles.cardInfoText}>Entrega: {item.data}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => { setActivityToEdit(item); setModalVisible(true); }}>
          <Feather name="edit" size={20} color="#555" style={{ marginRight: 15 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Feather name="trash-2" size={20} color="#ff4d4f" />
        </TouchableOpacity>
      </View>
    </View>
  );
  // ... (renderActivityCard permanece igual) ...

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atividades de {turmaNome || 'Turma'}</Text>
        <TouchableOpacity
          style={styles.createActivityButton}
          onPress={() => { setActivityToEdit(null); setModalVisible(true); }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={atividades}
        renderItem={renderActivityCard}
        keyExtractor={(item) => String(item.id)} 
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
            <Text style={styles.emptyText}>
                Nenhuma atividade cadastrada para esta turma ({turmaNome}).
            </Text>
        }
      />

      <NovaAtividadeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        activityToEdit={activityToEdit}
        onSave={handleSaveActivity}
        turmaContext={{ turmaNome }} 
        turmas={turmas} // NOVO: Passando a lista de turmas
      />
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  // ... (styles permanecem iguais)
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  createActivityButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
  },
  listContainer: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusBadge: { backgroundColor: '#ffe0b2', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  cardDescription: { color: '#666', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardInfoText: { fontSize: 13, color: '#666' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
});

const modalStyles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { width: '90%', backgroundColor: '#fff', borderRadius: 10, padding: 25 },
  closeButton: { position: 'absolute', top: 15, right: 15 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, fontSize: 16, backgroundColor: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
  createButton: { backgroundColor: '#2ecc71', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 10, alignItems: 'center' },
  cancelButtonText: { color: '#666', fontSize: 16 },
  // NOVO ESTILO: Container para o Picker para melhorar a visualização
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 15,
    width: '100%',
    overflow: 'hidden', // Importante para iOS
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 50, // Ajuste de altura para iOS
  },
});