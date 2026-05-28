import {
  Routes,
  Route,
} from "react-router-dom";


import Dashboard from "./pages/Dashboard";

import PrivateRoute from "./components/PrivateRoute";
import Auth from "./pages/Auth";


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Auth />}
      />



      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;