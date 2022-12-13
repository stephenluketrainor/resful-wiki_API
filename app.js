//Specifying that the dotenv file will be used when running the app on our local server during development

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Requiring modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();
const path = require("path");

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Mongoose
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Mongoose connection open"));

const entrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Entry = mongoose.model("Entry", entrySchema);

//////////////////// Requests targeting all Entries ////////////////////
app
  .route("/entries")
  .get((req, res) => {
    Entry.find((err, foundEntries) => {
      if (!err) {
        res.send(foundEntries);
      } else {
        res.send(err);
      }
    });
  })
  .post((req, res) => {
    const newEntry = new Entry({
      title: req.body.title,
      content: req.body.content,
    });
    newEntry.save((err) => {
      if (!err) {
        res.send("fully added new article");
      } else {
        res.send(err);
      }
    });
  })
  .delete((req, res) => {
    Entry.deleteMany((err) => {
      if (!err) {
        res.send("deleted all entries");
      } else {
        res.send(err);
      }
    });
  });

//////////////////// Requests targeting A Specific Entries ////////////////////

app
  .route("/entries/:entryTitle")
  .get((req, res) => {
    Entry.findOne({ title: req.params.entryTitle }, (err, foundEntry) => {
      if (foundEntry) {
        res.send(foundEntry);
      } else {
        res.send(err);
      }
    });
  })
  .put((req, res) => {
    Entry.replaceOne(
      { title: req.params.entryTitle },
      { title: req.body.title, content: req.body.content },
      (err, updatedEntry) => {
        if (!err) {
          res.send(updatedEntry);
        } else {
          res.send("error updating entry");
        }
      }
    );
  })
  .patch((req, res) => {
    Entry.findOneAndUpdate(
      { title: req.params.entryTitle },
      { $set: req.body },
      (err, updatedEntry) => {
        if (!err) {
          res.send("Successfully updated entry");
        } else {
          res.send(err);
        }
      }
    );
  })
  .delete((req, res) => {
    Entry.deleteOne({ title: req.params.entryTitle }, (err) => {
      if (!err) {
        res.send("Sucessfully deleted entry");
      } else {
        res.send(err);
      }
    });
  });

// Server ports
app.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("listening on port 3000");
  }
});
