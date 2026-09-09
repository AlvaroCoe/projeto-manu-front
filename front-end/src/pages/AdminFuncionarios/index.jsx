import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./style.css";

const ROLES = ["SOLICITANTE", "TECNICO_N1", "TECNICO_N2", "TECNICO_N3", "ADMIN"];

export default function AdminFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoRole, setNovoRole] = useState("SOLICITANTE");
  const [criando, setCriando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("SOLICITANTE");

  async function carregar() {
    try {
      const response = await api.get("/usuarios");
      setFuncionarios(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleCriar(e) {
    e.preventDefault();
    setCriando(true);
    try {
      await api.post("/usuarios", {
        nome: novoNome,
        email: novoEmail,
        senha: novaSenha,
        role: novoRole,
      });
      toast.success("Funcionário admitido com sucesso!");
      setNovoNome("");
      setNovoEmail("");
      setNovaSenha("");
      setNovoRole("SOLICITANTE");
      carregar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao admitir funcionário");
    } finally {
      setCriando(false);
    }
  }

  function iniciarEdicao(funcionario) {
    setEditandoId(funcionario.id);
    setEditNome(funcionario.nome);
    setEditEmail(funcionario.email);
    setEditRole(funcionario.role);
  }

  function cancelarEdicao() {
    setEditandoId(null);
  }

  async function salvarEdicao(id) {
    try {
      await api.put(`/usuarios/${id}`, { nome: editNome, email: editEmail, role: editRole });
      toast.success("Funcionário atualizado!");
      setEditandoId(null);
      carregar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar funcionário");
    }
  }

  async function alternarStatus(funcionario) {
    try {
      await api.patch(`/usuarios/${funcionario.id}/status`, { ativo: !funcionario.ativo });
      toast.success(funcionario.ativo ? "Funcionário desativado." : "Funcionário reativado!");
      carregar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao alterar status");
    }
  }

  async function excluir(funcionario) {
    if (!window.confirm(`Excluir permanentemente "${funcionario.nome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await api.delete(`/usuarios/${funcionario.id}`);
      toast.success("Funcionário excluído.");
      carregar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao excluir funcionário");
    }
  }

  if (loading) return <p className="lista-status">Carregando...</p>;

  return (
    <div className="admin-funcionarios">
      <h2>Administração de Funcionários</h2>

      <div className="admin-card">
        <h3>Admitir novo funcionário</h3>
        <form onSubmit={handleCriar} className="admin-form-inline">
          <input placeholder="Nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required />
          <input type="email" placeholder="E-mail" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required minLength={6} />
          <select value={novoRole} onChange={(e) => setNovoRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button type="submit" disabled={criando}>{criando ? "Admitindo..." : "Admitir"}</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Funcionários cadastrados</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th><th>E-mail</th><th>Papel</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((f) => (
              <tr key={f.id}>
                {editandoId === f.id ? (
                  <>
                    <td><input value={editNome} onChange={(e) => setEditNome(e.target.value)} /></td>
                    <td><input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></td>
                    <td>
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td><span className={`admin-badge ${f.ativo ? "ativo" : "inativo"}`}>{f.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td className="admin-acoes">
                      <button onClick={() => salvarEdicao(f.id)}>Salvar</button>
                      <button className="admin-btn-secundario" onClick={cancelarEdicao}>Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{f.nome}</td>
                    <td>{f.email}</td>
                    <td>{f.role}</td>
                    <td><span className={`admin-badge ${f.ativo ? "ativo" : "inativo"}`}>{f.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td className="admin-acoes">
                      <button onClick={() => iniciarEdicao(f)}>Editar</button>
                      <button className="admin-btn-secundario" onClick={() => alternarStatus(f)}>
                        {f.ativo ? "Desativar" : "Reativar"}
                      </button>
                      <button className="admin-btn-perigo" onClick={() => excluir(f)}>Excluir</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}