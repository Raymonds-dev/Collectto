# Guia de Validação Rápida (Quickstart)

**Feature**: `020-web-adapters-compatibility`  
**Date**: 2026-09-26  

Este guia detalha o passo a passo para verificar a compatibilidade e funcionamento correto dos adaptadores WEB e nativos.

---

## 1. Pré-requisitos e Execução do App na Web

Para iniciar o bundler no modo Web:

```bash
npm run web
```

O Metro iniciará o servidor local e abrirá o navegador em `http://localhost:8081`.

---

## 2. Cenários de Validação

### Cenário 1: Persistência de Autenticação na Web (`storageAdapter.web.ts`)
1. No navegador, acerte a rota inicial (`/login`).
2. Insira as credenciais de um usuário cadastrado e clique em **Entrar**.
3. Verifique nas ferramentas de desenvolvedor do navegador (**F12 → Application → Local Storage**):
   - A chave `collectto.session.token` deve conter o token JWT válido.
   - A chave `collectto.session.refresh_token` deve estar gravada.
4. Pressione **F5 (Reload)** na página.
5. **Resultado Esperado**: O usuário permanece autenticado e é redirecionado para a tela do perfil (`/profile`) sem quebras ou redirecionamentos indevidos.

---

### Cenário 2: Upload de Imagens no Navegador (`uploadAdapter.web.ts`)
1. Na versão Web, acesse a criação de coleção ou criação de item (`/create-item`).
2. Clique na área de seleção de foto.
3. Escolha uma imagem de teste do seu computador (formato `.png` ou `.jpg`, < 10MB).
4. Preencha os campos obrigatórios e submeta.
5. **Resultado Esperado**: A requisição HTTP `PUT` para o S3 é concluída com sucesso (status 200) utilizando `fetch` e `Blob`, e a foto é exibida no acervo.

---

### Cenário 3: Recorte de Foto de Perfil via HTML5 Canvas (`ProfilePhotoCropModal.web.tsx`)
1. Acesse a tela de configurações de conta (`/settings/account`).
2. Clique para alterar a foto de perfil e escolha uma foto no computador.
3. O modal de recorte deve abrir na tela.
4. Realize ajustes de enquadramento:
   - Arraste a imagem com o cursor do mouse.
   - Utilize a roda de rolagem do mouse (wheel) ou os botões de zoom (+ / -) para alterar a escala.
5. Clique em **Confirmar**.
6. **Resultado Esperado**: O recorte é processado via HTML5 Canvas e a imagem atualizada reflete o enquadramento escolhido no preview do perfil.

---

## 3. Validação Automatizada de Código

Execute o script unificado de qualidade do repositório:

```bash
npm run validate
```

**Resultado Esperado**:
- `npm run type-check`: 0 erros de tipagem.
- `npm run lint`: 0 warnings e 0 erros de ESLint.
- `npm run format:check`: 100% dos arquivos compatíveis com o Prettier.
