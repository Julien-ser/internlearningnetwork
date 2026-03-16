import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import UserProfile from './components/UserProfile'
import PostFeed from './components/PostFeed'
import CreatePost from './components/CreatePost'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="app-nav">
          <h1>InternLearningNetwork</h1>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/feed">Post Feed</Link>
            <Link to="/create-post">Create Post</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/profile">My Profile</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/feed" element={<PostFeed />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/" element={
            <div className="home">
              <h2>Welcome to InternLearningNetwork</h2>
              <p className="home-description">
                Share your learning journey, earn points, and level up your skills! 
                Connect with other interns and build your professional profile.
              </p>
              <div className="home-features">
                <div className="feature-card">
                  <h3>📝 Share Knowledge</h3>
                  <p>Create posts about what you're learning and help others</p>
                  <Link to="/create-post" className="cta-button">Create Post</Link>
                </div>
                <div className="feature-card">
                  <h3>🎯 Claim Skills</h3>
                  <p>Learn from others and add skills to your profile</p>
                  <Link to="/feed" className="cta-button">Browse Posts</Link>
                </div>
                <div className="feature-card">
                  <h3>🏆 Compete & Learn</h3>
                  <p>Earn points, level up, and climb the leaderboard</p>
                  <Link to="/leaderboard" className="cta-button">View Leaderboard</Link>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
