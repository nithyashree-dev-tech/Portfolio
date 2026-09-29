import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Certifications from './pages/Certifications';
import Experience from './pages/Experience';
import Achievements from './pages/Achievements';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import ProtectedRoute from './admin/ProtectedRoute';

function AppContent() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectDetails />} />
              <Route path="/certifications" element={<Certifications />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/projects" element={<AdminDashboard />} />
                <Route path="/admin/certifications" element={<AdminDashboard />} />
                <Route path="/admin/skills" element={<AdminDashboard />} />
                <Route path="/admin/experience" element={<AdminDashboard />} />
                <Route path="/admin/achievements" element={<AdminDashboard />} />
                <Route path="/admin/messages" element={<AdminDashboard />} />
                <Route path="/admin/profile" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
