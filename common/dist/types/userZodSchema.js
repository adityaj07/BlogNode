"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginBody = exports.signupBody = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signupBody = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email address"),
    name: zod_1.default.string().optional(),
    password: zod_1.default
        .string()
        .min(4, "Password must have a minimum length of 4.")
        .max(6, "Password cannot be of greater than 6 characters."),
});
exports.loginBody = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email address"),
    password: zod_1.default
        .string()
        .min(4, "Password must have a minimum length of 4.")
        .max(6, "Password cannot be of greater than 6 characters."),
});
