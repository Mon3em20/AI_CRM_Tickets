import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AgentDashboard from './pages/agent/Dashboard'
import './App.css'

function App() {

  return (
    <Router>
      <div className="App">
        <nav style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          <Link 
            to="/agent" 
            style={{ 
              textDecoration: 'none', 
              color: '#007bff',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            CRM Ticket System - Agent Dashboard
          </Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<AgentDashboard />} />
          <Route path="/agent" element={<AgentDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
