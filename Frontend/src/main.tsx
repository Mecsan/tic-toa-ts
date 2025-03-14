import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './css/index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <Toaster />
    <App />
  </>
)
