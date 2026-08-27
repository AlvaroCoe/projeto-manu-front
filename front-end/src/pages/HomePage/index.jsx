import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

const schema = yup.object({
  titulo: yup.string().required("Informe o título"),
  descricao: yup.string().required("Descreva o problema"),
  prioridade: yup.string().required("Selecione a prioridade"),
  equipamentoId: yup.string().required("Selecione o equipamento"),
});

export default function HomePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const [equipamentos, setEquipamentos] = useState([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function carregarEquipamentos() {
      try {
        const response = await api.get("/equipamentos");
        setEquipamentos(response.data);
      } catch {
        toast.error("Erro ao carregar equipamentos");
      } finally {
        setLoadingEquipamentos(false);
      }
    }

    carregarEquipamentos();
  }, []);

  async function onSubmit(data) {
    setEnviando(true);
    try {
      let imageUrl = null;
      const arquivo = data.foto?.[0];

      if (arquivo) {
        if (arquivo.size > 5 * 1024 * 1024) {
          toast.error("A imagem deve ter no máximo 5MB");
          setEnviando(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", arquivo);

        const uploadResponse = await api.post("/upload", formData);
        imageUrl = uploadResponse.data.url;
      }

      const payload = {
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade,
        clientId: user?.id,
        equipamentoId: Number(data.equipamentoId),
        imageUrl,
      };

      await api.post("/tickets", payload);
      toast.success("Chamado aberto com sucesso!");
      reset();
      navigate("/chamados");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao abrir chamado");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="homepage">
      <form onSubmit={handleSubmit(onSubmit)} className="chamado-form">
        <h2>Abrir Chamado</h2>

        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input id="titulo" placeholder="Ex: Impressora não funciona" {...register("titulo")} />
          {errors.titulo && <span className="error">{errors.titulo.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            placeholder="Descreva o problema com detalhes"
            rows={5}
            {...register("descricao")}
          />
          {errors.descricao && <span className="error">{errors.descricao.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="prioridade">Prioridade</label>
          <select id="prioridade" {...register("prioridade")} defaultValue="">
            <option value="" disabled>Selecione a prioridade</option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
          {errors.prioridade && <span className="error">{errors.prioridade.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="equipamentoId">Equipamento</label>
          <select
            id="equipamentoId"
            {...register("equipamentoId")}
            defaultValue=""
            disabled={loadingEquipamentos}
          >
            <option value="" disabled>
              {loadingEquipamentos ? "Carregando equipamentos..." : "Selecione o equipamento"}
            </option>
            {equipamentos.map((equipamento) => (
              <option key={equipamento.id} value={equipamento.id}>
                {equipamento.nome} - {equipamento.codigoPatrimonio}
              </option>
            ))}
          </select>
          {errors.equipamentoId && <span className="error">{errors.equipamentoId.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="foto">Foto do problema (opcional)</label>
          <input id="foto" type="file" accept="image/*" {...register("foto")} />
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Abrir Chamado"}
        </button>
      </form>
    </div>
  );
}