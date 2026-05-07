import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Page, PageHeader } from '@/components/layout/Page'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function NotFound() {
  return (
    <Page>
      <PageHeader title="Страница не найдена" />
      <Card>
        <CardContent className="pt-4">
          <div className="text-sm text-[#9FB0D0]">
            Такой страницы нет. Вернись в Workspace.
          </div>
          <div className="mt-3">
            <Link to="/">
              <Button variant="primary" type="button">
                <ArrowLeft className="h-4 w-4" />
                На главную
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}

