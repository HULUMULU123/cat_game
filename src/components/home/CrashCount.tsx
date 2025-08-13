import styled from "styled-components"
import bg from '../../assets/Rectangle 31.svg';

const StyledWrapper = styled.div`
  width: 90%;
  height: 100px;
  background-image: url(${bg});
  background-size: cover;
  background-repeat: no-repeat;
`;
export default function CrashCount() {
  return (
    <StyledWrapper>CrashCount</StyledWrapper>
  )
}
