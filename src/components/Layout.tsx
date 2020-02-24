import React from 'react'
import styled from 'styled-components'
import { Layout } from 'antd'

import { Navigator } from './Nav'
import { GlobalStyle } from '../design'
import { useUser } from './UserContext'

const { Content, Footer } = Layout

const CustomLayout = styled(Layout)<{ bg?: string; loading?: boolean }>`
  min-height: 100vh;
  background-color: ${props => (props.bg ? props.bg : '#fafafa')};
  display: ${props => (props.loading ? 'none' : 'flex')};
`

interface IPageLayoutProps {
  hideNav?: boolean
  bg?: string
  children: React.ReactNode
}

export const PageLayout: React.FunctionComponent<IPageLayoutProps> = (
  props: IPageLayoutProps
) => {
  const { user } = useUser()

  return (
    <React.Fragment>
      <CustomLayout bg={props.bg} loading={user === undefined}>
        <GlobalStyle />
        {!props.hideNav && <Navigator />}
        <Content style={{ marginTop: 64 }}>{props.children}</Content>
        <Footer
          style={{
            textAlign: 'center',
            backgroundColor: props.bg ? props.bg : '#fafafa'
          }}
        >
          IPST ©2019-{new Date().getFullYear()} | Contribution: All the source
          code for this website is available on{' '}
          <a
            href="https://github.com/programming-in-th/programming.in.th"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </Footer>
      </CustomLayout>
    </React.Fragment>
  )
}

PageLayout.defaultProps = {
  hideNav: false
}
