# Diretrizes do Projeto — Costa Azul (`desktop-operacional`)

Este documento define as regras arquiteturais, convenções de código e padrões do Design System para o frontend administrativo/operacional **Costa Azul (`desktop-operacional`)**.

---

## 1. Stack Tecnológica

- **Runtime & Bundler:** Vite 8 + TypeScript 6 (`type: "module"`)
- **Framework UI:** React 19 (`react`, `react-dom`)
- **Roteamento:** React Router DOM v7 (`react-router-dom`)
- **Estilização:**
  - **CSS Nativo (Prioritário):** O projeto prioriza **arquivos `.css` tradicionais modularizados por feature/componente** (ex: `SideBar.css`, `CompanyLayout.css`, `VesselCreate.css`, `Login.css`), consumindo as variáveis CSS globais (`var(--...)`) declaradas em `src/index.css`.
  - **Tailwind CSS v4:** Configurado em `src/index.css` via `@import "tailwindcss"` e `@theme`. O bloco `@theme` expõe todos os tokens tanto como Custom Properties nativas do CSS (`var(--color-primary-500)`, `var(--font-heading)`, etc.) quanto como utilitários quando necessário.
  - **PrimeReact v10** (`primereact` + `primeicons`) para componentes ricos de formulário e UI (`Card`, `InputText`, `InputNumber`, `Dropdown`, `Calendar`, etc.).
- **Tipografia (Figma Design System):**
  - **`Manrope`** (`--font-display` / `--font-heading`): Utilizada em **Display** e **Headings** (`h1`, `h2`, `h3`, títulos de páginas, seções e cards). A antiga fonte `DM Sans` foi descontinuada e substituída por `Manrope` + `Inter`.
  - **`Inter`** (`--font-sans` / `--font-body`): Utilizada em **Body**, **Labels** (botões, inputs, abas, badges) e **Data** (números tabulares em tabelas, horários e valores).
- **Cliente HTTP:** Axios (`src/services/api.ts`)

---

## 2. Arquitetura e Estrutura de Pastas

O projeto utiliza uma arquitetura orientada a **features** dentro de `src/`:

```text
src/
├── components/                 # Biblioteca global do Design System Costa Azul (barrel export em index.ts)
│   ├── ui/                     # Componentes base e infraestrutura (Button, Input, Select, Alert, KPI, Badge, IconButton, Checkbox, Switch, FilterChip, Tabs, SectionCard, Modal, Toast, Pagination, DataTable, EmptyState, Avatar, Icon)
│   ├── layout/                 # Estrutura da aplicação (Sidebar, Topbar, Breadcrumb, WizardStepper)
│   ├── domain/
│   │   └── vessel/             # Componentes reutilizáveis do domínio naval (VesselHeader, VesselCard, AreaCard, DeckItem)
│   └── index.ts                # Exportação central do Design System
├── features/
│   ├── login/                  # Fluxo de autenticação (Login.tsx, Login.css, components/)
│   └── company/                # Área logada operacional/administrativa
│       ├── CompanyLayout.tsx   # Layout base com SideBar, TopBar e <Outlet />
│       ├── CompanyLayout.css   # Estilos nativos do layout
│       ├── components/         # Componentes compartilhados do escopo da empresa (bars/, cards/)
│       ├── crew/               # Gestão de tripulação
│       ├── dashboard/          # Visão geral operacional
│       ├── financial/          # Módulo financeiro
│       ├── relatorios/         # Relatórios operacionais
│       ├── settings/           # Configurações
│       ├── trips/              # Gestão de viagens
│       └── vessel/             # Gestão e cadastro de embarcações (pages/, componets/)
├── routes/
│   └── AppRoutes.tsx           # Definição central de rotas
├── services/
│   ├── api.ts                  # Instância base do Axios e interceptors JWT
│   ├── auth.ts                 # Serviços de autenticação
│   └── vesselcreate.ts         # Serviços e DTOs de embarcações
├── App.tsx
├── main.tsx
└── index.css                   # Tokens globais (@theme / CSS Variables) e reset CSS
```

### Regras de Organização
- **Biblioteca de Componentes (`src/components/`):** Priorize o uso dos componentes compartilhados do Design System exportados por `src/components` (`Button`, `Input`, `Select`, `SectionCard`, `Alert`, `Badge`, `Toast`, `Breadcrumb`, etc.) antes de instanciar primitivos externos diretamente nas telas. Reserve componentes do PrimeReact (`FileUpload`, `Calendar`, etc.) para casos específicos ainda não cobertos pela biblioteca própria.
- **Novas páginas/módulos:** Devem ser criadas dentro de `src/features/company/<nome-da-feature>/` (ou em uma nova feature de primeiro nível se não pertencer ao escopo `company`).
- **Estilização de Componentes:** Prefira criar um arquivo `<NomeDoComponente>.css` junto ao componente e estilizar com classes semânticas/BEM (ex: `.vessel-header`, `.sidebar__item`) utilizando as variáveis de `src/index.css` (`var(--color-...)`, `var(--space-...)`, `var(--radius-...)`), em vez de sobrecarregar o JSX com classes utilitárias do Tailwind.
- **Rotas autenticadas/operacionais:** Devem ser aninhadas dentro do `<Route element={<CompanyLayout />}>` em `src/routes/AppRoutes.tsx`.
- **Chamadas de API e DTOs:** Nunca faça chamadas `axios` ou `fetch` diretamente nos componentes. Crie funções tipadas e interfaces DTO (`*RequestDTO`, `*ResponseDTO`) dentro de `src/services/` utilizando a instância `api` exportada por `src/services/api.ts`.

---

## 3. Design System e Tokens (`src/index.css`)

Todos os tokens abaixo foram extraídos da seção **Fundação** do Figma e estão disponíveis no bloco `@theme` de `src/index.css` para uso direto via `var(--nome-do-token)` no CSS nativo (ou classes equivalentes do Tailwind v4):

### 3.1. Fontes e Escala Tipográfica

| Categoria | Token | Família | Size / Line-Height | Weight | Extras | Uso Recomendado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | `Manrope` (`var(--font-display)`) | `48px` / `56px` | `800` | `tracking: -0.02em` | Headline principal de página |
| **Display** | `display-md` | `Manrope` (`var(--font-display)`) | `36px` / `44px` | `700` | `tracking: -0.02em` | Títulos de cards em destaque |
| **Heading** | `h1` | `Manrope` (`var(--font-heading)`) | `28px` / `36px` | `700` | `tracking: -0.01em` | Título de tela e de seção |
| **Heading** | `h2` | `Manrope` (`var(--font-heading)`) | `22px` / `32px` | `700` | — | Subseções e títulos de modais |
| **Heading** | `h3` | `Manrope` (`var(--font-heading)`) | `18px` / `28px` | `600` | — | Títulos de cards e grupos |
| **Body** | `body-lg` | `Inter` (`var(--font-sans)`) | `16px` / `24px` | `400` | — | Texto de leitura e descrições |
| **Body** | `body-md` | `Inter` (`var(--font-sans)`) | `14px` / `20px` | `400` | — | Corpo padrão da interface |
| **Body** | `body-sm` | `Inter` (`var(--font-sans)`) | `13px` / `20px` | `400` | — | Texto de apoio e ajuda |
| **Label** | `label-md` | `Inter` (`var(--font-sans)`) | `14px` / `20px` | `500` | — | Botões, inputs e abas |
| **Label** | `label-sm` | `Inter` (`var(--font-sans)`) | `12px` / `16px` | `500` | — | Badges, chips e alerts |
| **Data** | `num-md` | `Inter` (`var(--font-sans)`) | `14px` / `20px` | `600` | `tabular-nums` | Horários, valores e tabelas |
| **Data** | `caption` | `Inter` (`var(--font-sans)`) | `12px` / `16px` | `400` | `tabular-nums` | Metadados, dicas e placeholders |

### 3.2. Paleta de Cores (Códigos HEX Exatos)

#### Primary (Ações principais, links e estados selecionados)
- `--color-primary-900`: `#02142E`
- `--color-primary-800`: `#04285C`
- `--color-primary-700`: `#073B89`
- `--color-primary-600`: `#094FB7`
- `--color-primary-500`: `#0B63E5`
- `--color-primary-400`: `#3C82EA`
- `--color-primary-300`: `#6DA1EF`
- `--color-primary-200`: `#9DC1F5`
- `--color-primary-100`: `#CEE0FA`
- `--color-primary-50`: `#F0F5FF`

#### Secondary (Ações secundárias, destaques e containers complementares)
- `--color-secondary-900`: `#073642`
- `--color-secondary-800`: `#0A4B59`
- `--color-secondary-700`: `#0D5F70`
- `--color-secondary-600`: `#107589`
- `--color-secondary-500`: `#1590A8`
- `--color-secondary-400`: `#3EABC0`
- `--color-secondary-300`: `#70C1D1`
- `--color-secondary-200`: `#A5DCE5`
- `--color-secondary-100`: `#D0EEF2`
- `--color-secondary-50`: `#EFFBFC`

#### Gray Scale (Fundos, superfícies, textos e bordas)
- `--color-gray-900`: `#061C3D`
- `--color-gray-800`: `#243752`
- `--color-gray-700`: `#42526B`
- `--color-gray-600`: `#6A778B`
- `--color-gray-500`: `#838E9E`
- `--color-gray-400`: `#9BA4B1`
- `--color-gray-300`: `#B4BBC5`
- `--color-gray-200`: `#CDD2D8`
- `--color-gray-100`: `#E6E8EC`
- `--color-gray-50`: `#F5F6F7`
- `--color-white`: `#FFFFFF`

#### Semantic (Sucesso, atenção, erro e informação)
- **Success:** `--color-success-900` (`#064E3B`), `--color-success-500` (`#10B981`), `--color-success-100` (`#D1FAE5`), `--color-success-50` (`#ECFDF5`)
- **Warning:** `--color-warning-900` (`#78350F`), `--color-warning-500` (`#F59E0B`), `--color-warning-100` (`#FEF3C7`)
- **Error:** `--color-error-900` (`#7F1D1D`), `--color-error-500` (`#EF4444`), `--color-error-100` (`#FEE2E2`)
- **Info:** `--color-info-900` (`#172554`), `--color-info-500` (`#3B82F6`), `--color-info-100` (`#DBEAFE`)

#### Outlines / Contornos
- `--color-outline-variant`: `#E2E8F0` (Divisores, cards nível 1)
- `--color-outline`: `#CBD5E1` (Controles, níveis 2 e 3)

### 3.3. Espaçamento, Raios de Borda e Elevação (Sombras)
- **Spacing (Escala base 8pt / micro-step 4pt):**
  - `--space-1`: `4px` | `--space-2`: `8px` | `--space-3`: `12px` | `--space-4`: `16px` | `--space-6`: `24px` | `--space-8`: `32px` | `--space-12`: `48px`
  - `--container-max`: `1200px`
- **Border Radius:**
  - `--radius-xs`: `4px` (Checkbox, tags pequenas)
  - `--radius-sm`: `8px` (Inputs e botões)
  - `--radius-md`: `12px` (Cards e alerts)
  - `--radius-lg`: `16px` (Containers e painéis)
  - `--radius-xl`: `24px` (Modais e drawers)
  - `--radius-pill`: `999px` (Badges, chips e tags)
- **Shadows / Elevação:**
  - `--shadow-elev-0`: `none` (Página e cards em repouso)
  - `--shadow-elev-1`: `0px 1px 2px 0px rgba(15, 23, 42, 0.06)` (Cards interativos e inputs em foco)
  - `--shadow-elev-2`: `0px 4px 12px 0px rgba(15, 23, 42, 0.08)` (Menus, popovers e dropdowns)
  - `--shadow-elev-3`: `0px 12px 28px 0px rgba(15, 23, 42, 0.12)` (Modais e drawers)

---

## 4. Convenções de Código e Componentes

1. **Exportação de Componentes:**
   - Prefira **Named Exports** (`export function NomeDoComponente()`) para páginas e componentes de features, mantendo consistência com `Dashboard`, `Vessel`, `CompanyLayout`, etc.
2. **Estilização com CSS Nativo:**
   - Crie arquivos `.css` dedicados para cada página ou componente complexo e importe-os diretamente no `.tsx` (`import "./NomeDoComponente.css"`).
   - Utilize as Custom Properties definidas no `@theme` de `src/index.css` (ex: `color: var(--color-gray-900);`, `font-family: var(--font-heading);`, `border-radius: var(--radius-md);`).
3. **Tipagem TypeScript:**
   - Sempre declare interfaces explícitas para as props dos componentes (ex: `interface NomeDoComponenteProps { ... }`).
   - Evite o uso de `any`. Para campos numéricos controlados (`number | null`), converta valores vazios (`""`) para `null`.
4. **Componentes do Design System e PrimeReact:**
   - Utilize prioritariamente os componentes de `src/components/` (`Button`, `Input`, `Select`, `SectionCard`, `Alert`, `Badge`, `Toast`, `Breadcrumb`, etc.).
   - Use ícones da biblioteca `primeicons` (ex: `<i className="pi pi-compass" />`, `pi-ship`, `pi-users` ou via prop `icon="pi-compass"` nos componentes do Design System).
   - Associe sempre `<label htmlFor="...">` ao `id` correspondente nos controles de formulário (o `Input` e o `Select` do Design System fazem isso automaticamente via `id` ou `useId()`).
5. **Autenticação e API:**
   - O token JWT é armazenado no `localStorage` sob a chave `@costaazul-token` e injetado automaticamente pelo interceptor em `src/services/api.ts`.
   - O backend local responde por padrão em `http://localhost:8080`.
6. **Idioma:**
   - Textos de interface (UI), labels, placeholders e mensagens de erro exibidas ao usuário devem estar em **Português (pt-BR)**.
   - Propriedades de DTOs que comunicam com a API (ex: `vesselName`, `grossTonnage`, `idCompany`) devem respeitar exatamente o contrato em inglês esperado pelo backend.

---

## 5. Comandos de Verificação

- **Desenvolvimento:** `npm run dev`
- **Checagem de tipos e Build:** `npm run build` (`tsc -b && vite build`)
- **Linting:** `npm run lint`
