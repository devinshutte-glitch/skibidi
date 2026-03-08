import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createServiceClient()

  const { data: badges, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', params.userId)
    .order('earned_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ badges: badges || [] })
}
