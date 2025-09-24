import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Women from "./pages/Women";
import Men from "./pages/Men";
import Kids from "./pages/Kids";
import Accessories from "./pages/Accessories";
import Offers from "./pages/Offers";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import VirtualTryOn from "./pages/VirtualTryOn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/mujeres" element={<Women />} />
            <Route path="/hombres" element={<Men />} />
            <Route path="/ninos" element={<Kids />} />
            <Route path="/accesorios" element={<Accessories />} />
            <Route path="/ofertas" element={<Offers />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/probador-virtual" element={<VirtualTryOn />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
