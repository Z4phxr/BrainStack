export const LOGS_PAGE_SIZE = 20

export interface GetLogsParams {
  action?: string
  actorUserId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface LogEntry {
  id: string
  timestamp: Date
  action: string
  actorUserId: string | null
  actorEmail: string | null
  resourceType: string | null
  resourceId: string | null
  metadata: unknown
  createdAt: Date
}

export interface GetLogsResult {
  logs: LogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
