import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

const schema = yup.object({
  email: yup.string().email("E-mail inválido").required("Informe o e-mail"),
  senha: yup.string().required("Informe a senha"),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      const response = await api.post("/auth/login", data);
      
      // Separa o token do restante dos dados do usuário (id, nome, email, role)
      const { token, ...userData } = response.data;
      
      // Envia o objeto do usuário e o token separadamente
      login(userData, token);
      
      toast.success("Login realizado com sucesso!");
      navigate("/chamados");
    } catch (error) {
      toast.error(error.response?.data?.message || "E-mail ou senha inválidos");
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <h2>Entrar</h2>

        <div className="form-group">
          <input type="email" placeholder="E-mail" {...register("email")} />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <input type="password" placeholder="Senha" {...register("senha")} />
          {errors.senha && <span className="error">{errors.senha.message}</span>}
        </div>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}