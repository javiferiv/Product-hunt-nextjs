import React from 'react';
import styled from '@emotion/styled';
import Layout from './../components/layout/Layouts'

const Heading = styled.h1`
  color: red;
`

export default function Home() {
  return (
    <div>
      <Layout>
        <Heading>Hola</Heading>
      </Layout>
    </div>
  )
}
