# 🍪 Cookite - Landing Page JEPP 2025

Landing page da **Cookite**, confeitaria temporária para o evento JEPP do Sebrae, com sistema completo de reservas online integrado ao Supabase.

## 🚀 Deploy Rápido

```bash
# 1. Limpeza final
bash -c "$(cat FINAL_CLEANUP.md | grep 'rm -f' | head -20)"

# 2. Verificação pré-deploy
node deploy-check.js

# 3. Build e deploy
npm run deploy:build

# 4. Upload pasta 'dist/' no Netlify
```

## 🎯 Funcionalidades Ativas

- ✅ **Sistema de reservas** - Integração completa com Supabase
- ✅ **Confirmação por email** - Envio automático via Resend
- ✅ **Dashboard administrativo** - Gestão de reservas em tempo real
- ✅ **Design responsivo** - Mobile-first otimizado para conversão
- ✅ **Desconto automático** - 20% aplicado até 10/09/2025
- ✅ **Validação em tempo real** - Email e telefone
- ✅ **PWA Ready** - Instalável no dispositivo
- ✅ **SEO otimizado** - Meta tags e schema markup

## 🛠️ Stack Técnica

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 + shadcn/ui
- **Backend**: Supabase (Database + Edge Functions)
- **Email**: Resend API
- **Deploy**: Netlify
- **Validação**: React Hook Form + validação personalizada

## 📦 Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento local
npm run build           # Build padrão
npm run deploy:build    # Build otimizado para produção
npm run deploy:preview  # Build + preview local
npm run type-check      # Verificação TypeScript
npm run lint            # ESLint
npm run lint:fix        # ESLint + correção automática
```

## 🌐 URLs

- **Produção**: https://cookite-jepp.netlify.app
- **Supabase**: https://deeichvgibhpbrowhaiq.supabase.co
- **Instagram**: [@cookite_oficial](https://instagram.com/cookite_oficial)

## 📊 Produtos e Preços

| Produto | Preço Original | Com Desconto (20%) |
|---------|----------------|-------------------|
| Palha Italiana | R$ 6,00 | R$ 4,80 |
| Cookie | R$ 7,00 | R$ 5,60 |
| Cake Pop | R$ 4,50 | R$ 3,60 |
| Biscoito Amantegado | R$ 5,00 | R$ 4,00 |

## 🎨 Design System

### Paleta de Cores
- **Azul Cookite**: `#A8D0E6` (principal)
- **Amarelo Cookite**: `#FFE9A8` (destaque)
- **Cinza Claro**: `#f8f9fa` (fundo)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 400, 500, 600, 700

## 🔧 Configurações de Deploy

### Netlify
```toml
[build]
  publish = "dist"
  command = "npm run deploy:build"

[build.environment]
  NODE_VERSION = "18"
```

### Variáveis de Ambiente
```env
VITE_SITE_URL=https://cookite-jepp.netlify.app
VITE_APP_NAME=Cookite JEPP
```

## 📁 Estrutura do Projeto

```
├── components/              # Componentes React
│   ├── ui/                 # shadcn/ui components
│   ├── Hero.tsx            # Seção principal
│   ├── Products.tsx        # Vitrine de produtos
│   ├── ReservationForm.tsx # Formulário de reserva
│   └── AdminDashboard.tsx  # Dashboard administrativo
├── hooks/                  # Custom hooks
├── styles/                 # CSS global
├── utils/                  # Utilitários
├── supabase/functions/     # Edge Functions
└── public/                 # Assets estáticos
```

## 🚨 Troubleshooting

### Problemas de Build
```bash
# Limpar cache completo
rm -rf node_modules package-lock.json .vite dist
npm install

# Verificar dependências
npm audit fix

# Build com debug
npm run type-check
npm run lint
npm run build
```

### Problemas de CSS
```bash
# Verificar Tailwind
npx tailwindcss --version

# Regenerar CSS
rm -rf .vite
npm run dev
```

## 📞 Suporte

- **GitHub Issues**: Para bugs e melhorias
- **Instagram**: [@cookite_oficial](https://instagram.com/cookite_oficial)
- **Evento**: JEPP Sebrae 2025 - 12/09/2025

---

## 📄 Licença

MIT License - Desenvolvido com 💙 para o **JEPP Sebrae 2025**

### 🎉 Status: ✅ PRONTO PARA DEPLOY