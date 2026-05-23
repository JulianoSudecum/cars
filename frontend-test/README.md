# AutoCatálogo — Catálogo de Veículos com IA

Aplicação React que exibe um catálogo de veículos **agrupado por marca**, com filtros, busca, cadastro de novos veículos e um **assistente de IA** que analisa o perfil do usuário e recomenda os carros mais adequados.

Desafio front-end consumindo os endpoints `cars.json` e `cars_by_brand.json` da wswork.

> 🌐 **Demo online:** **https://frontend-test-rho-six.vercel.app**
>
> Hospedado na Vercel. O BFF roda como **serverless functions** (`api/*.js`, geradas de `functions/*.ts` por `npm run build:functions`); a chave da IA fica só no servidor. Em desenvolvimento local, use `npm run dev` (front + BFF Express juntos) — e `npm start` (não `vite preview`) para servir o build com a API.

##  Funcionalidades

-  **Listagem por marca** com filtros (marca, combustível), busca textual e ordenação.
-  **Assistente de IA (análise de perfil)** — recomenda veículos com justificativa personalizada.
-  **Cadastro de veículos** com validação e persistência local.
-  **Componente `<VehicleList>` reutilizável** e documentado.
-  Responsivo, acessível, com loading/empty/error states em toda a aplicação.

---

##  Como executar localmente

### Pré-requisitos

- Node.js ≥ 20
- npm

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
#   Edite .env e defina ANTHROPIC_API_KEY (necessária para o assistente de IA).
#   A listagem e o cadastro funcionam mesmo sem a chave.

# 3. Rodar em desenvolvimento (front + BFF juntos)
npm run dev
```

- Front-end (Vite): http://localhost:5173
- BFF (Express): http://localhost:3001 (acessado via proxy `/api`)

### Build de produção

```bash
npm run build     # gera dist/
npm start         # Express serve dist/ + /api na porta 3001
```

### Docker

```bash
docker compose up --build    # app completo em http://localhost:3001
```

> Passe a chave via ambiente: `ANTHROPIC_API_KEY=sk-ant-... docker compose up --build`.

### Qualidade

```bash
npm test          # testes (Vitest + Testing Library)
npm run typecheck # checagem de tipos
npm run lint      # ESLint
```

---

##  Funcionalidade de IA — Análise de perfil

O usuário responde a um breve questionário (uso principal, orçamento, prioridades, combustível). O front envia o **perfil + catálogo** para o BFF, que chama um **LLM (Claude)** com _tool use_ forçado, obrigando uma saída estruturada (`carId`, `score` 0–100, `reason`). O servidor então:

- **valida** a resposta com Zod e **descarta `carId` que não existem** no catálogo (anti-alucinação);
- ordena por `score` e retorna as melhores recomendações com justificativa em português.

Decisões relevantes:

- **Chave protegida**: a `ANTHROPIC_API_KEY` vive apenas no servidor (BFF). O navegador nunca a vê.
- **Prompt caching**: o system prompt e o catálogo recebem `cache_control`, reduzindo custo/latência em consultas repetidas.
- **Saída estruturada via tool**: garante um JSON previsível em vez de _parsing_ de texto livre.
- **Degradação graciosa**: sem a chave, a rota responde `503` e a UI mostra uma mensagem clara.

Modelo configurável via `ANTHROPIC_MODEL` (padrão `claude-opus-4-7`).

---

##  Arquitetura e organização

```
frontend-test/
├── server/                 # BFF (Express) — proxy de dados + rota de IA
│   ├── cars/catalog.ts     # busca + cache do catálogo (resolve CORS)
│   └── ai/                 # handler, prompt, schema (Zod), cliente Anthropic
├── src/
│   ├── domain/             # tipos + regras puras (normalização, agrupamento, marcas)
│   ├── services/           # acesso a dados (carsApi, carsRepository, aiClient)
│   ├── hooks/              # useCars, useMergedCars, useFilteredCars, useProfileRecommendation…
│   ├── store/              # Zustand (carros do usuário, filtros)
│   ├── components/         # ui/ (primitivos), vehicle/, form/, ai/
│   ├── pages/              # Home, Assistente, Cadastro, Documentação
│   └── lib/                # utilitários (formatters, cn, queryClient)
└── docs/VehicleList.md     # documentação do componente reutilizável
```

A separação em **camadas** (domain → services → hooks → componentes/páginas) mantém as regras de negócio puras e testáveis, isoladas da UI e do acesso a dados.

### Decisões de interface e componentização

- **Componentização em três níveis**: primitivos de UI (`Button`, `Input`, `Dialog`…), componentes de domínio (`VehicleCard`, `VehicleList`, `CarForm`, `ProfileAssistant`) e páginas que apenas orquestram.
- **Componente apresentacional reutilizável**: `<VehicleList>` não busca dados — recebe tudo por props (ver [`docs/VehicleList.md`](./docs/VehicleList.md)).
- **Acessibilidade**: primitivos baseados em **Radix UI** (foco, ARIA, teclado), _skip link_, headings semânticos, `aria-describedby` nos campos de formulário e respeito a `prefers-reduced-motion`.

### Gerenciamento de estado

| Tipo de estado            | Ferramenta            | Por quê                                             |
| ------------------------- | --------------------- | --------------------------------------------------- |
| Servidor (catálogo, IA)   | **TanStack Query**    | cache, _loading/error states_ e _refetch_ prontos   |
| Cliente (carros, filtros) | **Zustand**           | leve; `persist` cuida do localStorage               |
| Formulários               | **React Hook Form + Zod** | validação declarativa e performática            |

### Estratégia de integração com os dados

Os endpoints da wswork trazem três armadilhas que a aplicação trata explicitamente:

1. **CORS ausente** — os endpoints não enviam `Access-Control-Allow-Origin`, então o navegador bloquearia o `fetch` direto. O **BFF busca os dados server-side** e os expõe em `/api/cars`. (Em dev, o Vite faz proxy de `/api` para o Express.)
2. **JSON inválido** — `cars_by_brand.json` vem com vírgula faltando entre campos. A função `repairJson` insere a vírgula faltante antes do parse, com _fallback_.
3. **Marca sem nome / valores em milhar** — os dados só trazem o `id` da marca e preços no formato `50.000` (que o JSON lê como `50`). A normalização faz o _join_ de marca em três estratégias (`brand` explícito → por id → inferência por modelo → "não informada") e reinterpreta valores pequenos como milhares. Premissas documentadas no código.

A normalização vive em `src/domain/normalizeCatalog.ts` (função pura, compartilhada pelo BFF e pelos testes).

### Experiência do usuário

- _Skeletons_ no carregamento, estados de vazio e de erro com _retry_ em toda busca.
- Filtros e busca com _debounce_; cadastros aparecem na hora no catálogo (com selo "Meu cadastro").
- Feedback por _toasts_; navegação por teclado e foco visível.

---

##  Componente reutilizável

`<VehicleList>` é o componente extraído para reuso. Documentação completa (props, comportamento, exemplos, customização) em **[`docs/VehicleList.md`](./docs/VehicleList.md)** e demonstração interativa na rota `/componente`.

---

##  Diferenciais implementados

- **TypeScript** estrito · **Testes** (Vitest + Testing Library + 36 casos) · **Responsividade** · **Acessibilidade** (Radix) · **Estado avançado** (Zustand + persist) · **Docker / Docker Compose** · **Loading & error states** · **Performance** (code splitting por rota, memoização) · **IA real** com prompt caching e saída estruturada.

---

##  Stack

React 18 · TypeScript · Vite · TanStack Query · Zustand · React Hook Form · Zod · Tailwind CSS · Radix UI · React Router · Express · @anthropic-ai/sdk · Vitest · Testing Library.
