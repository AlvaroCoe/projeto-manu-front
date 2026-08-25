import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./style.css";

export default function ChamadoCard({ chamado, isTecnico, onEscalar, onAtualizarStatus, onPegar, onCancelar }) {
  const [motivo, setMotivo] = useState("");
  const [erroMotivo, setErroMotivo] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [comentariosCarregados, setComentariosCarregados] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  function handleEscalar() {
    if (!motivo.trim()) {
      setErroMotivo("Informe o motivo antes de escalar");
      return;
    }
    setErroMotivo("");
    onEscalar(chamado.id, motivo);
    setMotivo("");
  }

  function handleAtualizarStatus() {
    if (!novoStatus) return;
    onAtualizarStatus(chamado.id, novoStatus);
    setNovoStatus("");
  }

  function handleCancelar() {
    if (!motivoCancelamento.trim()) {
      toast.warning("Informe o motivo do cancelamento");
      return;
    }
    onCancelar(chamado.id, motivoCancelamento);
    setMotivoCancelamento("");
  }

  async function toggleComentarios() {
    const abrindo = !mostrarComentarios;
    setMostrarComentarios(abrindo);

    if (abrindo && !comentariosCarregados) {
      try {
        const response = await api.get(`/tickets/${chamado.id}/comments`);
        setComentarios(response.data);
        setComentariosCarregados(true);
      } catch (error) {
        toast.error("Erro ao carregar comentários");
      }
    }
  }

  async function handleEnviarComentario() {
    if (!novoComentario.trim()) return;

    setEnviandoComentario(true);
    try {
      const response = await api.post(`/tickets/${chamado.id}/comments`, {
        mensagem: novoComentario,
      });
      setComentarios((prev) => [...prev, response.data]);
      setNovoComentario("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao enviar comentário");
    } finally {
      setEnviandoComentario(false);
    }
  }

  const podeEscalar = isTecnico && chamado.currentLevel !== "N3";
  const chamadoEncerrado = chamado.status === "CANCELADO" || chamado.status === "FINALIZADO";

  return (
    <div className="chamado-card">
      <div className="chamado-card-header">
        <h3>{chamado.titulo}</h3>
        <span className={`badge-prioridade prioridade-${chamado.prioridade?.toLowerCase()}`}>
          {chamado.prioridade}
        </span>
      </div>

      <div className="chamado-card-info">
        <p><strong>Status:</strong> {chamado.status}</p>
        <p><strong>Nível atual:</strong> {chamado.currentLevel}</p>
        <p className="chamado-card-tecnico">
          {chamado.technician
            ? `Responsável: ${chamado.technician.nome}`
            : "Ninguém assumiu esse chamado ainda"}
        </p>
      </div>

      {isTecnico && !chamadoEncerrado && (
        <div className="chamado-card-actions">
          {!chamado.technician && (
            <div className="chamado-card-action">
              <button type="button" onClick={() => onPegar(chamado.id)}>
                Assumir chamado
              </button>
            </div>
          )}

          {podeEscalar ? (
            <div className="chamado-card-action">
              <input
                type="text"
                placeholder="Motivo do escalonamento"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  if (erroMotivo) setErroMotivo("");
                }}
              />
              {erroMotivo && <span className="error">{erroMotivo}</span>}
              <button type="button" onClick={handleEscalar}>
                Encaminhar para próximo nível
              </button>
            </div>
          ) : (
            chamado.currentLevel === "N3" && (
              <p className="chamado-card-nivel-maximo">
                Você já está no nível mais alto (N3).
              </p>
            )
          )}

          <div className="chamado-card-action">
            <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)}>
              <option value="">Alterar status para...</option>
              <option value="ANDAMENTO">Em andamento</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
            <button type="button" onClick={handleAtualizarStatus} disabled={!novoStatus}>
              Atualizar status
            </button>
          </div>

          <div className="chamado-card-action chamado-card-cancelar">
            <input
              type="text"
              placeholder="Motivo do cancelamento"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
            />
            <button type="button" className="btn-cancelar" onClick={handleCancelar}>
              Cancelar chamado
            </button>
          </div>
        </div>
      )}

      {chamadoEncerrado && (
        <p className="chamado-card-encerrado">Este chamado está encerrado.</p>
      )}

      <div className="chamado-card-comentarios">
        <button type="button" className="btn-comentarios" onClick={toggleComentarios}>
          {mostrarComentarios ? "Ocultar histórico" : "Ver histórico"}
        </button>

        {mostrarComentarios && (
          <div className="comentarios-lista">
            {comentarios.length === 0 && (
              <p className="chamado-card-tecnico">Nenhum comentário ainda.</p>
            )}
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="comentario-item">
                <p className="comentario-autor">{comentario.autor?.nome}</p>
                <p>{comentario.mensagem}</p>
              </div>
            ))}

            <div className="chamado-card-action">
              <input
                type="text"
                placeholder="Adicionar comentário"
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
              />
              <button type="button" onClick={handleEnviarComentario} disabled={enviandoComentario}>
                Comentar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}