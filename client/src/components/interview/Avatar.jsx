import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Avatar = ({ isTalking }) => {
  const headRef = useRef();
  const mouthRef = useRef();
  const eyeLRef = useRef();
  const eyeRRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Subtle idle floating/rotation
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      headRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
    }

    // Blink logic
    const blink = Math.sin(time * 2) > 0.98 ? 0.1 : 1;
    if (eyeLRef.current) eyeLRef.current.scale.y = blink;
    if (eyeRRef.current) eyeRRef.current.scale.y = blink;

    // Lip-Sync logic (Volume-based jitter)
    if (mouthRef.current) {
      if (isTalking) {
        // Jitter mouth based on a fast sin wave to simulate speech
        const speechIntensity = Math.sin(time * 25) * 0.4 + 0.5;
        mouthRef.current.scale.y = speechIntensity;
        mouthRef.current.scale.x = 1 + speechIntensity * 0.2;
      } else {
        // Natural resting mouth
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.1, 0.1);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1, 0.1);
      }
    }
  });

  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <Environment preset="city" />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <group ref={headRef} position={[0, 0, 0]}>
          {/* Main Head Shape (Stylized/Futuristic) */}
          <mesh>
            <sphereGeometry args={[1.2, 64, 64]} />
            <MeshDistortMaterial 
              color="#0a0a0a" 
              speed={2} 
              distort={0.2} 
              radius={1}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>

          {/* Eyes */}
          <mesh ref={eyeLRef} position={[-0.4, 0.3, 1]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
          </mesh>
          <mesh ref={eyeRRef} position={[0.4, 0.3, 1]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
          </mesh>

          {/* Mouth / Speaker Bar */}
          <mesh ref={mouthRef} position={[0, -0.4, 1]}>
            <boxGeometry args={[0.5, 0.1, 0.1]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.5} />
          </mesh>

          {/* Halo Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
            <torusGeometry args={[1.5, 0.02, 16, 100]} />
            <meshStandardMaterial color="#06b6d4" transparent opacity={0.3} />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

export default Avatar;
