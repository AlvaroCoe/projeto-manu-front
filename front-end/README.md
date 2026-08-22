npm i react-router-dom axios react-toastify yup react-hook-form @hookform/resolvers




Stephanie:

HomePage/index.jsx:

Adicionei useNavigate (estava faltando — quebrava ao abrir chamado).
Adicionei clientId (pego do user logado via useAuth) no payload, exigido pelo TicketCreateDTO.
Adicionei um <select> de equipamento, buscando a lista via GET /api/equipamentos e enviando equipamentoId — também exigido pelo back-end.


ListaChamados/index.jsx:

Linha 10: novo estado motivos (um texto por chamado)
Linhas 28-30: função que atualiza o motivo digitado
Linhas 32-49: escalarChamado agora valida e envia { motivo } no PATCH
Linha 76: botão de escalonar só aparece se não estiver em N3
Linhas 77-87: novo input de motivo + botão


ListaChamados/style.css:

.chamado-card button:houver{}

Header/index.jsx:

O que mudou: só a linha 31 — trocou user.nivel_acesso por user.role (o resto do arquivo continua igual, é só pra você conferir contexto).



Instalando dependências:

npm i react-router-dom axios react-toastify yup react-hook-form @hookform/resolvers

Criando branchs e salvando projetos:

git branch

git checkout -b nome-da-branch

// Faça seu código

git add .

git commit -m "..."

git push -u origin nome-da-branch

// Criar pull request no repositório github


