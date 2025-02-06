import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './Demo.tsx'
import EmailEditor from './components/EmailEditor.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <EmailEditor /> */}
    <App />
  </StrictMode>,
)
