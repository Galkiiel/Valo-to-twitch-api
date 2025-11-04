import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// CONFIG À PERSONNALISER
// ===============================
const REGION = "eu"; // change si besoin : eu, na, ap, kr...
const USERNAME = "Nutella"; // <-- mets ton pseudo Valorant
const TAG = "8365"; // <-- mets ton tag Valorant (sans #)
const HENRIK_API_KEY = "THDEV-2d07bab6-1481-44f8-94e7-d6b38fa9c123"; // <-- colle ta clé ici
// ===============================

let baseRR = null;

// Fonction pour récupérer ton RR actuel
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

// Endpoint principal : retourne ton gain/perte RR
app.get("/rr", async (req, res) => {
  const currentRR = await getCurrentRR();
  if (currentRR === null) {
    return res.send("Impossible de récupérer ton RR pour le moment 😕");
  }

  if (baseRR === null) {
    baseRR = currentRR; // première lecture = RR de départ
  }

  const diff = currentRR - baseRR;
  const signe = diff >= 0 ? "+" : "";
  res.send(`${signe}${diff} RR depuis le début du stream`);
});

// Endpoint pour reset le RR de départ
app.get("/reset", async (req, res) => {
  const currentRR = await getCurrentRR();
  if (currentRR !== null) {
    baseRR = currentRR;
    res.send("✅ RR de départ réinitialisé !");
  } else {
    res.send("Erreur : impossible de réinitialiser.");
  }
});

app.listen(PORT, () =>
  console.log(`✅ API RR lancée sur le port ${PORT}`)
);

