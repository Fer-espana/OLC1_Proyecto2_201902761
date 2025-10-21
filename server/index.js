const express = require("express");
const cors = require("cors");
const parser = require("./parser/parser");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({limit: '1mb'}));

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
