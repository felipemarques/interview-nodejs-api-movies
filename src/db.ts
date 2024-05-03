import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

export async function initialize() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS movies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          release_year INTEGER,
          title TEXT,
          studios TEXT,
          producers TEXT,
          winner TEXT
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

export async function queryDB(sql: string) {
  return new Promise<any[]>((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function create(record: Record<string, any>) {
  return new Promise<void>((resolve, reject) => {
    const keys = Object.keys(record).join(", ");
    const values = Object.values(record).map((value) =>
      typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : value
    );

    const sql = `INSERT INTO movies (${keys}) VALUES (${values.join(", ")})`;

    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
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

  return queryDB(sql);
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

  return queryDB(sql);
}
