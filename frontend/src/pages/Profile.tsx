import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, GraduationCap, XCircle } from 'lucide-react'

import {
  getComplianceProfile,
  upsertComplianceProfile,
  listOrganizations,
  createStudentVerification,
  listStudentVerifications,
  type OrganizationOut,
  type StudentVerificationOut,
} from '@/api/client'
import { Page, PageHeader } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { labelForRole, useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'

function verificationStatusBadge(status: string) {
  if (status === 'approved')
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-[#3DDC97]"><CheckCircle2 className="h-3.5 w-3.5" />Подтверждён</span>
  if (status === 'rejected')
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-[#FF5A6A]"><XCircle className="h-3.5 w-3.5" />Отклонён</span>
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6C8CFF]"><Clock className="h-3.5 w-3.5" />На проверке</span>
}

function StudentVerificationSection({ userId }: { userId: string }) {
  const [universities, setUniversities] = useState<OrganizationOut[]>([])
  const [verifications, setVerifications] = useState<StudentVerificationOut[]>([])
  const [selectedUni, setSelectedUni] = useState('')
  const [docRef, setDocRef] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    const [unis, vers] = await Promise.all([
      listOrganizations({ type: 'university' }).catch(() => [] as OrganizationOut[]),
      listStudentVerifications(userId).catch(() => [] as StudentVerificationOut[]),
    ])
    setUniversities(unis)
    setVerifications(vers)
    if (unis.length > 0 && !selectedUni) setSelectedUni(unis[0].id)
  }

  useEffect(() => { load() }, [userId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUni) return
    setErr(null)
    setMsg(null)
    setBusy(true)
    try {
      const created = await createStudentVerification({
        student_id: userId,
        university_org_id: selectedUni,
        document_ref: docRef.trim() || null,
      })
      setVerifications((prev) => [created, ...prev])
      setDocRef('')
      setMsg('Заявка отправлена. Вуз рассмотрит её в ближайшее время.')
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось отправить заявку'))
    } finally {
      setBusy(false)
    }
  }

  const hasPending = verifications.some((v) => v.status === 'pending' && v.university_org_id === selectedUni)
  const isApproved = verifications.some((v) => v.status === 'approved')

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[#6C8CFF]" />
          <div className="text-sm font-medium">Верификация студента вузом-партнёром</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isApproved && (
            <Alert tone="success">Ваш статус студента подтверждён вузом-партнёром.</Alert>
          )}

          {/* Existing verifications */}
          {verifications.length > 0 && (
            <div className="space-y-2">
              {verifications.map((v) => {
                const uni = universities.find((u) => u.id === v.university_org_id)
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-xl bg-[#0F1830] px-3 py-2 ring-1 ring-[#1E2A44]">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{uni?.name ?? v.university_org_id}</div>
                      {v.document_ref && (
                        <div className="text-xs text-[#9FB0D0] truncate">{v.document_ref}</div>
                      )}
                      <div className="text-[10px] text-[#9FB0D0]">
                        {v.created_at ? new Date(v.created_at).toLocaleDateString('ru-RU') : ''}
                      </div>
                    </div>
                    <div className="ml-3 shrink-0">{verificationStatusBadge(v.status)}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Submit form */}
          {!isApproved && (
            <form className="space-y-3 pt-1" onSubmit={submit}>
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Вуз-партнёр</div>
                {universities.length === 0 ? (
                  <div className="text-sm text-[#9FB0D0]">Нет зарегистрированных вузов-партнёров</div>
                ) : (
                  <select
                    className="w-full rounded-lg bg-[#111A2E] px-3 py-2 text-sm ring-1 ring-[#1E2A44] outline-none"
                    value={selectedUni}
                    onChange={(e) => setSelectedUni(e.target.value)}
                  >
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Ссылка на документ / номер студенческого (необязательно)</div>
                <Input
                  value={docRef}
                  onChange={(e) => setDocRef(e.target.value)}
                  placeholder="Номер студенческого или ссылка…"
                />
              </div>
              {err && <Alert tone="danger">{err}</Alert>}
              {msg && <Alert tone="success">{msg}</Alert>}
              <Button
                variant="primary"
                type="submit"
                disabled={busy || !selectedUni || hasPending || universities.length === 0}
              >
                {busy ? 'Отправляю…' : hasPending ? 'Заявка уже отправлена' : 'Отправить заявку'}
              </Button>
              {hasPending && (
                <div className="text-xs text-[#9FB0D0]">
                  Заявка в этот вуз уже находится на рассмотрении.
                </div>
              )}
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

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
        setNpdStatus((p.npd_status as 'unknown' | 'pending' | 'verified' | 'not_required') || 'unknown')
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
                    onChange={(e) => setNpdStatus(e.target.value as 'unknown' | 'pending' | 'verified' | 'not_required')}
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

      {user?.role === 'student' && <StudentVerificationSection userId={user.id} />}
    </Page>
  )
}
