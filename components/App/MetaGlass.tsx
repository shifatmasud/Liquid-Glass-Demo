
import React, { useState } from 'react';
import { FluxField } from '../Section/FluxField';
import { Theme } from '../../utils/theme';
import { SnippetDock } from '../Section/SnippetDock';
import { SnippetApps } from '../Section/SnippetApps';
import { ImageGrid } from '../Section/ImageGrid';
import { Footer } from '../Section/Footer';
import { GlassOverlay } from '../Core/GlassOverlay';
import { Slider, ToggleGroup } from '../Core/Controls';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DraggableWindow } from '../Core/DraggableWindow';
import { Dock } from '../Section/Dock';
import { HandDrawnArrow } from '../Core/HandDrawnArrow';

export const MetaGlassApp = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  // Controls State
  const [bezel, setBezel] = useState(24);
  const [refraction, setRefraction] = useState(30);
  const [blur, setBlur] = useState(10);
  const [radius, setRadius] = useState(32);
  const [debug, setDebug] = useState('off');

  // Window State for Controls
  const [windows, setWindows] = useState({ controls: true });
  const toggleWindow = (id: string) => setWindows(prev => ({ ...prev, [id]: !prev[id] }));

  const style = {
    container: {
      width: '100vw',
      minHeight: '100vh',
      background: Theme.Color.Base.Surface[1],
      color: Theme.Color.Base.Content[1],
      fontFamily: Theme.Type.Readable.Body.M.fontFamily,
      overflowX: 'hidden' as const,
      position: 'relative' as const,
    },
    section: {
      padding: '6rem 2rem',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      maxWidth: '900px',
      margin: '0 auto',
      position: 'relative' as const,
      zIndex: 10,
    },
    fluidText: {
      fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
      lineHeight: 1.4,
      fontWeight: 300,
      color: Theme.Color.Base.Content[2],
      maxWidth: '65ch',
    },
    fluidHeader: {
      fontSize: 'clamp(4rem, 12vw, 9rem)',
      fontFamily: Theme.Type.Expressive.Display.L.fontFamily,
      lineHeight: 0.85,
      letterSpacing: '-0.03em',
      marginBottom: '3rem',
      background: 'linear-gradient(to bottom, #fff 20%, #666 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      transform: 'translateZ(0)', // Hardware accel
    },
    glassContainer: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: '800px',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '4rem 0',
      // Ensure we have space for the draggable peel to float around
      perspective: '1000px',
    },
    glassCard: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: '600px',
      height: '300px',
      borderRadius: `${radius}px`,
      // We don't put overflow hidden here so we can see the dock pop out if needed
    },
    peelDraggable: {
      position: 'absolute' as const,
      right: '0%',
      top: '0%',
      width: '140px',
      height: '140px',
      cursor: 'grab',
      zIndex: 30,
    }
  };

  return (
    <div style={style.container}>
      <FluxField />

      {/* Header Section */}
      <section style={{...style.section, minHeight: '80vh'}}>
        <motion.div style={{ opacity, scale, transformOrigin: 'center center' }}>
          <h1 style={style.fluidHeader}>
            LIQUID<br />GLASS
          </h1>
        </motion.div>
      </section>

      {/* Intro Story */}
      <section style={style.section}>
        <p style={style.fluidText}>
          <span style={{ color: '#fff', fontWeight: 500 }}>How do you create backdrop displacement with HTML and CSS?</span><br/><br/>
          SVG. The idea is that you need a displacement map that distorts the input image. 
          In this case, the backdrop of our element (whatever is underneath).
        </p>
        <p style={{...style.fluidText, marginTop: '2rem', fontSize: '1rem', opacity: 0.7 }}>
          You need to update the map image whenever the shape of the element changes.
        </p>
      </section>

      {/* Interactive Demo */}
      <section style={style.section}>
        <div style={style.glassContainer}>
            {/* Background Elements to Distort */}
            <div style={{ position: 'absolute', inset: '-20%', zIndex: 0, opacity: 0.5 }}>
                <div style={{ 
                    position: 'absolute', top: '20%', left: '10%', 
                    width: '150px', height: '150px', 
                    background: 'linear-gradient(135deg, #FF5F57, #E0443E)', 
                    borderRadius: '50%' 
                }} />
                <div style={{ 
                    position: 'absolute', bottom: '30%', right: '15%', 
                    width: '100px', height: '100px', 
                    background: 'linear-gradient(135deg, #28C840, #1E9E30)', 
                    borderRadius: '30%' 
                }} />
                <div style={{ 
                    position: 'absolute', top: '40%', left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    width: '400px', height: '12px', 
                    background: '#fff', opacity: 0.2,
                    borderRadius: 'full' 
                }} />
                {/* Text for Peel context */}
                <div style={{ position: 'absolute', top: '10%', right: '0%', transform: 'rotate(12deg)' }}>
                    <HandDrawnArrow style={{ color: Theme.Color.Base.Content[2], width: 60, transform: 'scaleX(-1) rotate(90deg)' }} />
                </div>
            </div>

            {/* The Main Glass Object */}
            <motion.div 
                style={style.glassCard}
                animate={{ borderRadius: radius }}
            >
                <GlassOverlay 
                    radius={radius}
                    bezel={bezel}
                    refraction={refraction}
                    bgBlur={blur}
                    debug={debug === 'on'}
                />
                
                <div style={{ position: 'relative', zIndex: 20, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SnippetDock />
                </div>
            </motion.div>

            {/* The "Peel" Shape Draggable */}
            <motion.div
                drag
                dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95, cursor: 'grabbing' }}
                style={{
                  ...style.peelDraggable,
                  borderRadius: '0px 50% 50% 50%' // Leaf / Peel shape (Top-Left sharp)
                }}
            >
                 <GlassOverlay 
                    // Pass specific radii: [TL, TR, BR, BL]
                    // 0 = Sharp, 70 = Rounded (half of 140px width)
                    radius={[0, 70, 70, 70]} 
                    bezel={bezel}
                    refraction={refraction * 1.5} // Extra distortion for the peel
                    bgBlur={blur}
                    debug={debug === 'on'}
                />
                <div style={{ 
                    position: 'relative', zIndex: 20, height: '100%', width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <span style={{ ...Theme.Type.Readable.Label.S, color: '#fff', opacity: 0.9 }}>PEEL ME</span>
                </div>
            </motion.div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: Theme.Color.Base.Content[3] }}>
             <code>backdrop-filter: url(#map)</code>
        </div>
      </section>

      {/* Text Block 2 */}
      <section style={style.section}>
        <p style={style.fluidText}>
           Check the "debug" option to see the displacement map used and play with the options.
        </p>
        <p style={{...style.fluidText, marginTop: '1rem', color: '#FF5F57'}}>
           The big one? <code>backdrop-filter: url()</code> currently only works in Chromium.
        </p>
      </section>

      {/* Apps Grid */}
      <section style={style.section}>
         <SnippetApps />
      </section>

      {/* Text Block 3 */}
      <section style={style.section}>
        <p style={style.fluidText}>
          Glass adjusts for different surfaces and use cases.<br />
          Try different modes or freestyle it.
        </p>
      </section>

      {/* Images */}
      <section style={{ ...style.section, padding: '0 1rem' }}>
         <ImageGrid />
      </section>

      {/* Footer Text */}
      <section style={style.section}>
        <p style={style.fluidText}>
          That's it. Go forth and play with SVG filters.<br />
          But maybe do it in Safari and Firefox first.
        </p>
      </section>

      <Footer />

      {/* Floating Controls Window */}
      <DraggableWindow
        id="controls"
        title="Glass Properties"
        isOpen={windows.controls}
        onClose={() => toggleWindow('controls')}
        onFocus={() => {}}
        zIndex={100}
        initialPosition={{ x: 20, y: 100 }}
        width="280px"
        height="auto"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ToggleGroup 
                options={['off', 'on']} 
                value={debug} 
                onChange={setDebug} 
            />
            <Slider 
                label="Bezel Width" 
                value={bezel} 
                min={0} max={60} 
                onChange={setBezel} 
            />
            <Slider 
                label="Refraction" 
                value={refraction} 
                min={0} max={100} 
                onChange={setRefraction} 
            />
            <Slider 
                label="Blur" 
                value={blur} 
                min={0} max={40} 
                onChange={setBlur} 
            />
            <Slider 
                label="Radius" 
                value={radius} 
                min={0} max={100} 
                onChange={setRadius} 
            />
        </div>
      </DraggableWindow>

      <Dock windows={windows} onToggle={toggleWindow} />
    </div>
  );
};
