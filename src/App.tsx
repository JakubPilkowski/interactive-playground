import { Suspense, useEffect, useRef } from "react";
import tunnel from "tunnel-rat";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import { useAppDispatch, useAppSelector } from "./app/store";
import { setModeByShortcut } from "./features/playground/playgroundSlice";

import Controller from "./Controller";
import Renderer from "./Renderer";
import Panel from "./Panel";

const ui = tunnel();

function App() {
  const container = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector((state) => state.playground.currentMode);
  // var w = container.current?.clientWidth;
  // var h = container.current?.clientHeight;
  // var viewSize = h;
  // var aspectRatio = w / h;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      dispatch(setModeByShortcut({ key: e.key }));
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dispatch]);

  return (
    <Suspense fallback={<p>Ładowanie</p>}>
      <ui.Out />
      <div id="canvas-container" ref={container}>
        <Canvas>
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 20]}
            near={1}
            fov={45}
            far={100}
          />
          {/* <OrthographicCamera
            makeDefault
            position={[0, 0, 20]}
            near={1}
            far={10000}
            fov={15}
            left={(-aspectRatio * viewSize) / 2}
            right={(aspectRatio * viewSize) / 2}
            top={viewSize / 2}
            bottom={-viewSize / 2}
            // rotation={{ x: 0, y: 0, z: 0 }}
          /> */}
          <OrbitControls
            makeDefault
            enableRotate={false}
            enablePan
            panSpeed={1.5}
            zoomSpeed={2.5}
            // min zoom in perspective camera
            minDistance={20}
            // max zoom in perspective camera
            maxDistance={100}
            enableDamping={false}
            zoomToCursor
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            enabled={currentMode.movement.playground}
            mouseButtons={{
              LEFT: THREE.MOUSE.PAN,
              // LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN,
            }}
          />
          <Grid
            rotation={[Math.PI / 2, 0, 0]}
            cellSize={0.5}
            position={[0, 0, 0]}
            // sectionSize={100}
            cellThickness={1}
            cellColor={new THREE.Color(1, 0, 0)}
            sectionColor={new THREE.Color(0, 1, 0)}
            infiniteGrid
            visible={false}
            // scale={2}
            // args={[2, 2]}
          />
          <Controller>
            {({ onAdd, onMove, onModeSet }) => (
              <ui.In>
                <Panel onAdd={onAdd} onMove={onMove} onModeSet={onModeSet} />
              </ui.In>
            )}
          </Controller>
          <Renderer />
          {/* </OrthographicCamera> */}
        </Canvas>
      </div>
    </Suspense>
  );
}

export default App;
