import { clientPromise } from "../../functions/mongoDB";

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
