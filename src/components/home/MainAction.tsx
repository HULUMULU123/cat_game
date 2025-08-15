import styled from "styled-components"
import gift from '../../assets/icons/gift.svg'

const StyledActionWrapper = styled.div`
position: absolute;
left: 50%;
transform: translateX(-50%);
bottom:90px;
padding: 7px 40px;
background: #fff;
box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  -webkit-box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  -moz-box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  display:flex;
width: 50%;
max-width: 50vh;
border-radius: 7px;

`

const StyledActionContentWrapper = styled.div`
    width:100%;
    height: 100%;
    position: relative;
`

const StyledActionTextWrapper = styled.div`
margin: 0 auto;
font-family: 'Conthrax', sans-serif;`

const StyledActionName = styled.span`
display:block;
text-align:center;
color: #03624C;
font-size: 12px;`

const StyledActionTimer = styled.span`
display:block;
text-align:center;
color: #03624C;
font-size: 28px;
font-weight: 700;`

const StyledGiftWrapper = styled.div`
position: absolute;
top: -20px;
right: -30%;
background: #2CC295;
border-radius:7px;
display:flex;
padding: 7px 15px;

`

const StyledGiftImg = styled.img`
width: 100%;
margin: 0 auto;`
export default function MainAction() {
  return (
    <StyledActionWrapper>
        <StyledActionContentWrapper>
            <StyledActionTextWrapper>
                <StyledActionName>СБОЙ НАЧАЛСЯ :</StyledActionName>
                <StyledActionTimer>03 : 59 : 58</StyledActionTimer>
            </StyledActionTextWrapper>
            <StyledGiftWrapper>
                <StyledGiftImg src={gift}/>
            </StyledGiftWrapper>
        </StyledActionContentWrapper>
    </StyledActionWrapper>
  )
}
