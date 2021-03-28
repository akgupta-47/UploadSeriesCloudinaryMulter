const mongoose = require('mongoose');

const basicSchema = mongoose.Schema({
    name: String,
    menu: String,
});

const Basic = mongoose.model('Basic', basicSchema);
module.exports = Basic;