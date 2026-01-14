import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, MeshDistortMaterial, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// JSON font from a reliable CDN
const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';

function BrandText() {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(t / 4) / 8;
            meshRef.current.position.y = Math.sin(t / 1.5) / 5;
        }
    });

    return (
        <group ref={meshRef}>
            <Center position={[0, 0.3, 0]}>
                <Text3D
                    font={FONT_URL}
                    size={0.6}
                    height={0.15}
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.02}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
                >
                    Farmared
                    <meshStandardMaterial
                        color="#00b4d8"
                        roughness={0.2}
                        metalness={0.8}
                    />
                </Text3D>
            </Center>

            <Center position={[0, -0.6, 0]}>
                <Text3D
                    font={FONT_URL}
                    size={0.8}
                    height={0.2}
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.03}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
                >
                    88
                    <meshStandardMaterial
                        color="#f72585"
                        roughness={0.1}
                        metalness={0.9}
                        emissive="#f72585"
                        emissiveIntensity={0.15}
                    />
                </Text3D>
            </Center>
        </group>
    );
}

function FloatingElements() {
    const groupRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = t / 10;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Decorative Spheres */}
            <mesh position={[-3, 1.5, -1]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color="#0077b6" roughness={0.1} metalness={0.9} />
            </mesh>

            <mesh position={[3.5, -0.5, -2]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <MeshDistortMaterial color="#90e0ef" speed={3} distort={0.3} transparent opacity={0.6} />
            </mesh>

            <mesh position={[2.5, 2, -1]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.5} />
            </mesh>

            {/* Floating Capsules/Pills */}
            <mesh position={[-2.5, -1.2, 0]} rotation={[0, 0, Math.PI / 4]}>
                <capsuleGeometry args={[0.12, 0.5, 16, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.7} />
            </mesh>

            <mesh position={[3, 1, 0.5]} rotation={[Math.PI / 5, 0, -Math.PI / 5]}>
                <capsuleGeometry args={[0.1, 0.45, 16, 16]} />
                <meshStandardMaterial color="#0077b6" roughness={0.2} metalness={0.7} />
            </mesh>

            <mesh position={[4, -1.5, -1]} rotation={[0, Math.PI / 3, Math.PI / 6]}>
                <capsuleGeometry args={[0.08, 0.35, 16, 16]} />
                <meshStandardMaterial color="#881337" roughness={0.2} metalness={0.7} />
            </mesh>
        </group>
    );
}

function Particles() {
    const particles = useMemo(() => {
        return [...Array(30)].map(() => ({
            position: [
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 8
            ],
            scale: Math.random() * 0.04 + 0.02
        }));
    }, []);

    return (
        <>
            {particles.map((p, i) => (
                <mesh key={i} position={p.position}>
                    <sphereGeometry args={[p.scale, 12, 12]} />
                    <meshStandardMaterial color="#00b4d8" transparent opacity={0.25} />
                </mesh>
            ))}
        </>
    );
}

export default function ThreeScene() {
    return (
        <div style={{ height: '250px', width: '100%', pointerEvents: 'none' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, 5, 5]} intensity={0.8} color="#00b4d8" />
                <spotLight position={[0, 8, 3]} angle={0.4} penumbra={1} intensity={1.5} />

                <Suspense fallback={null}>
                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
                        <BrandText />
                    </Float>
                </Suspense>

                <FloatingElements />
                <Particles />

                <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>
        </div>
    );
}
