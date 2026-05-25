import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  CheckSquare,
  Eye,
  EyeOff,
  GraduationCap,
  LogIn,
  Square,
  UserPlus,
} from 'lucide-react'

import {
  createUser,
  createStudentVerification,
  listOrganizations,
  type OrganizationOut,
} from '@/api/client'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore, type UserRole } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'
import { getCachedUser, setCachedUser, checkUserCred } from '@/utils/userCache'
import { checkPartnerCred, checkCompanyCred } from '@/utils/partnerCreds'
import { checkMentorCred } from '@/utils/mentorRegistry'

const ADMIN_EMAIL = 'admin@proektoria.ru'
const ADMIN_PASSWORD = 'Proektoria2024!'

const allRoles: Array<{
  value: UserRole
  icon: (active: boolean) => React.ReactNode
  label: string
  hint: string
  activeBg: string
  activeRing: string
  activeText: string
}> = [
  {
    value: 'student',
    icon: (a) => <GraduationCap className={`h-4 w-4 shrink-0 ${a ? 'text-[#6C8CFF]' : 'text-[#9FB0D0]'}`} />,
    label: 'Студент',
    hint: 'Учусь в вузе, выполняю задачи, подтверждаю статус через университет',
    activeBg: 'bg-[#6C8CFF]/10',
    activeRing: 'ring-[#6C8CFF]/50',
    activeText: 'text-[#6C8CFF]',
  },
  {
    value: 'executor',
    icon: (a) => <Briefcase className={`h-4 w-4 shrink-0 ${a ? 'text-[#3DDC97]' : 'text-[#9FB0D0]'}`} />,
    label: 'Исполнитель',
    hint: 'Выполняю задачи, не привязан к конкретному вузу',
    activeBg: 'bg-[#3DDC97]/10',
    activeRing: 'ring-[#3DDC97]/40',
    activeText: 'text-[#3DDC97]',
  },
  {
    value: 'client',
    icon: (a) => <Building2 className={`h-4 w-4 shrink-0 ${a ? 'text-[#FF9F43]' : 'text-[#9FB0D0]'}`} />,
    label: 'Заказчик',
    hint: 'Ставлю задачи компании и выбираю исполнителя',
    activeBg: 'bg-[#FF9F43]/10',
    activeRing: 'ring-[#FF9F43]/40',
    activeText: 'text-[#FF9F43]',
  },
]

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Пароль'}
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB0D0] hover:text-white transition"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPassword2, setRegPassword2] = useState('')
  const [regName, setRegName] = useState('')
  const [regRole, setRegRole] = useState<UserRole>('student')
  const [selectedUniIds, setSelectedUniIds] = useState<string[]>([])
  const [executorUniText, setExecutorUniText] = useState('')

  const [universities, setUniversities] = useState<OrganizationOut[]>([])
  const [unisLoading, setUnisLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  useEffect(() => {
    setUnisLoading(true)
    listOrganizations({ type: 'university' })
      .then(setUniversities)
      .catch(() => {})
      .finally(() => setUnisLoading(false))
  }, [])

  function switchTab(t: 'login' | 'register') {
    setTab(t)
    setErr(null)
  }

  function toggleUni(id: string) {
    setSelectedUniIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const vEmail = loginEmail.trim().toLowerCase()
    if (!vEmail || !loginPassword) return

    setBusy(true)
    try {
      // Admin
      if (vEmail === ADMIN_EMAIL) {
        if (loginPassword !== ADMIN_PASSWORD) { setErr('Неверный пароль'); return }
        login({ id: 'admin-fixed', email: ADMIN_EMAIL, name: 'Администратор', role: 'admin' })
        navigate(from); return
      }
      // Partner
      const partnerCred = checkPartnerCred(vEmail, loginPassword)
      if (partnerCred) {
        login({ id: partnerCred.orgId, email: vEmail, name: partnerCred.orgName, role: 'partner' })
        navigate('/partner-cabinet'); return
      }
      // Company
      const companyCred = checkCompanyCred(vEmail, loginPassword)
      if (companyCred) {
        login({ id: companyCred.companyId, email: vEmail, name: companyCred.companyName, role: 'company' })
        navigate('/company-cabinet'); return
      }
      // Mentor (registered by partner/company)
      const mentorEntry = checkMentorCred(vEmail, loginPassword)
      if (mentorEntry) {
        login({ id: mentorEntry.userId, email: vEmail, name: mentorEntry.name, role: 'mentor' })
        navigate(from); return
      }
      // Regular user
      const cached = checkUserCred(vEmail, loginPassword)
      if (!cached) {
        setErr('Неверный email или пароль. Ещё не зарегистрированы?')
        return
      }
      login(cached)
      navigate(from)
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Ошибка входа'))
    } finally {
      setBusy(false)
    }
  }

  // ── REGISTER ───────────────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const vEmail = regEmail.trim().toLowerCase()
    const vName = regName.trim()
    if (!vEmail || !vName || !regPassword) return
    if (regPassword !== regPassword2) { setErr('Пароли не совпадают'); return }
    if (regPassword.length < 6) { setErr('Пароль должен быть не короче 6 символов'); return }
    if (getCachedUser(vEmail)) { setErr('Этот email уже зарегистрирован — войдите через вкладку «Войти»'); return }

    setBusy(true)
    try {
      const created = await createUser({ email: vEmail, display_name: vName })

      if (regRole === 'student' && selectedUniIds.length > 0) {
        await Promise.allSettled(
          selectedUniIds.map((uniId) =>
            createStudentVerification({ student_id: created.id, university_org_id: uniId }),
          ),
        )
      }

      const authUser = {
        id: created.id,
        email: created.email,
        name: vName,
        role: regRole,
        universityOrgIds: regRole === 'student' ? selectedUniIds : undefined,
        universityText: regRole === 'executor' ? (executorUniText.trim() || undefined) : undefined,
        password: regPassword,
      }
      setCachedUser(authUser)
      login(authUser)
      navigate(from)
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Ошибка регистрации'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1320px] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-[540px] overflow-hidden">

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="flex border-b border-[#1E2A44]">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                tab === t
                  ? 'border-b-2 border-[#6C8CFF] text-white'
                  : 'text-[#9FB0D0] hover:text-white'
              }`}
            >
              {t === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          ))}
        </div>

        <CardContent className="pt-6">

          {/* ══════════════ LOGIN TAB ══════════════ */}
          {tab === 'login' && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Email</div>
                <Input
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setErr(null) }}
                  placeholder="name@university.ru"
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Пароль</div>
                <PasswordInput
                  value={loginPassword}
                  onChange={(v) => { setLoginPassword(v); setErr(null) }}
                />
              </div>

              {err && <Alert tone="danger">{err}</Alert>}

              <Button
                variant="primary"
                type="submit"
                className="w-full"
                disabled={busy || !loginEmail.trim() || !loginPassword}
              >
                {busy ? 'Вхожу…' : <><LogIn className="mr-1.5 h-4 w-4" />Войти</>}
              </Button>

              <div className="text-center text-xs text-[#9FB0D0]">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="text-[#6C8CFF] hover:underline"
                >
                  Зарегистрируйтесь
                </button>
              </div>
            </form>
          )}

          {/* ══════════════ REGISTER TAB ══════════════ */}
          {tab === 'register' && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Email</div>
                <Input
                  value={regEmail}
                  onChange={(e) => { setRegEmail(e.target.value); setErr(null) }}
                  placeholder="name@university.ru"
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Имя</div>
                <Input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Например: Анна"
                  autoComplete="name"
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Пароль</div>
                <PasswordInput
                  value={regPassword}
                  onChange={(v) => { setRegPassword(v); setErr(null) }}
                  placeholder="Минимум 6 символов"
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">Повторите пароль</div>
                <PasswordInput
                  value={regPassword2}
                  onChange={(v) => { setRegPassword2(v); setErr(null) }}
                  placeholder="Повторите пароль"
                />
              </div>

              {/* Role selection */}
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[#9FB0D0]">
                  Кто вы на платформе?
                </div>
                <div className="space-y-2">
                  {allRoles.map((o) => {
                    const active = regRole === o.value
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setRegRole(o.value)}
                        className={`w-full text-left rounded-xl p-3 ring-1 transition ${
                          active
                            ? `${o.activeBg} ${o.activeRing}`
                            : 'bg-[#0F1830] ring-[#1E2A44] hover:ring-[#1E2A44]/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {o.icon(active)}
                          <span className="text-sm font-semibold">{o.label}</span>
                          {active && (
                            <span className={`ml-auto text-[10px] font-medium uppercase tracking-wide ${o.activeText}`}>
                              Выбрано
                            </span>
                          )}
                        </div>
                        <div className="mt-1 ml-6 text-xs text-[#9FB0D0]">{o.hint}</div>

                        {/* Student: university checkboxes */}
                        {active && o.value === 'student' && (
                          <div className="mt-3 ml-6 space-y-1" onClick={(ev) => ev.stopPropagation()}>
                            <div className="mb-1.5 text-[11px] text-[#9FB0D0]">
                              Выберите ваш вуз (один или несколько):
                            </div>
                            {unisLoading ? (
                              <div className="text-xs text-[#9FB0D0]">Загружаю список вузов…</div>
                            ) : universities.length === 0 ? (
                              <div className="rounded-lg bg-[#111A2E] px-3 py-2 text-xs text-[#9FB0D0] ring-1 ring-[#1E2A44]">
                                Вузы-партнёры ещё не зарегистрированы — добавите в профиле позже.
                              </div>
                            ) : (
                              universities.map((u) => {
                                const checked = selectedUniIds.includes(u.id)
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => toggleUni(u.id)}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ring-1 transition ${
                                      checked
                                        ? 'bg-[#6C8CFF]/15 ring-[#6C8CFF]/40 text-white'
                                        : 'bg-[#111A2E] ring-[#1E2A44] text-[#9FB0D0] hover:ring-[#6C8CFF]/20'
                                    }`}
                                  >
                                    {checked
                                      ? <CheckSquare className="h-3.5 w-3.5 shrink-0 text-[#6C8CFF]" />
                                      : <Square className="h-3.5 w-3.5 shrink-0 text-[#9FB0D0]" />}
                                    <span className="truncate">{u.name}</span>
                                    {u.region && (
                                      <span className="ml-auto shrink-0 text-[#9FB0D0]">{u.region}</span>
                                    )}
                                  </button>
                                )
                              })
                            )}
                            {selectedUniIds.length > 0 && (
                              <div className="pt-1 text-[10px] text-[#6C8CFF]">
                                Выбрано {selectedUniIds.length}. Запросы на верификацию отправятся автоматически.
                              </div>
                            )}
                          </div>
                        )}

                        {/* Executor: free-text university */}
                        {active && o.value === 'executor' && (
                          <div className="mt-3 ml-6" onClick={(ev) => ev.stopPropagation()}>
                            <div className="mb-1.5 text-[11px] text-[#9FB0D0]">
                              Университет (необязательно):
                            </div>
                            <Input
                              value={executorUniText}
                              onChange={(e) => setExecutorUniText(e.target.value)}
                              placeholder="Например: КФУ, МГУ, не учусь…"
                            />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {err && <Alert tone="danger">{err}</Alert>}

              <Button
                variant="primary"
                type="submit"
                className="w-full"
                disabled={busy || !regEmail.trim() || !regName.trim() || !regPassword}
              >
                {busy ? 'Регистрирую…' : <><UserPlus className="mr-1.5 h-4 w-4" />Зарегистрироваться</>}
              </Button>

              <div className="text-center text-xs text-[#9FB0D0]">
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-[#6C8CFF] hover:underline"
                >
                  Войти
                </button>
              </div>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
