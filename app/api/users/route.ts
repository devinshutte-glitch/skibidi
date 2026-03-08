import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, role, avatar, colour_theme, age')
    .order('role', { ascending: false }) // parent last

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: users || [] })
}
