import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, GitBranch } from 'lucide-react'

import { ingestGitWebhook } from '@/api/client'
import { Page, PageHeader } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/utils/errors'

export default function LearningDetail() {
  const { id } = useParams()

  const [projectId, setProjectId] = useState<string>(String(crypto.randomUUID()))
  const [teamId, setTeamId] = useState<string>(String(crypto.randomUUID()))
  const [repoUrl, setRepoUrl] = useState('https://github.com/org/repo')
  const [sha, setSha] = useState('abc123def456')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  return (
    <Page>
      <PageHeader
        title={id === 'demo' ? 'Демо: Git Webhook' : 'Карточка обучения'}
        subtitle={
          id === 'demo'
            ? 'Отправляет webhook на backend и создаёт code-артефакт.'
            : 'Экран-заготовка.'
        }
        right={
          <Link to="/learning">
            <Button variant="ghost" type="button">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
        }
      />

      {id !== 'demo' ? (
        <Card>
          <CardContent className="pt-4 text-sm text-[#9FB0D0]">
            Демо-экран: `/learning/demo`.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-[#6C8CFF]" />
              <div className="text-sm font-medium">/api/integrations/git/webhook</div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault()
                setErr(null)
                setMsg(null)
                setBusy(true)
                try {
                  const out = await ingestGitWebhook({
                    project_id: projectId,
                    owner_team_id: teamId,
                    repo_url: repoUrl,
                    commit_sha: sha,
                    event_type: 'push',
                    metadata: { reusability_index: 0.4 },
                  })
                  setMsg(`Создан артефакт: ${out.artifact_id} (hash: ${out.content_hash})`)
                } catch (e: unknown) {
                  setErr(getErrorMessage(e, 'Webhook не прошёл'))
                } finally {
                  setBusy(false)
                }
              }}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">project_id</div>
                  <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} />
                </div>
                <div>
                  <div className="mb-1 text-xs text-[#9FB0D0]">owner_team_id</div>
                  <Input value={teamId} onChange={(e) => setTeamId(e.target.value)} />
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">repo_url</div>
                <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
              </div>
              <div>
                <div className="mb-1 text-xs text-[#9FB0D0]">commit_sha</div>
                <Input value={sha} onChange={(e) => setSha(e.target.value)} />
              </div>
              {err ? <Alert tone="danger">{err}</Alert> : null}
              {msg ? <Alert tone="success">{msg}</Alert> : null}
              <Button variant="primary" type="submit" disabled={busy}>
                {busy ? 'Отправляю…' : 'Отправить webhook'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </Page>
  )
}
