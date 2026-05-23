# Cars (Front-end + Back-end)

- **[`frontend-test/`](./frontend-test/README.md)** — Catálogo de veículos em **React (Vite)**: listagem agrupada por marca, filtros/busca, **assistente de IA** (recomendação por perfil) e cadastro.
- **[`backend-test/`](./backend-test/README.md)** — **API REST em FastAPI** (Marca → Modelo → Carro): CRUD completo, autenticação JWT, **IA** (geração de descrição), endpoint otimizado para o front e Swagger.

> Os dois projetos são **independentes**: o front consome os JSONs públicos (`cars.json` / `cars_by_brand.json`); a API tem seu próprio banco e dados de seed.

---

##  Ambiente de produção

| Projeto | URL |
|---|---|
| **Front-end** (Vercel) | **https://frontend-test-rho-six.vercel.app** |
| **Back-end** (Render) | **https://cars-api-iwxi.onrender.com** |
| **API — Swagger/OpenAPI** | https://cars-api-iwxi.onrender.com/docs |

>  **Cold start:** a API está no *free tier* do Render — após ~15 min ociosa ela "dorme" e o **primeiro acesso leva ~50s** para responder; depois fica normal. (Um GitHub Action de *keep-alive* faz ping periódico para reduzir isso.)

---

##  Estrutura do repositório

```
cars/
├── frontend-test/        # React + Vite + BFF/serverless + IA (Claude)
├── backend-test/         # FastAPI + SQLAlchemy + PostgreSQL + IA (Claude)
├── render.yaml           # Blueprint do Render (provisiona a API + PostgreSQL)
└── .github/workflows/    # keep-alive da API hospedada
```

Cada subprojeto tem um **README próprio** com arquitetura, decisões técnicas e a estratégia de IA em detalhe.

---

##  Rodando localmente

### Pré-requisitos
- **Front-end:** Node.js ≥ 20 e npm
- **Back-end:** Docker + Docker Compose *(caminho recomendado)* — ou Python 3.12 + PostgreSQL
- *(Opcional)* uma **`ANTHROPIC_API_KEY`** para as funcionalidades de IA. Sem ela, **tudo funciona** — apenas a geração por IA responde de forma graciosa (mensagem/503).

### Front-end — `frontend-test/`

```bash
cd frontend-test
npm install
cp .env.example .env        # opcional: defina ANTHROPIC_API_KEY para o assistente de IA
npm run dev                 # front (Vite) em http://localhost:5173 + BFF (Express) em http://localhost:3001
```

Outros comandos úteis:
```bash
npm run build && npm start  # produção local (Express serve o build + API em :3001) — não use `vite preview`
npm test                    # testes (Vitest + Testing Library)
docker compose up --build   # via Docker (app completo em http://localhost:3001)
```

### Back-end — `backend-test/`

**Opção 1 — Docker Compose (recomendada):**
```bash
cd backend-test
cp .env.example .env
docker compose up --build
```
Sobe PostgreSQL + API; o entrypoint aguarda o banco, aplica as **migrations** e popula o **seed** (3 marcas, 5 modelos, 5 carros).
- API: http://localhost:8000 · **Swagger:** http://localhost:8000/docs
- Banco exposto no host em `localhost:5433` (evita conflito com um Postgres local na 5432)

**Opção 2 — local sem Docker** (requer Python 3.12 e um PostgreSQL acessível):
```bash
cd backend-test
python -m venv .venv
source .venv/bin/activate           # Windows (PowerShell): .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
export DATABASE_URL="postgresql+asyncpg://cars:cars@localhost:5432/cars"   # ajuste ao seu banco
alembic upgrade head
python -m scripts.seed              # opcional: popula dados de exemplo
uvicorn app.main:app --reload
```

#### Autenticação da API
**Leitura é pública; escrita (POST/PUT/DELETE) exige JWT.** Registre e autentique:
```bash
# 1) registrar
curl -X POST localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@exemplo.com","password":"senha12345"}'

# 2) login -> retorna { "access_token": "..." }
curl -X POST localhost:8000/api/v1/auth/login \
  -d "username=user@exemplo.com&password=senha12345"
```
Use o token no header `Authorization: Bearer <access_token>` (ou clique em **Authorize** no Swagger).

---

📄 Documentação detalhada: **[frontend-test/README.md](./frontend-test/README.md)** · **[backend-test/README.md](./backend-test/README.md)**
