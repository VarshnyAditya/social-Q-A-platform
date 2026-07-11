import mongoose from "mongoose";

const savedquestionschema = mongoose.Schema({
  userid: { type: String, required: true, index: true },
  questionid: { type: String, required: true },
  savedon: { type: Date, default: Date.now },
});

// A user can never save the same question twice — enforced at the DB level
// in addition to the check the controller does before inserting.
savedquestionschema.index({ userid: 1, questionid: 1 }, { unique: true });

export default mongoose.model("savedquestion", savedquestionschema);
