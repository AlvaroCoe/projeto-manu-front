import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ListaChamados from "./pages/ListaChamados";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chamados"
            element={
              <PrivateRoute>
                <ListaChamados />
              </PrivateRoute>
            }
          />
        </Routes>
        <Footer />
        <ToastContainer position="top-right" />
      </BrowserRouter>
    </AuthProvider>

    
  );
}