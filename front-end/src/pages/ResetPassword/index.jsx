import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "../Login/style.css";

const schema = yup.object({
    novaSenha: yup
        .string()
        .min(6, "A senha deve ter no mínimo 6 caracteres")
        .required("Informe a nova senha"),
    confirmarSenha: yup
        .string()
        .oneOf([yup.ref("novaSenha")], "As senhas não coincidem")
        .required("Confirme a nova senha"),
});

export default function ResetPassword() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    async function onSubmit(data) {
        if (!token) {
            toast.error("Link de redefinição inválido. Solicite um novo.");
            return;
        }

        try {
            const response = await api.post("/auth/reset-password", {
                token,
                novaSenha: data.novaSenha,
            });
            toast.success(response.data?.mensagem || "Senha redefinida com sucesso!");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Não foi possível redefinir sua senha.");
        }
    }

    return (
        <div className="login-page">
            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                <h2>Redefinir senha</h2>

                {!token && (
                    <p className="error">
                        Link inválido ou incompleto. Solicite a recuperação de senha novamente.
                    </p>
                )}

                <div className="form-group">
                    <input type="password" placeholder="Nova senha" {...register("novaSenha")} />
                    {errors.novaSenha && <span className="error">{errors.novaSenha.message}</span>}
                </div>

                <div className="form-group">
                    <input type="password" placeholder="Confirmar nova senha" {...register("confirmarSenha")} />
                    {errors.confirmarSenha && <span className="error">{errors.confirmarSenha.message}</span>}
                </div>

                <button type="submit" disabled={!token}>Redefinir senha</button>

                <Link to="/login">Voltar para o login</Link>
            </form>
        </div>
    );
}