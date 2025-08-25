# Copilot Instructions — pessoa736.github.io

Estas instruções ajudam o GitHub Copilot (Chat e inline) a gerar código e respostas alinhadas a este projeto.

## Sobre o projeto
- Portfólio pessoal em Next.js 15 (App Router) + TypeScript.
- UI com Chakra UI v3 e animações com `motion`.
- Build estático (Next.js `output: "export"`) para deploy no GitHub Pages.
- Linguagem preferencial: pt-BR nas mensagens, componentes e conteúdos visíveis (quando fizer sentido).

## Stack e versões
- Node 20 (CI usa `actions/setup-node@v4` com Node 20)
- Next.js: 15.5.x
- React: 19.1.x
- Chakra UI: 3.x
- TypeScript: 5.x

## Estrutura do repositório
- `site/` (raiz do app Next.js)
  - `src/app/` — App Router: `layout.tsx`, `page.tsx` e futuras rotas/páginas.
  - `src/components/` — Componentes reutilizáveis (ex.: `Header`, `Footer`, `card`, `perfilfoto`, `ui`).
  - `src/templates/` — Layouts/templates de páginas (ex.: `defaultpage`).
  - `src/utils/` — Utilitários (detecção de viewport, etc.).
  - `public/` — Imagens e assets estáticos.
  - `next.config.ts` — `output: "export"` (somente recursos compatíveis com export estático).
  - `tsconfig.json` — Alias de import principal: `"site/*" -> "./src/*"`.

## Importações e alias
- Sempre preferir o alias `site/*` para código interno. Exemplos:
  - `import PerfilFoto from "site/components/perfilfoto"`
  - `import DefaultPage from "site/templates/defaultpage"`
  - `import { isMobileScreen } from "site/utils/chackmobilescreen"`

## Padrões de Componentes (Chakra + App Router)
- Use Chakra UI para layout/estilização (Box, Flex, Heading, Text, etc.).
- Componentes que usam hooks, `motion` ou interatividade devem começar com `"use client"`.
- Preferir composição via props do Chakra (ex.: `px`, `py`, `gap`) em vez de CSS manual quando possível.
- Acessibilidade: adicionar `aria-*` e semântica quando aplicável.
- Tipagem: manter `strict` do TS. Evitar `any`; definir tipos de props.

Sugestão de organização ao criar um novo componente reutilizável:
- Pasta: `site/src/components/NomeDoComponente/`
  - `index.tsx` — implementação
  - `NomeDoComponente.types.ts` — tipos de props (opcional)

Respeite o padrão já presente quando editar componentes existentes (alguns diretórios usam caixa baixa).

## Páginas e rotas (App Router)
- Nova rota: criar pasta em `src/app/<rota>/page.tsx`.
- Opcionalmente exportar `metadata` tipada com `Metadata` do Next.
- Se o componente da página usar hooks/efeitos/`motion`, inclua `"use client"` no topo.
- Por ser export estático:
  - Evitar APIs/SSR (`getServerSideProps`, `dynamic = "force-dynamic"`, headers e cookies do request, etc.).
  - Preferir dados estáticos ou carregamento no cliente (quando aceitável) sem depender de execução no servidor.

Exemplo básico de página:
```tsx
// site/src/app/sobre/page.tsx
"use client";
import { Box, Heading, Text } from "@chakra-ui/react";

export const metadata = { title: "Sobre — Davi Pessoa" };

export default function SobrePage() {
  return (
    <Box px="10%" py="6%">
      <Heading mb={3}>Sobre</Heading>
      <Text>Conteúdo da página Sobre.</Text>
    </Box>
  );
}
```

## Animações (motion)
- Importar de `motion/react` (conforme já usado).
- Encadear animações simples com `initial`, `animate`, `transition`.
- Garantir que componentes animados sejam client-side (`"use client"`).

## Estilo, acessibilidade e conteúdo
- Texto em pt-BR. Evitar gírias e manter tom amigável.
- Usar tokens/responsividade do Chakra quando possível (`display`, `direction`, `gap`, breakpoints).
- Respeitar dark mode (o projeto tem Provider de modo de cor).

## Utilitários
- `site/src/utils/chackmobilescreen.tsx` e `.../getscreensize.tsx` são utilitários atuais de viewport.
- Ao criar novos utils, colocá-los em `src/utils/` e tipar assinaturas.

## Convenções de código
- TypeScript estrito, sem `any` silencioso.
- Mantém imports ordenados e usa alias `site/*`.
- Exports padrão para componentes (`export default ...`).
- Evitar lógica complexa em componentes; extrair para utils quando possível.

## Build, execução e deploy
- Scripts (executar dentro de `site/`):
  - `npm run dev` — desenvolvimento
  - `npm run build` — build de produção
  - `npm start` — rodar build
- Deploy: GitHub Pages via workflow em `.github/workflows/nextjs.yml`.
  - Observação: o workflow ouve `push` para `main`. Se o branch padrão for `master`, alinhar o gatilho do workflow.

## O que Copilot deve priorizar nas respostas
- Gerar código funcional e idiomático para Next.js App Router + Chakra.
- Usar alias `site/*` nas importações internas.
- Inserir `"use client"` quando houver hooks/efeitos ou `motion`.
- Evitar padrões incompatíveis com export estático.
- Fornecer exemplos enxutos e diretamente aplicáveis ao projeto.
- Quando criar novas rotas/componentes, indicar o caminho do arquivo e quaisquer imports necessários.

## O que evitar
- SSR, APIs do Next (rotas de API) ou qualquer recurso que exija servidor.
- Introduzir dependências novas sem necessidade clara.
- Sugestões que ignorem o Provider do Chakra/tema.

## Check rápido antes de sugerir código
- [ ] O import usa `site/*` quando é interno?
- [ ] Precisa de `"use client"`?
- [ ] É compatível com export estático?
- [ ] Tipos estão corretos (sem `any` desnecessário)?
- [ ] Respeita a estrutura de pastas?

---
Se precisar, posso ajustar estas instruções à medida que o projeto evolui (novos componentes, rotas, libs, etc.).
