# 📊 AI-Powered Crime Rate Analysis System

**מערכת ניתוח שיעורי פשיעה מבוססת בינה מלאכותית**

A sophisticated web application that transforms natural language queries into insightful crime statistics analysis. Simply ask questions in Hebrew about crime data, and get immediate, data-driven answers.

## ✨ Key Features

- **🗣️ Natural Language Queries**: Ask questions in Hebrew about crime statistics using everyday language
- **🤖 AI-Powered**: Uses advanced AI (Ollama) to convert your questions into SQL queries
- **📈 Real-Time Analysis**: Get instant insights from comprehensive crime databases
- **🎯 Sample Queries**: Pre-loaded examples to help you explore the data
- **📱 Responsive Design**: Modern, mobile-friendly interface with Hebrew RTL support
- **📊 Data Visualization**: Clear, interactive results display

## 🚀 Example Queries

- "הראה לי שיעורי פשיעה לפי עיר בשנה האחרונה" (Show me crime rates by city in the last year)
- "איזה אזורים הם בעלי שיעורי הפשיעה האלימה הגבוהים ביותר?" (Which areas have the highest violent crime rates?)
- "השווה מגמות פשיעה ברכוש ב-5 השנים האחרונות" (Compare property crime trends over the last 5 years)

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **AI/ML**: Ollama for natural language processing
- **Database**: Vercel Postgres for crime statistics storage
- **Deployment**: Vercel Platform
- **Analytics**: Vercel Analytics

## 🏃‍♂️ Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/crime-rate-analysis.git
cd crime-rate-analysis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Configure your Ollama and Postgres settings
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to start analyzing crime data!

## 🔧 Configuration

Configure your environment variables:
- `OLLAMA_BASE_URL`: Your Ollama server URL
- `OLLAMA_API_KEY`: API key for Ollama (if required)
- `OLLAMA_MODEL`: Model name (default: gpt-oss:120b-cloud)
- `POSTGRES_URL`: Your Vercel Postgres connection string

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by [Kobi Krasnoff](https://github.com/your-username)**

*Making crime data analysis accessible through the power of AI and natural language processing.*
