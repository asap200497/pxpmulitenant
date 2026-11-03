import http from "node:http";
import https from "node:https";
import { parse } from "node:url";
import next from "next";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);

const app = next({ dev });
const handle = app.getRequestHandler();

async function start() {
  await app.prepare();

  const requestHandler = async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  };

  let server;

  if (dev) {
    server = http.createServer(requestHandler);
  } else {
    const keyPath = process.env.SITE_KEY;
    const certPath = process.env.SITE_CERT;

    if (!keyPath || !certPath) {
      throw new Error("Missing SITE_KEY or SITE_CERT");
    }

    server = https.createServer(
      {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
      requestHandler
    );
  }

  server.listen(port, () => {
    console.log(
      `Server running at ${dev ? "http" : "https"}://localhost:${port}`
    );
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});