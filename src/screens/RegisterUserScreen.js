import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../services/authService';

/**
 * Tela de cadastro de usuário
 * Permite que administradores criem novos usuários no sistema
 */
const RegisterUserScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    username: '',
    email: '',
    telefone: '',
    tipoUsuario: 'USUARIO',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  /**
   * Valida os dados do formulário
   * @returns {boolean} True se válido, false caso contrário
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Atualiza um campo do formulário
   * @param {string} field Campo a ser atualizado
   * @param {string} value Novo valor
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * Submete o formulário de cadastro
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword dos dados enviados
      const { confirmPassword, ...userData } = formData;
      
      await registerUser(userData);
      
      Alert.alert(
        'Sucesso',
        'Usuário cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderiza um campo de entrada
   * @param {Object} props Propriedades do campo
   * @returns {JSX.Element} Componente do campo
   */
  const renderField = ({ 
    label, 
    field, 
    placeholder, 
    icon, 
    secureTextEntry = false,
    keyboardType = 'default',
    multiline = false 
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputContainer, errors[field] && styles.inputError]}>
        <Ionicons name={icon} size={20} color="#7f8c8d" style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, multiline && styles.textAreaInput]}
          placeholder={placeholder}
          placeholderTextColor="#bdc3c7"
          value={formData[field]}
          onChangeText={(value) => updateField(field, value)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Usuário</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Formulário */}
        <View style={styles.formContainer}>
          <View style={styles.titleContainer}>
            <Ionicons name="person-add" size={32} color="#3498db" />
            <Text style={styles.formTitle}>Cadastrar Novo Usuário</Text>
            <Text style={styles.formSubtitle}>
              Preencha as informações abaixo para criar uma nova conta
            </Text>
          </View>

          {renderField({
            label: 'Nome Completo',
            field: 'nomeCompleto',
            placeholder: 'Digite o nome completo',
            icon: 'person',
          })}

          {renderField({
            label: 'Nome de Usuário',
            field: 'username',
            placeholder: 'Digite o nome de usuário',
            icon: 'at',
          })}

          {renderField({
            label: 'Email',
            field: 'email',
            placeholder: 'Digite o email',
            icon: 'mail',
            keyboardType: 'email-address',
          })}

          {renderField({
            label: 'Telefone',
            field: 'telefone',
            placeholder: 'Digite o telefone (opcional)',
            icon: 'call',
            keyboardType: 'phone-pad',
          })}

          {/* Tipo de usuário */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tipo de Usuário</Text>
            <View style={[styles.inputContainer, styles.pickerContainer]}>
              <Ionicons name="shield" size={20} color="#7f8c8d" style={styles.inputIcon} />
              <Picker
                selectedValue={formData.tipoUsuario}
                style={styles.picker}
                onValueChange={(value) => updateField('tipoUsuario', value)}
              >
                <Picker.Item label="Usuário" value="USUARIO" />
                <Picker.Item label="Administrador" value="ADMIN" />
              </Picker>
            </View>
          </View>

          {renderField({
            label: 'Senha',
            field: 'password',
            placeholder: 'Digite a senha',
            icon: 'lock-closed',
            secureTextEntry: true,
          })}

          {renderField({
            label: 'Confirmar Senha',
            field: 'confirmPassword',
            placeholder: 'Digite a senha novamente',
            icon: 'lock-closed',
            secureTextEntry: true,
          })}

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Cadastrar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 34, // Compensa o botão de voltar
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputIcon: {
    padding: 15,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    paddingRight: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  textAreaInput: {
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    paddingRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 0.45,
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 0.45,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
});

export default RegisterUserScreen;
