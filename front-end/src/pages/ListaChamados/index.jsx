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
      const response = await api.get("/tickets");
      setChamados(response.data);
    } catch (error) {
  toast.error(error.response?.data?.message || "Erro ao carregar chamados");
} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarChamados();
  }, []);

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
            isTecnico={user?.role?.startsWith("TECNICO")}
            onEscalar={escalarChamado}
            onAtualizarStatus={atualizarStatus}
          />
        ))}
      </div>
    </div>
  );
}