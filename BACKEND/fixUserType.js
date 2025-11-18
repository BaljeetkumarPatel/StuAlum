const mongoose = require("mongoose");
const Points = require("./models/Points");

(async () => {
  await mongoose.connect("mongodb+srv://1by23cs277_db_user:pUt6waXvqDc6eZ57@cluster0.v2dsqzi.mongodb.net/StuAlumDB?retryWrites=true&w=majority&appName=Cluster0");

  const res1 = await Points.updateMany(
    { userType: /alumni/i },
    { $set: { userType: "AlumniProfile" } }
  );

  const res2 = await Points.updateMany(
    { userType: /student/i },
    { $set: { userType: "StudentProfile" } }
  );

  console.log("Fixed:", res1, res2);
  process.exit(0);
})();
