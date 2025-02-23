import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [searched, setSearched] = useState(false);

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
      setResults([]);
      socket.send(keyword);
      setShowWelcome(false);
      setSearched(true);
    }
  };

  return (
    <div className="container">
      {/* Welcome Message with Animation */}
      {showWelcome && (
        <div className="welcome-message fade-in">
          <h1>Welcome to MultiPDF Searcher</h1>
          <p>Find keywords in multiple PDFs instantly!</p>
        </div>
      )}

      <h1 className="title">MultiPDF Searcher</h1>
      <div className="search-container">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter a keyword..."
          className="input-bounce"
        />
        <button onClick={handleSearch} className="pulse-button">
          Search
        </button>
      </div>

      <div className="results">
        {searched && results.length === 0 && (
          <h2 className="shake">No Match Found</h2>
        )}

        {results.length > 0 && <h2 className="slide-in">Results:</h2>}
        <ul>
          {results.map((res, index) => (
            <li key={index} className="fade-in">
              <strong>{res.pdf_name}</strong> - Page {res.page}: {res.snippet}
              <a
                href={res.download_url}
                download
                className="download-button"
                target="_blank"
              >
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
