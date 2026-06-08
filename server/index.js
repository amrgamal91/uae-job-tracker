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
  const { query = "Senior Frontend Engineer UAE", page = 1 } = req.query;
  try {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_b=20&date_posted=week&country=ae`;
    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

// Catch-all: serve React app
app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
