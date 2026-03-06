export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const formData = new FormData()
  formData.append('secret', process.env.TURNSTILE_SECRET_KEY!)
  formData.append('response', token)
  if (ip) formData.append('remoteip', ip)

  const result = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: formData }
  )

  const outcome = await result.json()
  if (!outcome.success) {
    console.error('[Turnstile] verification failed:', JSON.stringify(outcome))
  }
  return outcome.success === true
}
