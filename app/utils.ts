import AsyncStorage from '@react-native-async-storage/async-storage';

export const normalizeThumbnail = (url?: string | null) => {
  if (!url) return undefined;
  return url.replace(/^http:/i, 'https:');
};

export const openLibraryCover = (isbn?: string | null, size: 'S'|'M'|'L' = 'L') => {
  if (!isbn) return undefined;
  const cleaned = String(isbn).replace(/[^0-9Xx]/g, '');
  return `https://covers.openlibrary.org/b/isbn/${cleaned}-${size}.jpg`;
};

// ==================== AUTH UTILS ====================

const USERS_KEY = '@biblioteca_users';
const CURRENT_USER_KEY = '@biblioteca_current_user';

export type User = {
  name: string;
  email: string;
  password: string;
};

// Salvar novo usuário
export const saveUser = async (user: User): Promise<void> => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    // Verificar se email já existe
    const exists = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) {
      throw new Error('E-mail já cadastrado');
    }
    
    users.push(user);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    throw error;
  }
};

// Fazer login
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!user) {
      throw new Error('E-mail ou senha incorretos');
    }
    
    // Salvar usuário atual
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    throw error;
  }
};

// Fazer logout
export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
};

// Verificar se está logado
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    return null;
  }
};
