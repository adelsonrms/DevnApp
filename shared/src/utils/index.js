"use strict";
/**
 * DevnFW Shared Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanString = exports.isValidEmail = exports.sleep = exports.formatDate = exports.generateSlug = void 0;
/**
 * Generates a clean URL-friendly slug from a string
 */
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};
exports.generateSlug = generateSlug;
/**
 * Formats a Date objects to a readable string (YYYY-MM-DD HH:mm:ss)
 */
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().replace('T', ' ').split('.')[0];
};
exports.formatDate = formatDate;
/**
 * Delay execution for a certain amount of milliseconds
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
/**
 * Simple email validation regex
 */
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
exports.isValidEmail = isValidEmail;
/**
 * Clean whitespace from a string
 */
const cleanString = (str) => {
    return str.replace(/\s+/g, ' ').trim();
};
exports.cleanString = cleanString;
