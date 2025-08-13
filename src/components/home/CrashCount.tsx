import styled from "styled-components"

const StyledWrapper = styled.div`
    width: 400px;
    height: 150px;
    background: rgba(0, 170, 255, 0.25);
    clip-path: path("M 0 0 H 100 V 85 Q 85 85 85 100 H 70 Q 70 100 70 85 H 30 Q 30 100 30 85 H 15 Q 15 85 0 85 Z");
`
export default function CrashCount() {
  return (
    <StyledWrapper>CrashCount</StyledWrapper>
  )
}
