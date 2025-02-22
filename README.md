# LaTeX Converter

A web application that converts images containing mathematical equations to LaTeX code using AI. Built with Next.js and Supabase.


## Features

- Upload images of any format like PNG, JPG, JPEG, etc.
- AI-powered conversion to LaTeX using Deepseek model via OpenRouter
- Real-time preview of converted LaTeX code with syntax highlighting
- Temporary secure file storage with Supabase
- Modern, responsive UI built with TailwindCSS
- Dark mode support
- File size limit of 10MB

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (>= 18.17.0)
- npm or yarn
- Git

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/samz905/doc2latex.git
   cd doc2latex
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up Supabase:
   - Create a new project on [Supabase](https://supabase.com)
   - Create a storage bucket named 'temp-uploads'
   - Set up storage policies for secure file access
   - Copy the project URL and keys to your `.env.local` file

4. Set up OpenRouter:
   - Create an account on [OpenRouter](https://openrouter.ai)
   - Get your API key
   - Add it to your `.env.local` file

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

Build the application:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## Project Structure

```
doc2latex/
├── src/
│   ├── app/              # Next.js app router files
│   ├── components/       # React components
│   └── styles/          # Global styles
├── public/              # Static files
├── .env.local          # Environment variables
└── package.json        # Dependencies and scripts
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend and storage
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [OpenRouter](https://openrouter.ai/) - AI model access
- [KaTeX](https://katex.org/) - LaTeX rendering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
