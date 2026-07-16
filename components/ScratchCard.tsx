'use client'

import { useRef, useEffect, useState } from 'react'

interface ScratchCardProps {
  flyerIndex: number
}

export default function ScratchCard({ flyerIndex }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const isMouseDownRef = useRef(false)

  // Initialize/reset canvas when flyer changes
  useEffect(() => {
    setIsRevealed(false)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fit canvas resolution to displayed size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // Reset composite operation to draw the coating
      ctx.globalCompositeOperation = 'source-over'

      // Create a gorgeous gold-yellow metallic gradient coating
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      grad.addColorStop(0, '#ffd13b')
      grad.addColorStop(0.5, '#fff066')
      grad.addColorStop(1, '#ffd13b')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add a subtle diagonal stripe pattern for texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
      for (let i = -canvas.width; i < canvas.width; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 15, 0)
        ctx.lineTo(i + canvas.height + 15, canvas.height)
        ctx.lineTo(i + canvas.height, canvas.height)
        ctx.closePath()
        ctx.fill()
      }

      // Draw border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.lineWidth = 4
      ctx.strokeRect(0, 0, canvas.width, canvas.height)

      // Draw dapper instructional text centered on the canvas
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetY = 2
      ctx.fillStyle = '#063c23' // dark felt green
      ctx.font = '900 1.25rem Impact, Arial Black, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const text = 'SCRATCH TO REVEAL FLYER! 🍌'
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)
      
      // Draw subtitle
      ctx.font = 'bold 0.65rem monospace'
      ctx.fillStyle = 'rgba(6, 60, 35, 0.8)'
      ctx.fillText('RUB YOUR FINGER HERE', canvas.width / 2, canvas.height / 2 + 25)
    }

    // Set a slight timeout to ensure the DOM layout and dimensions have rendered
    const timer = setTimeout(resizeCanvas, 100)

    window.addEventListener('resize', resizeCanvas)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [flyerIndex])

  const handleStart = () => {
    isMouseDownRef.current = true
  }

  const handleEnd = () => {
    isMouseDownRef.current = false
    checkScratchPercentage()
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isMouseDownRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 26, 0, Math.PI * 2)
    ctx.fill()
  }

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    let transparentCount = 0

    // Sample every 4th pixel to keep computation extremely fast!
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++
      }
    }

    const totalSamples = pixels.length / 16
    const percentage = (transparentCount / totalSamples) * 100

    // If more than 35% of the card is scratched, auto-reveal!
    if (percentage > 35) {
      setIsRevealed(true)
    }
  }

  if (isRevealed) return null

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchMove={(e) => {
        if (e.touches[0]) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY)
        }
      }}
      className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none select-none transition-opacity duration-300"
    />
  )
}