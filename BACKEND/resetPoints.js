const mongoose = require("mongoose");
const Points = require("./models/Points");

mongoose.connect("mongodb+srv://1by23cs277_db_user:pUt6waXvqDc6eZ57@cluster0.v2dsqzi.mongodb.net/StuAlumDB?retryWrites=true&w=majority&appName=Cluster0")
  .then(async () => {
    console.log("Connected ✔");
    await Points.deleteMany({});
    console.log(" Points collection cleared");
    process.exit(0);
  })
  .catch(err => console.error(err));
