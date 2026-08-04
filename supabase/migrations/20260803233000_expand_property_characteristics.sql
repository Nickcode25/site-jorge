begin;

insert into public.caracteristicas (id, nome, categoria, tipos_aplicaveis) values
  ('aquecimento_eletrico', 'Aquecimento elétrico', 'interna', array['apartamento','cobertura','sala']),
  ('aquecimento_gas', 'Aquecimento a gás', 'interna', array['apartamento','cobertura','sala']),
  ('conexao_internet_fibra', 'Conexão internet (fibra)', 'interna', array['apartamento','cobertura','sala']),
  ('deposito_despensa', 'Depósito / Despensa', 'interna', array['apartamento','cobertura','sala']),
  ('escritorio_home_office', 'Escritório / Home office', 'interna', array['apartamento','cobertura','sala']),
  ('janelas_antirruido', 'Janelas antirruído', 'interna', array['apartamento','cobertura','sala']),
  ('lavanderia', 'Lavanderia', 'interna', array['apartamento','cobertura','sala']),
  ('piso_laminado', 'Piso laminado', 'interna', array['apartamento','cobertura','sala']),
  ('piso_porcelanato', 'Piso porcelanato', 'interna', array['apartamento','cobertura','sala']),
  ('rouparia', 'Rouparia', 'interna', array['apartamento','cobertura','sala']),
  ('terraco_gourmet', 'Terraço gourmet', 'interna', array['apartamento','cobertura','sala']),
  ('vista_mar', 'Vista para o mar', 'interna', array['apartamento','cobertura','sala']),
  ('vista_montanha', 'Vista para montanha', 'interna', array['apartamento','cobertura','sala']),
  ('vista_panoramica', 'Vista panorâmica', 'interna', array['apartamento','cobertura','sala']),
  ('bicicletario', 'Bicicletário', 'externa', array['apartamento','cobertura']),
  ('cftv', 'Circuito interno de TV (CFTV)', 'externa', array['apartamento','cobertura']),
  ('coworking', 'Coworking', 'externa', array['apartamento','cobertura']),
  ('espaco_gourmet', 'Espaço gourmet', 'externa', array['apartamento','cobertura']),
  ('espaco_pet', 'Espaço pet', 'externa', array['apartamento','cobertura']),
  ('gerador', 'Gerador', 'externa', array['apartamento','cobertura']),
  ('playground', 'Playground', 'externa', array['apartamento','cobertura']),
  ('portaria_24h', 'Portaria 24h', 'externa', array['apartamento','cobertura']),
  ('quadra_poliesportiva', 'Quadra poliesportiva', 'externa', array['apartamento','cobertura']),
  ('sistema_energia_solar', 'Sistema de energia solar', 'externa', array['apartamento','cobertura']),
  ('aceita_financiamento', 'Aceita financiamento', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('aceita_permuta', 'Aceita permuta', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('documentacao_regularizada', 'Documentação regularizada', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('mobiliado', 'Mobiliado', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('proximo_comercio_escolas', 'Próximo a comércio/escolas', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('proximo_transporte_publico', 'Próximo a transporte público', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio']),
  ('semimobiliado', 'Semimobiliado', 'geral', array['apartamento','casa','chacara','cobertura','galpao','loja','lote','lote_condominio','predio','sala','sitio'])
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  tipos_aplicaveis = excluded.tipos_aplicaveis;

commit;
