import React, { useEffect, useState } from 'react';

function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in immediately
    setVisible(true);

    // Start fade out after 2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    // Remove from DOM after fade out completes
    const cleanup = setTimeout(() => {
      onClose();
    }, 2500); // slightly longer than 2s to allow fade-out animation

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? '#28a745' : '#dc3545';

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: bgColor,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '6px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        zIndex: 2000,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {message}
    </div>
  );
}

export default Toast;
