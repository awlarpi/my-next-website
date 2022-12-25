// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { bestBotMove } from "../../functions/tictactoeBot";
import axios from "axios";

export default function handler(req, res) {
  const receivedData = req.body;
  const squares = receivedData.first;
  const isMaximizer = receivedData.second;
  const player = isMaximizer ? "X" : "O";

  // const bestMove = bestBotMove(squares, isMaximizer);
  var data = JSON.stringify({
    dataSource: "Cluster0",
    database: "tactactoe",
    collection: "multiplayer_room_data",
    document: {
      "Game Room": 0,
      "Board State": squares,
      "Player Turn": player,
    },
  });

  var config = {
    method: "post",
    url: "https://data.mongodb-api.com/app/data-xaqjl/endpoint/data/v1/action/insertOne",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
      "api-key":
        "Pcg80jYzJO7SQc14T4bsA0nyD5wUtrgDz8xWPNPjScj0kjEQGBjemAryVFoLbuVK",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  res.status(200).send(bestMove);
}
