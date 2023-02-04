import "../styles/globals.css";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { query } = router;
  return (
    <>
      <Component {...pageProps} {...query} />
    </>
  );
}
