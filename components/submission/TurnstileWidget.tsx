'use client'

import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: () => void
}

export function TurnstileWidget({ onVerify, onError }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) {
    return (
      <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        验证码未配置（开发模式）
      </div>
    )
  }

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onVerify}
      onError={onError}
      options={{ theme: 'light', language: 'zh-cn' }}
    />
  )
}
