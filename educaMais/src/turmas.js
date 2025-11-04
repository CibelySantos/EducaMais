// src/Turmas.js
import React, { useState, useCallback, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, ActivityIndicator, 
    TouchableOpacity, Alert, TextInput, ScrollView, Modal, 
    KeyboardAvoidingView, Platform, Button 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 

// Importa o cliente Supabase fornecido
import { supabase } from './supabaseClient'; 


// ====================================================================
// FUNÇÕES DE AUTENTICAÇÃO E API (SUPABASE)
// ====================================================================

// Função para obter o ID do usuário autenticado (Professor)
const getProfessorId = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        // Retorna o ID do usuário ou null se não estiver logado
        return user ? user.id : null; 
    } catch (error) {
        console.error('Erro ao obter ID do Professor:', error);
        return null;
    }
};

// ---
const getTurmasDoProfessorSupabase = async (professorId) => {
    // Requisito 4: Listar turmas pertencentes ao professor autenticado
    const { data, error } = await supabase
        .from('turmas')
        .select('id, nome, periodo, num_alunos')
        .eq('professor_id', professorId)
        .order('nome', { ascending: true });

    if (error) {
        console.error('Supabase Error (Listagem):', error);
        return { success: false, message: `Erro ao buscar turmas: ${error.message}`, turmas: [] };
    }

    const turmasFormatadas = data.map(turma => ({
        id: turma.id,
        nome: turma.nome,
        periodo: turma.periodo,
        // Garante que o frontend use camelCase (numAlunos)
        numAlunos: turma.num_alunos, 
    }));

    return { success: true, turmas: turmasFormatadas };
};

// ---
const salvarTurmaSupabase = async (turmaData, isEditing, professorId) => {
    const dataToSave = {
        nome: turmaData.nome,
        periodo: turmaData.periodo,
        num_alunos: turmaData.numAlunos, // Mapeamento para snake_case do banco
    };
    
    let response;

    if (isEditing) {
        // Operação UPDATE (edição)
        response = await supabase
            .from('turmas')
            .update(dataToSave)
            .eq('id', turmaData.id)
            .select();
    } else {
        // Operação INSERT (cadastro) - Requisito 3
        dataToSave.professor_id = professorId; 
        response = await supabase
            .from('turmas')
            .insert([dataToSave])
            .select();
    }

    if (response.error) {
        console.error('Supabase Error (Salvar):', response.error);
        return { success: false, message: `Erro ao salvar turma: ${response.error.message}` };
    }

    return { 
        success: true, 
        message: isEditing ? 'Turma atualizada com sucesso!' : 'Turma cadastrada com sucesso!' 
    };
};

// ---
const excluirTurmaSupabase = async (turmaId) => {
    // 1. Verificar se a turma tem atividades (Requisito 5)
    // Assumimos que existe uma tabela 'atividades' com a chave estrangeira 'turma_id'
    const { count: atividadesCount, error: countError } = await supabase
        .from('atividades')
        .select('id', { count: 'exact', head: true })
        .eq('turma_id', turmaId);

    if (countError) {
        return { success: false, message: 'Erro ao verificar atividades da turma.' };
    }

    if (atividadesCount > 0) {
        // Requisito 5: Mensagem de erro se houver atividades.
        return { 
            success: false, 
            message: 'Você não pode excluir uma turma com atividades cadastradas.' 
        };
    }
    
    // 2. Procede com a exclusão
    const { error: deleteError } = await supabase
        .from('turmas')
        .delete()
        .eq('id', turmaId);

    if (deleteError) {
        console.error('Erro ao excluir turma:', deleteError);
        return { success: false, message: `Erro ao excluir turma: ${deleteError.message}` };
    }
    
    return { success: true, message: 'Turma excluída com sucesso.' };
};


// ====================================================================
// COMPONENTE TurmaItem (Requisitos 4, 5)
// ====================================================================

function TurmaItem({ turma, onTurmaExcluida, onVisualizarAtividades, onEditar }) {
  
  const handleExcluir = () => {
    // Requisito 5: Confirmação de exclusão
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a turma "${turma.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await excluirTurmaSupabase(turma.id); 

              if (response.success) {
                Alert.alert('Sucesso', response.message);
                onTurmaExcluida(); 
              } else {
                Alert.alert('Atenção', response.message);
              }
            } catch (error) {
              Alert.alert('Erro', 'Ocorreu um erro inesperado.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={itemStyles.card}>
      <View style={itemStyles.infoContainer}>
        <Icon name="people-outline" size={20} color="#343a40" />
        <Text style={itemStyles.nomeTurma}>{turma.nome}</Text>
      </View>
      <Text style={itemStyles.periodo}>{turma.periodo}</Text>
      <Text style={itemStyles.alunos}>{turma.numAlunos} alunos</Text>

      <View style={itemStyles.actionsContainer}>
        {/* Requisito 4: Botão para atividades */}
        <TouchableOpacity style={itemStyles.actionButton} onPress={() => onVisualizarAtividades(turma)}>
          <Icon name="list-outline" size={18} color="#007bff" />
          <Text style={[itemStyles.actionText, {color: '#007bff'}]}>Atividades</Text>
        </TouchableOpacity>
        
        {/* Botão de Edição */}
        <TouchableOpacity style={itemStyles.actionButton} onPress={() => onEditar(turma)}>
          <Icon name="create-outline" size={18} color="#6c757d" />
          <Text style={itemStyles.actionText}>Editar</Text>
        </TouchableOpacity>
        
        {/* Botão de Exclusão (Requisito 4 e 5) */}
        <TouchableOpacity style={itemStyles.deleteButton} onPress={handleExcluir}>
          <Icon name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const itemStyles = StyleSheet.create({
    // Estilos do TurmaItem (mantidos)
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    nomeTurma: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    periodo: {
        fontSize: 14,
        color: '#6c757d',
        marginLeft: 25,
        marginBottom: 5,
    },
    alunos: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007bff',
        marginBottom: 10,
        marginLeft: 25,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        paddingVertical: 5,
    },
    actionText: {
        marginLeft: 3,
        fontSize: 14,
        color: '#6c757d',
    },
    deleteButton: {
        marginLeft: 'auto',
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 5,
    }
});


// ====================================================================
// MODAL DE CADASTRO/EDIÇÃO (Requisito 3)
// ====================================================================

function CadastroOuEdicaoTurmaModal({ isVisible, onClose, turmaParaEditar, professorId, onSalvo }) {
    const isEditing = !!turmaParaEditar;
    
    const [nomeTurma, setNomeTurma] = useState(turmaParaEditar?.nome || '');
    const [periodo, setPeriodo] = useState(turmaParaEditar?.periodo || '');
    const [numAlunos, setNumAlunos] = useState(turmaParaEditar?.numAlunos?.toString() || '0');
    const [isLoading, setIsLoading] = useState(false);

    // Resetar o estado quando o modal for aberto/fechado ou o item de edição mudar
    useEffect(() => {
        if (isVisible) {
            setNomeTurma(turmaParaEditar?.nome || '');
            setPeriodo(turmaParaEditar?.periodo || '');
            setNumAlunos(turmaParaEditar?.numAlunos?.toString() || '0');
        }
    }, [isVisible, turmaParaEditar]);


    const handleSalvar = async () => {
        if (!nomeTurma.trim() || !periodo.trim()) {
            Alert.alert('Atenção', 'O Nome da Turma e o Período são obrigatórios.');
            return;
        }
        
        const alunosInt = parseInt(numAlunos || '0');
        if (!professorId || isNaN(alunosInt) || alunosInt < 0) {
            Alert.alert('Atenção', 'Dados incompletos ou inválidos.');
            return;
        }

        const turmaData = {
            id: turmaParaEditar?.id,
            nome: nomeTurma,
            periodo: periodo,
            numAlunos: alunosInt,
        };

        setIsLoading(true);
        try {
            const response = await salvarTurmaSupabase(turmaData, isEditing, professorId);

            if (response.success) {
                Alert.alert('Sucesso', response.message);
                onSalvo(); 
                onClose();
            } else {
                Alert.alert('Erro', response.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Ocorreu um erro inesperado ao salvar a turma.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                style={modalStyles.centeredView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={modalStyles.modalView}>
                    <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
                        <Icon name="close" size={24} color="#343a40" />
                    </TouchableOpacity>
                    
                    <Text style={modalStyles.modalTitle}>{isEditing ? 'Editar Turma' : 'Nova Turma'}</Text>
                    <Text style={modalStyles.modalSubtitle}>Preencha as informações da turma</Text>

                    <ScrollView style={modalStyles.formContainer}>
                        <Text style={modalStyles.label}>Nome da Turma</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Ex: 1º Ano A"
                            value={nomeTurma}
                            onChangeText={setNomeTurma}
                            autoCapitalize="words"
                        />
                        
                        <Text style={modalStyles.label}>Período</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Ex: Manhã, Tarde, Noite"
                            value={periodo}
                            onChangeText={setPeriodo}
                            autoCapitalize="words"
                        />

                        <Text style={modalStyles.label}>Número de Alunos</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="0"
                            value={numAlunos}
                            onChangeText={(text) => setNumAlunos(text.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                        />
                    </ScrollView>
                    
                    <View style={modalStyles.buttonContainer}>
                        <Button
                            title={isLoading ? "Salvando..." : (isEditing ? "Salvar" : "Criar")}
                            onPress={handleSalvar}
                            disabled={isLoading}
                        />
                        <View style={{ marginTop: 10 }}>
                            <Button
                                title="Cancelar"
                                onPress={onClose}
                                color="#6c757d"
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const modalStyles = StyleSheet.create({
    // Estilos do Modal (mantidos)
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 10,
        padding: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#343a40',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 15,
    },
    formContainer: {
        maxHeight: 300, 
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        marginTop: 10,
        color: '#343a40',
    },
    input: {
        height: 50,
        backgroundColor: '#f8f9fa',
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 5,
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    }
});


// ====================================================================
// TELA PRINCIPAL DE TURMAS (Requisito 4)
// ====================================================================

export default function Turmas() {
    const [turmas, setTurmas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [professorId, setProfessorId] = useState(null);
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [turmaParaEditar, setTurmaParaEditar] = useState(null);


    const loadProfessorAndTurmas = useCallback(async () => {
        setIsLoading(true);
        const id = await getProfessorId();
        setProfessorId(id);

        if (id) {
            const response = await getTurmasDoProfessorSupabase(id);
            if (response.success) {
                setTurmas(response.turmas);
            } else {
                Alert.alert('Erro', response.message);
            }
        } else {
            // Lidar com o caso de usuário não autenticado
            Alert.alert('Erro de Autenticação', 'Usuário não autenticado. Por favor, faça login.');
            setTurmas([]);
        }
        setIsLoading(false);
    }, []);

    // Carrega dados na montagem do componente
    useEffect(() => {
        loadProfessorAndTurmas();
    }, [loadProfessorAndTurmas]);


    const handleOpenModalCadastro = () => {
        setTurmaParaEditar(null); // Limpa para cadastro
        setIsModalVisible(true);
    };

    const handleOpenModalEdicao = (turma) => {
        setTurmaParaEditar(turma); // Define para edição
        setIsModalVisible(true);
    };

    const handleVisualizarAtividades = (turma) => {
        // Requisito 4: Navegar para a tela de atividades (Simulação)
        Alert.alert('Ação', `Acessar atividades da turma: ${turma.nome}`);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Carregando dados...</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Turmas</Text>
                    <Text style={styles.headerSubtitle}>Gerencie as turmas da escola</Text>
                </View>
                {/* Botão Nova Turma (Cadastro - Requisito 3) */}
                <TouchableOpacity 
                    style={styles.novaTurmaButton}
                    onPress={handleOpenModalCadastro} 
                    disabled={!professorId}
                >
                    <Icon name="add" size={24} color="#fff"/>
                    <Text style={styles.novaTurmaText}>Nova Turma</Text>
                </TouchableOpacity>
            </View>
            
            {turmas.length === 0 ? (
                <Text style={styles.emptyMessage}>Nenhuma turma cadastrada. Crie uma nova!</Text>
            ) : (
                <FlatList
                    data={turmas}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TurmaItem 
                            turma={item}
                            onTurmaExcluida={loadProfessorAndTurmas} // Recarrega a lista
                            onVisualizarAtividades={handleVisualizarAtividades}
                            onEditar={handleOpenModalEdicao}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
            
            {/* Modal de Cadastro/Edição */}
            <CadastroOuEdicaoTurmaModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                turmaParaEditar={turmaParaEditar}
                professorId={professorId}
                onSalvo={loadProfessorAndTurmas} // Recarrega a lista
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // Estilos da Tela Principal (mantidos)
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#343a40',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    novaTurmaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    novaTurmaText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    listContent: {
        paddingVertical: 10,
    },
    emptyMessage: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#6c757d',
    }
});