import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import ChamadoCard from "../../components/ChamadoCard";
import "./style.css";

export default function ListaChamados() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  async function carregarChamados() {
    try {
      // SOLICITANTE vê só os próprios chamados; TÉCNICO vê a fila do seu nível de suporte
      const params = {};
      if (user?.role === "SOLICITANTE") {
        params.clientId = user.id;
      } else if (user?.role?.startsWith("TECNICO")) {
        params.nivel = user.role.replace("TECNICO_", "");
      }

      const response = await api.get("/tickets", { params });
      setChamados(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao carregar chamados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) carregarChamados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function escalarChamado(id, motivo) {
    try {
      await api.patch(`/tickets/${id}/escalar`, { motivo });
      toast.success("Chamado escalado com sucesso!");
      carregarChamados();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao escalar chamado");
    }
  }

  async function atualizarStatus(id, status) {
    try {
      await api.patch(`/tickets/${id}/status`, { status });
      toast.success("Status atualizado!");
      carregarChamados();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar status");
    }
  }

  async function pegarChamado(id) {
    try {
      await api.patch(`/tickets/${id}/pegar`);
      toast.success("Chamado assumido com sucesso!");
      carregarChamados();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao assumir chamado");
    }
  }

  async function cancelarChamado(id, motivo) {
    try {
      await api.patch(`/tickets/${id}/cancelar`, { motivo });
      toast.success("Chamado cancelado.");
      carregarChamados();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao cancelar chamado");
    }
  }

  if (loading) return <p className="lista-status">Carregando...</p>;

  return (
    <div className="lista-chamados">
      <h2>Chamados</h2>

      {chamados.length === 0 && (
        <p className="lista-status">Nenhum chamado encontrado.</p>
      )}

      <div className="chamados-grid">
        {chamados.map((chamado) => (
          <ChamadoCard
            key={chamado.id}
            chamado={chamado}
            usuarioLogado={user}
            onEscalar={escalarChamado}
            onAtualizarStatus={atualizarStatus}
            onPegar={pegarChamado}
            onCancelar={cancelarChamado}
          />
        ))}
      </div>
    </div>
  );
}