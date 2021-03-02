import React from 'react';
import styled from '@emotion/styled';
import Layout from './../components/layout/Layouts'

const Heading = styled.h1`
  color: red;
`

export default function Nosotros() {
    return (
        <div>
            <Layout>
                <Heading>Nosotros</Heading>
            </Layout>
        </div>
    )
}
