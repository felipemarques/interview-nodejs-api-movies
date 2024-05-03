import express, { Request, Response } from "express";
import cors from "cors";
import { initialize, maxInterval, minInterval } from "./db";
import { importMovies } from "./utils/readCSV";

const app = express();

export async function init() {
  await initialize();
  await importMovies();
  
  app.use(cors());
  app.use(express.json());

  app.get('/movies', async (request: Request, response: Response) => {
    const max = await maxInterval();
    const min = await minInterval();
    return response.status(200).json({ max, min }).send();
  });

  if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Movies-list API listening at http://localhost:${PORT}`);
    });
  }
}

init();

export default app