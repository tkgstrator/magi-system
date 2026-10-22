import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: async () => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey?.trim()) {
      throw new Error('Missing required environment variable: OPENAI_API_KEY')
    }
    return apiKey
  }
})
