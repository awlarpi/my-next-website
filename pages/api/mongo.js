<<<<<<< HEAD
import { connectToDatabase } from "../../functions/mongoDB";
=======
import { clientPromise } from "../../functions/mongoDB";
>>>>>>> f2a9c0e8fcdc74da14f87428d17c94ea1ba807ea

export default async function handler(req, res) {
  try {
    const client = await connectToDatabase();
    const db = client.db("sample_mflix");
    const coll = db.collection("movies");

    const movies = await coll
      .find({})
      .sort({ metacritic: -1 })
      .limit(20)
      .toArray();

    const list = movies.map((movie) => ({
      title: movie.title,
      metacritic: movie.metacritic,
      plot: movie.plot,
    }));

    res.status(200).send(list);
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
}
