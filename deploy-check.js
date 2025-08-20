#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificação Pré-Deploy - Cookite JEPP');
console.log('=====================================\n');

const requiredFiles = [
  '.gitignore',
  'netlify.toml', 
  'public/_redirects',
  'postcss.config.js',
  'package.json',
  'tailwind.config.ts',
  'vite.config.ts',
  'App.tsx',
  'main.tsx',
  'styles/globals.css'
];

const forbiddenFiles = [
  '_gitignore.tsx',
  'netlify_toml.tsx',
  'postcss.config.cjs'
];

let errors = 0;
let warnings = 0;

// Verificar arquivos obrigatórios
console.log('✅ Verificando arquivos obrigatórios:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ❌ ${file} - FALTANDO`);
    errors++;
  }
});

console.log('\n❌ Verificando arquivos proibidos:');
forbiddenFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ❌ ${file} - DEVE SER REMOVIDO`);
    errors++;
  } else {
    console.log(`  ✓ ${file} - OK (não existe)`);
  }
});

// Verificar pasta public/_redirects
console.log('\n📁 Verificando public/_redirects:');
if (fs.existsSync('public/_redirects')) {
  if (fs.statSync('public/_redirects').isDirectory()) {
    const files = fs.readdirSync('public/_redirects');
    if (files.length > 0) {
      console.log(`  ❌ Diretório public/_redirects contém ${files.length} arquivos - DEVE ESTAR VAZIO`);
      console.log(`  📝 Arquivos encontrados: ${files.join(', ')}`);
      errors++;
    } else {
      console.log('  ✓ Diretório public/_redirects está vazio');
    }
  } else {
    console.log('  ✓ public/_redirects é um arquivo (correto)');
  }
} else {
  console.log('  ❌ public/_redirects não existe');
  errors++;
}

// Verificar package.json
console.log('\n📦 Verificando package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.devDependencies && packageJson.devDependencies.tailwindcss) {
    const version = packageJson.devDependencies.tailwindcss;
    if (version.startsWith('^3.')) {
      console.log(`  ✓ Tailwind CSS v3 (${version})`);
    } else {
      console.log(`  ⚠️  Tailwind CSS versão ${version} - recomendado v3.x`);
      warnings++;
    }
  } else {
    console.log('  ❌ Tailwind CSS não encontrado nas devDependencies');
    errors++;
  }
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log(`  ✓ Script de build: ${packageJson.scripts.build}`);
  } else {
    console.log('  ❌ Script de build não encontrado');
    errors++;
  }
} catch (e) {
  console.log('  ❌ Erro ao ler package.json:', e.message);
  errors++;
}

// Resumo final
console.log('\n📊 Resumo:');
console.log(`  Erros: ${errors}`);
console.log(`  Avisos: ${warnings}`);

if (errors === 0) {
  console.log('\n🚀 PROJETO PRONTO PARA DEPLOY!');
  console.log('Execute: npm run deploy:build');
  process.exit(0);
} else {
  console.log('\n⚠️  CORREÇÕES NECESSÁRIAS ANTES DO DEPLOY');
  console.log('Consulte FINAL_CLEANUP.md para instruções');
  process.exit(1);
}