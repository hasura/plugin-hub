export enum ScalarType {
  string,
  number,
  boolean,
  date,
  unknown
}

export interface ValueObservation {
  datasetKey: string
  row: number
  columnKey: string
  value: any
}

export interface Stats {
  min: number | string
  max: number | string
  average: number | string
  median: number | string
  mode: number | string
  mean: number | string
  stdev: number
  variance: number
  sum?: number
}

export interface ColumnAnalysis {
  unique?: boolean
  counts?: Record<string, number>,
  top50Counts?: Record<string, number>,
  stats?: Stats
  quartiles?: Record<string, number>
  deciles?: Record<string, number>
}

export type Analysis = Record<string, Record<string, ColumnAnalysis>>
export type ObjMap<T> = Record<string, T>
