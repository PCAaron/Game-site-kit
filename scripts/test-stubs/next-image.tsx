import type { ImgHTMLAttributes } from 'react'

export default function Image(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { priority: _priority, ...rest } = props as ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean
  }
  return <img alt="" {...rest} />
}
