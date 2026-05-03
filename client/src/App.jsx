import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InterviewSession from './pages/InterviewSession';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/interview" element={<InterviewSession />} />
      </Routes>
    </Router>
  );
}

export default App;


