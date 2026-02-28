import { Text, Tooltip } from '@mantine/core'
import { MonitorState, MonitorTarget } from '@/types/config'
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import DetailChart from './DetailChart'
import DetailBar from './DetailBar'
import { getColor } from '@/util/color'
import { maintenances } from '@/uptime.config'
import { useTranslation } from 'react-i18next'
import styles from '@/styles/MonitorDetail.module.css'

export default function MonitorDetail({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  const { t } = useTranslation('common')

  if (!state.latency[monitor.id])
    return (
      <>
        <Text mt="sm" fw={700}>
          {monitor.name}
        </Text>
        <Text mt="sm" fw={700}>
          {t('No data available')}
        </Text>
      </>
    )

  const isDown = state.incident[monitor.id].slice(-1)[0].end === undefined
  let statusIcon = isDown ? (
    <IconAlertCircle
      style={{ width: '1.25em', height: '1.25em', color: '#cf222e', marginRight: '3px' }}
    />
  ) : (
    <IconCircleCheck
      style={{ width: '1.25em', height: '1.25em', color: '#2da44e', marginRight: '3px' }}
    />
  )

  // Hide real status icon if monitor is in maintenance
  const now = new Date()
  const hasMaintenance = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .find((maintenance) => maintenance.monitors?.includes(monitor.id))
  const isMaintenance = Boolean(hasMaintenance)
  if (isMaintenance)
    statusIcon = (
      <IconAlertTriangle
        style={{
          width: '1.25em',
          height: '1.25em',
          color: '#bf8700',
          marginRight: '3px',
        }}
      />
    )

  const statusLabel = isMaintenance
    ? t('Maintenance')
    : isDown
      ? t('Major outage')
      : t('Operational')
  const badgeClass = isMaintenance
    ? styles.badgeMaintenance
    : isDown
      ? styles.badgeBad
      : styles.badgeOk

  let totalTime = Date.now() / 1000 - state.incident[monitor.id][0].start[0]
  let downTime = 0
  for (let incident of state.incident[monitor.id]) {
    downTime += (incident.end ?? Date.now() / 1000) - incident.start[0]
  }

  const uptimePercent = (((totalTime - downTime) / totalTime) * 100).toPrecision(4)

  // Conditionally render monitor name with or without hyperlink based on monitor.url presence
  const pulseClass = isDown || isMaintenance ? 'status-pulse' : undefined
  const monitorNameElement = (
    <Text mt="sm" fw={700} className={styles.name}>
      {monitor.statusPageLink ? (
        <a
          href={monitor.statusPageLink}
          target="_blank"
        >
          <span className={pulseClass}>{statusIcon}</span> {monitor.name}
        </a>
      ) : (
        <>
          <span className={pulseClass}>{statusIcon}</span> {monitor.name}
        </>
      )}
    </Text>
  )

  return (
    <>
      <div className={styles.header}>
        {monitor.tooltip ? (
          <Tooltip label={monitor.tooltip}>{monitorNameElement}</Tooltip>
        ) : (
          monitorNameElement
        )}

        <div className={styles.meta}>
          <Text
            mt="sm"
            fw={700}
            className={styles.uptime}
            style={{ color: getColor(uptimePercent, true) }}
          >
            {t('Overall', { percent: uptimePercent })}
          </Text>
          <div className={`${styles.badge} ${badgeClass}`}>{statusLabel}</div>
        </div>
      </div>

      <DetailBar monitor={monitor} state={state} />
      {!monitor.hideLatencyChart && <DetailChart monitor={monitor} state={state} />}
    </>
  )
}
