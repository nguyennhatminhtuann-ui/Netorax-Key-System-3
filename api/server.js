const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = 3000;
const DB = path.join(__dirname, "..", "database", "keys.json");

function readDB() {
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}
function send(res, code, type, body) {
  res.writeHead(code, {"Content-Type": type + "; charset=utf-8"});
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/getkey") {
    const db = readDB();
    // DEMO ONLY: this endpoint simulates a successful Link4M callback.
    const key = db.keys.find(k => k.active);
    if (!key) return send(res, 404, "application/json",
      JSON.stringify({success:false,message:"Hiện không có Key khả dụng."}));
    return send(res, 200, "application/json",
      JSON.stringify({success:true,key:key.value}));
  }

  if (url.pathname === "/api/verify") {
    const supplied = url.searchParams.get("key") || "";
    const db = readDB();
    const found = db.keys.find(k => k.value === supplied && k.active);
    return send(res, 200, "application/json",
      JSON.stringify(found
        ? {success:true,message:"Key hợp lệ"}
        : {success:false,message:"Key không hợp lệ"}));
  }

  if (url.pathname === "/") {
    const html = fs.readFileSync(path.join(__dirname, "..", "website", "index.html"), "utf8");
    return send(res, 200, "text/html", html);
  }

  send(res, 404, "text/plain", "Not Found");
});

server.listen(PORT, () => {
  console.log(`Netorax Key System: http://localhost:${PORT}`);
  console.log(`Verify demo: http://localhost:${PORT}/api/verify?key=1`);
});
