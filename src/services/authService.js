import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base da API do backend
const API_BASE_URL = 'http://localhost:8080/api'; // Para emulador Android
// const API_BASE_URL = 'http://localhost:8080/api'; // Para iOS Simulator

/**
 * Serviço de autenticação integrado com API Spring Boot
 */

/**
 * Realiza login do usuário
 * @param {string} username Nome de usuário
 * @param {string} password Senha
 * @returns {Promise} Promise com dados do usuário e token
 */
export const login = async (username, password) => {
  try {
    console.log('🔄 Iniciando login para:', username);
    console.log('🌐 URL da API:', `${API_BASE_URL}/auth/login`);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('✅ Response OK:', response.ok);

    const data = await response.json();
    console.log('📦 Dados recebidos:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    // Salva o token no AsyncStorage
    await AsyncStorage.setItem('@LogiTrack:token', data.token);
    await AsyncStorage.setItem('@LogiTrack:user', JSON.stringify(data.usuario));

    console.log('✅ Login realizado com sucesso');
    return {
      user: data.usuario,
      token: data.token,
    };
  } catch (error) {
    console.error('❌ Erro no login:', error);
    console.error('❌ Tipo do erro:', error.name);
    console.error('❌ Mensagem:', error.message);
    throw error;
  }
};

/**
 * Cadastra um novo usuário (apenas admins)
 * @param {Object} userData Dados do usuário
 * @returns {Promise} Promise com dados do usuário criado
 */
export const registerUser = async (userData) => {
  try {
    const token = await AsyncStorage.getItem('@LogiTrack:token');
    
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao cadastrar usuário');
    }

    return data;
  } catch (error) {
    console.error('Erro no cadastro:', error);
    throw error;
  }
};

/**
 * Lista todos os usuários (apenas admins)
 * @returns {Promise} Promise com lista de usuários
 */
export const listUsers = async () => {
  try {
    const token = await AsyncStorage.getItem('@LogiTrack:token');
    
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao listar usuários');
    }

    return data;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
};

/**
 * Atualiza um usuário (apenas admins)
 * @param {number} userId ID do usuário
 * @param {Object} userData Dados atualizados
 * @returns {Promise} Promise com dados do usuário atualizado
 */
export const updateUser = async (userId, userData) => {
  try {
    console.log('🔄 updateUser - iniciando requisição:', {
      userId,
      userData,
      url: `${API_BASE_URL}/usuarios/${userId}`
    });

    const token = await AsyncStorage.getItem('@LogiTrack:token');
    console.log('🔐 Token obtido:', token ? 'Token presente' : 'Token ausente');
    
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('✅ Response OK:', response.ok);

    const data = await response.json();
    console.log('📦 Dados recebidos:', data);

    if (!response.ok) {
      console.error('❌ Erro na resposta:', data);
      throw new Error(data.message || 'Erro ao atualizar usuário');
    }

    console.log('✅ updateUser - sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    console.error('❌ Tipo do erro:', error.name);
    console.error('❌ Mensagem:', error.message);
    throw error;
  }
};

/**
 * Desativa um usuário (apenas admins)
 * @param {number} userId ID do usuário
 * @returns {Promise} Promise de confirmação
 */
export const deleteUser = async (userId) => {
  try {
    const token = await AsyncStorage.getItem('@LogiTrack:token');
    
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erro ao desativar usuário');
    }

    return true;
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    throw error;
  }
};

/**
 * Obtém perfil do usuário logado
 * @returns {Promise} Promise com dados do perfil
 */
export const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('@LogiTrack:token');
    
    const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao obter perfil');
    }

    return data;
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    throw error;
  }
};

/**
 * Valida se o token ainda é válido
 * @returns {Promise<boolean>} Promise com status da validação
 */
export const validateToken = async () => {
  try {
    const token = await AsyncStorage.getItem('@LogiTrack:token');
    
    if (!token) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/validate-token?token=${token}`, {
      method: 'POST',
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};

/**
 * Verifica se o usuário está autenticado
 * @returns {Promise<boolean>} Promise com status da autenticação
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('@LogiTrack:token');
    const user = await AsyncStorage.getItem('@LogiTrack:user');
    
    if (!token || !user) {
      return false;
    }
    
    // Valida se o token ainda é válido
    return await validateToken();
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};

/**
 * Realiza logout do usuário
 * @returns {Promise} Promise de confirmação
 */
export const logout = async () => {
  try {
    // Remove dados do AsyncStorage
    await AsyncStorage.multiRemove(['@LogiTrack:token', '@LogiTrack:user']);
    return true;
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};
