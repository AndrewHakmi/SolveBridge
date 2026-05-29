import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Plus } from 'lucide-react'

import {
  createArtifact,
  createProject,
  createTeam,
  listProjects,
  listTeams,
  type ProjectOut,
  type TeamOut,
} from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/utils/errors'

export default function KnowledgeNew() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState<ProjectOut[]>([])
  const [teams, setTeams] = useState<TeamOut[]>([])
  const [loadingCtx, setLoadingCtx] = useState(true)

  const [projectId, setProjectId] = useState<string>('')
  const [teamId, setTeamId] = useState<string>('')

  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newTeamName, setNewTeamName] = useState('')

  const [typeCode, setTypeCode] = useState<'code' | 'research' | 'prototype'>('code')
  const [gitUrl, setGitUrl] = useState('')
  const [hash, setHash] = useState('')
  const [reusability, setReusability] = useState('0.0')
  const [metadataJson, setMetadataJson] = useState('{"complexity": 0.3, "innovative": 0.2}')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ id: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([listProjects(), listTeams()])
      .then(([ps, ts]) => {
        if (!alive) return
        setProjects(ps)
        setTeams(ts)
        if (ps.length > 0) setProjectId(ps[0].id)
        if (ts.length > 0) setTeamId(ts[0].id)
      })
      .catch(() => {/* silently ignore */})
      .finally(() => { if (alive) setLoadingCtx(false) })
    return () => { alive = false }
  }, [])

  async function handleCreateProject() {
    const title = newProjectTitle.trim()
    if (!title) return
    try {
      const p = await createProject({ title })
      setProjects((prev) => [p, ...prev])
      setProjectId(p.id)
      setNewProjectTitle('')
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось создать проект'))
    }
  }

  async function handleCreateTeam() {
    const name = newTeamName.trim()
    if (!name) return
    try {
      const t = await createTeam({ name })
      setTeams((prev) => [t, ...prev])
      setTeamId(t.id)
      setNewTeamName('')
    } catch (e: unknown) {
      setErr(getErrorMessage(e, 'Не удалось создать команду'))
    }
  }

  return (
    <Page>
      <PageHeader
        title="Создание артефакта"
        subtitle="Создаёт Digital Artifact через `/api/artifacts`."
        right={
          <Link to="/knowledge">
            <Button variant="ghost" type="button">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
        }
      />

      <TwoCol
        main={
          <div className="space-y-4">
            {/* Project picker */}
            <Card>
              <CardHeader>
                <div className="text-sm font-medium">Проект</div>
              </CardHeader>
              <CardContent>
                {loadingCtx ? (
                  <div className="text-sm text-[#9FB0D0]">Загружаю проекты…</div>
                ) : (
                  <div className="space-y-2">
                    {projects.length > 0 ? (
                      <div>
                        <div className="mb-1 text-xs text-[#9FB0D0]">Выбрать существующий</div>
                        <select
                          className="h-10 w-full rounded-lg bg-[#0F1830] px-3 text-sm ring-1 ring-[#1E2A44] focus:outline-none focus:ring-2 focus:ring-[#6C8CFF]"
                          value={projectId}
                          onChange={(e) => setProjectId(e.target.value)}
                        >
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    <div>
                      <div className="mb-1 text-xs text-[#9FB0D0]">Или создать новый проект</div>
                      <div className="flex gap-2">
                        <Input
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          placeholder="Название проекта"
                        />
                        <Button variant="secondary" type="button" onClick={handleCreateProject}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {projectId ? (
                      <div className="text-xs text-[#9FB0D0]">project_id: {projectId}</div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team picker */}
            <Card>
              <CardHeader>
                <div className="text-sm font-medium">Команда</div>
              </CardHeader>
              <CardContent>
                {loadingCtx ? (
                  <div className="text-sm text-[#9FB0D0]">Загружаю команды…</div>
                ) : (
                  <div className="space-y-2">
                    {teams.length > 0 ? (
                      <div>
                        <div className="mb-1 text-xs text-[#9FB0D0]">Выбрать существующую</div>
                        <select
                          className="h-10 w-full rounded-lg bg-[#0F1830] px-3 text-sm ring-1 ring-[#1E2A44] focus:outline-none focus:ring-2 focus:ring-[#6C8CFF]"
                          value={teamId}
                          onChange={(e) => setTeamId(e.target.value)}
                        >
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    <div>
                      <div className="mb-1 text-xs text-[#9FB0D0]">Или создать новую команду</div>
                      <div className="flex gap-2">
                        <Input
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="Название команды"
                        />
                        <Button variant="secondary" type="button" onClick={handleCreateTeam}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {teamId ? (
                      <div className="text-xs text-[#9FB0D0]">team_id: {teamId}</div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Artifact fields */}
            <Card>
              <CardHeader>
                <div className="text-sm font-medium">Поля артефакта</div>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setErr(null)
                    setResult(null)
                    if (!projectId || !teamId) {
                      setErr('Выберите или создайте проект и команду')
                      return
                    }
                    setBusy(true)
                    try {
                      const meta = metadataJson.trim() ? JSON.parse(metadataJson) : {}
                      const contentHash =
                        hash.trim() || String(crypto.randomUUID()).split('-').join('')
                      const out = await createArtifact({
                        project_id: projectId,
                        owner_team_id: teamId,
                        type_code: typeCode,
                        content_hash: contentHash,
                        reusability_index: Number(reusability) || 0,
                        metadata: meta,
                        git_url: gitUrl.trim() || null,
                      })
                      setResult({ id: out.id })
                    } catch (e: unknown) {
                      setErr(getErrorMessage(e, 'Не удалось создать артефакт'))
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <div className="mb-1 text-xs text-[#9FB0D0]">type</div>
                      <select
                        className="h-10 w-full rounded-lg bg-[#0F1830] px-3 text-sm ring-1 ring-[#1E2A44] focus:outline-none focus:ring-2 focus:ring-[#6C8CFF]"
                        value={typeCode}
                        onChange={(e) => {
                          const v = e.target.value
                          setTypeCode(
                            v === 'research' ? 'research' : v === 'prototype' ? 'prototype' : 'code',
                          )
                        }}
                      >
                        <option value="code">code</option>
                        <option value="research">research</option>
                        <option value="prototype">prototype</option>
                      </select>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-[#9FB0D0]">reusability_index</div>
                      <Input value={reusability} onChange={(e) => setReusability(e.target.value)} />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-[#9FB0D0]">content_hash</div>
                      <Input
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        placeholder="Авто"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">git_url (опционально)</div>
                    <Input
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                      placeholder="https://github.com/org/repo"
                    />
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">metadata (JSON)</div>
                    <textarea
                      className="min-h-[100px] w-full rounded-lg bg-[#0F1830] p-3 text-sm ring-1 ring-[#1E2A44] focus:outline-none focus:ring-2 focus:ring-[#6C8CFF]"
                      value={metadataJson}
                      onChange={(e) => setMetadataJson(e.target.value)}
                    />
                  </div>

                  {err ? <Alert tone="danger">{err}</Alert> : null}
                  {result ? (
                    <Alert tone="success" className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Артефакт создан: {result.id}
                      </span>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => navigate(`/knowledge/${result.id}`)}
                      >
                        Открыть
                      </Button>
                    </Alert>
                  ) : null}

                  <Button variant="primary" type="submit" disabled={busy}>
                    {busy ? 'Сохраняю…' : 'Создать артефакт'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        }
        aside={
          <Card>
            <CardHeader>
              <div className="text-sm font-medium">Подсказки</div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-[#9FB0D0]">
                <div>
                  Создай проект и команду через кнопку <strong>+</strong>, или выбери из уже существующих.
                </div>
                <div>
                  <code>content_hash</code> — контроль целостности. Оставь пустым для автогенерации.
                </div>
                <div>
                  <code>metadata</code> — JSONB для хранения сложности, инновационности и т.д.
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge tone="accent">JSONB</Badge>
                  <Badge>Mentorship Seal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        }
      />
    </Page>
  )
}
