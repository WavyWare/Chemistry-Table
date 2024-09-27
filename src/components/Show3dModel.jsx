import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars, Line } from '@react-three/drei'; // Import Line from drei
import { useLocation } from 'react-router-dom';

function Electron({ radius, speed, angle }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.x = radius * Math.cos(t + angle);
    ref.current.position.z = radius * Math.sin(t + angle);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="#00aaff" />
    </mesh>
  );
}

function Nucleus({ protons, neutrons }) {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#ff5555" />
    </mesh>
  );
}

// Function to create the electron shell line
function ElectronShell({ radius }) {
  const points = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push([Math.cos(theta) * radius, 0, Math.sin(theta) * radius]);
  }
  return (
    <Line
      points={points}
      color="white"
      lineWidth={1}
      transparent
      opacity={0.5}
    />
  );
}

export default function Atom3DModel() {
  const location = useLocation();
  const element = location.state && location.state.element;

  if (!element) {
    return <div>No element data available.</div>;
  }

  const { symbol, protons, neutrons, electrons,name } = element;

  const electronShells = [];
  const shellLines = [];

  // Simple electron shell distribution
  const shells = [2, 8, 18, 32, 60, 18, 8];
  let remainingElectrons = electrons;
  let shellNumber = 0;

  while (remainingElectrons > 0 && shellNumber < shells.length) {
    const electronsInShell = Math.min(remainingElectrons, shells[shellNumber]);
    const radius = 1 + shellNumber * 0.3;
    
    // Add the electron shell line
    shellLines.push(
      <ElectronShell key={`shell-line-${shellNumber}`} radius={radius} />
    );

    for (let i = 0; i < electronsInShell; i++) {
      const angle = (i / electronsInShell) * Math.PI * 2;
      electronShells.push(
        <Electron
          key={`shell-${shellNumber}-electron-${i}`}
          radius={radius}
          speed={0.5 + shellNumber * 0.1}
          angle={angle}
        />
      );
    }
    remainingElectrons -= electronsInShell;
    shellNumber++;
  }

  return (
    <div className="h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Stars />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <Nucleus protons={protons} neutrons={neutrons} />
        {shellLines} \
        {electronShells} \
        <OrbitControls /> 
      </Canvas>
      <div className="absolute top-4 left-4 text-white">
        <h1 className="text-2xl font-bold">{symbol}</h1>
        <h2 className=''>Name: {name}</h2>
        <p>Protons: {protons}</p>
        <p>Neutrons: {neutrons}</p>
        <p>Electrons: {electrons}</p>
      </div>
    </div>
  );
}
