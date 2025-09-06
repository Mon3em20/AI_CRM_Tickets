import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AgentDashboard from './pages/agent/Dashboard'
import CustomerDashboard from './pages/customer/Dashboard'
import TicketForm from './pages/customer/TicketForm'
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
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>CRM Ticket System</span>
            <Link to="/customer" style={{ textDecoration: 'none', color: '#007bff' }}>
              Customer Dashboard
            </Link>
            <Link to="/customer/new-ticket" style={{ textDecoration: 'none', color: '#007bff' }}>
              New Ticket
            </Link>
            <Link to="/agent" style={{ textDecoration: 'none', color: '#007bff' }}>
              Agent Dashboard
            </Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<CustomerDashboard />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/new-ticket" element={<TicketForm />} />
          <Route path="/agent" element={<AgentDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
