import styled from 'styled-components'
import PrizeHeader from '../PrizeModal/PrizeHeader'
import HeaderCloseBtn from './HeaderCloseBtn'
const StyledContentWrapper = styled.div`
display:flex;
width: 90%;
padding: 15px 20px;
justify-content: space-between;
`



export default function Header({infoType=null, handleClose}) {
  return (
    <StyledContentWrapper>
        {infoType=='prize'?<PrizeHeader handleClose={handleClose}/>:null}
        {infoType=='reward'?<PrizeHeader handleClose={handleClose}/>:null}
        
    </StyledContentWrapper>
  )
}
