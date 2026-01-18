"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_js_1 = require("datauri/parser.js");
var path_1 = require("path");
var getBuffer = function (file) {
    var parser = new parser_js_1.default();
    var extName = path_1.default.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);
};
exports.default = getBuffer;
