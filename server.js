import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// CONFIG À PERSONNALISER
// ===============================
const REGION = "eu";          // ta région Valorant
const USERNAME = "Nutella";   // ton pseudo
const TAG = "8365";           // ton tag
// ===============================

let baseRR = null;
let wins = 0;
let losses = 0;

// Fonction pour récupérer ton RR actuel depuis valorantrank.chat
async function getCurrentRR() {
  const url = `https://valorantrank.chat/${REGION}/${USERNAME}/${TAG}?onlyRank=true`;

  try {
    const res = await fetch(url);
    const text = await res.text(); // ex: "Nutella#8365 [Platinum 1] : 71 RR"

    const match = text.match(/(\d+)\s*RR/);
    if (!match) return null;

    const rr = parseInt(match[1], 10);
    return rr;
  } catch (err) {
    console.error("Erreur fetch:", err);
    return null;
  }
}

// Endpoint principal : retourne le recap RR
app.get("/rr", async (req, res) => {
  const currentRR = await getCurrentRR();
  if (currentRR === null) {
    return res.send("Impossible de récupérer ton RR pour le moment 😕");
  }

  if (baseRR === null) {
    baseRR = currentRR; // première lecture = RR de départ
  }

  const diff = currentRR - baseRR;

  // Mise à jour wins/losses
  if (diff > wins - losses) {
    wins++;
  } else if (diff < wins - losses) {
    losses++;
  }

  const signe = diff >= 0 ? "+" : "";
  res.send(`${wins} win - ${losses} loose = ${signe}${diff} RR depuis le début du stream`);
});

// Endpoint pour reset le RR de départ
app.get("/reset", async (req, res) => {
  const currentRR = await getCurrentRR();
  if (currentRR !== null) {
    baseRR = currentRR;
    wins = 0;
    losses = 0;
    res.send("✅ RR de départ réinitialisé !");
  } else {
    res.send("Erreur : impossible de réinitialiser.");
  }
});

app.listen(PORT, () =>
  console.log(`✅ API RR lancée sur le port ${PORT}`)
);
