import styled from 'styled-components'
import PrizeHeader from '../PrizeModal/PrizeHeader'
import HeaderCloseBtn from './HeaderCloseBtn'
import RewardModal from '../DailyReward/RewardModal'
import RewardHeader from '../DailyReward/RewardHeader'
const StyledContentWrapper = styled.div`
display:flex;

padding: 15px 20px;
justify-content: space-between;
`



export default function Header({infoType=null, handleClose}) {
  return (
    <StyledContentWrapper>
        {infoType=='prize'?<PrizeHeader handleClose={handleClose}/>:null}
        {infoType == 'reward' ? <RewardHeader handleClose={handleClose} /> : null}
    </StyledContentWrapper>
  )
}
