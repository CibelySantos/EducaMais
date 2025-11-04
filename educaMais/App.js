import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer'; // ⭐️ Importação do Drawer

// Importação das suas telas
import LoginProfessor from './src/login';
import CadastroProfessor from './src/cadastro';
import Home from './src/paginaInicial';
import Atividades from './src/paginaAtividades';
import TurmasScreen from './src/TurmasScreen';
import Sair from './src/logout'

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator(); 

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="HomeDrawer"
      screenOptions={{
        drawerActiveTintColor: '#5b5959ff', // Cor do item de menu ativo
        headerTintColor: '#000', 
        headerStyle: { 
          backgroundColor: '#fff', // Cor do cabeçalho
        },
        headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
        },
      }}
    >
      <Drawer.Screen 
        name="HomeDrawer" 
        component={Home} 
        options={{ title: 'Página Inicial' }} 
      />
      <Drawer.Screen 
        name="Turmas" 
        component={TurmasScreen} 
        options={{ title: 'Gerenciar Turmas' }} 
      />
      <Drawer.Screen 
        name="Atividades" 
        component={Atividades} 
        options={{ title: 'Gerenciar Atividades' }} 
      />
      <Drawer.Screen 
        name="Sair" 
        component={Sair} 
        options={{ title: 'Sair' }} 
      />
    </Drawer.Navigator>
  );
}

// --- 2. Componente de Navegação Stack (Principal) ---
// Este componente lida com as telas que não têm menu (Login/Cadastro) e o Drawer.
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="LoginProfessor"
      >
        {/* Telas que NÃO TÊM cabeçalho e menu (Acesso/Pré-login) */}
        <Stack.Screen 
            name="LoginProfessor" 
            component={LoginProfessor} 
            options={{ headerShown: false }} 
        />
        <Stack.Screen 
            name="CadastroProfessor" 
            component={CadastroProfessor} 
            options={{ headerShown: false }} 
        />
        
        {/* ⭐️ Rota Principal: Usa o Drawer Navigator 
             Quando o usuário logar, ele deve navegar para "MainContent"
        */}
        <Stack.Screen 
            name="MainContent" 
            component={MainDrawerNavigator} 
            options={{ headerShown: false }} // O Drawer já tem seu próprio cabeçalho
        />

        {/* ⚠️ Telas removidas: Não precisamos mais delas aqui, pois estão dentro do Drawer:
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Atividades" component={Atividades} />
        <Stack.Screen name="Turmas" component={Turmas} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

