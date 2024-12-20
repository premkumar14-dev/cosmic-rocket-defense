import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const AuthComponent = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome to Cosmic Rocket Defense</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#007AFF',
                  brandAccent: '#0056b3',
                }
              }
            }
          }}
          providers={[]}
        />
      </div>
    </div>
  );
};