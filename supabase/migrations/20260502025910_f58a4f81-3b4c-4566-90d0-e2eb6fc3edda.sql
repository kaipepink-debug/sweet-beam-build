-- Ajusta datas atrasadas das assinaturas: 29/04 -> 30/04 e 30/04 -> 01/05
UPDATE public.assinantes SET data_criacao = '2026-05-01' WHERE data_criacao = '2026-04-30';
UPDATE public.assinantes SET data_criacao = '2026-04-30' WHERE data_criacao = '2026-04-29';