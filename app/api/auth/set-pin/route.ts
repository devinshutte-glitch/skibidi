import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { userId, pin } = await req.json()

  if (!userId || !pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'Invalid PIN format — must be exactly 4 digits' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const pinHash = await bcrypt.hash(pin, 10)

  const { error } = await supabase
    .from('users')
    .update({ pin_hash: pinHash })
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
