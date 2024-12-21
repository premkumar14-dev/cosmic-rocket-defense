import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const AuthComponent = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-card/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-primary/20">
        <h2 className="text-2xl font-bold text-center mb-6 text-primary">Welcome to Cosmic Rocket Defense</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                  inputBackground: 'hsl(var(--background))',
                  inputText: 'hsl(var(--foreground))',
                  inputPlaceholder: 'hsl(var(--muted-foreground))',
                  messageText: 'hsl(var(--foreground))',
                  messageTextDanger: 'hsl(var(--destructive))',
                  anchorTextColor: 'hsl(var(--primary))',
                  dividerBackground: 'hsl(var(--border))',
                }
              }
            },
            className: {
              input: 'bg-background text-foreground border-border',
              label: 'text-foreground',
              message: 'text-foreground',
            }
          }}
          providers={[]}
        />
      </div>
    </div>
  );
};