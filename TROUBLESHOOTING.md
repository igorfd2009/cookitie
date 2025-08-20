# Troubleshooting - Cookite JEPP

## Problemas Comuns e Soluções

### 1. Erro ao executar `npm run dev`

#### **Problema**: `PostCSS plugin tailwindcss requires PostCSS 8`
**Solução**: 
```bash
npm uninstall postcss tailwindcss autoprefixer
npm install -D postcss@^8.4.38 tailwindcss@^3.4.0 autoprefixer@^10.4.19
```

#### **Problema**: Classes CSS não aplicadas ou Tailwind não funciona
**Soluções**:
1. Limpar cache do PostCSS e Vite:
   ```bash
   rm -rf node_modules/.cache
   rm -rf .vite
   npm run build
   ```

2. Verificar se `tailwind.config.ts` tem todos os paths corretos:
   ```ts
   content: [
     './index.html',
     './App.tsx',
     './main.tsx',
     './components/**/*.{js,ts,jsx,tsx}',
   ]
   ```

#### **Problema**: `Cannot find module 'sonner'` ou erros com toast
**Soluções**:
1. Reinstalar dependências do toast:
   ```bash
   npm uninstall sonner react-toastify
   npm install sonner@^1.4.41 react-toastify@^10.0.4
   ```

2. Verificar importações corretas no `App.tsx`

#### **Problema**: Variáveis CSS não definidas (`--color-cookite-blue` etc.)
**Solução**: Verificar se `styles/globals.css` está sendo importado corretamente no `main.tsx`:
```tsx
import './styles/globals.css';
```

### 2. Problemas de Build

#### **Problema**: `TypeError: Cannot read property 'hover' of undefined`
**Solução**: Atualizar `tailwind.config.ts` para incluir todas as classes do shadcn/ui:
```ts
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      background: "hsl(var(--background))",
      // ... todas as outras cores
    }
  }
}
```

#### **Problema**: Arquivos TypeScript não reconhecidos
**Soluções**:
1. Verificar `tsconfig.json` com configurações corretas
2. Executar verificação de tipos:
   ```bash
   npm run type-check
   ```

### 3. Problemas de Dependências

#### **Problema**: Conflitos de versão
**Soluções**:
1. Deletar `node_modules` e `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Verificar se todas as dependências estão nas versões corretas:
   ```bash
   npm outdated
   npm audit fix
   ```

#### **Problema**: Shadcn/ui components não funcionam
**Soluções**:
1. Verificar se todas as dependências do Radix UI estão instaladas
2. Checar se `components/ui/utils.ts` existe e exporta a função `cn`
3. Verificar se `tailwindcss-animate` está instalado

### 4. Problemas de Styling

#### **Problema**: Site aparece "esticado" ou com layout quebrado
**Soluções**:
1. Verificar se há conflitos entre classes do Tailwind e estilos personalizados
2. Checar se `@layer base` está correto no `globals.css`
3. Verificar se as variáveis CSS estão sendo aplicadas:
   ```css
   :root {
     --background: 0 0% 100%;
     --foreground: 222.2 84% 4.9%;
     /* ... outras variáveis */
   }
   ```

#### **Problema**: Cores personalizadas não aplicadas
**Solução**: Verificar se as variáveis CSS personalizadas estão definidas no `:root`:
```css
:root {
  --color-cookite-blue: #A8D0E6;
  --color-cookite-yellow: #FFE9A8;
  /* ... outras cores */
}
```

### 5. Comandos de Limpeza Completa

Se nada funcionar, execute esta sequência:

```bash
# 1. Limpar tudo
rm -rf node_modules
rm -rf package-lock.json
rm -rf .vite
rm -rf dist

# 2. Reinstalar dependências
npm install

# 3. Executar verificações
npm run type-check
npm run lint

# 4. Tentar executar
npm run dev
```

### 6. Verificações Finais

Antes de executar `npm run dev`, verificar se:

- [ ] `node_modules` foi instalado corretamente
- [ ] `tailwind.config.ts` existe e está correto
- [ ] `postcss.config.js` existe e está correto
- [ ] `styles/globals.css` está sendo importado
- [ ] Todas as dependências do `package.json` estão instaladas
- [ ] Não há arquivos `.tsx` incorretos na pasta `public/`

### 7. Logs Úteis

Para debugar problemas:

```bash
# Executar com mais verbosidade
DEBUG=vite:* npm run dev

# Verificar dependências
npm ls

# Verificar versões
node --version
npm --version
```

## Contato

Se os problemas persistirem, verifique:
1. Versão do Node.js >= 18.0.0
2. Versão do npm >= 8.0.0
3. Sistema operacional suportado
4. Conexão com internet para CDNs externos