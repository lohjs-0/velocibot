import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Cliente admin — usa service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cliente normal — pra validar o token do usuário
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function DELETE(req: Request) {
  try {
    // ✅ Valida que quem está pedindo é o próprio usuário autenticado
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Deleta os dados do perfil primeiro (foreign key)
    await supabaseAdmin.from('user_profiles').delete().eq('id', user.id)
    await supabaseAdmin.from('messages').delete().eq('user_id', user.id)
    await supabaseAdmin.from('chats').delete().eq('user_id', user.id)

    // ✅ Deleta o usuário do Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro ao deletar conta:', error)
    return NextResponse.json({ error: 'Erro ao deletar conta' }, { status: 500 })
  }
}