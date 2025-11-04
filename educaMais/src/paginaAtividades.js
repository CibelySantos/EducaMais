import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, Modal, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { supabase } from './supabaseClient';

// --- Modal de Criação/Edição ---
const NovaAtividadeModal = ({ visible, onClose, activityToEdit, onSave }) => {
  const [titulo, setTitulo] = useState(activityToEdit ? activityToEdit.nome : '');
  const [descricao, setDescricao] = useState(activityToEdit ? activityToEdit.descricao : '');
  const [turma, setTurma] = useState(activityToEdit ? activityToEdit.turma : '');
  const [dataEntrega, setDataEntrega] = useState(activityToEdit ? activityToEdit.data : '');

  useEffect(() => {
    if (activityToEdit) {
      setTitulo(activityToEdit.nome);
      setDescricao(activityToEdit.descricao);
      setTurma(activityToEdit.turma);
      setDataEntrega(activityToEdit.data);
    } else {
      setTitulo('');
      setDescricao('');
      setTurma('');
      setDataEntrega('');
    }
  }, [activityToEdit]);

  const isEditing = !!activityToEdit;

  const handleSave = () => {
    if (!titulo || !descricao || !dataEntrega || !turma) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const newActivity = {
      id: activityToEdit?.id,
      nome: titulo,
      descricao,
      turma,
      data: dataEntrega,
      status: activityToEdit?.status || 'Pendente',
    };

    onSave(newActivity);
    onClose();
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

          <Text style={modalStyles.label}>Turma</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="Ex: 1º Ano A"
            value={turma}
            onChangeText={setTurma}
          />

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
  const [atividades, setAtividades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);

  // --- Carregar atividades do banco ---
  const carregarAtividades = async () => {
    const { data, error } = await supabase.from('atividades').select('*').order('data', { ascending: true });
    if (error) {
      console.error('Erro ao carregar atividades:', error);
    } else {
      setAtividades(data);
    }
  };

  useEffect(() => {
    carregarAtividades();
  }, []);

  // --- Salvar nova ou editar atividade ---
  const handleSaveActivity = async (atividade) => {
    if (atividade.id) {
      // Atualizar
      const { error } = await supabase.from('atividades').update({
        nome: atividade.nome,
        descricao: atividade.descricao,
        turma: atividade.turma,
        data: atividade.data,
      }).eq('id', atividade.id);

      if (error) console.error('Erro ao atualizar atividade:', error);
      else carregarAtividades();
    } else {
      // Criar nova
      const { error } = await supabase.from('atividades').insert([atividade]);
      if (error) console.error('Erro ao criar atividade:', error);
      else carregarAtividades();
    }
  };

  // --- Excluir atividade ---
  const handleDelete = async (id) => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir esta atividade?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('atividades').delete().eq('id', id);
          if (error) console.error('Erro ao excluir:', error);
          else carregarAtividades();
        },
      },
    ]);
  };

  // --- Renderização dos cards ---
  const renderActivityCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status || 'Pendente'}</Text>
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atividades</Text>
        <TouchableOpacity style={styles.createActivityButton} onPress={() => { setActivityToEdit(null); setModalVisible(true); }}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={atividades}
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade cadastrada.</Text>}
      />

      <NovaAtividadeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        activityToEdit={activityToEdit}
        onSave={handleSaveActivity}
      />
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
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
});
