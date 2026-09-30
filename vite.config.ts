import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function geminiCoachPlugin(): Plugin {
  return {
    name: 'gemini-coach-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/coach' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { prompt, context } = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }));
                return;
              }

              const ai = new GoogleGenAI({ apiKey });
              const systemInstruction = `Ты — кибернетический персональный фитнес-тренер CYBER_COACH v4.5 в высокотехнологичном интерфейсе CYBER_FIT.
Твой тон — технологичный, профессиональный, мотивирующий, строгий и поддерживающий.
Используй киберпанк-метафоры умеренно, но отвечай научно и доказательно.
${context || ''}
Отвечай на русском языке кратко, структурированно, без воды, используя списки и жирный шрифт.`;

              const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                  systemInstruction
                }
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: response.text }));
            } catch (err: any) {
              console.error('Gemini coach error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Error generating coach response' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiCoachPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
