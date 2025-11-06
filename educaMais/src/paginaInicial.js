import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
// Você pode usar o pacote 'expo-icons' ou 'react-native-vector-icons' para ícones se estiver usando Expo/RN CLI.
// Como não podemos importar pacotes externos aqui, usaremos texto para simular os ícones.

export default function PaginaInicial({ route, navigation }) {
    // Pega o nome vindo da rota ou define 'Professor' como padrão
    // O nome é usado no título "Bem-vindo ao EduManager"
    const { nome } = route.params || { nome: 'Professor' }; 

    // O código de acesso foi removido para replicar o design da imagem, 
    // que foca nos cartões de navegação.

    const handleNavigate = (screenName) => {
        // Navega para as rotas definidas no Drawer Navigator do App.js
        navigation.navigate(screenName);
    };

    return (
        <View style={styles.container}>
            
            {/* 1. Cartão Principal de Boas-Vindas */}
            <View style={styles.cardPrincipal}>
                {/* ImageBackground simula o fundo escuro/foto visto na imagem */}
                <ImageBackground 
                    source={{ uri: 'https://previews.123rf.com/images/peopleimages12/peopleimages122301/peopleimages12230140670/197591525-friends-students-and-group-studying-with-laptop-at-park-outdoors-education-scholarship-learning.jpg' }} // Placeholder
                    style={styles.backgroundImage}
                    imageStyle={styles.imageStyle}
                >
                    <View style={styles.overlay}>
                        <Text style={styles.tituloPrincipal}>Bem-vindo ao EducaMais</Text>
                        <Text style={styles.subtituloPrincipal}>
                            Gerencie suas turmas e atividades de forma simples e eficiente
                        </Text>

                        {/* Botões do Cartão Principal */}
                        <View style={styles.principalBotoesContainer}>
                            <TouchableOpacity 
                                style={[styles.principalBotao, { backgroundColor: '#2ecc71' }]} 
                                onPress={() => handleNavigate('TurmasScreen')}
                            >
                                <Text style={styles.textoBotao}>Ver Turmas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.principalBotao, { backgroundColor: 'transparent', borderColor: '#fff', borderWidth: 1 }]} 
                                onPress={() => handleNavigate('Atividades')}
                            >
                                <Text style={styles.textoBotao}>Ver Atividades</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {/* 2. Cartão Gerenciar Turmas */}
            <View style={styles.cardSecundario}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}></Text> {/* Simula o ícone */}
                    <View>
                        <Text style={styles.cardTitle}>Gerenciar Turmas</Text>
                        <Text style={styles.cardDescription}>
                            Crie, edite e organize suas turmas escolares
                        </Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={[styles.cardButton, { backgroundColor: '#3498db' }]} 
                    onPress={() => handleNavigate('TurmasScreen')} 
                >
                    <Text style={styles.textoBotao}>Ir para Turmas</Text>
                </TouchableOpacity>
            </View>

            {/* 3. Cartão Gerenciar Atividades */}
            <View style={styles.cardSecundario}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}></Text> {/* Simula o ícone */}
                    <View>
                        <Text style={styles.cardTitle}>Gerenciar Atividades</Text>
                        <Text style={styles.cardDescription}>
                            Crie e acompanhe atividades e tarefas
                        </Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={[styles.cardButton, { backgroundColor: '#2ecc71' }]} 
                    onPress={() => handleNavigate('Atividades')}
                >
                    <Text style={styles.textoBotao}>Ir para Atividades</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', // Fundo levemente cinza
        padding: 15,
        alignItems: 'center',
    },
    // --- Estilos do Cartão Principal ---
    cardPrincipal: {
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 5, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    backgroundImage: {
        width: '100%',
        height: 200, // Altura fixa para o cartão principal
    },
    imageStyle: {
        borderRadius: 15,
        opacity: 0.6, // Escurece a imagem
    },
    overlay: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay escuro
        justifyContent: 'flex-end',
    },
    tituloPrincipal: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtituloPrincipal: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 15,
    },
    principalBotoesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    principalBotao: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },

    // --- Estilos dos Cartões Secundários ---
    cardSecundario: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        elevation: 3, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    cardIcon: {
        fontSize: 30, // Tamanho do emoji/ícone
        marginRight: 15,
        color: '#3498db', // Cor de destaque para o ícone
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    cardDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        maxWidth: '90%', // Limita a largura do texto
    },
    cardButton: {
        width: '100%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
