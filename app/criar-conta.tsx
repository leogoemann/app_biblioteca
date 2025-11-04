import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { saveUser } from './utils';

const emailRegex = /^\S+@\S+\.\S+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Preencha todos os campos.');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError('E-mail inválido.');
      return false;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return false;
    }
    return true;
  }

  async function handleSignUp() {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await saveUser({ name: name.trim(), email: email.trim(), password });
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Criar Conta</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Digite seu E-mail"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={securePassword}
                placeholder="Digite sua senha"
              />
              <TouchableOpacity onPress={() => setSecurePassword(!securePassword)} style={styles.showButton}>
                <Ionicons name={securePassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={secureConfirm}
                placeholder="Confirme sua senha"
              />
              <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.showButton}>
                <Ionicons name={secureConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading ? styles.buttonDisabled : null]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar Conta</Text>}
          </TouchableOpacity>

          <View style={styles.rowCenter}>
            <Text style={styles.label}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.link}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFB493',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#593520',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#593520',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  showButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#733620',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    color: '#593520',
  },
  error: {
    color: '#b00020',
    marginTop: 8,
  },
});