import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./style.css";

const schema = yup.object({
  titulo: yup.string().required("Informe o título"),
  descricao: yup.string().required("Descreva o problema"),
  prioridade: yup.string().required("Selecione a prioridade"),
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

  async function onSubmit(data) {
  // Ajuste do payload JSON correspondente ao DTO do Spring Boot
  const payload = {
    titulo: data.titulo,
    descricao: data.descricao,
    prioridade: data.prioridade,
    // Adicione os IDs necessários caso seu TicketCreateDTO exija
  };

  try {
    await api.post("/tickets", payload);
    toast.success("Chamado aberto com sucesso!");
    reset();
    navigate("/chamados"); // Redireciona direto para a lista após criar
  } catch (error) {
    toast.error("Erro ao abrir chamado");
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
          <label htmlFor="foto">Foto do problema (opcional)</label>
          <input id="foto" type="file" accept="image/*" {...register("foto")} />
        </div>

        <button type="submit">Abrir Chamado</button>
      </form>
    </div>
  );
}