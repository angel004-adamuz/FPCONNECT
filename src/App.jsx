import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import AlumnoApp from "./pages/AlumnoApp";
import CentroApp from "./pages/CentroApp";
import EmpresaApp from "./pages/EmpresaApp";

export default function App() {
  const [session, setSession] = useState(null);

  const handleLogout = () => setSession(null);

  if (!session) return <LoginPage onLogin={setSession} />;
  if (session.rol === "alumno") return <AlumnoApp user={session} onLogout={handleLogout} />;
  if (session.rol === "centro") return <CentroApp user={session} onLogout={handleLogout} />;
  if (session.rol === "empresa") return <EmpresaApp user={session} onLogout={handleLogout} />;
}
