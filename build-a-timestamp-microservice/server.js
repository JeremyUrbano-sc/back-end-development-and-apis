import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line

app.get("/api{/:date}", (req, res) => {
  const { date } = req.params;
  let d;
    if (date === undefined) {
    d = new Date();
  } else if (/^-?\d+$/.test(date)) {
    d = new Date(Number(date));
   } else {
    d = new Date(date);
  }
  if (isNaN(d.getTime())) {
    return res.json({ error: "Invalid Date" });
  }
  res.json({ unix: d.getTime(), utc: d.toUTCString() });
});

// Do not change code below this line

const PORT = 8000;
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});