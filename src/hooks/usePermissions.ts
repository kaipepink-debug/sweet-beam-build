import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface TeamPermissions {
  dashboard: boolean;
  financeiro: boolean;
  vendas: boolean;
  assinaturas: boolean;
  clientes: boolean;
  email_acesso: boolean;
  ferramentas_ia: boolean;
  gerar_avisos: boolean;
  acesso_clientes: boolean;
  pixels: boolean;
  analytics: boolean;
  configuracoes: boolean;
  equipe: boolean;
  is_afiliado: boolean;
}

const defaultPermissions: TeamPermissions = {
  dashboard: false,
  financeiro: false,
  vendas: false,
  assinaturas: false,
  clientes: false,
  email_acesso: true,
  ferramentas_ia: true,
  gerar_avisos: false,
  acesso_clientes: false,
  pixels: false,
  analytics: false,
  configuracoes: false,
  equipe: false,
  is_afiliado: false,
};

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<TeamPermissions>(defaultPermissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions(defaultPermissions);
      setLoading(false);
      return;
    }

    supabase
      .from("team_permissions")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPermissions({
            dashboard: data.dashboard,
            financeiro: data.financeiro,
            vendas: data.vendas,
            assinaturas: data.assinaturas,
            clientes: data.clientes,
            email_acesso: (data as any).email_acesso ?? true,
            ferramentas_ia: data.ferramentas_ia,
            gerar_avisos: (data as any).gerar_avisos ?? false,
            acesso_clientes: (data as any).acesso_clientes ?? false,
            pixels: (data as any).pixels ?? false,
            analytics: data.analytics,
            configuracoes: data.configuracoes,
            equipe: data.equipe,
            is_afiliado: (data as any).is_afiliado ?? false,
          });
        }
        setLoading(false);
      });
  }, [user]);

  return { permissions, loading };
}
