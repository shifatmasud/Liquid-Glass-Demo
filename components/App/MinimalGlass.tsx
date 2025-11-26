import React from 'react';
import { motion } from 'framer-motion';
import { Theme } from '../../utils/theme';
import { Glass } from '../Core/Glass';
import { Sparkle, Aperture, Fingerprint } from '@phosphor-icons/react';

export const MinimalGlass = () => {
  return (
    <main style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% -20%, #222, #000)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3], 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(circle, rgba(60, 100, 255, 0.15), transparent 70%)',
          filter: 'blur(60px)',
          borderRadius: '50%',
        }} 
      />
      <motion.div 
         animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2], 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(255, 60, 100, 0.1), transparent 70%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
        }} 
      />

      {/* Main Glass Card */}
      <Glass 
        style={{ 
          width: '90%', 
          maxWidth: '440px', 
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* FIX: Corrected path for content color */}
          <Aperture size={48} color={Theme.Color.Base.Content[1]} weight="light" style={{ marginBottom: '24px' }} />
          
          <h1 style={{ 
            // FIX: Corrected path for display typography
            ...Theme.Type.Expressive.Display.L, 
            fontSize: '64px', 
            margin: '0 0 16px 0',
            letterSpacing: '2px',
            background: 'linear-gradient(180deg, #fff, rgba(255,255,255,0.7))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            METAGLASS
          </h1>
          
          <p style={{ 
            // FIX: Corrected path for body typography
            ...Theme.Type.Readable.Body.M, 
            // FIX: Corrected path for secondary content color
            color: Theme.Color.Base.Content[2], 
            fontSize: '16px',
            marginBottom: '48px',
            maxWidth: '280px',
          }}>
            A minimalist exploration of optical interfaces and digital materiality.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
            <Glass variant="interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
               {/* FIX: Corrected path for primary content color */}
               <Sparkle size={24} color={Theme.Color.Base.Content[1]} style={{ marginBottom: '12px' }} />
               {/* FIX: Corrected paths for body typography and secondary content color */}
               <span style={{ ...Theme.Type.Readable.Body.M, fontSize: '12px', color: Theme.Color.Base.Content[2], letterSpacing: '0.05em', textTransform: 'uppercase' }}>Refract</span>
            </Glass>
            
            <Glass variant="interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
               {/* FIX: Corrected path for primary content color */}
               <Fingerprint size={24} color={Theme.Color.Base.Content[1]} style={{ marginBottom: '12px' }} />
               {/* FIX: Corrected paths for body typography and secondary content color */}
               <span style={{ ...Theme.Type.Readable.Body.M, fontSize: '12px', color: Theme.Color.Base.Content[2], letterSpacing: '0.05em', textTransform: 'uppercase' }}>Touch</span>
            </Glass>
          </div>
        </motion.div>
      </Glass>

      <footer style={{
        position: 'absolute',
        bottom: '32px',
        // FIX: Corrected path for body typography
        ...Theme.Type.Readable.Body.M,
        fontSize: '12px',
        // FIX: Corrected path for tertiary content color
        color: Theme.Color.Base.Content[3],
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        System v1.0
      </footer>
    </main>
  );
};
