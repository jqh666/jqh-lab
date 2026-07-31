import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { dataApi } from '../../api/index.js'

function numberValue(value) {
  return Number(value || 0)
}

function MetricCard({ label, value, subLabel, rawValue = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-3 text-3xl font-bold text-white">
        {rawValue ? value : numberValue(value).toLocaleString()}
      </div>
      {subLabel && <div className="mt-2 text-xs text-white/30">{subLabel}</div>}
    </div>
  )
}

function TrendBars({ data }) {
  const max = Math.max(...data.map((item) => numberValue(item.value)), 1)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold">访问趋势</h2>
        <span className="text-xs text-white/30">Page views</span>
      </div>
      <div className="flex h-44 items-end gap-2">
        {data.map((item) => {
          const height = Math.max((numberValue(item.value) / max) * 100, numberValue(item.value) > 0 ? 8 : 2)
          return (
            <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end rounded-full bg-white/5 px-1">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400"
                  style={{ height: `${height}%` }}
                  title={`${item.date}: ${item.value}`}
                />
              </div>
              <span className="w-full truncate text-center text-[10px] text-white/30">{String(item.date).slice(5)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RankingList({ title, items, getLabel, getValue, emptyText }) {
  const max = Math.max(...items.map((item) => numberValue(getValue(item))), 1)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-5 text-base font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-white/30">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const value = numberValue(getValue(item))
            return (
              <div key={`${getLabel(item)}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-white/75">{getLabel(item)}</span>
                  <span className="shrink-0 text-white/40">{value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-white/40"
                    style={{ width: `${Math.max((value / max) * 100, 4)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DataCenter() {
  const [days, setDays] = useState(7)
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    dataApi.overview({ days })
      .then((res) => {
        if (res.code === 200) {
          setOverview(res.data)
        } else {
          setError(res.message || '数据加载失败')
        }
      })
      .catch(() => setError('无法加载数据中台概览'))
      .finally(() => setLoading(false))
  }, [days])

  const aiSuccessRate = useMemo(() => {
    const success = numberValue(overview?.aiSuccess)
    const errors = numberValue(overview?.aiErrors)
    const total = success + errors
    if (total === 0) return '0%'
    return `${Math.round((success / total) * 100)}%`
  }, [overview])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pb-24 pt-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-bold">数据中台</h1>
            <p className="mt-2 text-sm text-white/35">统一观察访问、内容和 AI 对话表现</p>
          </div>
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            {[7, 14, 30].map((item) => (
              <button
                key={item}
                onClick={() => setDays(item)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  days === item ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white'
                }`}
              >
                {item} 天
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {loading || !overview ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <MetricCard label="PV" value={overview.pageViews} subLabel="页面访问量" />
              <MetricCard label="UV" value={overview.visitors} subLabel="独立访客" />
              <MetricCard label="事件总数" value={overview.totalEvents} subLabel="全部埋点事件" />
              <MetricCard label="AI 提问" value={overview.aiMessages} subLabel="用户发送次数" />
              <MetricCard label="AI 成功率" value={aiSuccessRate} subLabel="流式响应成功占比" rawValue />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <TrendBars data={overview.trend || []} />
              <RankingList
                title="事件分布"
                items={overview.eventBreakdown || []}
                getLabel={(item) => item.eventType}
                getValue={(item) => item.count}
                emptyText="暂无事件数据"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <RankingList
                title="热门页面"
                items={overview.topPages || []}
                getLabel={(item) => item.pageTitle || item.pagePath}
                getValue={(item) => item.views}
                emptyText="暂无页面访问数据"
              />
              <RankingList
                title="内容与行为排行"
                items={overview.topTargets || []}
                getLabel={(item) => `${item.targetType}: ${item.targetTitle || item.targetId}`}
                getValue={(item) => item.views}
                emptyText="暂无内容行为数据"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
