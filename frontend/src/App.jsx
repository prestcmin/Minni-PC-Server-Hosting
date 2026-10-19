import { useState } from "react";
import { getHealth } from "./services/api";


function App() {
  const [status, setStatus] = useState("Not tested");
  const [error, setError] = useState("");


  async function testBackend() {
    setError("");
    setStatus("Testing...");

    try {
      const result = await getHealth();
      setStatus(result.status);
    } catch (requestError) {
      setStatus("Backend unavailable");
      setError(requestError.message);
    }
  }


  return (
    <main>
      <h1>Minni-PC Server Hosting</h1>

      <button onClick={testBackend}>
        Test Backend Connection
      </button>

      <p>Backend status: {status}</p>

      {error && <p>{error}</p>}
    </main>
  );
}


export default App;
