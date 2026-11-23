import { useEffect } from "react";
import { AppRouter } from "./routes/AppRouter";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Única llamada en useEffect: confirma la sesión en cookie al montar la aplicación.
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
}
