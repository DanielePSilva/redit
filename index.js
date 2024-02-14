const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(express.json());

const dbName = "Cluster0";
let db;

const client = new MongoClient(process.env.DB_URL);

app.get("/", (req, res) => {
  res.status(200).json(dbName);
});

app.post("/post", async (req, res) => {
  const insertResult = await db.collection("posts").insertMany([req.body]);

  res.status(201).json(insertResult.ops);
});

app.get("/post/comment/:id", async (req, res) => {
  const postId = req.params.id;
  const { comments } = req.body;
  const filteredDocs = await db
    .collection("comment")
    .find({ _id: comments })
    .toArray();
  console.log("Found documents filtered by { a: 3 } =>", filteredDocs);

  res.status(200).json(filteredDocs);
});

app.post("/post/list", async (req, res) => {
  const findResult = await db.collection("posts").find({}).toArray();
  console.log("Found documents =>", findResult);

  res.status(200).json(findResult);
});

app.put("/post/:id", async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;

  const updateResult = await db
    .collection("posts")
    .updateOne({ _id: postId }, { $set: { title, content } });

  console.log("Updated documents =>", updateResult);

  res.status(200).json(updateResult);
});
async function start(app) {
  await client.connect();
  console.log("connect sucessfully to server");
  db = client.db(dbName);

  app.listen(process.env.PORT, () => {
    console.log("server is running(express)");
  });
}

start(app)
  .then(() => console.log("start routine complete"))
  .catch((err) => console.log("star routine error: ", err));
