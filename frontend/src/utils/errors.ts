export function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message
  if (typeof err === 'string' && err.trim()) return err
  return fallback
}

