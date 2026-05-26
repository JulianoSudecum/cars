# Cars API — Catálogo de Veículos (Back-end)

API REST para um catálogo de veículos com as entidades **Marca → Modelo → Carro**,
CRUD completo, autenticação JWT, geração de descrição de venda via **IA (Claude)**
e um endpoint otimizado para consumo do front-end.

> 🌐 **API online:** **https://cars-api-iwxi.onrender.com** · **Swagger:** https://cars-api-iwxi.onrender.com/docs
>
> Hospedada no Render (Blueprint `render.yaml`: web Docker + PostgreSQL gerenciado). No **free tier**, o serviço "dorme" após ~15 min ocioso; o primeiro acesso seguinte leva ~50s (cold start). Um GitHub Action (`.github/workflows/keep-alive.yml`) faz ping periódico para mantê-la acordada.

## Stack

- **Python 3.12** · **FastAPI** (Swagger/OpenAPI automático)
- **SQLAlchemy 2.0** (async, `asyncpg`) + **Alembic** (migrations)
- **PostgreSQL 16**
- **Pydantic v2** (validação) · **PyJWT** + **pwdlib/bcrypt** (auth)
- **anthropic** (SDK da Claude API)
- **pytest** · **ruff** · **Docker / Docker Compose** · **GitHub Actions**

## Estrutura do projeto

```
backend-test/
├── app/
│   ├── main.py              # app FastAPI: CORS, routers, exception handlers
│   ├── core/                # config (settings), security (hash/JWT), exceptions
│   ├── db/                  # base (DeclarativeBase), session (engine async), seed
│   ├── models/              # entidades SQLAlchemy (marca, modelo, carro, user)
│   ├── schemas/             # DTOs Pydantic (entrada/saída) + enums
│   ├── repositories/        # acesso a dados (somente ORM/SQL, eager loading)
│   ├── services/            # regras de negócio (orquestração + commits)
│   │   └── ai/              # integração com a Claude API (interface + provider)
│   ├── api/
│   │   ├── deps.py          # dependências (get_db, get_current_user, get_ai_service)
│   │   └── v1/              # routers: auth, marcas, modelos, carros, frontend, health
│   └── data/                # JSONs de referência usados pelo seed
├── alembic/                 # migrations (env.py async)
├── scripts/                 # entrypoint.sh, seed.py (CLI)
├── tests/                   # suíte pytest (Postgres real)
├── docker-compose.yml · Dockerfile · .env.example
└── .github/workflows/ci.yml
```

## Organização das camadas

Fluxo de uma requisição: **router → service → repository → model**.

- **Router** (`api/v1`): expõe os endpoints, valida entrada/saída via schemas, aplica
  autenticação. Sem regra de negócio.
- **Service** (`services`): regras de negócio, validações de domínio (ex.: impedir
  remover marca com modelos), orquestração e `commit`/`rollback`.
- **Repository** (`repositories`): apenas consultas SQL/ORM, com *eager loading*
  (`selectinload`) para evitar N+1 e o *lazy-load* (proibido em sessões async).
- **Model** (`models`): mapeamento das tabelas (SQLAlchemy 2.0, `Mapped`).

A integração de IA fica atrás de uma interface (`services/ai/base.py::DescriptionGenerator`),
injetada por `get_ai_service` — o que permite trocar o provider real por um mock nos testes.

## Modelo de dados

| Entidade | Campos |
|---|---|
| **Marca** | `id`, `nome_marca` (único) |
| **Modelo** | `id`, `marca_id` (FK→Marca, RESTRICT), `nome`, `valor_fipe` |
| **Carro** | `id`, `modelo_id` (FK→Modelo, RESTRICT), `timestamp_cadastro`, `ano`, `combustivel`, `num_portas`, `cor`, `quilometragem`, `valor_anuncio`, `descricao` |
| **User** | `id`, `email` (único), `hashed_password`, `is_active`, `created_at` |

Valores monetários são `Numeric(12,2)` (→ `Decimal`). Remover uma marca/modelo com
filhos retorna **409 Conflict** (FK `RESTRICT`).

## Como executar

### Opção 1 — Docker Compose (recomendada)

```bash
cp .env.example .env
docker compose up --build
```

Isso sobe o PostgreSQL e a API; o entrypoint aguarda o banco, aplica as migrations
(`alembic upgrade head`) e, com `RUN_SEED=true`, popula os dados de exemplo.

- API: <http://localhost:8000>
- **Swagger/OpenAPI**: <http://localhost:8000/docs> · ReDoc: <http://localhost:8000/redoc>
- Banco exposto no host em `localhost:5433` (configurável por `DB_HOST_PORT`, default
  5433 para não colidir com um Postgres local na 5432).

Para habilitar a geração de descrição por IA, defina `ANTHROPIC_API_KEY` no `.env`.
Sem a chave, a aplicação sobe normalmente e apenas o endpoint de descrição responde **503**.

### Opção 2 — Local (sem Docker)

Requer Python 3.12+ e um PostgreSQL acessível.

```bash
python -m venv .venv && . .venv/Scripts/activate   # Windows: .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
# aponte o banco (ex.: instância local)
export DATABASE_URL=postgresql+asyncpg://cars:cars@localhost:5432/cars
alembic upgrade head
python -m scripts.seed                # opcional: popula dados de exemplo
uvicorn app.main:app --reload
```

## Como consumir os endpoints

Recursos sob `/api/v1`. **Leitura é pública; escrita (POST/PUT/DELETE) exige JWT.**

```bash
# 1) Registrar e autenticar
curl -X POST localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@exemplo.com","password":"senha12345"}'

TOKEN=$(curl -s -X POST localhost:8000/api/v1/auth/login \
  -d "username=user@exemplo.com&password=senha12345" | jq -r .access_token)

# 2) Criar marca / modelo / carro (autenticado)
curl -X POST localhost:8000/api/v1/marcas -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"nome_marca":"TOYOTA"}'

curl -X POST localhost:8000/api/v1/modelos -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"marca_id":1,"nome":"COROLLA","valor_fipe":"120000.00"}'

curl -X POST localhost:8000/api/v1/carros -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"modelo_id":1,"ano":2021,"combustivel":"FLEX","num_portas":4,"cor":"PRATA","quilometragem":30000,"valor_anuncio":"95000.00"}'

# 3) Gerar descrição via IA (requer ANTHROPIC_API_KEY)
curl -X POST localhost:8000/api/v1/carros/1/description -H "Authorization: Bearer $TOKEN"

# 4) Endpoint do front-end (público)
curl localhost:8000/api/v1/frontend/models   # agrupado por marca
curl localhost:8000/api/v1/frontend/cars     # plano (compatível com o JSON externo)
```

### Endpoint para o front-end

- `GET /api/v1/frontend/models` — listagem de **modelos agrupada por marca**, com os
  carros de cada modelo.
- `GET /api/v1/frontend/cars` — listagem **plana** `{ "cars": [...] }`, idêntica ao
  formato externo (`cars_by_brand.json`).

Os itens de carro espelham as chaves dos JSONs de referência (`wswork.com.br/cars.json`
e `cars_by_brand.json`) — `valor`, `brand`, `nome_modelo`, `timestamp_cadastro` em
epoch e valores monetários como número — para consumo intercambiável. Ambos aceitam
`?marca_id=` para filtrar por marca.

**CORS** está habilitado (`CORS_ORIGINS` no `.env`) para o front-end hospedado em outro domínio.

## Estratégia de IA

A funcionalidade inteligente é a **geração automática da descrição de venda** do veículo
a partir de seus atributos (marca, modelo, ano, cor, combustível, quilometragem, preço),
usando a **Claude API** (`claude-haiku-4-5`, configurável). Detalhes:

- A integração fica atrás da interface `DescriptionGenerator` e é injetada por
  `get_ai_service` — desacoplando o domínio do SDK e facilitando testes (mock).
- O *system prompt* usa **prompt caching**; `max_tokens` é limitado.
- **Resiliência**: sem `ANTHROPIC_API_KEY`, ou em caso de erro/timeout/rate-limit do SDK,
  o endpoint dedicado responde **503** (sem derrubar a aplicação). No `POST /carros`
  com `generate_description: true`, uma falha de IA **não desfaz** a criação — o carro é
  salvo sem descrição.
- `POST /carros/{id}/description` permite **gerar/regenerar** a descrição a qualquer momento.

## Autenticação

Registro/login em `/api/v1/auth`. O login usa `OAuth2PasswordRequestForm` (campo
`username` = e-mail) e devolve um JWT (HS256). Senhas são armazenadas com hash (bcrypt).
O botão **Authorize** do Swagger já integra o fluxo. Endpoints de escrita exigem o token.

## Testes

Suíte `pytest` (assíncrona) executada contra um **PostgreSQL real** (banco `cars_test`,
criado automaticamente), cobrindo CRUD, autenticação (401/403), a funcionalidade de IA
(mock e cenário 503), o endpoint de front-end e o seed.

```bash
# com o banco do compose no ar (localhost:5433)
pytest -q
# ou aponte outro banco:
$env:TEST_DATABASE_URL = "postgresql+asyncpg://cars:cars@localhost:5433/cars_test"; pytest -q
```

## CI

`.github/workflows/ci.yml` sobe um serviço PostgreSQL e executa, a cada push/PR:
**lint (`ruff`) → `alembic upgrade head` → `pytest`**.

## Decisões técnicas e suposições

- **Async em toda a stack** (FastAPI + SQLAlchemy async + Claude API), com *eager loading*
  obrigatório para serializar relações.
- **Testes contra Postgres real** (não SQLite), evitando divergências em `Numeric`/`timestamptz`.
- **Dados de seed** (`app/data/*.json`) são o dataset de teste original e contêm
  inconsistências, tratadas no seed e documentadas:
  - `valor` vem em notação de milhar (ex.: `36.000`, que o JSON lê como `36.0`);
    é **multiplicado por 1000** para virar `valor_anuncio` em reais.
  - `nome_marca` e `valor_fipe` não existem nos arquivos: a **marca é inferida pelo nome
    do modelo** (o campo `brand` da origem é um placeholder `1` para todos) e o `valor_fipe`
    é **sintetizado** (~5% acima do anúncio).
  - vírgulas faltantes no `cars_by_brand.json` são corrigidas antes do parse;
    timestamps inválidos (ano > 2100) caem para o horário atual.
  - o seed é **idempotente** e reseta as *sequences* após inserir com IDs explícitos.
