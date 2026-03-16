import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import UserProfile from './components/UserProfile'

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="app-nav">
          <h1>InternLearningNetwork</h1>
          <div className="nav-links">
            <Link to="/profile">My Profile</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/" element={
            <div className="home">
              <h2>Welcome to InternLearningNetwork</h2>
              <p>Building the future of intern learning...</p>
              <Link to="/profile" className="cta-button">View Your Profile</Link>
            </div>
          } />
        </Routes>
      </div>
    )
  }

export default App
