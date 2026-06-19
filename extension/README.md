# RatarIA — Extensão Chrome (MVP)

Extensão que loga automaticamente nas ferramentas de IA da RatarIA quando o cliente clica em **"Abrir"** no painel.

> **Status:** MVP. Suporta **ChatGPT** e **Gemini**. Outras ferramentas chegam em breve.

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
├── manifest.json           Manifest V3
├── icons/                  Ícones do navegador
└── src/
    ├── background.js       Service worker — orquestra abertura + guarda credenciais
    ├── panel-bridge.js     Content script no painel (rataria.io)
    ├── flow-runner.js      Engine genérica de execução de fluxo
    ├── overlay.css         Estilo do overlay de progresso
    ├── popup.html / .js    Popup do ícone da extensão
    └── flows/
        ├── chatgpt.js      Fluxo de login do ChatGPT
        └── gemini.js       Fluxo de login do Gemini
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

1. Crie `src/flows/<nome>.js` seguindo o modelo do `chatgpt.js`
2. Adicione a entrada em `TOOLS` no `background.js` (loginUrl, successUrl, etc.)
3. Adicione um `content_scripts` block no `manifest.json` apontando pro novo flow + matches dos domínios da ferramenta
4. Adicione a chave em `MVP_TOOLS` no `src/pages/AcessarFerramentas.tsx`
5. Regenerar o `.zip`

### Segurança

- Credenciais ficam em `chrome.storage.session` (limpa ao fechar o navegador)
- TTL adicional de 5 minutos após criar — depois disso some
- Cookies da ferramenta são limpos antes de cada abertura (evita misturar sessões)
- O `panel-bridge` só responde mensagens de origens autorizadas (rataria.io e ambientes de dev/preview)

### Limitações conhecidas do MVP

- **Sem 2FA:** se a conta-mãe pedir código de e-mail, o fluxo para. Próximo passo: edge function lendo IMAP.
- **Sem rotação automática de contas:** pega o `acessos` com expiração mais distante. Se múltiplos clientes abrirem ao mesmo tempo, todos vão pro mesmo login.
- **Fluxo quebra se a ferramenta mudar de tela:** os seletores CSS são frágeis. Quando o ChatGPT/Google muda layout, precisa atualizar `flows/`.
- **Distribuição manual:** não passa pelo review do Google, mas o cliente vê alerta de "extensão em modo desenvolvedor". Migrar pra Chrome/Edge Store quando estabilizar.
