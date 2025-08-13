import styled from "styled-components"

const StyledWrapper = styled.div`
    /* Настраиваемые параметры */
  --r: 14px;        /* радиус внешних углов */
  --ir: 12px;       /* радиус внутренних углов выреза */
  --notch-w: 44%;   /* ширина выреза по низу (процент от ширины) */
  --notch-h: 28%;   /* высота выреза (насколько поднимается вверх) */

  /* Вспомогательные */
  --xL: calc(50% - var(--notch-w) / 2);   /* левая грань выреза */
  --xR: calc(50% + var(--notch-w) / 2);   /* правая грань выреза */
  --yTop: calc(100% - var(--notch-h));    /* верх выреза */

  width: 420px;
  height: 160px;
  background: rgba(0, 170, 255, 0.25);

  /* Все углы (внешние и внутренние) — сглажены */
  clip-path: path(
    "M var(--r) 0
     H calc(100% - var(--r))
     Q 100% 0 100% var(--r)
     V calc(100% - var(--r))
     Q 100% 100% calc(100% - var(--r)) 100%

     H var(--xR)
     Q var(--xR) 100% var(--xR) calc(100% - var(--ir))      /* плавный поворот снизу вправо -> вверх (правая ножка) */
     V calc(var(--yTop) + var(--ir))
     Q var(--xR) var(--yTop) calc(var(--xR) - var(--ir)) var(--yTop)  /* плавный верхний правый внутренний угол выреза */

     H calc(var(--xL) + var(--ir))
     Q var(--xL) var(--yTop) var(--xL) calc(var(--yTop) + var(--ir))  /* плавный верхний левый внутренний угол выреза */
     V calc(100% - var(--ir))
     Q var(--xL) 100% calc(var(--xL) + var(--ir)) 100%      /* плавный поворот сверху -> влево (левая ножка) */

     H var(--r)
     Q 0 100% 0 calc(100% - var(--r))
     V var(--r)
     Q 0 0 var(--r) 0 Z"
  );
`
export default function CrashCount() {
  return (
    <StyledWrapper>CrashCount</StyledWrapper>
  )
}
