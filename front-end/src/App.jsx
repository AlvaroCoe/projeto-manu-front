import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ListaChamados from "./pages/ListaChamados";
import AdminFuncionarios from "./pages/AdminFuncionarios";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
              <Route path="/chamados" element={<PrivateRoute><ListaChamados /></PrivateRoute>} />
              <Route path="/admin/funcionarios" element={<AdminRoute><AdminFuncionarios /></AdminRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}