import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ContactsPage from "./pages/Contacts";
import GroupsPage from "./pages/Groups";
import BalancesPage from "./pages/Balances";
import ExpensesPage from "./pages/Expenses";
import SettlementsPage from "./pages/Settlements";
import PersonsPage from "./pages/Persons";
import OAuthSuccess from "./pages/OAuthSuccess";
import Profile from "./pages/Profile";
import { useAuthContext } from "./hooks/AuthContext.jsx";

function App() {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    // You can use a spinner or skeleton here if you want
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Header />
      <div style={{ paddingTop: "4rem" }}>
        <Routes>
          {/* Landing page on / */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard page */}
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" replace />} />

          {/* Auth pages */}
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Contacts page */}
          <Route path="/contacts" element={isAuthenticated ? <ContactsPage /> : <Navigate to="/signin" replace />} />
          {/* Groups page */}
          <Route path="/groups/:id" element={isAuthenticated ? <GroupsPage /> : <Navigate to="/signin" replace />} />
          {/* Balances page */}
          <Route path="/balances" element={isAuthenticated ? <BalancesPage /> : <Navigate to="/signin" replace />} />
          {/* Expenses pages */}
          <Route path="/expenses" element={isAuthenticated ? <ExpensesPage /> : <Navigate to="/signin" replace />} />
          <Route path="/expenses/new" element={isAuthenticated ? <ExpensesPage /> : <Navigate to="/signin" replace />} />
          {/* Settlements pages */}
          <Route path="/settlements" element={isAuthenticated ? <SettlementsPage /> : <Navigate to="/signin" replace />} />
          <Route path="/settlements/user/:id" element={isAuthenticated ? <SettlementsPage /> : <Navigate to="/signin" replace />} />
          <Route path="/settlements/group/:id" element={isAuthenticated ? <SettlementsPage /> : <Navigate to="/signin" replace />} />
          {/* Persons page */}
          <Route path="/person/:id" element={isAuthenticated ? <PersonsPage /> : <Navigate to="/signin" replace />} />
          {/* Profile page */}
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/signin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;