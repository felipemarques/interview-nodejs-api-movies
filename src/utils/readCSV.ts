import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { create } from "../db";

export async function importMovies() {
  const movies: Record<string, any>[] = [];

  createReadStream("./movielist.csv")
    .pipe(parse({ delimiter: ";", from_line: 2 }))
    .on("data", async (row: string[]) => {
      movies.push({
        release_year: Number(row[0]),
        title: row[1],
        studios: row[2],
        producers: row[3],
        winner: row[4],
      });
    })
    .on("end", async () => {
      for await (const movie of movies) {
        await create(movie);
      }
    })
    .on("error", function (error: Error) {
      console.error(error.message);
    });

}
