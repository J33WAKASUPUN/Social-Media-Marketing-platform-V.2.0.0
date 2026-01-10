import api from '@/lib/api';

export interface OptimizePostRequest {
  content: string;
  platform: string;
  brandId?: string;
}

export interface OptimizePostResponse {
  original: string;
  optimized: string;
  platform: string;
  metadata: {
    originalLength: number;
    optimizedLength: number;
    charLimit: number;
  };
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  brandId?: string;
}

export interface ChatResponse {
  conversationId: string;
  userMessage: string;
  aiResponse: string;
  conversation: {
    _id: string;
    title: string;
    messageCount: number;
  };
}

export interface Conversation {
  _id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  lastActivity: Date;
  platform?: string;
  purpose: 'optimization' | 'chat' | 'content_generation';
  messageCount: number;
  lastMessage?: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
}

export interface GenerateContentRequest {
  topic: string;
  platform: string;
  contentType?: string;
  brandId?: string;
}

export const aiApi = {
  /**
   * Optimize post content for specific platform
   */
  optimizePost: async (data: OptimizePostRequest): Promise<{ success: boolean; data: OptimizePostResponse }> => {
    const response = await api.post('/ai/optimize-post', data);
    return response.data;
  },

  /**
   * Chat with AI assistant
   */
  chat: async (data: ChatRequest): Promise<{ success: boolean; data: ChatResponse }> => {
    const response = await api.post('/ai/chat', data);
    return response.data;
  },

  /**
   * Get conversation history
   */
  getConversations: async (params?: {
    brandId?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<{ success: boolean; data: Conversation[]; pagination: any }> => {
    const response = await api.get('/ai/conversations', { params });
    return response.data;
  },

  /**
   * Get single conversation
   */
  getConversation: async (id: string): Promise<{ success: boolean; data: Conversation }> => {
    const response = await api.get(`/ai/conversations/${id}`);
    return response.data;
  },

  /**
   * Update conversation
   */
  updateConversation: async (
    id: string,
    data: { title?: string; status?: string }
  ): Promise<{ success: boolean; data: Conversation }> => {
    const response = await api.patch(`/ai/conversations/${id}`, data);
    return response.data;
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/ai/conversations/${id}`);
    return response.data;
  },

  /**
   * Generate content from topic
   */
  generateContent: async (data: GenerateContentRequest): Promise<{ success: boolean; data: { content: string } }> => {
    const response = await api.post('/ai/generate-content', data);
    return response.data;
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.get('/ai/health');
    return response.data;
  },
};