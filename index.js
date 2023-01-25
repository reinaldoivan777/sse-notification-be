const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const PORT = 3000;

// Store all connected clients
let clients = [];

const addSubscriber = (req, res) => {
  // Set necessary headers to establish a stream of events
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  };
  res.writeHead(200, headers);

  // Add a new client that just connected
  // Store the id and the whole response object
  const id = Date.now();
  const client = {
    id,
    res,
  };
  clients.push(client);

  console.log(`Client connected: ${id}`);

  // When the connection is closed, remove the client from the subscribers
  req.on("close", () => {
    console.log(`Client disconnected: ${id}`);
    clients = clients.filter((client) => client.id !== id);
  });
};

const notifySubscribers = (message) => {
  // Send a message to each subscriber
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(message)}\n\n`)
  );
};

// Add a new message and send it to all subscribed clients
const addMessage = (req, res) => {
  const message = req.body;

  // Return the message as a response for the "/message" call
  res.json(message);

  return notifySubscribers(message);
};

// Get a number of the clients subscribed
const getSubscribers = (_req, res) => {
  return res.json(clients.length);
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Define endpoints
app.get("/subscribe", addSubscriber);
app.post("/message", addMessage);
app.get("/status", getSubscribers);

// Start the app
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});