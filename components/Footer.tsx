import { Card, Container } from '@mantine/core'
import { pageConfig } from '@/uptime.config'
import { motion } from 'framer-motion'

export default function Footer() {
  const defaultFooter =
    '<p style="text-align: center; font-size: 14px; margin-top: 0px; font-weight: 500; color: var(--mantine-color-dimmed);"> RSSS • Rakko System Service Status </p>'

  return (
    <Container size="md" mt="lg" mb="xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Card className="glass footer-card" padding="sm" radius="md">
          <div dangerouslySetInnerHTML={{ __html: pageConfig.customFooter ?? defaultFooter }} />
        </Card>
      </motion.div>
    </Container>
  )
}
