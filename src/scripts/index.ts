
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown
}

export function withViewTransition(callback: () => void): void {
  const transitionDocument = document as ViewTransitionDocument

  if (!transitionDocument.startViewTransition) {
    callback()
    return
  }

  transitionDocument.startViewTransition(() => {
    callback()
  })
}
