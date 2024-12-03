'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ModPageContent() {
  const searchParams = useSearchParams()
  const dirName = searchParams.get('dirname')

  return <div>{dirName}</div>
}

export default function ModPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModPageContent />
    </Suspense>
  )
}