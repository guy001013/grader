import React from 'react'
import { Box, Flex, Heading } from '@chakra-ui/core'

import { SubmissionsList } from 'components/submissions/SubmissionsList'
import { PageLayout } from 'components/Layout'

export default () => {
  return (
    <PageLayout>
      <Flex justify="center" flexGrow={1} py={4}>
        <Box maxW="100%">
          <Heading px={4}>Submissions</Heading>
          <SubmissionsList id={undefined} />
        </Box>
      </Flex>
    </PageLayout>
  )
}
