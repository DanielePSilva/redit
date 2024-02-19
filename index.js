const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");

require("dotenv").config();

app.use(express.json());

const dbName = "Cluster0";
let db;

const client = new MongoClient(process.env.DB_URL);

app.get("/", async (req, res) => {
  try {
    const posts = await db.collection("posts").find({}).toArray();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/post", async (req, res) => {
  try {
    const insertResult = await db.collection("posts").insertOne(req.body);
    console.log(insertResult);
    res.status(201).json(insertResult.ops);
  } catch (error) {
    console.error("Error inserting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/post/comment/:id", async (req, res) => {
  const postId = req.params.id;
  const post = await db
    .collection("post")
    .findOne({ _id: new ObjectId(postId) });

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const commentIds = post.comments || [];
  const comments = await db
    .collection("comments")
    .find({ _id: { $in: commentIds.map(ObjectId()) } })
    .toArray();

  res.status(200).json(comments);
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
