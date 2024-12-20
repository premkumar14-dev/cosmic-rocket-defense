import { Game } from "@/components/Game";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
      <Game />
    </div>
  );
};

export default Index;