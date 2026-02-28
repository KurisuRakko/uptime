import { MonitorState, MonitorTarget } from '@/types/config'
import { Accordion, Card, Text, Container, TextInput, Badge, SegmentedControl } from '@mantine/core'
import MonitorDetail from './MonitorDetail'
import { maintenances, pageConfig } from '@/uptime.config'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import styles from '@/styles/MonitorList.module.css'

function countDownCount(state: MonitorState, ids: string[]) {
  let downCount = 0
  for (let id of ids) {
    if (state.incident[id] === undefined || state.incident[id].length === 0) {
      continue
    }

    if (state.incident[id].slice(-1)[0].end === undefined) {
      downCount++
    }
  }
  return downCount
}

function getStatusTextColor(state: MonitorState, ids: string[]) {
  let downCount = countDownCount(state, ids)
  if (downCount === 0) {
    return '#2da44e'
  } else if (downCount === ids.length) {
    return '#cf222e'
  } else {
    return '#bf8700'
  }
}

export default function MonitorList({
  monitors,
  state,
}: {
  monitors: MonitorTarget[]
  state: MonitorState
}) {
  const { t } = useTranslation('common')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'issues' | 'maintenance'>('all')
  const listVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  }
  const itemVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.35 } },
  }
  const group = pageConfig.group
  const groupedMonitor = group && Object.keys(group).length > 0
  let content
  const normalizedQuery = query.trim().toLowerCase()

  const isDown = (id: string) => {
    const incidents = state.incident[id]
    if (!incidents || incidents.length === 0) return false
    return incidents.slice(-1)[0].end === undefined
  }

  const now = new Date()
  const maintenanceIds = new Set(
    maintenances
      .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
      .flatMap((m) => m.monitors || [])
  )

  const isMaintenance = (id: string) => maintenanceIds.has(id)

  const matchesQuery = (monitor: MonitorTarget) => {
    if (!normalizedQuery) return true
    return (
      monitor.name.toLowerCase().includes(normalizedQuery) ||
      monitor.id.toLowerCase().includes(normalizedQuery)
    )
  }

  const passesFilter = (monitor: MonitorTarget) => {
    if (!matchesQuery(monitor)) return false
    if (filter === 'issues') return isDown(monitor.id)
    if (filter === 'maintenance') return isMaintenance(monitor.id)
    return true
  }
  const filteredCount = monitors.filter(passesFilter).length
  const counts = monitors.reduce(
    (acc, monitor) => {
      if (isMaintenance(monitor.id)) {
        acc.maintenance += 1
      } else if (isDown(monitor.id)) {
        acc.down += 1
      } else {
        acc.up += 1
      }
      return acc
    },
    { up: 0, down: 0, maintenance: 0 }
  )

  // Load expanded groups from localStorage
  const savedExpandedGroups = localStorage.getItem('expandedGroups')
  const expandedInitial = savedExpandedGroups
    ? JSON.parse(savedExpandedGroups)
    : Object.keys(group || {})
  const [expandedGroups, setExpandedGroups] = useState<string[]>(expandedInitial)
  useEffect(() => {
    localStorage.setItem('expandedGroups', JSON.stringify(expandedGroups))
  }, [expandedGroups])

  if (groupedMonitor) {
    // Grouped monitors
    content =
      filteredCount === 0 ? (
        <div className={styles.empty}>{t('No matching components')}</div>
      ) : (
        <Accordion
          multiple
          defaultValue={Object.keys(group)}
          variant="contained"
          value={expandedGroups}
          onChange={(values) => setExpandedGroups(values)}
          transitionDuration={240}
        >
          {Object.keys(group).map((groupName) => {
            const groupMonitors = monitors
              .filter((monitor) => group[groupName].includes(monitor.id))
              .sort((a, b) => group[groupName].indexOf(a.id) - group[groupName].indexOf(b.id))
              .filter(passesFilter)

            if (groupMonitors.length === 0) {
              return null
            }

            return (
              <Accordion.Item key={groupName} value={groupName}>
                <Accordion.Control>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <div>{groupName}</div>
                    <Text
                      fw={500}
                      style={{
                        display: 'inline',
                        paddingRight: '5px',
                        color: getStatusTextColor(state, group[groupName]),
                      }}
                    >
                      {group[groupName].length - countDownCount(state, group[groupName])}/
                      {group[groupName].length} {t('Operational')}
                    </Text>
                  </div>
                </Accordion.Control>
                <Accordion.Panel>
                  <motion.div variants={listVariants} initial="hidden" animate="show">
                    {groupMonitors.map((monitor) => (
                    <motion.div key={monitor.id} variants={itemVariants} layout className={styles.item}>
                      <Card.Section ml="xs" mr="xs">
                        <MonitorDetail monitor={monitor} state={state} />
                      </Card.Section>
                    </motion.div>
                    ))}
                  </motion.div>
                </Accordion.Panel>
              </Accordion.Item>
            )
          })}
        </Accordion>
      )
  } else {
    // Ungrouped monitors
    const filteredMonitors = monitors.filter(passesFilter)
    content =
      filteredMonitors.length === 0 ? (
        <div className={styles.empty}>{t('No matching components')}</div>
      ) : (
        <motion.div variants={listVariants} initial="hidden" animate="show">
          {filteredMonitors.map((monitor) => (
            <motion.div key={monitor.id} variants={itemVariants} layout className={styles.item}>
              <Card.Section ml="xs" mr="xs">
                <MonitorDetail monitor={monitor} state={state} />
              </Card.Section>
            </motion.div>
          ))}
        </motion.div>
      )
  }

  return (
    <Container size="md" mt="xl">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        className="glass monitor-card"
        withBorder={!groupedMonitor}
      >
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <TextInput
              size="sm"
              placeholder={t('Search components')}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
            <SegmentedControl
              size="sm"
              value={filter}
              onChange={(value) => setFilter(value as 'all' | 'issues' | 'maintenance')}
              data={[
                { value: 'all', label: t('All') },
                { value: 'issues', label: t('Incidents') },
                { value: 'maintenance', label: t('Maintenance') },
              ]}
            />
          </div>
          <div className={styles.summary}>
            <Badge color="green" variant="light">
              {t('Operational')} {counts.up}
            </Badge>
            <Badge color="red" variant="light">
              {t('Major outage')} {counts.down}
            </Badge>
            <Badge color="blue" variant="light">
              {t('Maintenance')} {counts.maintenance}
            </Badge>
            <div className={styles.toolbarHint}>
              {t('Showing')} {filteredCount}/{monitors.length}
            </div>
          </div>
        </div>
        {content}
      </Card>
    </Container>
  )
}
