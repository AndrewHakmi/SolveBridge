import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { getArtifact, type ArtifactOut } from '@/api/client'
import { Page, PageHeader, TwoCol } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { getErrorMessage } from '@/utils/errors'

export default function KnowledgeDetail() {
  const { id } = useParams()
  const [artifact, setArtifact] = useState<ArtifactOut | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let alive = true
    setErr(null)
    setArtifact(null)
    getArtifact(id)
      .then((a) => {
        if (!alive) return
        setArtifact(a)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setErr(getErrorMessage(e, 'Не удалось загрузить артефакт'))
      })
    return () => {
      alive = false
    }
  }, [id])

  return (
    <Page>
      <PageHeader
        title="Карточка материала"
        subtitle={id ? `Artifact id: ${id}` : undefined}
        right={
          <Link to="/knowledge">
            <Button variant="ghost" type="button">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
        }
      />

      {err ? <Alert tone="danger">{err}</Alert> : null}

      <TwoCol
        main={
          <Card>
            <CardHeader>
              <div className="text-sm font-medium">Содержание</div>
            </CardHeader>
            <CardContent>
              {artifact ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="accent">type_id: {artifact.type_id}</Badge>
                    <Badge tone={artifact.mentorship_seal ? 'success' : 'neutral'}>
                      seal: {String(artifact.mentorship_seal)}
                    </Badge>
                    <Badge>reusability: {artifact.reusability_index.toFixed(2)}</Badge>
                  </div>
                  <div className="text-xs text-[#9FB0D0]">content_hash: {artifact.content_hash}</div>
                  {artifact.git_url ? (
                    <a
                      href={artifact.git_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#6C8CFF] hover:underline"
                    >
                      {artifact.git_url}
                    </a>
                  ) : null}
                  <div>
                    <div className="mb-1 text-xs text-[#9FB0D0]">metadata</div>
                    <pre className="max-h-[420px] overflow-auto rounded-xl bg-[#0F1830] p-3 text-xs ring-1 ring-[#1E2A44]">
                      {JSON.stringify(artifact.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
              )}
            </CardContent>
          </Card>
        }
        aside={
          <Card>
            <CardHeader>
              <div className="text-sm font-medium">Метаданные</div>
            </CardHeader>
            <CardContent>
              {artifact ? (
                <div className="space-y-2 text-sm text-[#9FB0D0]">
                  <div>project_id: {artifact.project_id}</div>
                  <div>owner_team_id: {artifact.owner_team_id}</div>
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
