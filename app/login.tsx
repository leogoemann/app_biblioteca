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
import { loginUser } from './utils';

const emailRegex = /^\S+@\S+\.\S+$/;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Formato de e-mail inválido.');
      return false;
    }
    return true;
  }

  async function handleLogin() {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar.');
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
          <Text style={styles.title}>Bem-vindo!</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E‑mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Digite seu E-mail"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                autoCapitalize="none"
                placeholder="Digite sua senha"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setSecure(!secure)}
                style={styles.showButton}
              >
                <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading ? styles.buttonDisabled : null]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.rowSpace}>
            <TouchableOpacity onPress={() => router.push('/redefine-senha')}>
              <Text style={styles.link}>Esqueci a senha</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/criar-conta')}>
              <Text style={styles.link}>Criar conta</Text>
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
    marginTop: 12,
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
  link: {
    color: '#593520',
    fontSize: 14,
  },
  rowSpace: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dividerRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  orText: {
    marginHorizontal: 8,
    color: '#999',
  },
  socialRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  socialText: {
    fontSize: 14,
  },
  error: {
    color: '#b00020',
    marginTop: 8,
  },
});
