import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../services/authService';

/**
 * Tela de cadastro de usuários
 * Permite que administradores cadastrem novos usuários no sistema
 */
const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomeCompleto: '',
    telefone: '',
    tipoUsuario: 'USUARIO', // USUARIO ou ADMIN
  });
  const [loading, setLoading] = useState(false);

  /**
   * Atualiza um campo do formulário
   * @param {string} field Campo a ser atualizado
   * @param {string} value Novo valor
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Valida os dados do formulário
   * @returns {boolean} True se válido, false caso contrário
   */
  const validateForm = () => {
    const { username, email, password, confirmPassword, nomeCompleto } = formData;

    // Campos obrigatórios
    if (!username.trim()) {
      Alert.alert('Erro', 'Nome de usuário é obrigatório');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }

    if (!password) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return false;
    }

    if (!nomeCompleto.trim()) {
      Alert.alert('Erro', 'Nome completo é obrigatório');
      return false;
    }

    // Validação do username (mínimo 3 caracteres)
    if (username.length < 3) {
      Alert.alert('Erro', 'Nome de usuário deve ter pelo menos 3 caracteres');
      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Email deve ter um formato válido');
      return false;
    }

    // Validação da senha (mínimo 6 caracteres)
    if (password.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    // Confirmação de senha
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return false;
    }

    return true;
  };

  /**
   * Manipula o envio do formulário
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Remove confirmPassword do objeto a ser enviado
      const { confirmPassword, ...userData } = formData;

      const newUser = await registerUser(userData);
      
      Alert.alert(
        'Sucesso',
        `Usuário "${newUser.username}" cadastrado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro no cadastro',
        error.message || 'Falha ao cadastrar usuário'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpa todos os campos do formulário
   */
  const clearForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      nomeCompleto: '',
      telefone: '',
      tipoUsuario: 'USUARIO',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Cadastrar Usuário</Text>
          <Text style={styles.subtitle}>
            Preencha os dados para criar um novo usuário
          </Text>

          {/* Nome de usuário */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome de usuário *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome de usuário"
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Nome completo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              value={formData.nomeCompleto}
              onChangeText={(value) => updateField('nomeCompleto', value)}
              autoCapitalize="words"
            />
          </View>

          {/* Telefone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChangeText={(value) => updateField('telefone', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Tipo de usuário */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de usuário *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.tipoUsuario}
                onValueChange={(value) => updateField('tipoUsuario', value)}
                style={styles.picker}
              >
                <Picker.Item label="Usuário" value="USUARIO" />
                <Picker.Item label="Administrador" value="ADMIN" />
              </Picker>
            </View>
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a senha"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
            />
          </View>

          {/* Confirmar senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar senha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme a senha"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
            />
          </View>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={clearForm}
              disabled={loading}
            >
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            * Campos obrigatórios
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#95a5a6',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3498db',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 14,
  },
});

export default RegisterScreen;
