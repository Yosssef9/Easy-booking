const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title of the report
  },
  description: {
    type: String,
    required: true, // Description of the report
  },
  userWhoCreatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User who created the report
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now, // Automatically sets the current date when the report is created
  },
});

module.exports = mongoose.model("Report", reportSchema);
