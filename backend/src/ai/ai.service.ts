import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        'http://localhost:11434/api/embeddings',
        {
          model: 'nomic-embed-text',
          prompt: text,
        },
      );

      return response.data.embedding;
    } catch (e: any) {
      console.error('Erreur Ollama :', e.response?.data || e.message);
      throw e;
    }
  }
}
