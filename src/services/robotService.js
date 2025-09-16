import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8080/api';

export const getRobots = async () => {
  try {
    const token = await AsyncStorage.getItem('@LogiTrack:token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/robos`, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }
      throw new Error(`Falha ao obter dados dos robôs: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao conectar com o servidor:', error);
    if (error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8080/api');
  }
};

export const getRobotById = async (id) => {
  try {
    const token = await AsyncStorage.getItem('@LogiTrack:token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/robos/${id}`, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }
      throw new Error(`Falha ao obter dados do robô: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao conectar com o servidor:', error);
    if (error.message.includes('autenticado')) {
      throw error;
    }
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8080/api');
  }
};