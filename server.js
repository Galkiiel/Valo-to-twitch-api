import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// ⚙️ CONFIG À PERSONNALISER
// ===============================
const REGION = "eu";         // ta région Valorant : eu, na, ap, kr...
const USERNAME = "Nutella";  // ton pseudo Valorant
const TAG = "8365";          // ton tag Valorant (sans le #)
const HENRIK_API_KEY = "THDEV-2d07bab6-1481-44f8-94e7-d6b38fa9c123"; // ta clé HenrikDev (si nécessaire)
// ===============================

let baseRR = null;
let lastRR = null;
let wins = 0;
let losses = 0;

// 🧩 Fonction pour récupérer ton RR actuel
async function getCurrentRR() {
  const url = `https://api.henrikdev.xyz/valorant/v2/mmr/${REGION}/${USERNAME}/${TAG}`;

  const res = await fetch(url, {
    headers: { Authorization: HENRIK_API_KEY },
  });
  const data = await res.json();

  if (!data.data || !data.data.current_data) {
    console.error("Erreur API:", data);
    return null;
  }

  return data.data.current_data.rr;
}

// ✅ Endpoint principal : renvoie ton résumé RR
app.get("/rr", async (req, res) => {
  const currentRR = await getCurrentRR();
  if (currentRR === null) {
    return res.send("Impossible de récupérer ton RR pour le moment 😕");
  }

  // Première lecture = base de départ
  if (baseRR === null) {
    baseRR = currentRR;
    lastRR = currentRR;
  }

  // Mise à jour du compteur win/loss
  if (currentRR > lastRR) wins++;
  else if (currentRR < lastRR) losses++;

  lastRR = currentRR;

  const diff = currentRR - baseRR;
  const signe = diff >= 0 ? "+" : "";
  const message = `${wins} win - ${losses} loose = ${signe}${diff} RR`;

  res.send(message);
});

// 🔄 Endpoint pour reset au début du stream
app.get("/reset", async (req, res) => {
  const currentRR = await getCurrentRR();
  if (currentRR !== null) {
    baseRR = currentRR;
    lastRR = currentRR;
    wins = 0;
    losses = 0;
    res.send("✅ Compteur RR réinitialisé !");
  } else {
    res.send("Erreur : impossible de réinitialiser.");
  }
});

app.listen(PORT, () => console.log(`✅ API RR lancée sur le port ${PORT}`));
