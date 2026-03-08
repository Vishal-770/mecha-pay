import { use } from "react";
import "./App.css";
import axios from "axios";

const BASEURL = "https://mecha-pay.vercel.app/api/v1/me";

async function fetchData() {
  try {
    const respone = await axios.get(BASEURL, {
      headers: {
        "x-api-key": "mp_live_dfb6eb6c52c3cce679cb42ff10235a438c48f02d5c90c0a1",
      },
    });
    console.log(respone.data);
  } catch (error) {
    console.error(error);
  }
}
function App() {
  const data = use(fetchData());

  return <></>;
}

export default App;
