import Head from 'next/head'
import Script from 'next/script'

import { MonitorState, MonitorTarget } from '@/types/config'
import { KVNamespace } from '@cloudflare/workers-types'
import { maintenances, pageConfig, workerConfig } from '@/uptime.config'
import OverallStatus from '@/components/OverallStatus'
import Header from '@/components/Header'
import MonitorList from '@/components/MonitorList'
import { Center, Text } from '@mantine/core'
import MonitorDetail from '@/components/MonitorDetail'
import Footer from '@/components/Footer'
import { useTranslation } from 'react-i18next'
import styles from '@/styles/Home.module.css'
import { motion } from 'framer-motion'

export const runtime = 'experimental-edge'

export default function Home({
  state: stateStr,
  monitors,
}: {
  state: string
  monitors: MonitorTarget[]
  tooltip?: string
  statusPageLink?: string
}) {
  const { t } = useTranslation('common')
  const pageVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  }
  const sectionVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  }
  let state
  if (stateStr !== undefined) {
    state = JSON.parse(stateStr) as MonitorState
  }

  // Specify monitorId in URL hash to view a specific monitor (can be used in iframe)
  const monitorId = window.location.hash.substring(1)
  if (monitorId) {
    const monitor = monitors.find((monitor) => monitor.id === monitorId)
    if (!monitor || !state) {
      return <Text fw={700}>{t('Monitor not found', { id: monitorId })}</Text>
    }
    return (
      <div style={{ maxWidth: '810px' }}>
        <MonitorDetail monitor={monitor} state={state} />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{pageConfig.title}</title>
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
      </Head>
      <Script
        src="https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0/dist/autoload.js"
        strategy="afterInteractive"
      />

      <motion.main className={styles.page} variants={pageVariants} initial="hidden" animate="show">
        <motion.div variants={sectionVariants}>
          <Header />
        </motion.div>

        {state == undefined ? (
          <motion.div variants={sectionVariants}>
            <Center>
              <Text fw={700}>{t('Monitor State not defined')}</Text>
            </Center>
          </motion.div>
        ) : (
          <motion.div className={styles.sectionWrap} variants={sectionVariants}>
            <OverallStatus state={state} monitors={monitors} maintenances={maintenances} />
            <MonitorList monitors={monitors} state={state} />
          </motion.div>
        )}

        <motion.div variants={sectionVariants}>
          <Footer />
        </motion.div>
      </motion.main>
    </>
  )
}

export async function getServerSideProps() {
  const { UPTIMEFLARE_STATE } = process.env as unknown as {
    UPTIMEFLARE_STATE: KVNamespace
  }

  // Read state as string from KV, to avoid hitting server-side cpu time limit
  const state = (await UPTIMEFLARE_STATE?.get('state')) as unknown as MonitorState

  // Only present these values to client
  const monitors = workerConfig.monitors.map((monitor) => {
    const base = {
      id: monitor.id,
      name: monitor.name,
      // @ts-ignore
      tooltip: monitor?.tooltip ?? null,
      // @ts-ignore
      statusPageLink: monitor?.statusPageLink ?? null,
    }
    // @ts-ignore
    return monitor?.hideLatencyChart === undefined
      ? base
      : {
          ...base,
          // @ts-ignore
          hideLatencyChart: monitor.hideLatencyChart,
        }
  })

  return { props: { state, monitors } }
}
