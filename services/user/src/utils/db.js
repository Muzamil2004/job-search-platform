"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
var serverless_1 = require("@neondatabase/serverless");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
exports.sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
