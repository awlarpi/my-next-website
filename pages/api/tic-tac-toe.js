// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { bestBotMove } from "../../functions/tictactoeBot";

export default function handler(req, res) {
  const receivedData = req.body;
  const squares = receivedData.first;
  const isMaximizer = receivedData.second;
  const bestMove = bestBotMove(squares, isMaximizer);
  res.status(200).send(bestMove);
}
