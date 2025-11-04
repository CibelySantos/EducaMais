import React, { useState, useEffect } from 'react'; // ⭐️ Adicionado useEffect
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, ScrollView, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
// ⭐️ Importe o Supabase Client
import { supabase } from './supabaseClient'; 

// --- Componente do Modal de Criação/Edição ---
// ⭐️ Adicionada a lista de turmas para seleção
const NovaAtividadeModal = ({ visible, onClose, activityToEdit, onSave, turmas }) => {
  const [titulo, setTitulo] = useState(activityToEdit ? activityToEdit.titulo : '');
  const [descricao, setDescricao] = useState(activityToEdit ? activityToEdit.descricao : '');
  // Assumindo que a turma é salva como texto (nome) no front por enquanto
  const [turma, setTurma] = useState(activityToEdit ? activityToEdit.turma : ''); 
  const [dataEntrega, setDataEntrega] = useState(activityToEdit ? activityToEdit.entrega : '');
  const [loading, setLoading] = useState(false);

  const isEditing = !!activityToEdit;
  const modalTitle = isEditing ? 'Editar Atividade' : 'Nova Atividade';
  const buttonLabel = isEditing ? 'Salvar Edição' : 'Criar';

  const handleSave = async () => {
    if (!titulo || !descricao || !turma || !dataEntrega) {
        Alert.alert("Atenção", "Preencha todos os campos.");
        return;
    }

    setLoading(true);

    // ⭐️ Dados formatados para o Supabase (colunas nome, descricao, data)
    const activityData = {
        nome: titulo,
        descricao: descricao,
        data: dataEntrega, // Manter como string 'dd/mm/aaaa'. Se Supabase exigir formato ISO, mude a formatação aqui.
        turma: turma, // Você precisará criar a coluna 'turma' na tabela 'atividades'
        // status: 'Pendente' é um bom valor inicial, adicione a coluna 'status' na tabela 'atividades'
        status: activityToEdit?.status || 'Pendente', 
    };

    try {
        await onSave(activityData, activityToEdit?.id); // Passa os dados e o ID se estiver editando
        onClose();
    } catch (error) {
        console.error("Erro ao salvar atividade:", error);
        Alert.alert("Erro", "Não foi possível salvar a atividade. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose} disabled={loading}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={modalStyles.modalTitle}>{modalTitle}</Text>
          <Text style={modalStyles.modalSubtitle}>Preencha as informações da atividade</Text>

          {/* Título */}
          <Text style={modalStyles.label}>Título</Text>
          <TextInput
            style={modalStyles.input}
            placeholder="Ex: Trabalho de Matemática"
            value={titulo}
            onChangeText={setTitulo}
            editable={!loading}
          />

          {/* Descrição */}
          <Text style={modalStyles.label}>Descrição</Text>
          <TextInput
            style={[modalStyles.input, modalStyles.textArea]}
            placeholder="Descreva a atividade..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
            editable={!loading}
          />

          {/* Turma e Data de Entrega */}
          <View style={modalStyles.row}>
            {/* ⭐️ Campo Turma (usando TextInput simples) */}
            <View style={modalStyles.halfInput}>
              <Text style={modalStyles.label}>Turma</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="Ex: 1º Ano A"
                value={turma}
                onChangeText={setTurma}
                editable={!loading}
              />
            </View>
            {/* Campo Data de Entrega */}
            <View style={modalStyles.halfInput}>
              <Text style={modalStyles.label}>Data de Entrega</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="dd/mm/aaaa"
                keyboardType="numeric"
                value={dataEntrega}
                onChangeText={setDataEntrega}
                editable={!loading}
              />
              <Feather name="calendar" size={18} color="#999" style={modalStyles.calendarIcon} />
            </View>
          </View>

          {/* Botões */}
          <TouchableOpacity 
              style={modalStyles.createButton} 
              onPress={handleSave} 
              disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={modalStyles.createButtonText}>{buttonLabel}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

// --- Componente Principal da Tela ---
export default function AtividadesScreen() {
  const [atividades, setAtividades] = useState([]); // ⭐️ Começa vazio
  const [turmas, setTurmas] = useState([]); // ⭐️ Novo estado para turmas
  const [modalVisible, setModalVisible] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [loading, setLoading] = useState(true); // ⭐️ Estado de carregamento inicial
  const [error, setError] = useState(null);

  // 1. Função de Busca de Atividades (CRUD - READ)
  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('atividades')
      // ⭐️ Seleciona as colunas do DB. Inclua 'id' e 'status' se existirem.
      .select('id, nome, descricao, turma, data, status') 
      .order('id', { ascending: false }); 

    if (error) {
      console.error('Erro ao buscar atividades:', error);
      setError('Falha ao carregar as atividades.');
    } else if (data) {
        // Mapeia os dados do Supabase para o formato do Card
        const formattedActivities = data.map(item => ({
            id: item.id,
            titulo: item.nome, // Mapeia 'nome' para 'titulo'
            descricao: item.descricao,
            turma: item.turma,
            entrega: item.data, // Mapeia 'data' para 'entrega'
            status: item.status || 'Pendente', // Assume 'Pendente' se a coluna 'status' for nula
        }));
        setAtividades(formattedActivities);
        setError(null);
    }
    setLoading(false);
  };
  
  // 1.1 Função de Busca de Turmas (Para o Modal)
  const fetchTurmas = async () => {
      const { data, error } = await supabase
          .from('turmas')
          .select('nome'); 
          
      if (error) {
          console.error('Erro ao buscar turmas:', error);
      } else if (data) {
          setTurmas(data.map(t => t.nome));
      }
  };

  // 2. Função de Salvar/Editar (CRUD - CREATE/UPDATE)
  const handleSaveActivity = async (activityData, id) => {
    let response;
    
    if (id) {
      // Edição (UPDATE)
      response = await supabase
        .from('atividades')
        .update(activityData)
        .eq('id', id);
    } else {
      // Criação (INSERT)
      response = await supabase
        .from('atividades')
        .insert([activityData]);
    }
    
    if (response.error) {
        throw new Error(response.error.message);
    }
    
    // Recarrega a lista para mostrar a mudança
    await fetchActivities(); 
  };
  
  // 3. Função de Excluir (CRUD - DELETE)
  const handleDelete = async (id) => {
    Alert.alert(
        "Confirmar Exclusão",
        "Tem certeza que deseja excluir esta atividade?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Excluir", 
                onPress: async () => {
                    const { error } = await supabase
                        .from('atividades')
                        .delete()
                        .eq('id', id);

                    if (error) {
                        console.error('Erro ao excluir:', error);
                        Alert.alert("Erro", "Falha ao excluir a atividade.");
                    } else {
                        // Atualiza o estado sem recarregar tudo (opcional, mas mais rápido)
                        setAtividades(prev => prev.filter(a => a.id !== id));
                        console.log(`Atividade ${id} excluída.`);
                    }
                },
                style: "destructive"
            }
        ]
    );
  };

  // ⭐️ Executa a busca inicial ao montar o componente
  useEffect(() => {
    fetchTurmas();
    fetchActivities();
  }, []);

  const handleCreateNew = () => {
    setActivityToEdit(null);
    setModalVisible(true);
  };

  const handleEdit = (activity) => {
    setActivityToEdit(activity);
    setModalVisible(true);
  };


  // --- Renderização de cada Card de Atividade (inalterada) ---
  const renderActivityCard = ({ item }) => {
    // ⭐️ Use item.status, que agora vem do DB
    const statusStyle = item.status === 'Concluída' ? styles.statusConcluida : styles.statusPendente;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleGroup}>
            <MaterialCommunityIcons name="note-text-outline" size={24} color="#333" style={{ marginRight: 10 }} />
            <Text style={styles.cardTitle}>{item.titulo}</Text>
          </View>
          <View style={[styles.statusBadge, statusStyle]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>{item.descricao}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.infoGroup}>
            <Feather name="users" size={14} color="#666" style={{ marginRight: 5 }} />
            <Text style={styles.cardInfoText}>{item.turma}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Feather name="calendar" size={14} color="#666" style={{ marginRight: 5 }} />
            <Text style={styles.cardInfoText}>{item.entrega}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Feather name="trash-2" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Atividades</Text>
          <Text style={styles.headerSubtitle}>Gerencie as atividades escolares</Text>
        </View>
        
        {/* Botão Nova Atividade */}
        <TouchableOpacity style={styles.createActivityButton} onPress={handleCreateNew}>
          <Feather name="plus" size={20} color="#fff" style={{ marginRight: 5 }} />
          <Text style={styles.createActivityButtonText}>Nova Atividade</Text>
        </TouchableOpacity>
      </View>

      {/* ⭐️ Indicador de Carregamento/Erro */}
      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 50 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        /* Lista de Atividades */
        <FlatList
          data={atividades}
          renderItem={renderActivityCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
              <Text style={styles.emptyText}>Nenhuma atividade cadastrada.</Text>
          )}
        />
      )}
      
      {/* Modal de Nova/Editar Atividade */}
      <NovaAtividadeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        activityToEdit={activityToEdit}
        onSave={handleSaveActivity} // ⭐️ Função async do Supabase
        turmas={turmas}
      />
    </SafeAreaView>
  );
}

// --- Estilos da Tela Principal e Cards (Adicionado o estilo de erro) ---
const styles = StyleSheet.create({
  // ... (Estilos inalterados) ...
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666' },
  createActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createActivityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleGroup: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginLeft: 34,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
  infoGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  cardInfoText: { fontSize: 13, color: '#666' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
  statusPendente: { backgroundColor: '#ffe0b2' },
  statusConcluida: { backgroundColor: '#b3e0ff' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  editText: { color: '#555', fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' },
  // ⭐️ NOVO: Estilo para exibir erros
  errorText: {
    color: '#cc0000',
    textAlign: 'center',
    marginTop: 30,
    padding: 15,
    backgroundColor: '#ffdddd',
    marginHorizontal: 20,
    borderRadius: 8,
  }
});

// --- Estilos do Modal (Inalterados) ---
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  halfInput: {
    width: '48%',
    position: 'relative',
  },
  calendarIcon: {
    position: 'absolute',
    right: 10,
    bottom: 12,
  },
  createButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  }
});
