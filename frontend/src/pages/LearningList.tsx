import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

import { Page, PageHeader } from '@/components/layout/Page'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function LearningList() {
  return (
    <Page>
      <PageHeader
        title="Обучение"
        subtitle="Каталог обучений и прогресс. В MVP — демо-экран и ссылочная структура."
        right={
          <Link to="/learning/demo">
            <Button variant="secondary" type="button">
              Открыть демо
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[#0F1830] p-2 ring-1 ring-[#1E2A44]">
              <GraduationCap className="h-4 w-4 text-[#6C8CFF]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">Learning Catalog</div>
              <div className="mt-1 text-sm text-[#9FB0D0]">
                Эта часть будет подключена к отдельным данным (курсы/программы/прогресс).
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="accent">Каталог</Badge>
                <Badge>Прогресс</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}

