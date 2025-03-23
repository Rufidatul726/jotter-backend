const mongoose = require('mongoose');
require('dotenv').config();

const ConnectDB = {
    connect: function() {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log("MongoDB successfully connected"))
            .catch(err => console.log(err));
    }
};

module.exports = ConnectDB;