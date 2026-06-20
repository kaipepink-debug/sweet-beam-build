-- Habilita Supabase Realtime nas tabelas acessos e proxies.
-- Permite que o painel /acessar-ferramentas escute mudanças em tempo real e
-- re-sincronize com a extensão automaticamente (ex: admin cadastra novo 2FA
-- → todos os clientes online recebem em < 5 segundos).
--
-- A publicação supabase_realtime já existe por padrão. As políticas RLS
-- existentes continuam aplicadas: cliente só recebe eventos de linhas que
-- conseguiria SELECT (acessos não expirados + proxies ativos).

ALTER PUBLICATION supabase_realtime ADD TABLE public.acessos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proxies;
