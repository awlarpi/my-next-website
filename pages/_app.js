import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { query } = router;
  return (
    <>
      <Component {...pageProps} {...query} />
      {/*<Analytics />*/}
    </>
  );
}
