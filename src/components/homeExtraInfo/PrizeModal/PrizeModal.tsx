import React from 'react'
import styled from 'styled-components'
import Header from '../common/Header'
import SectionInfo from '../../common/SectionInfo'


export default function PrizeModal({handleClose}) {
  return (
    <div>
        <Header infoType='prize' handleClose={handleClose}/>
        <SectionInfo InfoName={'НАГРАДЫ ТЕКУЩЕГО СБОЯ'}/>
    </div>
  )
}
