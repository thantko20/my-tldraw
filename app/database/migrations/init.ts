import { Kysely } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.transaction().execute(async (trx) => {
    // create tldraw_file_table
    await trx.schema
      .createTable("tldraw_file")
      .addColumn("id", "text", (col) => col.notNull().primaryKey())
      .addColumn("name", "text", (col) => col.notNull().unique())
      .addColumn("key", "text", (col) => col.notNull())
      .execute()
  })
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await trx.schema.dropTable("tldraw_file").execute()
  })
}
