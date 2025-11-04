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

// Stockage en mémoire pour répondre instantanément
let baseRR = null;
let lastRR = null;
let wins = 0;
let losses = 0;

// Fonction pour récupérer ton RR actuel depuis valorantrank.chat
async function fetchCurrentRR() {
  const url = `https://valorantrank.chat/${REGION}/${USERNAME}/${TAG}?onlyRank=true`;

  try {
    const res = await fetch(url);
    const text = await res.text(); // ex: "Nutella#8365 [Platinum 1] : 71 RR"

    const match = text.match(/(\d+)\s*RR/);
    if (!match) return null;

    return parseInt(match[1], 10);
  } catch (err) {
    console.error("Erreur fetch:", err);
    return null;
  }
}

// Fonction pour mettre à jour le RR et calculer wins/losses
async function updateRR() {
  const currentRR = await fetchCurrentRR();
  if (currentRR === null) return lastRR; // si fetch échoue, renvoyer dernier RR connu

  // Réinitialisation automatique si baseRR n'est pas défini
  if (baseRR === null) {
    baseRR = currentRR;
    lastRR = currentRR;
    wins = 0;
    losses = 0;
    return currentRR;
  }

  if (lastRR !== null) {
    const diff = currentRR - lastRR;
    if (diff > 0) wins++;
    if (diff < 0) losses++;
  }

  lastRR = currentRR;
  return currentRR;
}

// Endpoint principal pour StreamElements
app.get("/rr", async (req, res) => {
  // Mettre à jour RR mais renvoyer toujours une réponse instant
  await updateRR();
  const diff = lastRR - baseRR;
  const signe = diff >= 0 ? "+" : "";
  res.send(`${wins} win - ${losses} loose = ${signe}${diff} RR depuis le début du stream`);
});

app.listen(PORT, () => console.log(`✅ API RR lancée sur le port ${PORT}`));
