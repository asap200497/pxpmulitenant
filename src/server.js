import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";
import dotenv from "dotenv";

// Load env vars from .env file
dotenv.config();

const keyPath = process.env.SITE_KEY;
const certPath = process.env.SITE_CERT;
const port = process.env.PORT;

if (!keyPath || !certPath) {
  throw new Error("Missing SITE_KEY or SITE_CERT env vars");
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

console.log("backend");
console.log(process.env.NEXT_PUBLIC_API);

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();
if ( dev )  {
app.prepare().then(() => {
  createServer( async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
    }).listen(port, (err) => {
    if (err) throw err;
    console.log("✅ HTTP server running at http://localhost:"  + port);

    });
  });
  
} else {
app.prepare().then(() => {
  createServer(options, async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
    }).listen(port, (err) => {
    if (err) throw err;
    console.log("✅ HTTPS server running at https://localhost:"  + port);

    });
  }); 



  
}




