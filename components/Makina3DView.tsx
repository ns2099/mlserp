'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    THREE: any
  }
}

interface Makina3DViewProps {
  makinaAdi: string
}

export default function Makina3DView({ makinaAdi }: Makina3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const animationFrameRef = useRef<number>()
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })

  const [threeLoaded, setThreeLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !threeLoaded) return

    const initScene = () => {
      if (!containerRef.current || !window.THREE) {
        setError('Three.js yüklenemedi')
        return
      }

      try {
        const THREE = window.THREE

        // Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x1a1a1a)
        sceneRef.current = scene

        // Camera
        const camera = new THREE.PerspectiveCamera(
          45,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          1000
        )
        camera.position.set(6, 4, 8)
        camera.lookAt(0, 2, 0)
        cameraRef.current = camera

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        containerRef.current.appendChild(renderer.domElement)
        rendererRef.current = renderer

        // Manuel Mouse Controls (OrbitControls yerine)
        const onMouseDown = (e: MouseEvent) => {
          isDraggingRef.current = true
          previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
          renderer.domElement.style.cursor = 'grabbing'
        }

        const onMouseMove = (e: MouseEvent) => {
          if (!isDraggingRef.current) return

          const deltaX = e.clientX - previousMousePositionRef.current.x
          const deltaY = e.clientY - previousMousePositionRef.current.y

          // Yatay döndürme (y ekseni etrafında)
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.01)
          
          // Dikey döndürme (x ekseni etrafında)
          const verticalAxis = new THREE.Vector3()
          camera.getWorldDirection(verticalAxis)
          verticalAxis.cross(new THREE.Vector3(0, 1, 0))
          camera.position.applyAxisAngle(verticalAxis, deltaY * 0.01)

          camera.lookAt(0, 2, 0)
          previousMousePositionRef.current = { x: e.clientX, y: e.clientY }
        }

        const onMouseUp = () => {
          isDraggingRef.current = false
          renderer.domElement.style.cursor = 'grab'
        }

        const onWheel = (e: WheelEvent) => {
          e.preventDefault()
          const zoomSpeed = 0.1
          const direction = new THREE.Vector3()
          camera.getWorldDirection(direction)
          const distance = camera.position.length()
          const newDistance = distance + e.deltaY * zoomSpeed
          if (newDistance > 2 && newDistance < 30) {
            camera.position.normalize().multiplyScalar(newDistance)
          }
        }

        renderer.domElement.style.cursor = 'grab'
        renderer.domElement.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        renderer.domElement.addEventListener('wheel', onWheel)

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.6))
        const dirLight = new THREE.DirectionalLight(0xffffff, 1)
        dirLight.position.set(5, 10, 5)
        scene.add(dirLight)

        // =======================
        // PLACEHOLDER MAKİNE
        // =======================
        // Ana gövde
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(4, 3, 3),
          new THREE.MeshStandardMaterial({ color: 0x6b6f6d })
        )
        body.position.y = 2
        scene.add(body)

        // Üst hazne
        const hopper = new THREE.Mesh(
          new THREE.BoxGeometry(5, 1.5, 4),
          new THREE.MeshStandardMaterial({ color: 0x7a7f7d })
        )
        hopper.position.y = 4
        scene.add(hopper)

        // Motor (turuncu kısım)
        const motor = new THREE.Mesh(
          new THREE.BoxGeometry(2, 1.5, 2),
          new THREE.MeshStandardMaterial({ color: 0xff6a00 })
        )
        motor.position.set(3, 1.8, 0)
        scene.add(motor)

        // Ayaklar
        for (const x of [-1.5, 1.5]) {
          for (const z of [-1, 1]) {
            const leg = new THREE.Mesh(
              new THREE.BoxGeometry(0.4, 2, 0.4),
              new THREE.MeshStandardMaterial({ color: 0x555555 })
            )
            leg.position.set(x, 1, z)
            scene.add(leg)
          }
        }

        // Animate
        function animate() {
          animationFrameRef.current = requestAnimationFrame(animate)
          renderer.render(scene, camera)
        }
        animate()

        // Responsive
        const handleResize = () => {
          if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
          cameraRef.current.aspect =
            containerRef.current.clientWidth / containerRef.current.clientHeight
          cameraRef.current.updateProjectionMatrix()
          rendererRef.current.setSize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          )
        }
        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
          renderer.domElement.removeEventListener('mousedown', onMouseDown)
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('mouseup', onMouseUp)
          renderer.domElement.removeEventListener('wheel', onWheel)
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }
          if (containerRef.current && rendererRef.current?.domElement) {
            try {
              containerRef.current.removeChild(rendererRef.current.domElement)
            } catch (e) {
              // Ignore
            }
          }
          rendererRef.current?.dispose()
        }
      } catch (err: any) {
        console.error('3D sahne oluşturulurken hata:', err)
        setError(err.message || '3D görünüm yüklenemedi')
      }
    }

    const cleanup = initScene()

    return () => {
      cleanup?.()
    }
  }, [makinaAdi, threeLoaded])

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"
        onLoad={() => {
          if ((window as any).THREE) {
            setThreeLoaded(true)
          } else {
            setError('Three.js yüklenemedi')
          }
        }}
        onError={() => {
          setError('Three.js script yüklenemedi')
        }}
        strategy="lazyOnload"
      />
      <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden relative">
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <p className="text-red-400 mb-2">Hata: {error}</p>
              <p className="text-sm text-gray-400">Sayfayı yenileyin</p>
            </div>
          </div>
        ) : threeLoaded ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>3D görünüm yükleniyor...</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
