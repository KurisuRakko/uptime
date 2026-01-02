import { Card, Container } from '@mantine/core'
import { pageConfig } from '@/uptime.config'

export default function Footer() {
  const defaultFooter =
    '<p style="text-align: center; font-size: 14px; margin-top: 0px; font-weight: 500; color: var(--mantine-color-dimmed);"> RSSS • Rakko System Service Status </p>'

  return (
    <Container size="md" mt="lg" mb="xl">
      <Card className="glass" padding="sm" radius="md">
        <div dangerouslySetInnerHTML={{ __html: pageConfig.customFooter ?? defaultFooter }} />
      </Card>
    </Container>
  )
}
