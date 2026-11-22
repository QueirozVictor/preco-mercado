# Preço Mercado

App para registrar o preço dos produtos em cada supermercado (com foto) e saber na hora se algo está mais caro ou mais barato do que você já conhece.

React 19 · Vite · Supabase (Auth, Postgres e Storage) · GitHub Pages

## Como rodar

```bash
npm install
cp .env.example .env     # preencha URL e chave anon do Supabase
npm run dev
```

No Supabase, rode `supabase/schema.sql` no SQL Editor (tabelas, RLS e o bucket privado `fotos` com policies).
Se quiser que só você use o app, desative novos cadastros em *Authentication → Providers → Email* depois de criar sua conta.

## Estrutura (camadas)

```text
src/
├── lib/supabase.js          # único lugar que cria o client
├── services/                # únicas funções que falam com o Supabase
│   ├── authService.js
│   ├── produtosService.js   # produto + preços + mercado numa consulta
│   ├── mercadosService.js
│   ├── precosService.js
│   └── fotosService.js      # upload e URLs assinadas (bucket privado)
├── contexts/AuthContext.jsx # sessão do usuário
├── hooks/                   # useAuth, useProdutos/useProduto, useMercados, useMercadoAtual
├── utils/
│   ├── comparacao.js        # regras: menor preço, média, mais caro/barato, imposto
│   ├── converterImagem.js   # reduz e converte a foto para WebP antes do upload
│   └── formatarIene.js
├── components/              # Layout, ProtectedRoute, ProdutoCard, SeloPreco, FotoUpload...
├── pages/                   # Login, Catalogo, ProdutoDetalhe, RegistrarPreco
└── styles/                  # theme.css (cores e fontes) + base.css
```

Componentes e páginas nunca chamam o Supabase direto: usam hooks, e os hooks usam os services.

## Como funciona a comparação

- Cada registro de preço guarda produto, mercado, valor em ienes, se já inclui imposto e a data.
- O último preço de cada mercado entra na comparação. Preços sem imposto (税抜) são convertidos com 8% (`TAXA_ALIMENTO` em `utils/comparacao.js`).
- No Catálogo, escolha "Estou no mercado" para ver, em cada produto, se o preço ali é o menor ou quantos % acima do menor já visto.
- Em "Registrar preço", ao digitar o preço o app mostra na hora se está mais caro ou mais barato que o histórico.

## Publicar no GitHub Pages

`npm run deploy` gera o build com o seu `.env` e publica a pasta `dist`. A chave `anon` é pública por natureza (quem protege os dados é o RLS), mas nunca coloque a `service_role` no projeto.
Depois de publicar, adicione a URL do Pages em *Authentication → URL Configuration* no Supabase.
