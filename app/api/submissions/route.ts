import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTurnstile } from '@/lib/turnstile'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, url, description, category_id, submitter_name, submitter_email, turnstile_token } = body

  // Validate required fields
  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: '标题和链接为必填项' }, { status: 400 })
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: '请输入有效的链接地址' }, { status: 400 })
  }

  // Verify Turnstile captcha
  if (!turnstile_token) {
    return NextResponse.json({ error: '请完成验证码' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
  const captchaValid = await verifyTurnstile(turnstile_token, ip)
  if (!captchaValid) {
    return NextResponse.json({ error: '验证码验证失败，请重试' }, { status: 400 })
  }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('submissions')
    .insert({
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() ?? null,
      category_id: category_id ?? null,
      submitter_name: submitter_name?.trim() ?? null,
      submitter_email: submitter_email?.trim() ?? null,
      ip_address: ip ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
