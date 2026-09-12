import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

const ROLE_LABELS = {
    SOLICITANTE: "Solicitante",
    TECNICO_N1: "Técnico N1",
    TECNICO_N2: "Técnico N2",
    TECNICO_N3: "Técnico N3",
    ADMIN: "Administrador",
};

const senhaSchema = yup.object({
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

const perfilSchema = yup.object({
    nome: yup
        .string()
        .min(3, "O nome deve ter no mínimo 3 caracteres")
        .max(100, "O nome deve ter no máximo 100 caracteres")
        .required("Informe o nome"),
    email: yup.string().email("E-mail inválido").required("Informe o e-mail"),
});

function getInitials(nome = "") {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return "?";
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function getStrength(senha = "") {
    if (!senha) return 0;
    let score = 0;
    if (senha.length >= 6) score++;
    if (senha.length >= 10) score++;
    if (/[0-9]/.test(senha) && /[a-zA-Z]/.test(senha)) score++;
    if (/[^a-zA-Z0-9]/.test(senha)) score++;
    return Math.min(score, 3);
}

const STRENGTH_LABEL = ["", "Fraca", "Média", "Forte"];

function EyeIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.7 13.7 0 0 1-3.1 3.9M6.6 6.6C3.4 8.4 1.5 12 1.5 12s3.5 7 10.5 7c1.4 0 2.7-.28 3.87-.77" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10.5" width="16" height="10" rx="2" />
            <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
        </svg>
    );
}

export default function MinhaConta() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState("perfil");
    const [showSenhaAtual, setShowSenhaAtual] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

    const isAdmin = user?.role === "ADMIN";

    // ---------- Form de senha ----------
    const {
        register: registerSenha,
        handleSubmit: handleSubmitSenha,
        reset: resetSenha,
        watch,
        formState: { errors: senhaErrors, isSubmitting: isSubmittingSenha },
    } = useForm({
        resolver: yupResolver(senhaSchema),
    });

    const novaSenha = watch("novaSenha") || "";
    const strength = getStrength(novaSenha);

    async function onSubmitSenha(data) {
        try {
            const response = await api.patch("/usuarios/me/senha", {
                senhaAtual: data.senhaAtual,
                novaSenha: data.novaSenha,
            });
            toast.success(response.data?.mensagem || "Senha alterada com sucesso!");
            resetSenha();
        } catch (error) {
            toast.error(error.response?.data?.message || "Não foi possível alterar sua senha.");
        }
    }

    // ---------- Form de perfil (somente Admin edita) ----------
    const {
        register: registerPerfil,
        handleSubmit: handleSubmitPerfil,
        formState: { errors: perfilErrors, isSubmitting: isSubmittingPerfil },
    } = useForm({
        resolver: yupResolver(perfilSchema),
        defaultValues: {
            nome: user?.nome || "",
            email: user?.email || "",
        },
    });

    async function onSubmitPerfil(data) {
        try {
            const response = await api.put(`/usuarios/${user.id}`, {
                nome: data.nome,
                email: data.email,
                role: user.role,
            });
            updateUser(response.data);
            toast.success("Dados atualizados com sucesso!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Não foi possível atualizar seus dados.");
        }
    }

    const roleLabel = ROLE_LABELS[user?.role] || user?.role || "";

    return (
        <div className="minha-conta-page">
            <div className="minha-conta-container">
                <aside className="conta-sidebar">
                    <div className="conta-avatar">{getInitials(user?.nome)}</div>
                    <h2 className="conta-nome">{user?.nome}</h2>
                    <p className="conta-email">{user?.email}</p>
                    <span className={`conta-badge role-${(user?.role || "").toLowerCase()}`}>
                        {roleLabel}
                    </span>

                    <nav className="conta-tabs">
                        <button
                            type="button"
                            className={activeTab === "perfil" ? "conta-tab active" : "conta-tab"}
                            onClick={() => setActiveTab("perfil")}
                        >
                            <UserIcon />
                            Perfil
                        </button>
                        <button
                            type="button"
                            className={activeTab === "seguranca" ? "conta-tab active" : "conta-tab"}
                            onClick={() => setActiveTab("seguranca")}
                        >
                            <LockIcon />
                            Segurança
                        </button>
                    </nav>
                </aside>

                <section className="conta-content">
                    {activeTab === "perfil" && (
                        <div className="conta-card">
                            <h3>Dados da conta</h3>
                            <p className="conta-subtitle">
                                {isAdmin
                                    ? "Como administrador, você pode editar seu nome e e-mail."
                                    : "Suas informações cadastrais no sistema."}
                            </p>

                            {isAdmin ? (
                                <form onSubmit={handleSubmitPerfil(onSubmitPerfil)} className="perfil-form">
                                    <div className="info-grid">
                                        <div className="form-group">
                                            <label htmlFor="nome">Nome</label>
                                            <input id="nome" type="text" {...registerPerfil("nome")} />
                                            {perfilErrors.nome && (
                                                <span className="error">{perfilErrors.nome.message}</span>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">E-mail</label>
                                            <input id="email" type="email" {...registerPerfil("email")} />
                                            {perfilErrors.email && (
                                                <span className="error">{perfilErrors.email.message}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Perfil de acesso</span>
                                            <span className="info-value">{roleLabel}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Status</span>
                                            <span className="info-value status-ativo">
                                                <i className="status-dot" /> Ativo
                                            </span>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-salvar" disabled={isSubmittingPerfil}>
                                        {isSubmittingPerfil ? "Salvando..." : "Salvar alterações"}
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Nome</span>
                                            <span className="info-value">{user?.nome}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">E-mail</span>
                                            <span className="info-value">{user?.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Perfil de acesso</span>
                                            <span className="info-value">{roleLabel}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Status</span>
                                            <span className="info-value status-ativo">
                                                <i className="status-dot" /> Ativo
                                            </span>
                                        </div>
                                    </div>

                                    <p className="conta-hint">
                                        Para alterar nome, e-mail ou perfil de acesso, entre em contato com o
                                        administrador do sistema.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === "seguranca" && (
                        <div className="conta-card">
                            <h3>Alterar senha</h3>
                            <p className="conta-subtitle">
                                Use uma senha com pelo menos 6 caracteres, misturando letras e números.
                            </p>

                            <form onSubmit={handleSubmitSenha(onSubmitSenha)} className="senha-form">
                                <div className="form-group">
                                    <label htmlFor="senhaAtual">Senha atual</label>
                                    <div className="input-wrapper">
                                        <input
                                            id="senhaAtual"
                                            type={showSenhaAtual ? "text" : "password"}
                                            placeholder="Digite sua senha atual"
                                            {...registerSenha("senhaAtual")}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-visibility"
                                            onClick={() => setShowSenhaAtual((v) => !v)}
                                            aria-label="Mostrar ou ocultar senha atual"
                                        >
                                            {showSenhaAtual ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    {senhaErrors.senhaAtual && (
                                        <span className="error">{senhaErrors.senhaAtual.message}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="novaSenha">Nova senha</label>
                                    <div className="input-wrapper">
                                        <input
                                            id="novaSenha"
                                            type={showNovaSenha ? "text" : "password"}
                                            placeholder="Digite a nova senha"
                                            {...registerSenha("novaSenha")}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-visibility"
                                            onClick={() => setShowNovaSenha((v) => !v)}
                                            aria-label="Mostrar ou ocultar nova senha"
                                        >
                                            {showNovaSenha ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>

                                    {novaSenha.length > 0 && (
                                        <div className="strength-wrapper">
                                            <div className={`strength-bar strength-${strength}`}>
                                                <span />
                                                <span />
                                                <span />
                                            </div>
                                            <span className={`strength-label strength-label-${strength}`}>
                                                {STRENGTH_LABEL[strength]}
                                            </span>
                                        </div>
                                    )}

                                    {senhaErrors.novaSenha && (
                                        <span className="error">{senhaErrors.novaSenha.message}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmarNovaSenha">Confirmar nova senha</label>
                                    <div className="input-wrapper">
                                        <input
                                            id="confirmarNovaSenha"
                                            type={showConfirmarSenha ? "text" : "password"}
                                            placeholder="Repita a nova senha"
                                            {...registerSenha("confirmarNovaSenha")}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-visibility"
                                            onClick={() => setShowConfirmarSenha((v) => !v)}
                                            aria-label="Mostrar ou ocultar confirmação de senha"
                                        >
                                            {showConfirmarSenha ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    {senhaErrors.confirmarNovaSenha && (
                                        <span className="error">{senhaErrors.confirmarNovaSenha.message}</span>
                                    )}
                                </div>

                                <button type="submit" className="btn-salvar" disabled={isSubmittingSenha}>
                                    {isSubmittingSenha ? "Salvando..." : "Salvar nova senha"}
                                </button>
                            </form>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}