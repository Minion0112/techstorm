'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';

import {
    abs,
    blendScreen,
    float,
    mod,
    mx_cell_noise_float,
    oneMinus,
    smoothstep,
    texture,
    uniform,
    uv,
    vec2,
    vec3,
    pass,
    mix,
    add
} from 'three/tsl';

const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

extend(THREE as any);

// Post Processing component
const PostProcessing = ({
    strength = 1,
    threshold = 1,
}: {
    strength?: number;
    threshold?: number;
}) => {
    const { gl, scene, camera } = useThree();

    const render = useMemo(() => {
        const postProcessing = new THREE.PostProcessing(gl as any);
        const scenePass = pass(scene, camera);
        const scenePassColor = scenePass.getTextureNode('output');
        const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

        const final = scenePassColor.add(bloomPass);

        postProcessing.outputNode = final;

        return postProcessing;
    }, [camera, gl, scene, strength, threshold]);

    useFrame(() => {
        render.renderAsync();
    }, 1);

    return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
    const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

    const { material, uniforms } = useMemo(() => {
        const uPointer = uniform(new THREE.Vector2(0));
        const uProgress = uniform(0);

        const strength = 0.01;

        const tDepthMap = texture(depthMap);

        const tMap = texture(
            rawMap,
            uv().add(tDepthMap.r.mul(uPointer).mul(strength))
        );

        const aspect = float(WIDTH).div(HEIGHT);
        const tUv = vec2(uv().x.mul(aspect), uv().y);

        const tiling = vec2(240.0);
        const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

        const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

        const dist = float(tiledUv.length());
        const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

const depth = tDepthMap.r;

const flow = oneMinus(
    smoothstep(0, 0.02, abs(depth.sub(uProgress)))
);

const scanIntensity = dot.mul(flow);

const purple = vec3(0.70, 0.0, 0.85);
const mask = purple.mul(scanIntensity).mul(0.8);

const final = tMap.add(mask);
        const material = new THREE.MeshBasicNodeMaterial({
            colorNode: final,
        });

        return {
            material,
            uniforms: {
                uPointer,
                uProgress,
            },
        };
    }, [rawMap, depthMap]);

    const [w, h] = useAspect(WIDTH, HEIGHT);

    useFrame(({ clock }) => {
        uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    });

    useFrame(({ pointer }) => {
        uniforms.uPointer.value = pointer;
    });

    const scaleFactor = 0.4;
    return (
        <mesh scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
            <planeGeometry />
        </mesh>
    );
};

const SetTransparentBackground = () => {
    const { scene, gl } = useThree();
    useEffect(() => {
        scene.background = null;
        gl.setClearColor(0x000000, 0);
    }, [scene, gl]);
    return null;
};

export const HeroAnimation = () => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas
                flat
                gl={async (props) => {
                    const renderer = new THREE.WebGPURenderer({ ...(props as any), alpha: true });
                    await renderer.init();
                    return renderer;
                }}
            >
                <SetTransparentBackground />
                <PostProcessing />
                <Scene />
            </Canvas>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)', // black overlay
            }}>
                <img src="/logo.svg" alt="Logo" style={{ width: '750px' }} />
            </div>
        </div>
    );
};

export default HeroAnimation;