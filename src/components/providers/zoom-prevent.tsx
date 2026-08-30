"use client";

import { useEffect } from "react";

export function ZoomPrevent() {
  useEffect(() => {
    // Mencegah Pinch-to-Zoom (zoom dengan 2 jari)
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Mencegah Double-Tap-to-Zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Mencegah Gesture zoom bawaan browser (khusus Safari iOS)
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    // Mencegah Zoom di Laptop/Desktop (Ctrl + Wheel atau Trackpad Pinch)
    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Mencegah Zoom di Laptop/Desktop (Ctrl + Plus / Minus)
    const preventKeyZoom = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        (e.key === "=" || e.key === "-" || e.key === "+" || e.key === "_")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchstart", preventPinchZoom, { passive: false });
    document.addEventListener("touchmove", preventPinchZoom, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });
    document.addEventListener("gestureend", preventGesture, { passive: false });
    document.addEventListener("wheel", preventWheelZoom, { passive: false });
    document.addEventListener("keydown", preventKeyZoom, { passive: false });

    return () => {
      document.removeEventListener("touchstart", preventPinchZoom);
      document.removeEventListener("touchmove", preventPinchZoom);
      document.removeEventListener("touchend", preventDoubleTapZoom);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      document.removeEventListener("wheel", preventWheelZoom);
      document.removeEventListener("keydown", preventKeyZoom);
    };
  }, []);

  return null;
}
