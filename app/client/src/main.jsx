import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import { ThemeProvider } from '@mui/material/styles'
import './main.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      <App/>
    </ThemeProvider >
  </React.StrictMode>
)
