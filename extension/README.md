# RatarIA — Extensão Chrome (modelo Proton Pass)

Quando o cliente entra numa página de login (ChatGPT, Gemini, etc.), aparece um ícone roxo da RatarIA dentro do campo de e-mail. Ele clica, escolhe a conta que quer usar, e os campos preenchem sozinhos.

> **Status:** v0.3.0. Suporta **ChatGPT** e **Gemini**. Outras ferramentas chegam em breve.

## Como funciona (visão técnica)

1. Cliente abre `/acessar-ferramentas` no painel — a página puxa todas as credenciais ativas do Supabase e **sincroniza** com a extensão via `postMessage`
2. Extensão guarda as credenciais em `chrome.storage.local` com **TTL de 24h**
3. Cliente clica em "ChatGPT" no painel → abre `chatgpt.com/auth/login` em nova aba
4. Content script `login-injector.js` detecta o campo de e-mail e injeta um ícone flutuante
5. Cliente clica no ícone → dropdown abre com as contas disponíveis pra essa ferramenta
6. Cliente seleciona uma conta → e-mail e senha preenchem via `execCommand('insertText')` (executa dentro do gesture do usuário, então o React captura corretamente)
7. Cliente clica "Continuar" manualmente

---

## Como o cliente instala (passo a passo)

> A extensão **não está na Chrome Web Store**, então a instalação é manual (uma vez só).

### 1. Baixar o arquivo

No painel da RatarIA, clique em **"Acesso Rápido"** → **"Baixar extensão (.zip)"**.
Salve o arquivo `rataria-extension.zip` na sua área de trabalho.

### 2. Extrair o ZIP

- Clique com o botão direito no `rataria-extension.zip`
- Escolha **"Extrair tudo"** (Windows) ou clique duas vezes (Mac)
- Vai aparecer uma pasta chamada `rataria-extension`

> **Importante:** não delete essa pasta depois. A extensão precisa dela pra funcionar.

### 3. Abrir o gerenciador de extensões

Abra o Chrome e cole na barra de endereços:
```
chrome://extensions
```

### 4. Ativar Modo do desenvolvedor

No canto superior **direito** da página, ative o toggle **"Modo do desenvolvedor"**.

### 5. Carregar a extensão

- Clique em **"Carregar sem compactação"** (canto superior esquerdo)
- Selecione a pasta `rataria-extension` que você extraiu no passo 2
- A extensão vai aparecer na lista com o ícone roxo da RatarIA

### 6. Pronto

Volte ao painel da RatarIA. Em **"Acesso Rápido"** o status deve mudar de
*"Instale a extensão..."* pra **"Extensão conectada"** em verde.

Agora é só clicar em ChatGPT ou Gemini e ver a mágica.

---

## Recomendação importante: use um perfil dedicado do Chrome

Pra não misturar sua conta pessoal do Google com as contas da RatarIA:

1. No Chrome, clique no ícone do seu perfil (canto superior direito)
2. Clique em **"Adicionar"** → escolha um nome tipo `RatarIA` e uma cor diferente
3. Use esse perfil novo só pra usar as ferramentas da RatarIA
4. Instale a extensão **dentro desse perfil**

Isso evita conflito de sessão (ex.: você fica logado na Canva pessoal e na compartilhada ao mesmo tempo).

---

## Troubleshooting

### "Extensão não detectada" continua aparecendo no painel
- Verifique se a extensão está **ativada** em `chrome://extensions`
- Recarregue a página do painel (F5)
- Se persistir, remova a extensão e instale de novo

### "Modo do desenvolvedor" aparece um aviso amarelo
- Esse é o aviso padrão do Chrome pra extensões fora da Web Store. **Pode ignorar.**
- Se incomodar, dá pra fechar com o "X" toda vez que abrir o navegador.

### Toda vez que abro o Chrome ele pergunta se quero manter
- Resposta: **"Sim, manter"**. É chato mas é por segurança do Chrome.

### O login não funcionou na ferramenta
- Pode ser que a conta-mãe foi deslogada (acontece de tempos em tempos por uso compartilhado)
- Avise no canal `@rataria.io` no WhatsApp pra equipe relogar
- Não tente forçar — pode acabar bloqueando a conta

---

## Para desenvolvedores (RatarIA team)

### Estrutura

```
extension/
├── manifest.json              Manifest V3
├── icons/                     Ícones do navegador (16/48/128)
└── src/
    ├── background.js          Service worker — sync de credenciais + storage
    ├── panel-bridge.js        Content script no painel da RatarIA
    ├── login-injector.js      Content script nas páginas de login (ChatGPT/Google)
    ├── login-injector.css     Estilo do ícone + dropdown (modelo Proton Pass)
    ├── popup.html / .css/ .js Popup do ícone da extensão (status + atalho)
```

### Como rodar localmente

```
chrome://extensions → Modo desenvolvedor → "Carregar sem compactação" → selecione /extension
```

Edite os arquivos e clique no botão "recarregar" da extensão pra ver mudanças.

### Como gerar o .zip pra distribuição

A partir da raiz do repo:

```bash
cd extension
zip -r ../public/extensao/rataria-extension.zip . -x "*.DS_Store" "README.md"
```

O arquivo gerado é o que o cliente baixa pelo botão "Baixar extensão" no painel.

### Adicionando uma ferramenta nova

1. No `login-injector.js`, adiciona o domínio → ferramenta em `TOOL_BY_HOST`
2. No `manifest.json`, adiciona o(s) domínio(s) em `content_scripts[1].matches` + `host_permissions`
3. Adiciona a entrada em `TOOL_OPEN_URL` e `TOOL_DOMAINS` no `background.js`
4. Adiciona em `MVP_TOOLS` no `src/pages/AcessarFerramentas.tsx`
5. Regenera o `.zip`

### Segurança

- Credenciais ficam em `chrome.storage.local` (isolado por extensão; outras páginas não acessam)
- TTL de **24 horas** — se passar disso, o cliente precisa reabrir o painel pra sincronizar
- Cookies do Gemini são limpos antes da abertura (force logout)
- O `panel-bridge` só responde mensagens de origens autorizadas (rataria.io, localhost, ambientes Lovable)
- O `login-injector` só roda nos domínios listados no `manifest.json`

### Limitações conhecidas

- **Sem 2FA automático:** se a ferramenta pedir código por e-mail/SMS, cliente resolve manualmente. Próximo passo: edge function lendo IMAP.
- **Cliente escolhe a conta:** ainda não há rotação inteligente. Se quiser priorizar a menos usada, precisa de coluna `uso_count` em `acessos` + RPC pra incrementar.
- **Distribuição manual:** não passa pelo review do Google, mas o cliente vê alerta de "modo desenvolvedor". Migrar pra Edge Add-ons Store quando estabilizar.
- **Sync precisa ser refeito após 24h:** TTL existe pra forçar credenciais frescas. Cliente só precisa abrir o painel pra resincronizar.
