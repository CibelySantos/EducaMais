import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginProfessor from './src/login';
import CadastroProfessor from './src/cadastro';
import Home from './src/paginaInicial';
import Atividades from './src/paginaAtividades';
import Turmas from './src/turmas'

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="LoginProfessor" // 👈 Login será a primeira página
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="LoginProfessor" component={LoginProfessor} />
        <Stack.Screen name="CadastroProfessor" component={CadastroProfessor} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Atividades" component={Atividades} />
        <Stack.Screen name="Turmas" component={Turmas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

