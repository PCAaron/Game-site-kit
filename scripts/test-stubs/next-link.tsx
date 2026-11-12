import type { AnchorHTMLAttributes, ReactNode } from 'react'

type NextLinkStubProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children?: ReactNode
}

export default function Link({ href, children, ...rest }: NextLinkStubProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}
