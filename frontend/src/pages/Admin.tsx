import { useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

import { createMentorActivity, setProjectScores } from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/errors'

export default function Admin() {
  const user = useAuthStore((s) => s.user)

  const allowed = user?.role === 'admin'
  const demo = useMemo(() => ({
    mentorId: String(crypto.randomUUID()),
    teamId: String(crypto.randomUUID()),
    projectId: String(crypto.randomUUID()),
  }), [])

  const [projectId, setProjectId] = useState<string>(demo.projectId)
  const [mentor, setMentor] = useState('0.8')
  const [client, setClient] = useState('0.7')
  const [peer, setPeer] = useState('0.6')
  const [artifact, setArtifact] = useState('0.5')
  const [scoreBusy, setScoreBusy] = useState(false)
  const [scoreMsg, setScoreMsg] = useState<string | null>(null)
  const [scoreErr, setScoreErr] = useState<string | null>(null)

  const [mentorId, setMentorId] = useState<string>(demo.mentorId)
  const [teamId, setTeamId] = useState<string>(demo.teamId)
  const [actionType, setActionType] = useState('review')
  const [duration, setDuration] = useState('25')
  const [pomBusy, setPomBusy] = useState(false)
  const [pomMsg, setPomMsg] = useState<string | null>(null)
  const [pomErr, setPomErr] = useState<string | null>(null)

  return (
    <Page>
      <PageHeader
        title="Админ"
        subtitle="Scoring и Proof of Mentorship. Доступ — только admin." 
        right={<Badge tone={allowed ? 'success' : 'danger'}>{allowed ? 'доступ открыт' : 'нет прав'}</Badge>}
      />

      {!allowed ? (
        <Alert tone="danger">Эта страница доступна только роли admin.</Alert>
      ) : null}

      <TwoCol
        main={
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#6C8CFF]" />
                <div className="text-sm font-medium">360° Scoring (API)</div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!allowed) return
                  setScoreErr(null)
                  setScoreMsg(null)
                  setScoreBusy(true)
                  try {
                    const out = await setProjectScores({
                      project_id: projectId.trim(),
                      mentor_score: Number(mentor),
                      client_score: Number(client),
                      peer_score: Number(peer),
                      artifact_score: Number(artifact),
                    })
                    setScoreMsg(
                      `success_rate=${out.success_rate == null ? 'n/a' : out.success_rate.toFixed(3)}`,
                    )
                  } catch (e: unknown) {
                    setScoreErr(getErrorMessage(e, 'Не удалось пересчитать scoring'))
                  } finally {
                    setScoreBusy(false)
                  }
                }}
              >
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">project_id</div>
                  <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">mentor</div>
                    <Input value={mentor} onChange={(e) => setMentor(e.target.value)} />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">client</div>
                    <Input value={client} onChange={(e) => setClient(e.target.value)} />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">peer</div>
                    <Input value={peer} onChange={(e) => setPeer(e.target.value)} />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">artifact</div>
                    <Input value={artifact} onChange={(e) => setArtifact(e.target.value)} />
                  </div>
                </div>
                {scoreErr ? <Alert tone="danger">{scoreErr}</Alert> : null}
                {scoreMsg ? <Alert tone="success">{scoreMsg}</Alert> : null}
                <Button variant="primary" type="submit" disabled={!allowed || scoreBusy}>
                  {scoreBusy ? 'Считаю…' : 'Пересчитать'}
                </Button>
              </form>
            </CardContent>
          </Card>
        }
        aside={
          <Card>
            <CardHeader>
              <div className="text-sm font-medium">PoM Activity Log (API)</div>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!allowed) return
                  setPomErr(null)
                  setPomMsg(null)
                  setPomBusy(true)
                  try {
                    const out = await createMentorActivity({
                      mentor_id: mentorId.trim(),
                      team_id: teamId.trim(),
                      project_id: projectId.trim(),
                      action_type: actionType,
                      duration_minutes: Number(duration) || 0,
                      complexity_weight: 1.0,
                    })
                    setPomMsg(`OK: ${out.id}`)
                  } catch (e: unknown) {
                    setPomErr(getErrorMessage(e, 'Не удалось записать PoM'))
                  } finally {
                    setPomBusy(false)
                  }
                }}
              >
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">mentor_id</div>
                  <Input value={mentorId} onChange={(e) => setMentorId(e.target.value)} />
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">team_id</div>
                  <Input value={teamId} onChange={(e) => setTeamId(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">action_type</div>
                    <select
                      className="h-10 w-full rounded-lg bg-[#0F1830] px-3 text-sm ring-1 ring-[#1E2A44] focus:outline-none focus:ring-2 focus:ring-[#6C8CFF]"
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                    >
                      <option value="review">review</option>
                      <option value="meeting">meeting</option>
                      <option value="approval">approval</option>
                    </select>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">minutes</div>
                    <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>
                </div>
                {pomErr ? <Alert tone="danger">{pomErr}</Alert> : null}
                {pomMsg ? <Alert tone="success">{pomMsg}</Alert> : null}
                <Button variant="secondary" type="submit" disabled={!allowed || pomBusy}>
                  {pomBusy ? 'Пишу…' : 'Записать PoM'}
                </Button>
              </form>
            </CardContent>
          </Card>
        }
      />
    </Page>
  )
}
