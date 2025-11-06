Cibely Cristiny n°03 | Júlia Fortunato n°14

EducaMais - Sistema de Gestão de Turmas e Atividades

Este projeto é um sistema mobile para professores, desenvolvido em React Native com Expo, focado na gestão de turmas e atividades, utilizando o Supabase como backend e sistema de banco de dados.

Tecnologias Utilizadas

Framework: Expo / React Native
Linguagem: JavaScript / ES6+
Backend & Database: Supabase
Autenticação: Manual (via AsyncStorage e bcrypt)

Instalação de Dependências

Para que o projeto funcione corretamente, é necessário instalar os seguintes pacotes.

1. Dependências Principais e Expo

Estas dependências são instaladas via `npm` e `npx expo install`.

Comando
`npm install @supabase/supabase-js`
`npm install bcryptjs`
`npx expo install @expo/vector-icons`

2. Persistência de Sessão e Utilitários

Como a autenticação está sendo feita de forma **manual (lendo a tabela `professores`)**, usamos estas dependências para salvar o ID do usuário localmente e garantir a compatibilidade com o Supabase.

Comando

`npx expo install @react-native-async-storage/async-storage`
`npx expo install react-native-url-polyfill`

3. Navegação (React Navigation)

O projeto utiliza o React Navigation para gerenciar a transição entre telas.

Comando
`npm install @react-navigation/native`
`npm install @react-navigation/stack`
`npx expo install react-native-screens react-native-safe-area-context`

Instalação Completa

Você pode instalar todas as dependências de uma vez executando os seguintes comandos no terminal, na raiz do projeto:

bash
1. Instalação via NPM
npm install @supabase/supabase-js bcryptjs @react-navigation/native @react-navigation/stack

2. Instalação via Expo (Melhor compatibilidade para nativos)
npx expo install @react-native-async-storage/async-storage react-native-url-polyfill @expo/vector-icons react-native-screens react-native-safe-area-context

<img width="383" height="821" alt="image" src="https://github.com/user-attachments/assets/79519d2b-9f27-4bee-b7c0-afbca95c9232" />
<img width="377" height="818" alt="image" src="https://github.com/user-attachments/assets/4204c15f-2404-4dbc-8182-7d671d9046e2" />
<img width="373" height="826" alt="image" src="https://github.com/user-attachments/assets/033fde47-e70b-479f-97da-95ca11fd1cc1" />


Para realizar login utilize: 
Email: julia@julia.com
Senha:123456


