import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { listUsers, deleteUser } from '../services/authService';

/**
 * Tela de gerenciamento de usuários
 * Permite que administradores vejam, criem, editem e desativem usuários
 */
const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Carrega a lista de usuários
   */
  const loadUsers = async () => {
    try {
      const usersList = await listUsers();
      setUsers(usersList);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar usuários: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Recarrega a lista quando a tela ganha foco
   */
  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  /**
   * Manipula o refresh da lista
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  /**
   * Navega para a tela de cadastro de usuário
   */
  const handleAddUser = () => {
    navigation.navigate('RegisterUser');
  };

  /**
   * Confirma e executa a desativação de um usuário
   * @param {Object} user Usuário a ser desativado
   */
  const handleDeleteUser = (user) => {
    Alert.alert(
      'Confirmar desativação',
      `Tem certeza que deseja desativar o usuário "${user.username}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Sucesso', 'Usuário desativado com sucesso');
              loadUsers(); // Recarrega a lista
            } catch (error) {
              Alert.alert('Erro', error.message || 'Falha ao desativar usuário');
            }
          },
        },
      ]
    );
  };

  /**
   * Navega para tela de edição do usuário
   * @param {Object} user Usuário a ser editado
   */
  const handleEditUser = (user) => {
    navigation.navigate('EditUser', { user });
  };

  /**
   * Obtém a cor do badge baseada no tipo de usuário
   * @param {string} tipoUsuario Tipo do usuário
   * @returns {string} Cor do badge
   */
  const getBadgeColor = (tipoUsuario) => {
    return tipoUsuario === 'ADMIN' ? '#e74c3c' : '#3498db';
  };

  /**
   * Formata a data de criação
   * @param {string} dataISO Data no formato ISO
   * @returns {string} Data formatada
   */
  const formatDate = (dataISO) => {
    const date = new Date(dataISO);
    return date.toLocaleDateString('pt-BR');
  };

  /**
   * Renderiza um item da lista de usuários
   * @param {Object} param0 Item e índice
   * @returns {JSX.Element} Componente do item
   */
  const renderUserItem = ({ item: user }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.nomeCompleto}</Text>
          <Text style={styles.userUsername}>@{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        
        <View style={[styles.badge, { backgroundColor: getBadgeColor(user.tipoUsuario) }]}>
          <Text style={styles.badgeText}>
            {user.tipoUsuarioDescricao}
          </Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>
            {user.telefone || 'Não informado'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#7f8c8d" />
          <Text style={styles.detailText}>
            Cadastrado em {formatDate(user.dataCriacao)}
          </Text>
        </View>

        {user.dataUltimoAcesso && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#7f8c8d" />
            <Text style={styles.detailText}>
              Último acesso: {formatDate(user.dataUltimoAcesso)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditUser(user)}
        >
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(user)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Desativar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Renderiza componente de lista vazia
   * @returns {JSX.Element} Componente de lista vazia
   */
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#bdc3c7" />
      <Text style={styles.emptyTitle}>Nenhum usuário encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Comece criando o primeiro usuário do sistema
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciar Usuários</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de usuários */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#27ae60',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#34495e',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 0.45,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default UserManagementScreen;
