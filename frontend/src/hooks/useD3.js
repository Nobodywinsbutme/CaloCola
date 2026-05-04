import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function useD3(render, deps) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return undefined
    const selection = d3.select(ref.current)
    const cleanup = render(selection)
    return typeof cleanup === 'function' ? cleanup : undefined
  }, deps)

  return ref
}
