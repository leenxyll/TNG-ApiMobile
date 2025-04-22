const path = require('path');

// เก็บ log ดั้งเดิมไว้
const originalLog = console.log;
const originalError = console.error;

// สร้าง timestamp
function getTimestamp() {
  const now = new Date();
  return now.toLocaleString('th-TH', {
    dateStyle: 'short',
    timeStyle: 'medium'
  });
}

// ดึง path ของไฟล์ที่เรียก console
function getCallerPath() {
  const stack = new Error().stack;
  const stackLines = stack.split('\n');

  const callerLine = stackLines[3] || '';
  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/);

  if (match) {
    const fullPath = match[1];
    const projectRoot = process.cwd();
    const relativePath = path.relative(projectRoot, fullPath);
    return relativePath;
  }

  return 'unknown';
}

// ปรับ console.log
console.log = (...args) => {
  const timestamp = getTimestamp();
  const file = getCallerPath();
  originalLog(`[${timestamp}] [${file}] [LOG]`, ...args);
};

// ปรับ console.error
console.error = (...args) => {
  const timestamp = getTimestamp();
  const file = getCallerPath();
  originalError(`[${timestamp}] [${file}] [ERROR]`, ...args);
};

module.exports = console;
