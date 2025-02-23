import { useState, useEffect } from "react";
import "./App.css"; // Import the external CSS

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    document.title = "MultiPDFSearcher";
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults((prev) => [...prev, data]);
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleSearch = () => {
    if (socket && keyword.trim()) {
      setResults([]); // Clear previous results
      socket.send(keyword);
    }
  };

  return (
    <div className="app-container">
      <h1>PDF Keyword Search</h1>

      {/* Input & Button in one line */}
      <div className="search-box">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter a keyword..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Dynamic Results Heading */}
      <div className="results-container">
        <h2>{results.length > 0 ? "Results:" : "No Match Found"}</h2>
        <ul>
          {results.map((res, index) => (
            <li key={index}>
              <strong>{res.pdf_name}</strong> - Page {res.page}: {res.snippet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
