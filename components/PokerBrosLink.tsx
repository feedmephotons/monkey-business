'use client'

import { useEffect, useState } from 'react'

const IOS_URL = 'https://apps.apple.com/us/app/pokerbros/id1465194546'
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.kpgame.PokerBros'
const FALLBACK_URL = 'https://www.pokerbros.com/'

export default function PokerBrosLink({ className }: { className?: string }) {
  const [href, setHref] = useState(FALLBACK_URL)

  useEffect(() => {
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setHref(IOS_URL)
    } else if (/Android/i.test(ua)) {
      setHref(ANDROID_URL)
    }
  }, [])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Get PokerBros
    </a>
  )
}
