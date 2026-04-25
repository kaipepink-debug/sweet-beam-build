export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      acessos: {
        Row: {
          created_at: string
          created_by: string
          data_criacao: string
          data_expiracao: string
          email_cliente: string
          ferramenta: string
          gmail_id: string | null
          id: string
          login: string
          senha: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          data_criacao?: string
          data_expiracao: string
          email_cliente: string
          ferramenta?: string
          gmail_id?: string | null
          id?: string
          login: string
          senha: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          data_criacao?: string
          data_expiracao?: string
          email_cliente?: string
          ferramenta?: string
          gmail_id?: string | null
          id?: string
          login?: string
          senha?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acessos_gmail_id_fkey"
            columns: ["gmail_id"]
            isOneToOne: false
            referencedRelation: "gmails"
            referencedColumns: ["id"]
          },
        ]
      }
      acessos_temporarios: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string
          ferramenta: string
          id: string
          login: string
          observacoes: string | null
          senha: string
          updated_at: string
          url_acesso: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by: string
          ferramenta: string
          id?: string
          login: string
          observacoes?: string | null
          senha: string
          updated_at?: string
          url_acesso?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string
          ferramenta?: string
          id?: string
          login?: string
          observacoes?: string | null
          senha?: string
          updated_at?: string
          url_acesso?: string | null
        }
        Relationships: []
      }
      assinantes: {
        Row: {
          created_at: string
          created_by: string
          data_criacao: string
          data_renovacao: string | null
          email: string
          id: string
          meio_pagamento: string | null
          nome: string
          plano: string | null
          produto: string
          proxima_cobranca: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          created_by: string
          data_criacao?: string
          data_renovacao?: string | null
          email: string
          id?: string
          meio_pagamento?: string | null
          nome: string
          plano?: string | null
          produto?: string
          proxima_cobranca?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          data_criacao?: string
          data_renovacao?: string | null
          email?: string
          id?: string
          meio_pagamento?: string | null
          nome?: string
          plano?: string | null
          produto?: string
          proxima_cobranca?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      banners_historico: {
        Row: {
          created_at: string
          created_by: string
          dados: Json | null
          ferramenta_id: string | null
          id: string
          imagem_url: string | null
          prompt_usado: string | null
          tipo: string
          titulo: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          dados?: Json | null
          ferramenta_id?: string | null
          id?: string
          imagem_url?: string | null
          prompt_usado?: string | null
          tipo: string
          titulo?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          dados?: Json | null
          ferramenta_id?: string | null
          id?: string
          imagem_url?: string | null
          prompt_usado?: string | null
          tipo?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banners_historico_ferramenta_id_fkey"
            columns: ["ferramenta_id"]
            isOneToOne: false
            referencedRelation: "ferramentas_banner"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_acesso: {
        Row: {
          dicloak_url: string
          id: string
          login: string
          senha: string
          totp_secret: string
          updated_at: string
          updated_by: string | null
          video_url: string
        }
        Insert: {
          dicloak_url?: string
          id?: string
          login?: string
          senha?: string
          totp_secret?: string
          updated_at?: string
          updated_by?: string | null
          video_url?: string
        }
        Update: {
          dicloak_url?: string
          id?: string
          login?: string
          senha?: string
          totp_secret?: string
          updated_at?: string
          updated_by?: string | null
          video_url?: string
        }
        Relationships: []
      }
      configuracoes_acesso_temp: {
        Row: {
          dicloak_url: string
          id: string
          login: string
          senha: string
          totp_secret: string
          updated_at: string
          updated_by: string | null
          video_url: string
        }
        Insert: {
          dicloak_url?: string
          id?: string
          login?: string
          senha?: string
          totp_secret?: string
          updated_at?: string
          updated_by?: string | null
          video_url?: string
        }
        Update: {
          dicloak_url?: string
          id?: string
          login?: string
          senha?: string
          totp_secret?: string
          updated_at?: string
          updated_by?: string | null
          video_url?: string
        }
        Relationships: []
      }
      ferramentas_banner: {
        Row: {
          cor_tema: string | null
          created_at: string
          id: string
          logo_url: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          cor_tema?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          cor_tema?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      ferramentas_fornecedor: {
        Row: {
          created_at: string
          ferramenta: string
          id: string
          updated_at: string
          updated_by: string
          url: string
        }
        Insert: {
          created_at?: string
          ferramenta: string
          id?: string
          updated_at?: string
          updated_by: string
          url?: string
        }
        Update: {
          created_at?: string
          ferramenta?: string
          id?: string
          updated_at?: string
          updated_by?: string
          url?: string
        }
        Relationships: []
      }
      gmails: {
        Row: {
          created_at: string
          created_by: string
          email_recuperacao: string | null
          gmail: string
          id: string
          senha: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email_recuperacao?: string | null
          gmail: string
          id?: string
          senha: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email_recuperacao?: string | null
          gmail?: string
          id?: string
          senha?: string
          updated_at?: string
        }
        Relationships: []
      }
      gmails_utilizados: {
        Row: {
          created_at: string
          ferramenta: string
          gmail_email: string
          gmail_id: string
          id: string
        }
        Insert: {
          created_at?: string
          ferramenta: string
          gmail_email: string
          gmail_id: string
          id?: string
        }
        Update: {
          created_at?: string
          ferramenta?: string
          gmail_email?: string
          gmail_id?: string
          id?: string
        }
        Relationships: []
      }
      pixels: {
        Row: {
          api_token: string
          created_at: string
          enabled: boolean
          id: string
          pixel_id: string
          platform: string
          updated_at: string
        }
        Insert: {
          api_token?: string
          created_at?: string
          enabled?: boolean
          id?: string
          pixel_id?: string
          platform: string
          updated_at?: string
        }
        Update: {
          api_token?: string
          created_at?: string
          enabled?: boolean
          id?: string
          pixel_id?: string
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_permissions: {
        Row: {
          acesso_clientes: boolean
          analytics: boolean
          assinaturas: boolean
          clientes: boolean
          configuracoes: boolean
          created_at: string
          dashboard: boolean
          email_acesso: boolean
          equipe: boolean
          ferramentas_ia: boolean
          financeiro: boolean
          gerar_avisos: boolean
          id: string
          pixels: boolean
          updated_at: string
          user_id: string
          vendas: boolean
        }
        Insert: {
          acesso_clientes?: boolean
          analytics?: boolean
          assinaturas?: boolean
          clientes?: boolean
          configuracoes?: boolean
          created_at?: string
          dashboard?: boolean
          email_acesso?: boolean
          equipe?: boolean
          ferramentas_ia?: boolean
          financeiro?: boolean
          gerar_avisos?: boolean
          id?: string
          pixels?: boolean
          updated_at?: string
          user_id: string
          vendas?: boolean
        }
        Update: {
          acesso_clientes?: boolean
          analytics?: boolean
          assinaturas?: boolean
          clientes?: boolean
          configuracoes?: boolean
          created_at?: string
          dashboard?: boolean
          email_acesso?: boolean
          equipe?: boolean
          ferramentas_ia?: boolean
          financeiro?: boolean
          gerar_avisos?: boolean
          id?: string
          pixels?: boolean
          updated_at?: string
          user_id?: string
          vendas?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vturb_config: {
        Row: {
          id: string
          player_id: string
          script_url: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          player_id: string
          script_url: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          player_id?: string
          script_url?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
