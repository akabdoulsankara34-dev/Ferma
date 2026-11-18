import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Sparkles,
  Send,
  BotMessageSquare,
  User,
  Lightbulb,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'Comment améliorer l’Indice de Consommation (IC) sur mes lots en croissance ?',
  'Quelle courbe de température et de lumière appliquer du démarrage à la finition ?',
  'Mesures d’urgence en cas de coup de chaleur (> 30°C) dans le bâtiment ?',
  'Comment corriger un manque d’homogénéité (< 85%) dans une bande ?',
  'Calendrier vaccinal recommandé pour un lot de poulets fermiers / chair ?',
];

export const AIAssistantView: React.FC = () => {
  const { flocks, houses, activeFlocksCount, avgSurvivalRate, avgFCR, totalBirds, feedDaysRemaining } = useFarm();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Bonjour ! Je suis votre **Conseiller Vétérinaire & Expert en Suivi des Lots IA**.

Je dispose en temps réel des données de vos bandes :
- **Lots actifs** : ${activeFlocksCount} lot(s) · ${totalBirds.toLocaleString()} sujets en élevage
- **Taux de survie moyen** : ${avgSurvivalRate}%
- **Indice de Consommation (IC) moyen** : ${avgFCR}
- **Bâtiments** : ${houses.length} poulaillers en surveillance · Autonomie aliment ~${feedDaysRemaining} jours

Posez-moi vos questions sur la croissance des lots, le GMQ, l'indice de consommation, l'ambiance des bâtiments ou la prophylaxie.`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const farmSummary = {
        totalBirds,
        activeFlocksCount,
        avgSurvivalRate,
        avgFCR,
        flocks: flocks.map((f) => ({
          name: f.name,
          breed: f.breed,
          ageWeeks: f.ageWeeks,
          count: f.currentCount,
          currentWeightGrams: f.currentWeightGrams,
          targetWeightGrams: f.targetWeightGrams,
          status: f.status,
        })),
        houses: houses.map((h) => ({
          name: h.name,
          temperature: h.temperature,
          humidity: h.humidity,
          lightingHours: h.lightingHours,
        })),
      };

      const res = await fetch('/api/gemini/flock-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, farmSummary }),
      });

      if (!res.ok) {
        throw new Error('Erreur API');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || "Je n'ai pas pu générer de réponse.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackAnswer = `Voici mes recommandations techniques pour le suivi de vos lots :
- **Indice de Consommation (IC ${avgFCR})** : Contrôlez la hauteur des mangeoires (niveau du dos des volailles) pour éviter le gaspillage d'aliment et surveillez les transitions démarrage → croissance → finition.
- **Homogénéité & Croissance** : Réalisez une pesée hebdomadaire sur au moins 100 sujets par bâtiment et ajustez la densité aux abreuvoirs (ratio eau/aliment cible entre 1.8 et 2.1).
- **Régulation thermique** : Maintenez une litière sèche (< 25% humidité) et adaptez la ventilation dès que l'ambiance dépasse les consignes de l'âge du lot.`;

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: fallbackAnswer,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E5D8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A6741] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#3D4035] font-['Outfit',sans-serif]">
              Assistant Vétérinaire & Suivi des Lots IA
            </h2>
            <p className="text-xs md:text-sm text-[#8A8D7C]">
              Expertise zootechnique, croissance des bandes, biosécurité et rentabilité
            </p>
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-[#8A8D7C] flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#D4A373]" /> Questions fréquentes sur le suivi des lots :
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs font-medium bg-white hover:bg-[#E9F0E6] text-[#3D4035] hover:text-[#4A6741] border border-[#E9E5D8] px-3.5 py-1.5 rounded-full transition-all text-left cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-[#E9E5D8] p-4 md:p-6 min-h-[420px] max-h-[560px] flex flex-col justify-between overflow-y-auto space-y-4">
        <div className="space-y-4 overflow-y-auto pr-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#4A6741] text-white flex items-center justify-center shrink-0 mt-1">
                    <BotMessageSquare className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs md:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#4A6741] text-white rounded-tr-xs'
                      : 'bg-[#F9F7F2] text-[#3D4035] border border-[#E9E5D8] rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <span
                    className={`block text-[10px] mt-2 text-right tabular-nums ${
                      isUser ? 'text-white/70' : 'text-[#8A8D7C]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#D4A373] text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-[#4A6741] text-white flex items-center justify-center shrink-0">
                <BotMessageSquare className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-[#F9F7F2] border border-[#E9E5D8] rounded-2xl px-4 py-3 text-xs text-[#8A8D7C] flex items-center gap-2">
                <span>Analyse zootechnique en cours...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 pt-3 border-t border-[#E9E5D8] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Posez une question technique sur vos lots..."
            className="flex-1 bg-[#F9F7F2] border border-[#E9E5D8] rounded-2xl px-4 py-3 text-xs md:text-sm text-[#3D4035] focus:outline-hidden focus:border-[#4A6741]"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="px-5 py-3 bg-[#4A6741] hover:bg-[#3D5235] disabled:opacity-50 text-white rounded-2xl font-bold text-xs md:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
};
