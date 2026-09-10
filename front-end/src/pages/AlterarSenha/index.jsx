import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./style.css";

const schema = yup.object({
    senhaAtual: yup.string().required("Informe a senha atual"),
    novaSenha: yup
        .string()
        .min(6, "A nova senha deve ter no mínimo 6 caracteres")
        .required("Informe a nova senha"),
    confirmarNovaSenha: yup
        .string()
        .oneOf([yup.ref("novaSenha")], "As senhas não coincidem")
        .required("Confirme a nova senha"),
});

export default function AlterarSenha() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
    });

    async function onSubmit(data) {
        try {
            const response = await api.patch("/usuarios/me/senha", {
                senhaAtual: data.senhaAtual,
                novaSenha: data.novaSenha,
            });
            toast.success(response.data?.mensagem || "Senha alterada com sucesso!");
            reset();
        } catch (error) {
            toast.error(error.response?.data?.message || "Não foi possível alterar sua senha.");
        }
    }

    return (
        <div className="alterar-senha-page">
            <form onSubmit={handleSubmit(onSubmit)} className="alterar-senha-form">
                <h2>Alterar senha</h2>

                <div className="form-group">
                    <input type="password" placeholder="Senha atual" {...register("senhaAtual")} />
                    {errors.senhaAtual && <span className="error">{errors.senhaAtual.message}</span>}
                </div>

                <div className="form-group">
                    <input type="password" placeholder="Nova senha" {...register("novaSenha")} />
                    {errors.novaSenha && <span className="error">{errors.novaSenha.message}</span>}
                </div>

                <div className="form-group">
                    <input type="password" placeholder="Confirmar nova senha" {...register("confirmarNovaSenha")} />
                    {errors.confirmarNovaSenha && <span className="error">{errors.confirmarNovaSenha.message}</span>}
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar nova senha"}
                </button>
            </form>
        </div>
    );
}