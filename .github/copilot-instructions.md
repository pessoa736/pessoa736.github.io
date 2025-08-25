# Instruções do Copilot para o Projeto

## Configuração do Projeto
**Tipo**: Next.js 15.5.0 com TypeScript
**UI Framework**: Chakra UI v3.25.0
**Tema**: next-themes v0.4.6 para dark/light mode
**Ícones**: react-icons v5.5.0
**Animações**: motion v12.23.12

### Dependências Principais
```json
{
  "dependencies": {
    "@chakra-ui/react": "^3.25.0",
    "@emotion/react": "^11.14.0",
    "motion": "^12.23.12",
    "next": "15.5.0",
    "next-themes": "^0.4.6",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-icons": "^5.5.0"
  }
}
```

### Configuração TypeScript
- Target: ES2017
- Paths configurados: `"site/*": ["./src/*"]`
- JSX: preserve
- Strict mode ativado

## Estrutura do Projeto
```
src/
├── app/
│   ├── layout.tsx (Provider wrapper)
│   └── page.tsx
└── components/
    └── ui/
        ├── provider.tsx (ChakraProvider + ColorModeProvider)
        ├── color-mode.tsx
        ├── toaster.tsx
        └── tooltip.tsx
```

## Diretrizes de Desenvolvimento

### ANÁLISE OBRIGATÓRIA
**SEMPRE antes de implementar qualquer funcionalidade:**
1. Analise a estrutura atual do projeto
2. Verifique os componentes UI existentes em `src/components/ui/`
3. Identifique padrões de organização já estabelecidos
4. Considere a arquitetura de providers existente

### Criação de Componentes
1. **Localização**: Todos os componentes UI em `src/components/ui/`
2. **Importações**: Use o alias `site/` configurado no tsconfig
3. **Tipo**: Sempre criar componentes funcionais com TypeScript
4. **Props**: Defina interfaces claras para as props
5. **Export**: Use export nomeado quando apropriado

### Padrão de Hooks
1. **Localização**: Criar pasta `src/hooks/` para hooks customizados
2. **Nomenclatura**: Prefixo `use` + nome descritivo (ex: `useTheme`, `useLocalStorage`)
3. **Tipagem**: Sempre tipar retorno e parâmetros dos hooks
4. **Reutilização**: Focar em hooks genéricos e reutilizáveis

### Padrão de Providers
1. **Estrutura existente**: Já existe Provider principal em `src/components/ui/provider.tsx`
2. **Novos providers**: Integrar ao Provider existente quando possível
3. **Context**: Criar contexts tipados com TypeScript
4. **Hooks de consumo**: Sempre criar hook personalizado para consumir context

### Estilo e UI
1. **Framework**: Usar exclusivamente Chakra UI
2. **Tema**: Respeitar o sistema de dark/light mode configurado
3. **Responsividade**: Usar breakpoints do Chakra UI
4. **Ícones**: Usar react-icons para consistência
5. **Animações**: Utilizar motion para transições suaves

### Organização de Arquivos
1. **Componentes simples**: Um arquivo por componente
2. **Componentes complexos**: Pasta com index.tsx + arquivos auxiliares
3. **Tipos**: Definir em arquivos .types.ts quando necessário
4. **Utilitários**: Criar pasta `src/utils/` para funções auxiliares

### Boas Práticas
1. **Client Components**: Usar "use client" apenas quando necessário
2. **Performance**: Implementar lazy loading para componentes pesados
3. **Acessibilidade**: Sempre considerar ARIA labels e navegação por teclado
4. **Testes**: Preparar componentes para serem testáveis
5. **Documentação**: Comentar componentes complexos com JSDoc

### Exemplo de Estrutura de Componente
```tsx
"use client"

import { Box, BoxProps } from "@chakra-ui/react"
import { ReactNode } from "react"

interface CustomComponentProps extends BoxProps {
  title: string
  children: ReactNode
  variant?: "primary" | "secondary"
}

export function CustomComponent({ title, children, variant = "primary", ...props }: CustomComponentProps) {
  return (
    <Box {...props}>
      {/* Implementação */}
    </Box>
  )
}
```

### Exemplo de Hook Customizado
```tsx
import { useState, useEffect } from "react"

interface UseCustomHookReturn {
  data: any[]
  loading: boolean
  error: string | null
}

export function useCustomHook(): UseCustomHookReturn {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Implementação

  return { data, loading, error }
}
```

## Lembre-se
- SEMPRE analise o projeto antes de implementar
- Mantenha consistência com a estrutura existente  
- Priorize componentes reutilizáveis e simples
- Use hooks e providers de forma eficiente
- Evite um amontoado de vários elementos XML numa mesma página  
- Use as dependências já instaladas antes de sugerir novas
- Respeite os padrões de nomenclatura e organização estabelecidos
- se uma pagina tiver muitos elementos semelhantes ou com muitos argumentos parecidos, considere criar um componente separado para eles
- foque em criar padrões e reutilizar componentes já existentes
- crie componentes para qualquer coisa que seja repetitiva
- se tiver muito grande o codigo, refatore em componentes menores, hooks ou providers