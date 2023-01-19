const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSchema);
