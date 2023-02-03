export function errorHandler(error, setError) {
  console.error(error)
  switch (error.message) {
    case "timeout!":
      setError({ status: 408, message: error.message })
      if (!isOpponentTurn)
        alert("Error! Opponent took too long, connection timed out!")
      break
    case "room deleted!":
      setError({ status: 404, message: error.message })
      alert("Room deleted!")
      break
    case "Error! Opponent left the game!":
      setError({ status: 404, message: error.message })
      alert("Error! Opponent left the game!")
    default:
      setError({ status: 404, message: error.message })
      alert("Error! Opponent left the game!")
      break
  }
}
