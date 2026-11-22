-- Esquema completo do app. Se você já rodou a parte das tabelas, execute só a parte do Storage.
-- Painel do Supabase → SQL Editor.

-- ========== TABELAS ==========
create table if not exists mercados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  nome text not null,
  cidade text
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  nome text not null,
  descricao text,
  foto_path text,                       -- caminho no Storage, não a imagem
  created_at timestamptz default now()
);

create table if not exists precos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  produto_id uuid not null references produtos(id) on delete cascade,
  mercado_id uuid not null references mercados(id),
  preco_yen integer not null,
  com_imposto boolean default true,     -- true = preço já com imposto (税込)
  observado_em date default current_date
);

create index if not exists precos_produto_idx on precos (produto_id);
create index if not exists precos_mercado_idx on precos (mercado_id);

-- ========== RLS (cada usuário só vê o que é dele) ==========
alter table mercados enable row level security;
alter table produtos enable row level security;
alter table precos   enable row level security;

drop policy if exists "dono" on mercados;
drop policy if exists "dono" on produtos;
drop policy if exists "dono" on precos;
create policy "dono" on mercados for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dono" on produtos for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dono" on precos   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ========== STORAGE (fotos) ==========
-- Bucket privado. O app salva em  <id-do-usuario>/<arquivo>  e lê com URL assinada.
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', false)
on conflict (id) do nothing;

drop policy if exists "fotos: dono lê" on storage.objects;
drop policy if exists "fotos: dono envia" on storage.objects;
drop policy if exists "fotos: dono apaga" on storage.objects;

create policy "fotos: dono lê" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "fotos: dono envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "fotos: dono apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
