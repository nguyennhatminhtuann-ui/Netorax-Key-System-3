const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const DB = path.join(__dirname, "..", "database", "keys.json");
const WEBSITE = path.join(__dirname, "..", "website");

function readDB() {
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}

function send(res, code, type, body) {
  res.writeHead(code, {
    "Content-Type": type + "; charset=utf-8"
  });
  res.end(body);
}

function getContentType(file) {
  const ext = path.extname(file).toLowerCase();

  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
  };

  return types[ext] || "application/octet-stream";
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // =========================
  // GET KEY
  // =========================
  if (url.pathname === "/api/getkey") {
    try {
      const db = readDB();

      const key = db.keys.find(k => k.active);

      if (!key) {
        return send(
          res,
          404,
          "application/json",
          JSON.stringify({
            success: false,
            message: "Hiện không có Key khả dụng."
          })
        );
      }

      return send(
        res,
        200,
        "application/json",
        JSON.stringify({
          success: true,
          key: key.value
        })
      );

    } catch (err) {
      return send(
        res,
        500,
        "application/json",
        JSON.stringify({
          success: false,
          message: "Lỗi database."
        })
      );
    }
  }

  // =========================
  // VERIFY KEY
  // =========================
  if (url.pathname === "/api/verify") {
    try {
      const supplied = url.searchParams.get("key") || "";
      const db = readDB();

      const found = db.keys.find(
        k => k.value === supplied && k.active
      );

      return send(
        res,
        200,
        "application/json",
        JSON.stringify(
          found
            ? {
                success: true,
                message: "Key hợp lệ"
              }
            : {
                success: false,
                message: "Key không hợp lệ"
              }
        )
      );

    } catch (err) {
      return send(
        res,
        500,
        "application/json",
        JSON.stringify({
          success: false,
          message: "Lỗi database."
        })
      );
    }
  }

  // =========================
  // WEBSITE FILES
  // =========================

  let requestedPath;

  if (url.pathname === "/") {
    requestedPath = path.join(WEBSITE, "index.html");
  } else {
    const cleanPath = decodeURIComponent(url.pathname);

    // Không cho truy cập ra ngoài thư mục website
    requestedPath = path.resolve(
      WEBSITE,
      "." + cleanPath
    );

    if (
      requestedPath !== path.resolve(WEBSITE) &&
      !requestedPath.startsWith(path.resolve(WEBSITE) + path.sep)
    ) {
      return send(res, 403, "text/plain", "Forbidden");
    }
  }

  if (!fs.existsSync(requestedPath)) {
    return send(res, 404, "text/plain", "Not Found");
  }

  try {
    const content = fs.readFileSync(requestedPath);

    res.writeHead(200, {
      "Content-Type": getContentType(requestedPath)
    });

    return res.end(content);

  } catch (err) {
    return send(res, 500, "text/plain", "Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Netorax Key System running on port ${PORT}`);
});
