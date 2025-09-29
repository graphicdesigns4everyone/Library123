// Authentication service for library owners
export interface LibraryOwner {
  id: string;
  username: string;
  email: string;
  libraryName: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  libraryName: string;
}

// Simulated database - in production, use a real database
const OWNERS_KEY = 'library_owners';
const CURRENT_USER_KEY = 'current_library_owner';

// No default admin - users must register their own accounts for security

const getStoredOwners = () => {
  try {
    const stored = localStorage.getItem(OWNERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const login = async (credentials: LoginCredentials): Promise<LibraryOwner> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const owners = getStoredOwners();
      const owner = owners.find((o: any) => 
        o.username === credentials.username && o.password === credentials.password
      );
      
      if (owner) {
        const { password, ...ownerWithoutPassword } = owner;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(ownerWithoutPassword));
        resolve(ownerWithoutPassword);
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, 1000);
  });
};

export const register = async (data: RegisterData): Promise<LibraryOwner> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const owners = getStoredOwners();
      
      // Check if username or email already exists
      const existingOwner = owners.find((o: any) => 
        o.username === data.username || o.email === data.email
      );
      
      if (existingOwner) {
        reject(new Error('Username or email already exists'));
        return;
      }
      
      const newOwner = {
        id: Date.now().toString(),
        username: data.username,
        email: data.email,
        password: data.password, // In production, hash this
        libraryName: data.libraryName,
        createdAt: new Date().toISOString(),
      };
      
      const updatedOwners = [...owners, newOwner];
      localStorage.setItem(OWNERS_KEY, JSON.stringify(updatedOwners));
      
      const { password, ...ownerWithoutPassword } = newOwner;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(ownerWithoutPassword));
      resolve(ownerWithoutPassword);
    }, 1000);
  });
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): LibraryOwner | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};