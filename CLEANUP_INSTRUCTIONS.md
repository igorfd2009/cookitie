# Instruções de Limpeza Manual

## Arquivos para remover manualmente:

Execute os seguintes comandos para remover arquivos incorretos:

```bash
# Remover arquivos .tsx incorretos
rm _gitignore.tsx
rm netlify_toml.tsx

# Remover todos os arquivos .tsx dentro de public/_redirects/
rm public/_redirects/Code-component-112-317.tsx
rm public/_redirects/Code-component-112-333.tsx
rm public/_redirects/Code-component-115-381.tsx
rm public/_redirects/Code-component-115-419.tsx
rm public/_redirects/Code-component-83-145.tsx
rm public/_redirects/Code-component-83-170.tsx

# Opcional: Remover o diretório vazio se estiver vazio após remoção dos arquivos
# rmdir public/_redirects (apenas se estiver vazio)
```

## Após a limpeza, execute:

```bash
# Limpar cache e reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Executar o projeto
npm run dev
```

## Verificação final:

Certifique-se de que os seguintes arquivos existam e estejam corretos:

- ✅ `.gitignore` (sem extensão)
- ✅ `netlify.toml` (sem extensão)
- ✅ `public/_redirects` (sem extensão)
- ✅ `postcss.config.js` (formato CommonJS)
- ✅ `package.json` (dependências corretas)
- ✅ `styles/globals.css` (Tailwind v3)

## Problemas comuns após limpeza:

1. **Se o Tailwind não funcionar**:

   ```bash
   npm uninstall tailwindcss
   npm install -D tailwindcss@^3.4.0
   ```

2. **Se o PostCSS der erro**:

   - Verificar se `postcss.config.js` está em formato CommonJS
   - Verificar se `autoprefixer` e `postcss` estão instalados

3. **Se o build falhar**:
   ```bash
   npm run type-check
   npm run lint
   ```

Após seguir estas instruções, o projeto deve compilar e executar sem erros!