import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"

// ---------------------------------------------------------------------------
// FIX: Tooltip tidak muncul di iPad/tablet/HP.
//
// Base UI Tooltip (seperti Radix) hanya di-trigger oleh event hover/focus.
// Di perangkat dengan pointer kasar (touch — iPad, tablet, HP) tidak ada
// event hover sama sekali, jadi tooltip tidak pernah terbuka. Ini murni
// masalah interaction model, bukan z-index/CSS.
//
// Solusi: deteksi media query `(pointer: coarse)`. Di perangkat coarse,
// tooltip dibuka via tap (state terkontrol secara eksplisit oleh kita).
// Di perangkat fine (mouse/trackpad), perilaku hover bawaan Base UI tidak
// diubah sama sekali. Tap di luar tooltip (atau tap trigger lagi) menutup
// tooltip seperti biasa lewat dismiss bawaan Base UI.
//
// Tidak ada perubahan API — seluruh pemakaian <Tooltip>/<TooltipTrigger>
// yang sudah ada di codebase tetap jalan tanpa modifikasi.
// ---------------------------------------------------------------------------

function useIsCoarsePointer() {
  const [isCoarse, setIsCoarse] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(pointer: coarse)")
    setIsCoarse(mq.matches)
    const handler = (e) => setIsCoarse(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return isCoarse
}

const TooltipTouchContext = React.createContext(null)

function TooltipProvider({
  delay = 0,
  ...props
}) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}) {
  const isCoarse = useIsCoarsePointer()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const setOpen = React.useCallback(
    (value) => {
      if (!isControlled) setUncontrolledOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  const ctxValue = React.useMemo(() => ({ isCoarse, open, setOpen }), [isCoarse, open, setOpen])

  return (
    <TooltipPrimitive.Root
      data-slot="tooltip"
      open={open}
      onOpenChange={setOpen}
      {...props}
    >
      <TooltipTouchContext.Provider value={ctxValue}>
        {children}
      </TooltipTouchContext.Provider>
    </TooltipPrimitive.Root>
  )
}

function TooltipTrigger({
  onClick,
  onPointerDown,
  ...props
}) {
  const ctx = React.useContext(TooltipTouchContext)

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onPointerDown={(e) => {
        onPointerDown?.(e)
        // Tandai bahwa interaksi ini berasal dari touch, dipakai onClick di bawah.
        if (ctx) e.currentTarget.dataset.lastPointerType = e.pointerType
      }}
      onClick={(e) => {
        onClick?.(e)
        if (!ctx) return
        const isTouchInteraction =
          ctx.isCoarse || e.currentTarget.dataset.lastPointerType === "touch"
        if (isTouchInteraction) {
          // Base UI tidak membuka tooltip lewat click di perangkat touch,
          // jadi kita toggle manual lewat state terkontrol.
          e.preventDefault()
          ctx.setOpen(!ctx.open)
        }
      }}
      {...props}
    />
  )
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        // z-[1100]: dinaikkan dari z-50 bawaan. `isolate` di sini membuat
        // stacking context baru untuk Popup di dalamnya, jadi z-index Popup
        // (di bawah) percuma dinaikkan sendiri kalau Positioner ini masih
        // z-50  dia yang jadi "plafon"-nya. Tooltip di-portal ke
        // document.body, sama seperti DialogContent (z-[1000]), jadi harus
        // lebih tinggi dari itu supaya tooltip di dalam modal tetap kelihatan.
        className="isolate z-[1100]"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-[1100] inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-[1100] **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-[1100] size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }