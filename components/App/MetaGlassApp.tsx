
import React, { useState, useCallback } from 'react';
import { Theme } from '../../utils/theme';
import { Background } from '../Section/Background';
import { Dock } from '../Section/Dock';
import { DraggableWindow } from '../Core/DraggableWindow';
import { GlassBubble } from '../Package/GlassBubble';
import { Slider, ToggleGroup } from '../Core/Controls';
import { Console } from '../Section/Console';
import { CodeIO } from '../Section/CodeIO';
import { Faders, Code, TerminalWindow } from '@phosphor-icons/react';
import { GlassShape } from '../../utils/glassGenerator';

// --- Types ---
interface GlassState {
  bezel: number;
  intensity: number;
  blur: number;
  radius: number;
  debug: 'off' | 'on';
  shape: GlassShape;
}

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'action' | 'system';
}

export const MetaGlassApp = () => {
  // --- State: Glass Properties ---
  const [glass, setGlass] = useState<GlassState>({
    bezel: 24,
    intensity: 40,
    blur: 0, 
    radius: 48,
    debug: 'off',
    shape: 'rect',
  });

  // --- State: Window Management (#MP) ---
  const [windows, setWindows] = useState([
    { id: 'controls', isOpen: true, zIndex: 10, title: 'Controls', icon: <Faders size={20} weight="duotone" /> },
    { id: 'code', isOpen: false, zIndex: 9, title: 'Code I/O', icon: <Code size={20} weight="duotone" /> },
    { id: 'console', isOpen: false, zIndex: 8, title: 'Console', icon: <TerminalWindow size={20} weight="duotone" /> },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, timestamp: new Date().toLocaleTimeString(), message: 'System initialized. Performance mode active.', type: 'system' }
  ]);

  // --- Actions ---
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => {
      const newLogs = [...prev, { id: Date.now(), timestamp: new Date().toLocaleTimeString(), message, type }];
      return newLogs.slice(-50); // Keep log clean
    });
  }, []);

  const updateGlass = useCallback((key: keyof GlassState, val: any) => {
    setGlass(prev => ({ ...prev, [key]: val }));
    if (Math.random() > 0.95) { 
       addLog(`Property [${key}] updated to ${val}`, 'action');
    }
  }, [addLog]);

  const toggleWindow = useCallback((id: string) => {
    setWindows(prev => {
      const target = prev.find(w => w.id === id);
      if (!target) return prev;
      
      const wasOpen = target.isOpen;
      if (!wasOpen) addLog(`Process spawned: ${target.title}`, 'system');

      const maxZ = Math.max(...prev.map(w => w.zIndex));
      return prev.map(w => 
        w.id === id 
          ? { ...w, isOpen: !wasOpen, zIndex: !wasOpen ? maxZ + 1 : w.zIndex } 
          : w
      );
    });
  }, [addLog]);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      const target = prev.find(w => w.id === id);
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      if (target && target.zIndex === maxZ) return prev;

      return prev.map(w => ({
        ...w,
        zIndex: w.id === id ? maxZ + 1 : w.zIndex
      }));
    });
  }, []);

  const styles = {
    container: { 
      width: '100vw', 
      height: '100vh', 
      position: 'relative' as const, 
      overflow: 'hidden',
      fontFamily: Theme.Type.Readable.Body.M.fontFamily,
      color: Theme.Color.Base.Content[1],
      background: Theme.Color.Base.Surface[1],
      userSelect: 'none' as const,
    },
    glassContainer: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'clamp(300px, 40vw, 500px)',
      height: 'clamp(300px, 40vw, 500px)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  return (
    <div style={styles.container}>
      <Background />
      
      <div style={styles.glassContainer}>
         <GlassBubble 
            {...glass} 
            debug={glass.debug === 'on'} 
         />
      </div>

      {windows.map((win) => (
        <DraggableWindow
          key={win.id}
          id={win.id}
          title={win.title}
          isOpen={win.isOpen}
          zIndex={win.zIndex}
          onClose={() => toggleWindow(win.id)}
          onFocus={() => focusWindow(win.id)}
          width={win.id === 'code' ? '420px' : '300px'}
          height={win.id === 'console' ? '280px' : 'auto'}
        >
          {win.id === 'controls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: Theme.Space.L }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: Theme.Space.S }}>
                  <label style={Theme.Type.Readable.Label.S}>Debug Visualization</label>
                  <ToggleGroup 
                    options={['off', 'on']} 
                    value={glass.debug} 
                    onChange={(v) => {
                      updateGlass('debug', v);
                      addLog(`Debug mode switched ${v}`, 'system');
                    }} 
                  />
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: Theme.Space.S }}>
                  <label style={Theme.Type.Readable.Label.S}>Geometry</label>
                  <ToggleGroup 
                    options={['rect', 'squircle']} 
                    value={glass.shape} 
                    onChange={(v) => {
                      updateGlass('shape', v);
                      addLog(`Shape updated to ${v}`, 'action');
                    }} 
                  />
               </div>

               <div style={{ height: '1px', background: Theme.Color.Base.Surface[3] }} />
               
               <Slider label="Refraction Intensity" value={glass.intensity} min={0} max={100} onChange={(v) => updateGlass('intensity', v)} />
               <Slider label="Bezel Width" value={glass.bezel} min={0} max={100} onChange={(v) => updateGlass('bezel', v)} />
               <Slider label="Surface Blur" value={glass.blur} min={0} max={20} onChange={(v) => updateGlass('blur', v)} />
               {glass.shape === 'rect' && (
                 <Slider label="Corner Radius" value={glass.radius} min={0} max={250} onChange={(v) => updateGlass('radius', v)} />
               )}
            </div>
          )}
          {win.id === 'code' && <CodeIO />}
          {win.id === 'console' && <Console logs={logs} />}
        </DraggableWindow>
      ))}

      <Dock items={windows} onToggle={toggleWindow} />
      
    </div>
  );
};
