import { useState } from "react";
import "./style.css";

export default function ChamadoCard({ chamado, isTecnico, onEscalar, onAtualizarStatus }) {
  const [motivo, setMotivo] = useState("");
  const [erroMotivo, setErroMotivo] = useState("");
  const [novoStatus, setNovoStatus] = useState("");

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

  const podeEscalar = isTecnico && chamado.currentLevel !== "N3";

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
      </div>

      {isTecnico && (
        <div className="chamado-card-actions">
          {podeEscalar && (
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
          )}

          <div className="chamado-card-action">
            <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)}>
              <option value="">Alterar status para...</option>
              <option value="ANDAMENTO">Em andamento</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
            <button type="button" onClick={handleAtualizarStatus} disabled={!novoStatus}>
              Atualizar status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}