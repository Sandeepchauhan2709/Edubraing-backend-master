// const mongoose = require("mongoose");
import mongoose from "mongoose";

const Schema = mongoose.Schema;

export const CloudLinkSchema = new Schema({
    domain_url:String,
    bucket:String,
    folder_name:String,
    file_name:String,
})

// export const CloudLinkSchema = mongoose.model('cloudlink',cloudLinkSchema);
// module.exports = CloudLinkSchema;