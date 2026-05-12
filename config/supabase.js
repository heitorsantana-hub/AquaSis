// config/supabase.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltam as variáveis de ambiente do Supabase!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
