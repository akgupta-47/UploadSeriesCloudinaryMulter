const mongoose = require('mongoose');

const basicSchema = mongoose.Schema({
    name: String,
    file: String,
});

const Basic = mongoose.model('Basic', basicSchema);
module.exports = Basic;