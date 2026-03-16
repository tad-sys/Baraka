import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubtmteicmabuymlmkwiu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidG10ZWljbWFidXltbG1rd2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDgzMjEsImV4cCI6MjA4ODgyNDMyMX0.V8eet7Jl2NDAQOvHh3CtHQ_NZamc7xeRBlHgid-bLy4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)