import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const emailRegex = /^\S+@\S+\.\S+$/;

export default function ForgotPasswordDirectScreen({
  onResetPassword = async ({ email, newPassword }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'user@example.com') resolve({ ok: true });
        else reject(new Error('E-mail não encontrado.'));
      }, 1000);
    });
  },
  onBackToLogin = () => {},
}) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function validate() {
    if (!email.trim() || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Formato de e-mail inválido.');
      return false;
    }
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    return true;
  }

  async function handleReset() {
    setError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await onResetPassword({ email: email.trim(), newPassword });
      setSuccess('Senha redefinida com sucesso!');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha.');
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
          <Text style={styles.title}>Redefinir Senha</Text>
          <Text style={styles.subtitle}>
            Digite seu e-mail e crie uma nova senha
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="seu@exemplo.com"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nova senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={secure1}
                placeholder="Digite a nova senha"
              />
              <TouchableOpacity onPress={() => setSecure1(!secure1)} style={styles.showButton}>
                <Icon name={secure1 ? 'eye-off' : 'eye'} size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={secure2}
                placeholder="Confirme a nova senha"
              />
              <TouchableOpacity onPress={() => setSecure2(!secure2)} style={styles.showButton}>
                <Icon name={secure2 ? 'eye-off' : 'eye'} size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading ? styles.buttonDisabled : null]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.buttonText}>Redefinir Senha</Text>
            )}
          </TouchableOpacity>

          <View style={styles.rowCenter}>
            <TouchableOpacity onPress={onBackToLogin}>
              <Text style={styles.link}>Voltar ao login</Text>
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
    marginBottom: 8,
    textAlign: 'center',
    color: '#593520',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
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
    fontSize: 14,
  },
  error: {
    color: '#b00020',
    marginTop: 8,
    textAlign: 'center',
  },
  success: {
    color: '#006600',
    marginTop: 8,
    textAlign: 'center',
  },
});
