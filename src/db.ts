import { promisify } from "util";
// @ts-ignore does not have typings
import jdbc from "jdbc";
// @ts-ignore does not have typings
import jinst from "jdbc/lib/jinst";

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(["h2-2.2.224.jar"]);
}

const h2 = new jdbc({
  url: "jdbc:h2:mem:exoplanets;DB_CLOSE_DELAY=-1",
  drivername: "org.h2.Driver",
  properties: {
    user: "SA",
    password: "",
  },
});

export async function initialize() {
  await promisify(h2.initialize.bind(h2))();
  await queryDB(
    "CREATE TABLE IF NOT EXISTS movies (" +
      "  id INT PRIMARY KEY AUTO_INCREMENT," +
      "  release_year NUMBER," +
      "  title VARCHAR," +
      "  studios VARCHAR," +
      "  producers VARCHAR," +
      "  winner VARCHAR)"
  );
}

export async function queryDB(sql: string) {
  const connection = await promisify(h2.reserve.bind(h2))();
  const statement = await promisify(
    connection.conn.createStatement.bind(connection.conn)
  )();
  const result = await promisify(statement.execute.bind(statement))(sql);
  await promisify(h2.release.bind(h2))(connection);
  return result;
}

export async function create(record: Record<string, any>) {
  const columns = Object.keys(record).join(", ");
  const values = Object.values(record).map((value) =>
    typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : value
  );
  
  const sql = `INSERT INTO movies (${columns}) VALUES (${values.join(", ")});`;

  await queryDB(sql);

  return record;
}

export async function maxInterval() {
  const sql = `
    SELECT producers, MAX(year_diff) AS max_interval, 
           MAX(release_year) - MAX(year_diff) AS previousWin, 
           MAX(release_year) AS followingWin
    FROM (
        SELECT producers, 
               release_year, 
               release_year - LAG(release_year) OVER (PARTITION BY producers ORDER BY release_year) AS year_diff 
        FROM movies 
        WHERE winner = 'yes'
    ) AS intervals 
    WHERE year_diff IS NOT NULL 
    GROUP BY producers 
    HAVING MAX(year_diff) = (
        SELECT MAX(year_diff) 
        FROM (
            SELECT producers, 
                   release_year - LAG(release_year) OVER (PARTITION BY producers ORDER BY release_year) AS year_diff 
            FROM movies 
            WHERE winner = 'yes'
        ) AS sub_intervals
    )
    ORDER BY max_interval DESC
  `;

  const result = await queryDB(sql);

  return await promisify(result.toObjArray.bind(result))();
}

export async function minInterval() {
  const sql = `
    SELECT producers, MIN(year_diff) AS min_interval, 
           MIN(release_year) - MIN(year_diff) AS previousWin, 
           MIN(release_year) AS followingWin
    FROM (
        SELECT producers, 
               release_year, 
               release_year - LAG(release_year) OVER (PARTITION BY producers ORDER BY release_year) AS year_diff 
        FROM movies 
        WHERE winner = 'yes'
    ) AS intervals 
    WHERE year_diff IS NOT NULL 
    GROUP BY producers 
    HAVING MIN(year_diff) = (
      SELECT MIN(year_diff) 
      FROM (
          SELECT producers, 
                 release_year - LAG(release_year) OVER (PARTITION BY producers ORDER BY release_year) AS year_diff 
          FROM movies 
          WHERE winner = 'yes'
      ) AS sub_intervals
  )
    ORDER BY min_interval ASC
  `;

  const result = await queryDB(sql);

  return await promisify(result.toObjArray.bind(result))();
}
