const fs = require("fs");
const Path = require("path");

const path = require("../util/path");

const deleteFile = (filePath) => {
    fs.unlink(Path.join(path, filePath), (error) => {
        if(error) {
            throw error;
        }
    });
};

exports.deleteFile = deleteFile;