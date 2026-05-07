import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'

import { listCapabilities, type CapabilityOut } from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { getErrorMessage } from '@/utils/errors'

function ProficiencyBar({ value }: { value: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-[#1E2A44]">
        <div
          className="h-1.5 rounded-full bg-[#6C8CFF] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs text-[#9FB0D0]">{pct}%</span>
    </div>
  )
}

export default function TalentProfile() {
  const { id } = useParams()

  const [capabilities, setCapabilities] = useState<CapabilityOut[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let alive = true
    setLoading(true)
    setErr(null)
    listCapabilities({ entity_type: 'user', entity_id: id })
      .then((caps) => { if (alive) setCapabilities(caps) })
      .catch((e: unknown) => { if (alive) setErr(getErrorMessage(e, 'Ошибка загрузки')) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id])

  return (
    <Page>
      <PageHeader
        title="Профиль сотрудника"
        subtitle={id ? `User id: ${id}` : undefined}
        right={
          <Link to="/talent">
            <Button variant="ghost" type="button">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
        }
      />

      <TwoCol
        main={
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#6C8CFF]" />
                <div className="text-sm font-medium">Навыки (Capability Graph)</div>
              </div>
            </CardHeader>
            <CardContent>
              {err ? (
                <Alert tone="danger">{err}</Alert>
              ) : loading ? (
                <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
              ) : capabilities.length === 0 ? (
                <div className="text-sm text-[#9FB0D0]">
                  Нет зафиксированных навыков для этого пользователя.
                </div>
              ) : (
                <div className="space-y-3">
                  {capabilities.map((c) => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">skill #{c.skill_id}</span>
                        <Badge tone="accent">{c.entity_type}</Badge>
                      </div>
                      <ProficiencyBar value={c.proficiency_level} />
                      <div className="text-xs text-[#9FB0D0] truncate">
                        evidence: {c.evidence_artifact_id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        }
        aside={
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="text-sm font-medium">Действия</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link
                    to="/talent"
                    className="block text-sm text-[#6C8CFF] hover:underline"
                  >
                    Добавить навык
                  </Link>
                  <Link
                    to="/knowledge"
                    className="block text-sm text-[#6C8CFF] hover:underline"
                  >
                    Перейти к артефактам
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-sm font-medium">Сводка</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-[#9FB0D0]">
                  <div>Навыков: {capabilities.length}</div>
                  {capabilities.length > 0 ? (
                    <div>
                      Средний уровень:{' '}
                      {(
                        capabilities.reduce((s, c) => s + c.proficiency_level, 0) /
                        capabilities.length
                      ).toFixed(2)}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
    </Page>
  )
}
