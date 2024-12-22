require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

// Verify that API_KEY is defined
if (!process.env.API_KEY) {
  console.error("Error: API_KEY is not defined in .env file. Please add it and restart the server.");
  process.exit(1); // Exit the process if the API key is missing
}

// CORS configuration
app.use(
  cors({
    origin: '*', // Replace '*' with specific domains in production
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper function for API requests
async function makeApiRequest(url) {
  try {
    const response = await axios.get(url);
    return {
      status: 200,
      success: true,
      message: "Successfully fetched the data",
      data: response.data,
    };
  } catch (error) {
    console.error("API request error:", error.response ? error.response.data : error.message);
    return {
      status: error.response?.status || 500,
      success: false,
      message: "Failed to fetch data from the API",
      error: error.response?.data || error.message,
    };
  }
}

// Route: Fetch all news
app.get("/all-news", async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 20; // Default page size
  const page = parseInt(req.query.page) || 1; // Default page number
  const q = req.query.q || "world"; // Default search query

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    q
  )}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.API_KEY}`;
  const result = await makeApiRequest(url);
  res.status(result.status).json(result);
});

// Route: Fetch top headlines
app.get("/top-headlines", async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 20; // Default page size
  const page = parseInt(req.query.page) || 1; // Default page number
  const category = req.query.category || "general"; // Default category

  const url = `https://newsapi.org/v2/top-headlines?category=${encodeURIComponent(
    category
  )}&language=en&page=${page}&pageSize=${pageSize}&apiKey=${process.env.API_KEY}`;
  const result = await makeApiRequest(url);
  res.status(result.status).json(result);
});

// Route: Fetch news by country
app.get("/country/:iso", async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 20; // Default page size
  const page = parseInt(req.query.page) || 1; // Default page number
  const country = req.params.iso; // Country ISO code

  const url = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(
    country
  )}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.API_KEY}`;
  const result = await makeApiRequest(url);
  res.status(result.status).json(result);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
