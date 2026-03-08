import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { userId, pin } = await req.json()

  if (!userId || !pin) {
    return NextResponse.json({ error: 'Missing userId or pin' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const valid = await bcrypt.compare(pin, user.pin_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
  }

  // Return user without pin_hash
  const { pin_hash: _, ...safeUser } = user
  return NextResponse.json({ user: safeUser })
}
