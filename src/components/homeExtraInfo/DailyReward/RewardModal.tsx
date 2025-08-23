import React from 'react'
import styled from 'styled-components'
import Header from '../common/Header'
import ModalName from '../common/ModalName'
import RewardsSection from './Rewards/RewardsSection'
import SpecialRewards from './Rewards/SpecialRewards'
import TodayDate from './Rewards/TodayDate'
const StyledWrapper = styled.div`
  width:100%;
  
`
export default function RewardModal({handleClose}) {
  return (
    <StyledWrapper>
        <Header infoType='reward' handleClose={handleClose}/>
        <ModalName textName='ЕЖЕДНЕВНАЯ НАГРАДА'/>
        <RewardsSection/>
        <SpecialRewards/>
        <TodayDate/>
    </StyledWrapper>
  )
}
