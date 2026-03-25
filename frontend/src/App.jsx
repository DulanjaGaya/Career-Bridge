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

// Placeholder home page
const Home = () => (
    <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to the Interview Preparation Platform. Please use the navigation to explore features.</p>
    </div>
);

function App() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <Toaster position="top-right" />
            
            <main className="flex-grow">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    
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
