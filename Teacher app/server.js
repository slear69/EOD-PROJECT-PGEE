const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const port = Number(process.env.PORT || 3000);
const deviceToken = process.env.DEVICE_TOKEN;
const attendanceFile = path.join(__dirname, "attendance.json");
const maxBodyBytes = 8192;

if (!deviceToken) {
  console.error("Set DEVICE_TOKEN before starting the attendance receiver.");
  process.exit(1);
}

let checkIns = [];
let saveQueue = Promise.resolve();

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(data));
}

function isAuthorized(request) {
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    return false;
  }

  const supplied = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(deviceToken);
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytesRead = 0;
    let tooLarge = false;

    request.on("data", (chunk) => {
      if (tooLarge) {
        return;
      }
      bytesRead += chunk.length;
      if (bytesRead > maxBodyBytes) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      if (tooLarge) {
        reject(new Error("Request body is too large."));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function validField(value, maxLength) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength &&
    !/[\u0000-\u001f\u007f]/.test(value);
}

async function saveCheckIns() {
  const tempFile = `${attendanceFile}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(checkIns, null, 2), "utf8");
  await fs.rename(tempFile, attendanceFile);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");

  if (url.pathname === "/api/attendance" && request.method === "GET") {
    sendJson(response, 200, { checkIns });
    return;
  }

  if (url.pathname !== "/api/attendance" || request.method !== "POST") {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  if (!isAuthorized(request)) {
    sendJson(response, 401, { error: "Invalid or missing device token." });
    return;
  }

  if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
    sendJson(response, 415, { error: "Content-Type must be application/json." });
    return;
  }

  let payload;
  try {
    payload = await readJson(request);
  } catch (error) {
    if (!response.destroyed) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    sendJson(response, 400, { error: "Expected a JSON object." });
    return;
  }

  const number = typeof payload.number === "number" ? String(payload.number) : payload.number;
  if (
    !validField(payload.name, 100) ||
    !validField(payload.class, 100) ||
    !validField(number, 40)
  ) {
    sendJson(response, 400, {
      error: 'Expected non-empty "name", "class", and "number" fields.'
    });
    return;
  }

  const checkIn = {
    name: payload.name.trim(),
    class: payload.class.trim(),
    number: number.trim(),
    receivedAt: new Date().toISOString()
  };
  const previousCheckIns = checkIns;
  checkIns = [checkIn, ...checkIns].slice(0, 1000);

  saveQueue = saveQueue.catch(() => {}).then(saveCheckIns);
  try {
    await saveQueue;
  } catch (error) {
    checkIns = previousCheckIns;
    console.error("Could not save attendance locally:", error);
    sendJson(response, 500, { error: "Could not save attendance on this computer." });
    return;
  }

  sendJson(response, 201, { ok: true, checkIn });
  console.log(`Saved local check-in: ${checkIn.name} (${checkIn.number}), ${checkIn.class}`);
});

async function start() {
  try {
    const saved = JSON.parse(await fs.readFile(attendanceFile, "utf8"));
    if (!Array.isArray(saved)) {
      throw new Error("Attendance file must contain a JSON array.");
    }
    checkIns = saved.slice(0, 1000);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not load local attendance:", error);
      process.exit(1);
    }
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Local attendance receiver listening on port ${port}.`);
    console.log(`Arduino endpoint: http://<computer-lan-ip>:${port}/api/attendance`);
    console.log(`Check-ins are saved to ${attendanceFile}`);
  });
}

start();
