import React from 'react'
import styled from 'styled-components'
import FailrueHeader from '../components/failure/header/FailrueHeader'
import Droplets from '../components/failure/droplets/Droplets'


export default function Failure() {
  return (
    <div>
      <FailrueHeader/>
      <Droplets/>
    </div>
  )
}
