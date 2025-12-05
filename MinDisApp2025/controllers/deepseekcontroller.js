const axios = require('axios');

const chatController = {
  handleChat: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: 'Ikke logget ind' });
      }

      const { message } = req.body;
      
      if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Besked må ikke være tom' });
      }

      // Tjek om DeepSeek API nøglen er konfigureret
      if (!process.env.DEEPSEEK_API_KEY) {
        console.error('DEEPSEEK_API_KEY er ikke konfigureret');
        return res.status(500).json({ error: 'AI service er ikke konfigureret korrekt' });
      }

      // SYSTEM PROMPT - Fortæller AI'en hvem den er
      const systemPrompt = `Du er en venlig og hjælpsom chatbot for Understory (https://understory.io/da), en platform der hjælper virksomheder med at forstå og forbedre deres kundeoplevelser. 

Om Understory:
- Understory er en dansk SaaS platform
- De hjælper virksomheder med at indsamle og analysere kundefeedback
- De fokuserer på kundeoplevelser og kundetilfredshed
- Platformen giver insights til at forbedre kunderelationer
- email: info@understory.io
- 1 kr. første måned

Din rolle:
- Hjælp brugere med spørgsmål om Understory
- Forklar hvordan Understory kan hjælpe virksomheder
- Vejled i kundeoplevelse og feedback management
- Vær professionel og imødekommende
- Sig at du er Understory's chatbot når samtalen starter

Svar altid på dansk medmindre brugeren beder om andet.`;

      const response = await axios.post('https://api.deepseek.com/chat/completions', {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt }, // SYSTEM message til identitet
          { role: "user", content: message } // USER message
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 sekunder timeout
      });

      if (!response.data.choices || !response.data.choices[0]) {
        throw new Error('Uventet svar fra AI service');
      }

      res.json({ 
        reply: response.data.choices[0].message.content 
      });
      
    } catch (error) {
      console.error('DeepSeek API error:', error);
      
      if (error.response?.status === 429) {
        return res.status(429).json({ error: 'For mange anmodninger. Vent venligst.' });
      }
      
      if (error.response?.status === 401) {
        return res.status(500).json({ error: 'Ugyldig API-nøgle' });
      }

      if (error.response?.data?.error?.message?.includes('Insufficient Balance')) {
        return res.status(500).json({ 
          error: 'Ingen kreditter tilbage på kontoen. Opret en ny API nøgle eller tilføj penge.' 
        });
      }
      
      if (error.response?.data?.error) {
        return res.status(500).json({ error: error.response.data.error.message });
      }
      
      res.status(500).json({ error: 'Fejl ved kommunikation med AI' });
    }
  }
};

module.exports = chatController;