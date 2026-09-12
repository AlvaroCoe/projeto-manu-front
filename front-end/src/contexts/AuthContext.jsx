import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erro ao ler usuário do localStorage:", error);
    }
    return null;
  });

  function login(userData, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  // Atualiza os dados do usuário logado (ex: depois de editar nome/e-mail)
  // sem precisar deslogar e logar de novo.
  function updateUser(newData) {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);