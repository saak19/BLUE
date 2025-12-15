import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AvailabilityPage from './pages/AvailabilityPage';
import BookingsPage from './pages/BookingsPage';
import RequestsPage from './pages/RequestsPage';
import EmbedCodePage from './pages/EmbedCodePage';
import InstantCallPage from './pages/InstantCallPage';
import PublicCallPage from './pages/PublicCallPage';
import { getCurrentUser } from './services/auth';


const PrivateRoute = ({ children }) => {
    const user = getCurrentUser();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route path="/dashboard" element={
                    <PrivateRoute><DashboardPage /></PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute><ProfileSettingsPage /></PrivateRoute>
                } />
                <Route path="/availability" element={
                    <PrivateRoute><AvailabilityPage /></PrivateRoute>
                } />
                <Route path="/bookings" element={
                    <PrivateRoute><BookingsPage /></PrivateRoute>
                } />
                <Route path="/requests" element={
                    <PrivateRoute><RequestsPage /></PrivateRoute>
                } />
                <Route path="/embed-code" element={
                    <PrivateRoute><EmbedCodePage /></PrivateRoute>
                } />
                <Route path="/instant-call" element={
                    <PrivateRoute><InstantCallPage /></PrivateRoute>
                } />

                <Route path="/call/:userId" element={<PublicCallPage />} />

                <Route path="/" element={<Navigate to="/dashboard" />} />

            </Routes>
        </Router>
    );
}

export default App;
