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
  analytics: boolean;
  configuracoes: boolean;
  equipe: boolean;
}

const defaultPermissions: TeamPermissions = {
  dashboard: false,
  financeiro: false,
  vendas: false,
  assinaturas: false,
  clientes: false,
  email_acesso: true,
  ferramentas_ia: true,
  analytics: false,
  configuracoes: false,
  equipe: false,
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
            analytics: data.analytics,
            configuracoes: data.configuracoes,
            equipe: data.equipe,
          });
        }
        setLoading(false);
      });
  }, [user]);

  return { permissions, loading };
}
