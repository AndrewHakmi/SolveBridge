import { Page, PageHeader } from '@/components/layout/Page'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <Page>
      <PageHeader
        title="Профиль"
        subtitle="Личные данные и настройки. В MVP — демо-профиль и роль." 
      />

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">Текущий пользователь</div>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <div className="text-sm">Имя: {user.name}</div>
              <div className="text-sm">Роль: {user.role}</div>
              <div className="text-xs text-[#9FB0D0]">id: {user.id}</div>
              <Button variant="danger" type="button" onClick={() => logout()}>
                Выйти
              </Button>
            </div>
          ) : (
            <div className="text-sm text-[#9FB0D0]">Не авторизован</div>
          )}
        </CardContent>
      </Card>
    </Page>
  )
}

