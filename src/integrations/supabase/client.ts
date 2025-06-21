// Este arquivo é gerado automaticamente. Não edite diretamente.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// URL do projeto Supabase
const SUPABASE_URL = "https://tkwttdjpkynqprszlmmr.supabase.co";
// Chave pública do projeto Supabase (não é secreta)
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd3R0ZGpwa3lucXByc3psbW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjU1NjEsImV4cCI6MjA2NTg0MTU2MX0._nj90k5DdOSrscu1iwdr1Fmp34gjCRuLa0hSK-ktGSk";

// Importe o cliente supabase assim:
// import { supabase } from "@/integrations/supabase/client";

// Criação e exportação do cliente Supabase com tipagem do banco de dados
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
