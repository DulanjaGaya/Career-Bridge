import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import LobbyList from './pages/Lobby/LobbyList';
import CreateLobby from './pages/Lobby/CreateLobby';
import LobbyRoom from './pages/Lobby/LobbyRoom';
import ResourceTracker from './pages/Resource/ResourceTracker';
import Home from './pages/Home';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col">
            <Navbar />
            <Toaster position="top-right" toastOptions={{ style: { background: '#1E293B', color: '#F8FAFC' } }} />
            
            <main className="flex-grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Routes */}
                    <Route path="/lobbies" element={
                        <ProtectedRoute>
                            <LobbyList />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/lobbies/create" element={
                        <ProtectedRoute>
                            <CreateLobby />
                        </ProtectedRoute>
                    } />

                    <Route path="/lobbies/:id" element={
                        <ProtectedRoute>
                            <LobbyRoom />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/resources" element={
                        <ProtectedRoute>
                            <ResourceTracker />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            
            <Footer />
        </div>
    );
}

export default App;
