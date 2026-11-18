import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini Veterinary Diagnosis & Poultry Expert endpoint
app.post("/api/gemini/diagnose", async (req: Request, res: Response) => {
  try {
    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "Clé API Gemini non configurée sur le serveur.",
        fallback: true,
      });
    }

    const { symptoms, flockInfo, mortalityRate, growthDropPercent, eggDropPercent } = req.body;

    const prompt = `Tu es un médecin vétérinaire spécialiste en aviculture (suivi des lots de volailles, poulets de chair, bandes fermières et élevage).
Analyse la situation suivante et donne un diagnostic différentiel aviaire professionnel avec recommandations précises en français.

Données du lot :
- Espèce / Souche : ${flockInfo?.breed || "Poulet de chair / Fermier"}
- Âge : ${flockInfo?.ageWeeks || "Non spécifié"} semaines
- Effectif : ${flockInfo?.count || "Non spécifié"} volailles
- Taux de mortalité récent : ${mortalityRate || 0}%
- Retard de croissance / baisse de consommation observée : ${growthDropPercent ?? eggDropPercent ?? 0}%
- Symptômes observés : ${symptoms || "Aucun symptôme renseigné"}

Formate la réponse sous forme structurée en JSON avec :
1. "diagnosticPrincipal": nom de la pathologie la plus probable (ex: Coccidiose, Bronchite infectieuse, Maladie de Newcastle, Coryza infectieux, Gumboro, Mycoplasmose, Salmonellose, Carence nutritionnelle, Stress thermique)
2. "probabilite": "Élevée" | "Moyenne" | "Faible"
3. "gravite": "Critique" | "Moyenne" | "Faible"
4. "diagnosticsDifferentiels": liste des autres pathologies possibles avec brève justification
5. "mesuresUrgentes": liste d'actions immédiates d'isolement, désinfection et biosécurité
6. "traitementsRecommandes": liste des traitements ou molécules appropriés (antibiotiques, anticoccidiens, vitamines/électrolytes) avec mention du délai d'attente avant sortie du lot
7. "conseilsProphylaxie": mesures préventives futures`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    try {
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch {
      return res.json({ rawText: responseText });
    }
  } catch (err: any) {
    console.error("Gemini diagnosis error:", err);
    res.status(500).json({ error: err.message || "Erreur d'analyse vétérinaire" });
  }
});

// Gemini Assistant for Poultry Farm Optimization
app.post("/api/gemini/flock-advisor", async (req: Request, res: Response) => {
  try {
    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "Clé API Gemini non configurée sur le serveur.",
        fallback: true,
      });
    }

    const { question, farmSummary } = req.body;

    const prompt = `Tu es un conseiller expert en aviculture et suivi de lots (élevage de bandes de volailles, poulets de chair/fermiers, croissance, indice de consommation, santé et rentabilité).
Réponds à la question de l'éleveur de manière concrète, pratique et chiffrée.

Contexte des lots de la ferme :
${JSON.stringify(farmSummary, null, 2)}

Question de l'éleveur :
${question}

Réponds avec bienveillance, précision technique avicole (GMQ, indice de consommation, homogénéité, taux de survie, ration en g/sujet/j, température, ventilation, programme lumineux, etc.) en français avec un formatage Markdown clair.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    return res.json({ answer: response.text });
  } catch (err: any) {
    console.error("Gemini advisor error:", err);
    res.status(500).json({ error: err.message || "Erreur de conseil avicole" });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Avicool démarré sur http://localhost:${PORT}`);
  });
}

startServer();
