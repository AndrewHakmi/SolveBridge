import { useEffect, useState } from 'react'

import { getComplianceProfile, upsertComplianceProfile } from '@/api/client'
import { Page, PageHeader } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { labelForRole, useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [pdnConsent, setPdnConsent] = useState(false)
  const [npdStatus, setNpdStatus] = useState<'unknown' | 'pending' | 'verified' | 'not_required'>('unknown')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setErr(null)
    getComplianceProfile(user.id)
      .then((p) => {
        if (!p) return
        setPdnConsent(Boolean(p.pdn_consent))
        const v = String(p.npd_status || 'unknown') as any
        setNpdStatus(v)
      })
      .catch(() => {})
  }, [user?.id])

  return (
    <Page>
      <PageHeader
        title="Профиль"
        subtitle="Личные данные. Для работы платформы нужны согласие 152‑ФЗ и статус самозанятого (422‑ФЗ)." 
      />

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">Текущий пользователь</div>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <div className="text-sm">Имя: {user.name}</div>
              <div className="text-sm">Email: {user.email}</div>
              <div className="text-sm">Роль: {labelForRole(user.role)}</div>
              <div className="text-xs text-[#9FB0D0]">id: {user.id}</div>
              <Button variant="danger" type="button" onClick={() => logout()}>
                Выйти
              </Button>
            </div>
          ) : (
            <div className="text-sm text-[#9FB0D0]">Не авторизован</div>
          )}
        </CardContent>
      </Card>

      {user ? (
        <Card className="mt-4">
          <CardHeader>
            <div className="text-sm font-medium">Документы и согласия</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={pdnConsent}
                    onChange={(e) => setPdnConsent(e.target.checked)}
                  />
                  <div>
                    <div className="text-sm font-medium">Согласие на обработку персональных данных (152‑ФЗ)</div>
                    <div className="mt-1 text-xs text-[#9FB0D0]">Без этого нельзя назначить исполнителя на задачу.</div>
                  </div>
                </label>
              </div>

              <div className="rounded-xl bg-[#0F1830] p-3 ring-1 ring-[#1E2A44]">
                <div className="text-sm font-medium">Статус самозанятого (422‑ФЗ)</div>
                <div className="mt-2">
                  <select
                    className="w-full rounded-lg bg-[#111A2E] px-3 py-2 text-sm ring-1 ring-[#1E2A44] outline-none"
                    value={npdStatus}
                    onChange={(e) => setNpdStatus(e.target.value as any)}
                  >
                    <option value="unknown">Не указан</option>
                    <option value="pending">В процессе</option>
                    <option value="verified">Подтверждён</option>
                    <option value="not_required">Не требуется</option>
                  </select>
                </div>
                <div className="mt-1 text-xs text-[#9FB0D0]">MVP: подтверждение ставится вручную.</div>
              </div>

              {err ? <Alert tone="danger">{err}</Alert> : null}
              {msg ? <Alert tone="success">{msg}</Alert> : null}

              <Button
                variant="primary"
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!user) return
                  setErr(null)
                  setMsg(null)
                  setBusy(true)
                  try {
                    await upsertComplianceProfile({
                      user_id: user.id,
                      npd_status: npdStatus,
                      pdn_consent: pdnConsent,
                      metadata: {},
                    })
                    setMsg('Сохранено')
                  } catch (e: unknown) {
                    setErr(getErrorMessage(e, 'Не удалось сохранить'))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {busy ? 'Сохраняю…' : 'Сохранить'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </Page>
  )
}
