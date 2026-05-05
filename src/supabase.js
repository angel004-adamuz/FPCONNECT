import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jbweevldmqtoxeprpatj.supabase.co/rest/v1/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impid2VldmxkbXF0b3hlcHJwYXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzkzODUsImV4cCI6MjA5MzU1NTM4NX0.6OmViJxrkJHm6dAksUtosNOWL-GjfD6mTawVd6DN40k'

export const supabase = createClient(supabaseUrl, supabaseKey)