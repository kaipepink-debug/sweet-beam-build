-- Corrigir data_criacao para refletir o fuso de Brasília (America/Sao_Paulo)
-- com base no created_at (que é UTC).
UPDATE public.assinantes
SET data_criacao = (created_at AT TIME ZONE 'America/Sao_Paulo')::date
WHERE data_criacao <> (created_at AT TIME ZONE 'America/Sao_Paulo')::date;