-- Custom SQL migration file, put your code below! --
/* Custom migration required, because of a drizzle bug, see github issue below
 * Issue: https://github.com/drizzle-team/drizzle-orm/issues/2675 */

/* IMPORTANT also refresh or restart deegree so it can see the changes in the database */

ALTER TABLE creatures__spawned
ALTER COLUMN geometry TYPE geometry(Point, 28992)
USING ST_SetSRID(geometry, 28992);