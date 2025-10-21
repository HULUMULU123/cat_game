import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";

/**
 * Fullscreen loading screen with a skewed (parallelogram) segmented progress bar.
 * Uses styled-components. The wordmark (e.g., "STAKAN") is passed as an image.
 *
 * Props:
 * - wordmarkSrc: string (required) — image URL for the wordmark text
 * - emblemSrc?: string — optional small logo above the wordmark
 * - segmentCount?: number (default 12)
 * - totalDuration?: number ms for auto progress 0→100 (default 6000)
 * - startAt?: number 0–100 (default 0)
 * - autoStart?: boolean (default true)
 * - progress?: number — controlled mode; if provided, auto is disabled
 * - subtitle?: string
 * - onComplete?: () => void
 */
export default function StakanLoader({
  wordmarkSrc,
  emblemSrc,
  segmentCount = 12,
  totalDuration = 6000,
  startAt = 0,
  autoStart = true,
  progress: controlledProgress,
  subtitle = "Грею лапки на клавиатуре…",
  onComplete,
}) {
  if (!wordmarkSrc) {
    throw new Error("StakanLoader: prop `wordmarkSrc` is required (image with the text wordmark)");
  }

  const [internal, setInternal] = useState(Math.max(0, Math.min(100, startAt)));
  const rafRef = useRef(0);
  const startTsRef = useRef(null);

  const isControlled = typeof controlledProgress === "number";
  const progress = isControlled ? controlledProgress : internal;

  useEffect(() => {
    if (isControlled || !autoStart) return;

    const animate = (ts) => {
      if (startTsRef.current == null) startTsRef.current = ts;
      const elapsed = ts - (startTsRef.current || 0);
      const next = Math.min(100, (elapsed / totalDuration) * 100);
      setInternal(next);
      if (next < 100) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isControlled, autoStart, totalDuration, onComplete]);

  useEffect(() => {
    if (progress >= 100) onComplete?.();
  }, [progress, onComplete]);

  const filled = useMemo(
    () => Math.round((segmentCount * Math.max(0, Math.min(100, progress))) / 100),
    [progress, segmentCount]
  );

  return (
    <Screen role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <BgGradient />
      <BgRadial />

      <Content>
        <Brand>
          {emblemSrc ? <Emblem src={emblemSrc} alt="logo" /> : null}
          <Wordmark src={wordmarkSrc} alt="wordmark" />
        </Brand>

        <BarWrap>
          <BarOutline>
            <Segments>
              {Array.from({ length: segmentCount }).map((_, i) => (
                <Segment key={i} $filled={i < filled} />
              ))}
            </Segments>
          </BarOutline>
          <Percent>{Math.round(progress)}%</Percent>
        </BarWrap>

        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      </Content>
    </Screen>
  );
}

// ================= Styled Components =================
const Screen = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #000;
  color: #fff;
  overflow: hidden;
`;

const BgGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.96) 40%, rgba(3,51,35,0.6) 100%);
`;

const BgRadial = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background: radial-gradient(60% 60% at 50% 35%, rgba(30,255,170,0.12) 0%, rgba(0,0,0,0) 60%);
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 720px;
  display: grid;
  gap: 40px;
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  user-select: none;
`;

const Emblem = styled.img`
  width: 72px;
  height: 72px;
  filter: drop-shadow(0 0 12px rgba(255,255,140,0.9));
`;

const Wordmark = styled.img`
  max-width: 90%;
  height: auto;
  filter: drop-shadow(0 0 22px rgba(255,255,255,0.55));
`;

const BarWrap = styled.div`
  width: 100%;
`;

const BarOutline = styled.div`
  width: 100%;
  border: 2px solid rgba(255,255,255,0.85);
  border-radius: 999px;
  padding: 10px;
  box-shadow: 0 0 30px rgba(255,255,255,0.15);
  overflow: hidden;
`;

const Segments = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Segment = styled.div`
  flex: 1;
  height: 32px;
  transform: skewX(-20deg);
  border-radius: 6px;
  ${(p) =>
    p.$filled
      ? css`
          background: #fef08a; /* yellow-200 */
          box-shadow: 0 0 12px rgba(254, 240, 138, 0.9);
        `
      : css`
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.2);
        `}
`;

const Percent = styled.div`
  margin-top: 16px;
  text-align: center;
  font-size: 24px;
  letter-spacing: 0.35em;
  color: rgba(255,255,255,0.9);
`;

const Subtitle = styled.div`
  text-align: center;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.02em;
`;

