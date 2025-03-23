const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ConnectDB = require("./configs/dbconfig");
const dotenv = require("dotenv");
const passport = require("passport");
const ConfigPassport = require("./configs/passport");
const users = require("./routes/apis/user");
const files = require("./routes/apis/file");
const cors = require("cors");

app.use(cors());  

dotenv.config();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

// Connect to MongoDB
ConnectDB.connect();

app.use(passport.initialize());
ConfigPassport(passport);

app.use("/api/users", users);
app.use("/api/files", files);

const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
