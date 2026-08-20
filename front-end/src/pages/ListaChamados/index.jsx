import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
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
      toast.error("Erro ao carregar chamados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarChamados();
  }, []);

  async function escalarChamado(id) {
    try {
      // Envia objeto vazio para satisfazer a validação do TicketEscalateDTO caso o técnico seja opcional
      await api.patch(`/tickets/${id}/escalar`, {});
      toast.success("Chamado escalado com sucesso!");
      carregarChamados();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao escalar chamado");
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
          <div key={chamado.id} className="chamado-card">
            <div className="chamado-card-header">
              <h3>{chamado.titulo}</h3>
              <span className={`badge-prioridade prioridade-${chamado.prioridade?.toLowerCase()}`}>
                {chamado.prioridade}
              </span>
            </div>

            <div className="chamado-card-info">
              <p><strong>Status:</strong> {chamado.status}</p>
              {/* Corrigido de chamado.nivel_atual para chamado.currentLevel */}
              <p><strong>Nível atual:</strong> {chamado.currentLevel}</p>
            </div>

            {user?.role?.startsWith("TECNICO") && (
              <button onClick={() => escalarChamado(chamado.id)}>
                Encaminhar para próximo nível
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}