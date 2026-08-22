import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import ChamadoCard from "../../components/ChamadoCard";
import "./style.css";

export default function ListaChamados() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motivos, setMotivos] = useState({}); // { [chamadoId]: "texto digitado" }
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

  function handleMotivoChange(id, valor) {
    setMotivos((prev) => ({ ...prev, [id]: valor }));
  }

  async function escalarChamado(id) {
    const motivo = motivos[id]?.trim();

    if(!motivo) {
      toast.warning("Informe o motivo do escalonamento antes de continuar");
      return
    }
    try {
      // Envia objeto vazio para satisfazer a validação do TicketEscalateDTO caso o técnico seja opcional
      await api.patch(`/tickets/${id}/escalar`, {motivo});
      toast.success("Chamado escalado com sucesso!");
      setMotivos((prev) => ({ ...prev, [id]: "" }));
      carregarChamados();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao escalar chamado");
    }
  }
  async function finalizarChamado(id) {
    try{
      await api.patch(`/tickets/${id}/status`, { status: "FINALIZADO"});
      toast.success("Chamado finalizado com sucesso");
      carregarChamados();
    } catch (error){
      toast.error(error.response?.data?.message || "Erro ao finalizar chamado");
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