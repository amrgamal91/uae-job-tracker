const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "60aed3eb74msh178c8d96f73dc01p1e7c04jsn4fb51359ecf9";

// Serve React build in production
const distPath = path.join(__dirname, "../client/dist");
app.use(express.static(distPath));

app.get("/api/jobs", async (req, res) => {
  let { query } = req.query;
  
  // Ensure query is provided
  if (!query) {
    console.error("[JOB_SEARCH] No query provided");
    return res.status(400).json({ error: "Query parameter is required" });
  }

  // Clean up query - remove location if appended
  query = query.replace(/\s+UAE$/i, "").replace(/\s+Dubai$/i, "").trim();
  
  console.log(`[JOB_SEARCH] Cleaned query: "${query}"`);
  
  try {
    // Build URL with minimal required parameters
    const params = new URLSearchParams();
    params.append("query", query);
    params.append("page", "1");
    params.append("num_pages", "1");
    
    const url = `https://jsearch.p.rapidapi.com/search?${params.toString()}`;
    console.log(`[JOB_SEARCH] URL: ${url}`);
    console.log(`[JOB_SEARCH] Using API Key: ${RAPIDAPI_KEY.slice(0, 10)}...`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    const responseText = await response.text();
    console.log(`[JOB_SEARCH] Status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[JOB_SEARCH] API returned ${response.status}:`, responseText.slice(0, 300));
      return res.status(response.status).json({ 
        error: `JSearch API error: ${response.statusText}`,
        details: responseText 
      });
    }

    const data = JSON.parse(responseText);
    const jobCount = data.data?.length || 0;
    console.log(`[JOB_SEARCH] Success: ${jobCount} jobs found`);
    
    res.json(data);
  } catch (err) {
    console.error(`[JOB_SEARCH] Exception:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Catch-all: serve React app
app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[SERVER] Ready on port ${PORT}`));