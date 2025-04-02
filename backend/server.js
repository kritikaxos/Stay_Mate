const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const app = require('./app')
const User =require ('./models/userModel')

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB)
  .then(async (conn) => {
    console.log("DB connected ");
    const dbName = conn.connection.name;
    console.log("Using Database:", dbName);

    const count = await User.countDocuments();
    console.log(`Total users in DB: ${count}`);
  });
  
  const port = process.env.PORT;

  app.listen(port, () => {
    console.log(`App running on port ${port}`);
  });