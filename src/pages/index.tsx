import React from 'react'
import { Text, Flex } from '@chakra-ui/core'

import { PageLayout } from '../components/Layout'

export default () => (
  <PageLayout>
    <Flex align="center" justify="center" width="100%">
      <Text fontSize={['24px', '72px']} fontWeight="800" textAlign="center">
        PROGRAMMING.IN.TH
      </Text>
    </Flex>
  </PageLayout>
)
