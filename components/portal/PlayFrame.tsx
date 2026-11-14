'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import type { PlayPresentation } from '@/lib/portal/play-presentation'
import { shouldAcceptIframeLoadEvent } from '@/lib/portal/play-presentation'

export type PlayFrameUiState =
  | 'idle'
  | 'loading'
  | 'loaded-event'
  | 'ready'
  | 'timeout'
  | 'external-only'

export interface PlayFrameProps {
  presentation: PlayPresentation
  loadGeneration: number
}

function isUnconfirmedPlayState(state: PlayFrameUiState): boolean {
  return state === 'loading' || state === 'loaded-event'
}

export function PlayFrame({ presentation, loadGeneration }: PlayFrameProps) {
  const activeGenerationRef = useRef(loadGeneration)
  activeGenerationRef.current = loadGeneration

  const [uiState, setUiState] = useState<PlayFrameUiState>(() =>
    presentation.mode === 'production-iframe' ? 'loading' : 'external-only'
  )

  const layoutStyle = useMemo(() => {
    const width = presentation.embedLayout?.width ?? '100%'
    const minHeight =
      presentation.embedLayout?.desktopMinHeightPx != null
        ? `${presentation.embedLayout.desktopMinHeightPx}px`
        : undefined
    return {
      width,
      maxWidth: '100%',
      ...(minHeight ? { minHeight } : {}),
    } as import('react').CSSProperties
  }, [presentation.embedLayout])

  useEffect(() => {
    if (presentation.mode !== 'production-iframe' || !presentation.primaryUrl) {
      setUiState('external-only')
      return
    }

    setUiState('loading')
    const generationAtStart = loadGeneration

    const timer = setTimeout(() => {
      if (activeGenerationRef.current !== generationAtStart) return
      setUiState((current) => {
        if (current === 'ready' || current === 'external-only' || current === 'timeout') {
          return current
        }
        if (isUnconfirmedPlayState(current)) {
          return 'timeout'
        }
        return current
      })
    }, presentation.timeoutMs)

    return () => {
      clearTimeout(timer)
    }
  }, [presentation, loadGeneration])

  const externalUrl = presentation.primaryUrl
  const iframeGeneration = loadGeneration

  const handleIframeLoad = () => {
    if (!shouldAcceptIframeLoadEvent(iframeGeneration, activeGenerationRef.current)) return
    setUiState((current) => (current === 'loading' ? 'loaded-event' : current))
  }

  const handleIframeError = () => {
    if (!shouldAcceptIframeLoadEvent(iframeGeneration, activeGenerationRef.current)) return
    setUiState((current) => (current === 'loading' ? 'loaded-event' : current))
  }

  return (
    <section className="mx-auto w-full space-y-3" style={layoutStyle} aria-label="Game play area">
      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100" role="status">
        {presentation.gameTitle}
      </div>

      {presentation.mode === 'production-iframe' && presentation.primaryUrl ? (
        <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-gray-700">
          <div className="relative aspect-video w-full md:min-h-[480px]">
            <iframe
              id="player"
              key={`${loadGeneration}:${presentation.primaryUrl}`}
              src={presentation.primaryUrl}
              title={`Play ${presentation.gameTitle}`}
              className="absolute inset-0 h-full w-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
          {uiState === 'loading' ? (
            <p className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-center text-sm text-white">
              Loading game…
            </p>
          ) : null}
          {uiState === 'timeout' ? (
            <div className="border-t border-gray-700 bg-gray-900 px-3 py-3 text-sm text-gray-100">
              <p className="mb-2">
                This game is taking longer than usual to load in the embedded player. You can open
                it in a new tab instead.
              </p>
              {externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-400 inline-flex rounded-md px-3 py-2 font-medium text-white focus:outline-none focus-visible:ring-2"
                >
                  Open game in new tab
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 dark:border-gray-700 dark:bg-gray-900/50">
          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
            In-page embed is not enabled for production yet (embed permission or deployment CSP
            verification pending). Use the official launch link below.
          </p>
          {externalUrl ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-400 inline-flex rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2"
            >
              Open game in new tab
            </a>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Launch URL is not verified for this game.
            </p>
          )}
        </div>
      )}

      {presentation.mode === 'production-iframe' && externalUrl ? (
        <p className="text-sm">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
          >
            Open game in new tab
          </a>
        </p>
      ) : null}
    </section>
  )
}
