import { Insertable, Selectable, Updateable } from "kysely"

export type Database = {}

export type TldrawFileTable = {
  id: string
  filename: string
  key: string
  created_at: number
}

export type TldrawFile = Selectable<TldrawFileTable>
export type NewTldrawFile = Insertable<TldrawFileTable>
export type TldrawFileUpdate = Updateable<TldrawFileTable>
