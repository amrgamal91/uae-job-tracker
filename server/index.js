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
  const { query = "Senior Frontend Engineer", page = 1 } = req.query;
  console.log(`[JOB_SEARCH] Query: ${query}, Page: ${page}`);
  
  try {
    // JSearch API with proper parameters
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`;
    console.log(`[JOB_SEARCH] Fetching from: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });
 
    const responseText = await response.text();
    console.log(`[JOB_SEARCH] Response status: ${response.status}`);
    console.log(`[JOB_SEARCH] Response body (first 500 chars): ${responseText.slice(0, 500)}`);
 
    if (!response.ok) {
      console.error(`[JOB_SEARCH] API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: `API error: ${response.statusText}`, details: responseText });
    }
 
    const data = JSON.parse(responseText);
    console.log(`[JOB_SEARCH] Success: ${data.data?.length || 0} jobs found`);
    res.json(data);
  } catch (err) {
    console.error(`[JOB_SEARCH] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});
 
app.get("/health", (_, res) => {
  console.log("[HEALTH] OK");
  res.json({ status: "ok" });
});
 
// Catch-all: serve React app
app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
 
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[SERVER] Listening on port ${PORT}`));