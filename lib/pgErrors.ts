/* Telling "this migration has not been run" apart from "something went wrong".
 *
 * Supabase does not speak to Postgres directly, it speaks through PostgREST,
 * and that matters here. When a query reaches Postgres and fails there, the
 * Postgres SQLSTATE comes back untouched -- 23505 for a duplicate key, and so
 * on. But when PostgREST's own schema cache has never heard of the table,
 * function or column being asked for, the request never gets that far, and what
 * comes back is a PGRST2xx code of PostgREST's own invention.
 *
 * "Migration not run" is exactly that second case, so checking only the
 * Postgres code meant every one of these guards was unreachable: the admin was
 * shown an empty list where it should have said which file to run, and saving
 * an article failed with a raw PGRST205 in the logs. Both codes are accepted
 * here because either can legitimately arrive -- the schema cache can also be
 * stale for a table that does exist.
 */
type PgLike = { code?: string } | null | undefined;

/* 42P01 undefined_table / PGRST205 unknown table. */
export function isMissingTable(error: PgLike): boolean {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

/* 42883 undefined_function / PGRST202 unknown function. */
export function isMissingFunction(error: PgLike): boolean {
  return error?.code === "42883" || error?.code === "PGRST202";
}

/* 42703 undefined_column / PGRST204 unknown column. */
export function isMissingColumn(error: PgLike): boolean {
  return error?.code === "42703" || error?.code === "PGRST204";
}
