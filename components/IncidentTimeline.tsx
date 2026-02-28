import { Card, Text, Group, Badge, Stack } from '@mantine/core'
import { MonitorState, MonitorTarget } from '@/types/config'
import { useTranslation } from 'react-i18next'

function formatRange(start: number, end?: number) {
  const startStr = new Date(start * 1000).toLocaleString()
  if (!end) return `${startStr} —`
  const endStr = new Date(end * 1000).toLocaleString()
  return `${startStr} → ${endStr}`
}

export default function IncidentTimeline({
  monitor,
  state,
  days = 30,
}: {
  monitor: MonitorTarget
  state: MonitorState
  days?: number
}) {
  const { t } = useTranslation('common')
  const now = Math.floor(Date.now() / 1000)
  const startWindow = now - days * 86400
  const incidents = (state.incident[monitor.id] || [])
    .filter((incident) => {
      const incStart = incident.start[0]
      const incEnd = incident.end ?? now
      return incEnd >= startWindow
    })
    .slice(-20)
    .reverse()

  if (incidents.length === 0) {
    return (
      <Card className="glass" padding="md" radius="md" mt="md">
        <Text>{t('No recent incidents')}</Text>
      </Card>
    )
  }

  return (
    <Card className="glass" padding="md" radius="md" mt="md">
      <Group justify="space-between" mb="xs">
        <Text fw={600}>{t('Incident timeline')}</Text>
        <Badge variant="light">{t('Last')} {days}d</Badge>
      </Group>
      <Stack gap="sm">
        {incidents.map((incident, idx) => (
          <div key={idx}>
            <Text fw={600}>{formatRange(incident.start[0], incident.end)}</Text>
            <Text size="sm" c="dimmed">
              {incident.error?.[0] || t('Unknown error')}
            </Text>
          </div>
        ))}
      </Stack>
    </Card>
  )
}
