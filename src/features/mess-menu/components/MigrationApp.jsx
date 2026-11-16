import { useEffect } from "react";

export const MigrationApp = () => {
  useEffect(() => {
    // --- The Migration Logic ---
    const newDomain = 'digi-mess.pages.dev';
    const newURL = `https://${newDomain}`;
    
    // Unregister all old service workers to break the cache trap.
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`Unregistering ${registrations.length} service workers...`);
      for (let registration of registrations) {
        registration.unregister();
      }
      console.log('Service workers unregistered.');
      
      // After a short delay, force a full page navigation to the new domain.
      setTimeout(() => {
        console.log(`Redirecting to ${newURL}`);
        window.location.replace(newURL);
      }, 500); // 500ms delay to ensure unregistration completes
    });
  }, []);

  // Render a simple, friendly loading/redirecting message.
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#111827',
      color: '#f9fafb',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ color: '#f97316' }}>Moving to a New Home!</h1>
      <p>Our app has a new name and a new address.</p>
      <p>Redirecting you to the new Digi Mess app now...</p>
    </div>
  );
};