"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var app = (0, express_1.default)();
app.listen(process.env.PORT, function () {
    console.log("User service is running on http://localhost:".concat(process.env.PORT));
});
