function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        color: 'white',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
          Welcome to GroupUp!
        </h1>
        <p style={{
          fontSize: '1.25rem',
          lineHeight: '1.6',
          opacity: '0.95',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
        }}>
          We help you connect with clubs and activities around you
        </p>
      </div>
    </div>
  );
}
export default Home;