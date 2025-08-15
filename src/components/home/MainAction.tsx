import styled from "styled-components"
import gift from '../../assets/icons/gift.svg'

const StyledActionWrapper = styled.div`
position: absolute;
left: 50%;
transform: translateY(-50%);
bottom:50px;
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
margin: 0 auto;`

const StyledActionName = styled.span`
display:block;
text-align:center;
color: #03624C;
font-size: 12px;`

const StyledActionTimer = styled.span`
display:block;
text-align:center;
color: #03624C;
font-size: 28px;`

const StyledGiftWrapper = styled.div`
position: absolute;
top: -20px;
right: -20px;
background: #2CC295;

`

const StyledGiftImg = styled.img`
width: 60%;`
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
