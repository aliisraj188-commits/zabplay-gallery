import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: VideosPage,
});

function VideosPage() {
  return (
    <div style={{ 
      backgroundColor: '#000000', 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#FFD700',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>ZabPlay</h1>
      <p style={{ color: '#ffffff', fontSize: '18px' }}>India's Premium Player</p>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px 30px', 
        border: '2px solid #FFD700', 
        borderRadius: '10px',
        backgroundColor: 'rgba(255, 215, 0, 0.1)'
      }}>
        कन्फर्म: लाल स्क्रीन हट गई है!
      </div>

      <p style={{ marginTop: '20px', color: '#888', fontSize: '12px' }}>
        अब हम अगले स्टेप में आपकी गैलरी जोड़ेंगे।
      </p>
    </div>
  );
}

