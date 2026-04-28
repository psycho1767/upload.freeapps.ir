const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "../Frontend")));
const PORT = 3000;
console.log("===========================================");
console.info("|  Server start at http://localhost:3000  |");
console.log("===========================================");

const uploadsDir = path.join(__dirname, "uploads");
const dbPath = path.join(__dirname, "files.json");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "[]");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const name = req.body.name;
    cb(null, name + ".enc");
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.static(__dirname));

const readDB = () => JSON.parse(fs.readFileSync(dbPath));
const writeDB = (data) =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const syncFilesOnStart = () => {
  let data = readDB();
  data = data.filter((f) => fs.existsSync(path.join(__dirname, f.path)));
  writeDB(data);
};

const isExpired = (file) => {
  return Date.now() > file.timestamp + file.expire_in_hours * 3600000;
};

const autoCleanExpiredFiles = () => {
  let data = readDB();
  const valid = [];

  data.forEach((f) => {
    const fullPath = path.join(__dirname, f.path);
    if (isExpired(f)) {
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } else {
      valid.push(f);
    }
  });

  writeDB(valid);
};

const generateName = (originalName, existingNames) => {
  let base = cleanFileName(originalName);

  if (!base) base = "file";

  let name = base;
  let i = 1;

  while (existingNames.includes(name)) {
    name = base + "-" + i;
    i++;
  }

  return name;
};

const cleanFileName = (name) => {
  return name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
};

setInterval(autoCleanExpiredFiles, 3600000);

syncFilesOnStart();

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    let { expire_in_hours, passwordProtected } = req.body;

    expire_in_hours = Number(expire_in_hours) || 24;
    if (expire_in_hours <= 0 || expire_in_hours > 24) {
      expire_in_hours = 24;
    }

    let data = readDB();

    const originalName = req.file.originalname;
    const name = generateName(
      originalName,
      data.map((f) => f.name),
    );

    const newFileName = name + ".enc";
    const newPath = path.join(uploadsDir, newFileName);

    fs.renameSync(req.file.path, newPath);

    const record = {
      name,
      originalName,
      path: "uploads/" + newFileName,
      timestamp: Date.now(),
      expire_in_hours,
      passwordProtected: passwordProtected === "true",
    };

    data.push(record);
    writeDB(data);

    res.json({
      success: true,
      name,
      originalName,
      link: `/?file=${name}`,
      expire_in_hours,
    });
  } catch {
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/file/:name", (req, res) => {
  try {
    const name = req.params.name;
    const data = readDB();
    const file = data.find((f) => f.name === name);

    if (!file) return res.status(404).end();

    if (isExpired(file)) {
      const fullPath = path.join(__dirname, file.path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

      writeDB(data.filter((f) => f.name !== name));
      return res.status(410).end();
    }

    const fullPath = path.join(__dirname, file.path);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`,
    );
    res.sendFile(fullPath);
  } catch {
    res.status(500).end();
  }
});

app.get("/api/info/:name", (req, res) => {
  const data = readDB();
  const file = data.find((f) => f.name === req.params.name);

  if (!file) return res.status(404).end();

  if (isExpired(file)) return res.status(410).end();

  res.json({
    name: file.name,
    originalName: file.originalName,
    passwordProtected: file.passwordProtected,
  });
});

app.listen(PORT);
