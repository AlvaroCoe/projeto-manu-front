import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "../Login/style.css";

const schema = yup.object({
    email: yup.string().email("E-mail inválido").required("Informe o e-mail"),
});

export default function ForgotPassword() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });
    const [enviado, setEnviado] = useState(false);

    async function onSubmit(data) {
        try {
            const response = await api.post("/auth/forgot-password", data);
            toast.success(response.data?.mensagem || "Se o e-mail estiver cadastrado, você receberá um link.");
            setEnviado(true);
        } catch (error) {
            // O backend responde com a mesma mensagem genérica mesmo em caso de erro de validação,
            // mas mantemos um fallback para falhas inesperadas (ex: servidor fora do ar)
            toast.error(error.response?.data?.message || "Não foi possível processar sua solicitação. Tente novamente.");
        }
    }

    return (
        <div className="login-page">
            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                <h2>Esqueci minha senha</h2>

                {enviado ? (
                    <p>
                        Se o e-mail informado estiver cadastrado, você receberá um link para
                        redefinir sua senha. Verifique também a caixa de spam.
                    </p>
                ) : (
                    <>
                        <div className="form-group">
                            <input type="email" placeholder="Seu e-mail cadastrado" {...register("email")} />
                            {errors.email && <span className="error">{errors.email.message}</span>}
                        </div>

                        <button type="submit">Enviar link de recuperação</button>
                    </>
                )}

                <Link to="/login">Voltar para o login</Link>
            </form>
        </div>
    );
}