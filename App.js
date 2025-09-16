import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Telas
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RobotListScreen from './src/screens/RobotListScreen';
import RobotDetailScreen from './src/screens/RobotDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import EditUserScreen from './src/screens/EditUserScreen';
import RegisterUserScreen from './src/screens/RegisterUserScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação principal com tabs
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Robôs') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Robôs" component={RobotStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Perfil" component={ProfileStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Stack navigator para a seção de robôs
const RobotStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Lista de Robôs" component={RobotListScreen} />
      <Stack.Screen name="Detalhes do Robô" component={RobotDetailScreen} />
    </Stack.Navigator>
  );
};

// Stack navigator para perfil e gerenciamento de usuários
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditUser" component={EditUserScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterUser" component={RegisterUserScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Verificar se o usuário já está logado
    const bootstrapAsync = async () => {
      let token = null;
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.log('Falha ao recuperar token', e);
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(() => ({
    signIn: async (data) => {
      // data contém o token e informações do usuário vindos do login
      try {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      } catch (e) {
        console.log('Erro ao salvar dados de autenticação', e);
      }
      setUserToken(data.token);
    },
    signOut: async () => {
      try {
        await AsyncStorage.multiRemove(['userToken', 'userData']);
      } catch (e) {
        console.log('Erro ao remover dados de autenticação', e);
      }
      setUserToken(null);
    },
    getUserData: async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
      } catch (e) {
        console.log('Erro ao obter dados do usuário', e);
        return null;
      }
    },
  }), []);

  if (isLoading) {
    return null; // ou um componente de loading
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {userToken == null ? (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator} 
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

// Contexto de autenticação para ser usado em toda a aplicação
export const AuthContext = React.createContext();
