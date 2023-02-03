import styles from "../styles/Game.module.css"
import Link from "next/link"
import Head from "next/head"

export default function Home() {
  return (
    <>
      <Head>
        <title>Play Tic Tac Toe Online</title>
        <meta
          property="og:title"
          content="Play Tic Tac Toe Online | Multiplayer Strategy Game"
          key="title"
        />
        <meta
          name="description"
          content="Challenge friends or play against the computer in this classic strategy game. Play Tic Tac Toe online now!"
        />
        <meta
          property="og:description"
          content="Challenge friends or play against the computer in this classic strategy game. Play Tic Tac Toe online now!"
          key="description"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="keywords"
          context="tic tac toe, online, multiplayer, strategy, game"
        />
      </Head>
      <main className={`${styles.landingMain} ${styles["light"]}`}>
        <div className={styles.landingMenu}>
          <Link
            className={styles.landingMenuItem}
            href="/tictactoe/game/offline"
          >
            <h2>
              Play Offline!<span>-&gt;</span>
            </h2>
          </Link>
        </div>
      </main>
    </>
  )
}
