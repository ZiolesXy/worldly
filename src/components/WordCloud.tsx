import { useEffect, useRef } from 'react'
import '../styles/WordCloud.css'

interface WordData {
  text: string
  value: number
}

interface WordCloudProps {
  data: WordData[]
}

export default function WordCloud({ data }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    containerRef.current.innerHTML = ''

    const maxValue = Math.max(...data.map((d) => d.value))
    const minValue = Math.min(...data.map((d) => d.value))

    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
      '#F8B88B',
      '#A8E6CF',
    ]

    const sortedData = [...data].sort((a, b) => b.value - a.value)

    sortedData.forEach((item, index) => {
      const sizeRatio = (item.value - minValue) / (maxValue - minValue)
      const fontSize = 14 + sizeRatio * 32

      const span = document.createElement('span')
      span.textContent = item.text
      span.className = 'word-item'
      span.style.fontSize = `${fontSize}px`
      span.style.color = colors[index % colors.length]

      containerRef.current?.appendChild(span)
    })
  }, [data])

  return <div ref={containerRef} className="word-cloud-container"></div>
}
