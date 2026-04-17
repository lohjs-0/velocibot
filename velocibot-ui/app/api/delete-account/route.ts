import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function DELETE(req: Request) {
  const { userId } = await req.json()

  if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

  await supabase.auth.admin.deleteUser(userId)

  return NextResponse.json({ ok: true })
}