import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

import { getArtifact, updateArtifact, type ArtifactOut } from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/utils/errors'

export default function KnowledgeEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [artifact, setArtifact] = useState<ArtifactOut | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)

  const [gitUrl, setGitUrl] = useState('')
  const [reusability, setReusability] = useState('0.0')
  const [metadataJson, setMetadataJson] = useState('')
  const [mentorshipSeal, setMentorshipSeal] = useState(false)

  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let alive = true
    setLoadErr(null)
    setArtifact(null)
    getArtifact(id)
      .then((a) => {
        if (!alive) return
        setArtifact(a)
        setGitUrl(a.git_url ?? '')
        setReusability(String(a.reusability_index))
        setMetadataJson(JSON.stringify(a.metadata, null, 2))
        setMentorshipSeal(a.mentorship_seal)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setLoadErr(getErrorMessage(e, 'Не удалось загрузить артефакт'))
      })
    return () => { alive = false }
  }, [id])

  if (loadErr) {
    return (
      <Page>
        <PageHeader title="Редактирование" right={
          <Link to="/knowledge"><Button variant="ghost" type="button"><ArrowLeft className="h-4 w-4" />Назад</Button></Link>
        } />
        <Alert tone="danger">{loadErr}</Alert>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        title="Редактирование артефакта"
        subtitle={id ? `id: ${id}` : undefined}
        right={
          <Link to={id ? `/knowledge/${id}` : '/knowledge'}>
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
              <div className="text-sm font-medium">Изменить поля</div>
            </CardHeader>
            <CardContent>
              {!artifact ? (
                <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!id) return
                    setErr(null)
                    setSaved(false)
                    setBusy(true)
                    try {
                      const meta = metadataJson.trim() ? JSON.parse(metadataJson) : {}
                      await updateArtifact(id, {
                        reusability_index: Number(reusability) || 0,
                        git_url: gitUrl.trim() || null,
                        metadata: meta,
                        mentorship_seal: mentorshipSeal,
                      })
                      setSaved(true)
                    } catch (e: unknown) {
                      setErr(getErrorMessage(e, 'Не удалось сохранить артефакт'))
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">reusability_index</div>
                    <Input value={reusability} onChange={(e) => setReusability(e.target.value)} />
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">git_url</div>
                    <Input
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                      placeholder="https://github.com/org/repo"
                    />
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">metadata (JSON)</div>
                    <textarea
                      className="min-h-[120px] w-full rounded-lg bg-[#0F1830] p-3 text-sm ring-1 ring-[#1E2A44] focus:outline-none focus:ring-2 focus:ring-[#6C8CFF]"
                      value={metadataJson}
                      onChange={(e) => setMetadataJson(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="seal"
                      type="checkbox"
                      checked={mentorshipSeal}
                      onChange={(e) => setMentorshipSeal(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#6C8CFF]"
                    />
                    <label htmlFor="seal" className="text-sm text-[#9FB0D0] cursor-pointer">
                      mentorship_seal
                    </label>
                  </div>

                  {err ? <Alert tone="danger">{err}</Alert> : null}
                  {saved ? (
                    <Alert tone="success" className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Сохранено
                      </span>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => navigate(`/knowledge/${id}`)}
                      >
                        Открыть
                      </Button>
                    </Alert>
                  ) : null}

                  <Button variant="primary" type="submit" disabled={busy}>
                    {busy ? 'Сохраняю…' : 'Сохранить'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        }
        aside={
          <Card>
            <CardHeader>
              <div className="text-sm font-medium">Только для чтения</div>
            </CardHeader>
            <CardContent>
              {artifact ? (
                <div className="space-y-2 text-xs text-[#9FB0D0]">
                  <div>id: {artifact.id}</div>
                  <div>project_id: {artifact.project_id}</div>
                  <div>owner_team_id: {artifact.owner_team_id}</div>
                  <div>content_hash: {artifact.content_hash}</div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge tone="accent">type_id: {artifact.type_id}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[#9FB0D0]">—</div>
              )}
            </CardContent>
          </Card>
        }
      />
    </Page>
  )
}
