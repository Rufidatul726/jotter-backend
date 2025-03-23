const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["folder", "file"],
        required: true
    },
    category: {
        type: String,
        enum: ["image", "video", "audio", "document", "pdf", "other"],
        default: "other"
    },
    size: {
        type: Number,
        default: 0
    },
    path: {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileModel",
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        default: null
    },
},
    { timestamps: true }
);

module.exports = FileModel = mongoose.model("File", FileSchema);