import { useEffect, useState } from 'react'
import { BadgeCheck, RefreshCw, Users } from 'lucide-react'

import { listCapabilities, upsertCapability, type CapabilityOut } from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/utils/errors'

export default function TalentDirectory() {
  const [entityType, setEntityType] = useState<'user' | 'team'>('user')
  const [entityId, setEntityId] = useState<string>(String(crypto.randomUUID()))
  const [skillCode, setSkillCode] = useState('fastapi')
  const [skillName, setSkillName] = useState('FastAPI')
  const [level, setLevel] = useState('0.75')
  const [evidenceArtifactId, setEvidenceArtifactId] = useState<string>(
    String(crypto.randomUUID()),
  )
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [capabilities, setCapabilities] = useState<CapabilityOut[]>([])
  const [loadingCaps, setLoadingCaps] = useState(true)
  const [capsErr, setCapsErr] = useState<string | null>(null)

  function fetchCaps() {
    setLoadingCaps(true)
    setCapsErr(null)
    listCapabilities()
      .then(setCapabilities)
      .catch((e: unknown) => setCapsErr(getErrorMessage(e, 'Ошибка загрузки')))
      .finally(() => setLoadingCaps(false))
  }

  useEffect(() => { fetchCaps() }, [])

  return (
    <Page>
      <PageHeader
        title="Таланты и навыки"
        subtitle="Capability Graph: обновление навыков только через evidence-артефакт."
      />

      <TwoCol
        main={
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#6C8CFF]" />
                <div className="text-sm font-medium">Upsert skill edge</div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setErr(null)
                  setOk(null)
                  setBusy(true)
                  try {
                    const out = await upsertCapability({
                      entity_type: entityType,
                      entity_id: entityId.trim(),
                      skill_code: skillCode.trim(),
                      skill_name: skillName.trim(),
                      proficiency_level: Number(level) || 0,
                      evidence_artifact_id: evidenceArtifactId.trim(),
                    })
                    setOk(`OK: edge ${out.id} (skill_id=${out.skill_id})`)
                    fetchCaps()
                  } catch (e: unknown) {
                    setErr(getErrorMessage(e, 'Не удалось обновить компетенцию'))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">entity_type</div>
                    <select
                      className="h-10 w-full rounded-lg bg-[#0F1830] px-3 text-sm ring-1 ring-[#1E2A44] focus:outline-none focus:ring-2 focus:ring-[#6C8CFF]"
                      value={entityType}
                      onChange={(e) =>
                        setEntityType(e.target.value === 'team' ? 'team' : 'user')
                      }
                    >
                      <option value="user">user</option>
                      <option value="team">team</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-1 text-xs text-[#9FB0D0]">entity_id</div>
                    <Input value={entityId} onChange={(e) => setEntityId(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">skill_code</div>
                    <Input value={skillCode} onChange={(e) => setSkillCode(e.target.value)} />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">skill_name</div>
                    <Input value={skillName} onChange={(e) => setSkillName(e.target.value)} />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">proficiency_level</div>
                    <Input value={level} onChange={(e) => setLevel(e.target.value)} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">evidence_artifact_id</div>
                  <Input
                    value={evidenceArtifactId}
                    onChange={(e) => setEvidenceArtifactId(e.target.value)}
                  />
                </div>

                {err ? <Alert tone="danger">{err}</Alert> : null}
                {ok ? <Alert tone="success">{ok}</Alert> : null}

                <Button variant="primary" type="submit" disabled={busy}>
                  {busy ? 'Сохраняю…' : 'Сохранить'}
                </Button>
              </form>
            </CardContent>
          </Card>
        }
        aside={
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#9FB0D0]" />
                  <div className="text-sm font-medium">Все компетенции</div>
                </div>
                <button
                  type="button"
                  onClick={fetchCaps}
                  className="rounded p-1 text-[#9FB0D0] hover:text-[#EAF0FF] transition"
                  title="Обновить"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {capsErr ? (
                <Alert tone="danger">{capsErr}</Alert>
              ) : loadingCaps ? (
                <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
              ) : capabilities.length === 0 ? (
                <div className="text-sm text-[#9FB0D0]">Нет записей</div>
              ) : (
                <div className="space-y-2">
                  {capabilities.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg bg-[#0F1830] p-2 ring-1 ring-[#1E2A44] text-xs"
                    >
                      <div className="flex flex-wrap gap-1 mb-1">
                        <Badge tone="accent">{c.entity_type}</Badge>
                        <Badge>skill {c.skill_id}</Badge>
                        <Badge tone={c.proficiency_level >= 0.8 ? 'success' : 'neutral'}>
                          {(c.proficiency_level * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="truncate text-[#9FB0D0]">entity: {c.entity_id}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        }
      />
    </Page>
  )
}
