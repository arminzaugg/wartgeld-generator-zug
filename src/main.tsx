import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "@fontsource/newsreader/latin-500.css"
import "@fontsource/newsreader/latin-500-italic.css"
import "@fontsource/instrument-sans/latin-400.css"
import "@fontsource/instrument-sans/latin-500.css"
import "@fontsource/instrument-sans/latin-600.css"
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
