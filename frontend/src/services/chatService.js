import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const sendMessageToAI = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { message });
    return response.data.reply;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch response');
  }
};
