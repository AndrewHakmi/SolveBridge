import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileCode, FlaskConical, Layers, Plus } from 'lucide-react'

import { listArtifacts, type ArtifactOut } from '@/api/client'
import { Page, PageHeader } from '@/components/layout/Page'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { getErrorMessage } from '@/utils/errors'

const TYPE_LABELS: Record<number, string> = { 1: 'code', 2: 'research', 3: 'prototype' }

function TypeIcon({ typeId }: { typeId: number }) {
  if (typeId === 1) return <FileCode className="h-4 w-4 text-[#6C8CFF]" />
  if (typeId === 2) return <FlaskConical className="h-4 w-4 text-[#3DDC97]" />
  return <Layers className="h-4 w-4 text-[#FF9A3C]" />
}

export default function KnowledgeList() {
  const [artifacts, setArtifacts] = useState<ArtifactOut[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    listArtifacts()
      .then((list) => { if (alive) setArtifacts(list) })
      .catch((e: unknown) => { if (alive) setErr(getErrorMessage(e, 'Не удалось загрузить артефакты')) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <Page>
      <PageHeader
        title="База знаний"
        subtitle="Digital Artifacts — цифровые следы работы команды."
        right={
          <Link to="/knowledge/new">
            <Button variant="primary" type="button">
              <Plus className="h-4 w-4" />
              Создать артефакт
            </Button>
          </Link>
        }
      />

      {err ? <Alert tone="danger">{err}</Alert> : null}

      {loading ? (
        <div className="text-sm text-[#9FB0D0]">Загружаю…</div>
      ) : artifacts.length === 0 ? (
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-[#9FB0D0]">
              Артефактов пока нет.{' '}
              <Link to="/knowledge/new" className="text-[#6C8CFF] hover:underline">
                Создать первый
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {artifacts.map((a) => (
            <Link key={a.id} to={`/knowledge/${a.id}`}>
              <Card className="transition hover:bg-[#132042]">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-[#0F1830] p-2 ring-1 ring-[#1E2A44]">
                      <TypeIcon typeId={a.type_id} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {TYPE_LABELS[a.type_id] ?? `type ${a.type_id}`}
                        </span>
                        {a.mentorship_seal ? (
                          <Badge tone="success">seal</Badge>
                        ) : null}
                        <Badge>reuse: {a.reusability_index.toFixed(2)}</Badge>
                      </div>
                      <div className="mt-1 truncate text-xs text-[#9FB0D0]">
                        {a.git_url ? a.git_url : `hash: ${a.content_hash}`}
                      </div>
                      <div className="mt-1 text-xs text-[#9FB0D0]">
                        project: {a.project_id}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Page>
  )
}
