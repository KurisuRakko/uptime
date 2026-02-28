import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { Container, Collapse, Card, Text } from '@mantine/core'
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import MaintenanceAlert from './MaintenanceAlert'
import { pageConfig } from '@/uptime.config'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Link from 'next/link'
import styles from '@/styles/OverallStatus.module.css'

function useWindowVisibility() {
  const [isVisible, setIsVisible] = useState(true)
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  return isVisible
}

export default function OverallStatus({
  state,
  maintenances,
  monitors,
}: {
  state: MonitorState
  maintenances: MaintenanceConfig[]
  monitors: MonitorTarget[]
}) {
  const { t } = useTranslation('common')

  let statusString = ''
  let statusVariant: 'ok' | 'warn' | 'bad' | 'neutral' = 'neutral'
  let icon = <IconAlertCircle style={{ width: 18, height: 18, color: 'inherit' }} />
  if (state.overallUp === 0 && state.overallDown === 0) {
    statusString = t('No data yet')
    statusVariant = 'neutral'
  } else if (state.overallUp === 0) {
    statusString = t('All systems not operational')
    statusVariant = 'bad'
  } else if (state.overallDown === 0) {
    statusString = t('All systems operational')
    statusVariant = 'ok'
    icon = <IconCircleCheck style={{ width: 18, height: 18, color: 'inherit' }} />
  } else {
    statusString = t('Some systems not operational', {
      down: state.overallDown,
      total: state.overallUp + state.overallDown,
    })
    statusVariant = 'warn'
  }
  const pulseClass = state.overallDown > 0 ? 'status-pulse' : undefined

  const [openTime] = useState(Math.round(Date.now() / 1000))
  const [currentTime, setCurrentTime] = useState(Math.round(Date.now() / 1000))
  const isWindowVisible = useWindowVisibility()
  const [expandUpcoming, setExpandUpcoming] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isWindowVisible) return
      if (currentTime - state.lastUpdate > 300 && currentTime - openTime > 30) {
        window.location.reload()
      }
      setCurrentTime(Math.round(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  })

  const now = new Date()

  const activeMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: MonitorTarget[]
  })[] = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  const upcomingMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: (MonitorTarget | undefined)[]
  })[] = maintenances
    .filter((m) => now < new Date(m.start))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  const calcSla = (days: number) => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const windowStart = nowSeconds - days * 86400
    const totalWindow = (nowSeconds - windowStart) * monitors.length
    if (totalWindow <= 0) return 100
    let downSeconds = 0
    for (const monitor of monitors) {
      const incidents = state.incident[monitor.id] || []
      for (const incident of incidents) {
        const incStart = incident.start[0]
        const incEnd = incident.end ?? nowSeconds
        const overlap = Math.max(0, Math.min(incEnd, nowSeconds) - Math.max(incStart, windowStart))
        downSeconds += overlap
      }
    }
    const uptime = ((totalWindow - downSeconds) / totalWindow) * 100
    return Math.max(0, Math.min(100, uptime))
  }

  const sla30 = calcSla(30).toFixed(2)
  const sla90 = calcSla(90).toFixed(2)

  return (
    <Container size="md" mt="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass status-card" padding="lg" radius="md">
          <div className={styles.wrapper}>
            <div className={`status-banner is-${statusVariant}`}>
              <span className={pulseClass}>{icon}</span>
              {statusString}
            </div>

            <div className={styles.titleRow}>
              <div className={styles.currentStatus}>
                {t('Current Status')}: {pageConfig.title}
              </div>
              <div className="status-meta">
                <span>{t('Uptime over the past 30 days')}.</span>
                <Link className={styles.statusLink} href="/incidents">
                  {t('View historical uptime')}
                </Link>
              </div>
            </div>

            <div className={styles.timeRow}>
              {t('Last updated on', {
                date: new Date(state.lastUpdate * 1000).toLocaleString(),
                seconds: currentTime - state.lastUpdate,
              })}
            </div>

            <div className={styles.slaGrid}>
              <div className={styles.slaCard}>
                <div className={styles.slaLabel}>{t('SLA (30d)')}</div>
                <div className={styles.slaValue}>{sla30}%</div>
              </div>
              <div className={styles.slaCard}>
                <div className={styles.slaLabel}>{t('SLA (90d)')}</div>
                <div className={styles.slaValue}>{sla90}%</div>
              </div>
            </div>

            {/* Upcoming Maintenance */}
            {upcomingMaintenances.length > 0 && (
              <>
                <Text mt="4px" className={styles.subtitle}>
                  {t('upcoming maintenance', { count: upcomingMaintenances.length })}{' '}
                  <span
                    className={styles.maintenanceToggle}
                    onClick={() => setExpandUpcoming(!expandUpcoming)}
                  >
                    {expandUpcoming ? t('Hide') : t('Show')}
                  </span>
                </Text>

                <Collapse in={expandUpcoming}>
                  {upcomingMaintenances.map((maintenance, idx) => (
                    <MaintenanceAlert
                      key={`upcoming-${idx}`}
                      maintenance={maintenance}
                      upcoming
                    />
                  ))}
                </Collapse>
              </>
            )}

            {/* Active Maintenance */}
            {activeMaintenances.map((maintenance, idx) => (
              <MaintenanceAlert
                key={`active-${idx}`}
                maintenance={maintenance}
              />
            ))}
          </div>
        </Card>
      </motion.div>
    </Container>
  )
}
