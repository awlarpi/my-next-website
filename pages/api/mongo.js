export const config = {
  runtime: "edge",
}

import { clientPromise } from "../../functions/mongoDB"

export default async function handler(req, res) {
  try {
    const client = await clientPromise()
    const db = client.db("sample_mflix")
    const coll = db.collection("movies")

    const movies = await coll
      .find({}, { projection: { _id: 0 } })
      .sort({ metacritic: -1 })
      .limit(20)
      .toArray()

    res.status(200).send(list)
  } catch (e) {
    console.error(e)
    res.status(500).send("Internal Server Error")
  }
}
