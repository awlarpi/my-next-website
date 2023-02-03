import { atom } from "jotai"

export const resultAtom = atom(null)
export const gameModeAtom = atom("singlePlayer")
export const onlineModeAtom = atom(false)
export const isOpponentTurnAtom = atom(Math.random() < 0.5)
export const squaresAtom = atom(Array(9).fill(null))
export const playerAtom = atom("X")
export const errorAtom = atom(null)
