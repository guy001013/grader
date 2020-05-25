import React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import styled from '@emotion/styled'
import { Flex, Box, Text, Link as ChakraLink } from '@chakra-ui/core'

import { SWRfetch } from 'lib/fetch'
import { config } from 'config'

import { Normal } from './Submit/Normal'
import { Comm } from './Submit/Comm'
import { OutputOnly } from './Submit/OutputOnly'

import { ITask } from '../../@types/task'
import { Th, Td, Table, Tr } from '../submissions/ListTable'

import { useUser } from '../UserContext'
import { ISubmissionList } from '../../@types/submission'

import { isArrayEmpty } from 'utils/isEmpty'

const PDF = styled.object`
  width: 100%;
  height: 100%;
`

export const Statement = ({ metadata }) => {
  const { user } = useUser()

  const { data: submissions } = useSWR<ISubmissionList[]>(
    user.username !== ''
      ? `${config.baseURL}/getSubmissions?offset=&username=${
          user.username
        }&taskID=${metadata.id || ''}`
      : null,
    SWRfetch,
    {
      errorRetryCount: 1,
    }
  )

  const renderSubmit = (metadata: ITask) => {
    switch (metadata.type) {
      case 'normal':
        return <Normal metadata={metadata}></Normal>

      case 'communication':
        return <Comm metadata={metadata}></Comm>

      case 'output-only':
        return <OutputOnly metadata={metadata}></OutputOnly>
    }
  }

  return (
    <Flex direction={['column', 'row']} height="100%" flexGrow={1}>
      <Flex mt={4} mx={[6, 0]} flex="2 1 80%" direction="column">
        <Box height="100%">
          <PDF
            data={`https://beta-programming-in-th.s3-ap-southeast-1.amazonaws.com/statements/${metadata?.id}.pdf`}
          >
            <Text>
              Your browser doesn't support embed PDF viewer please{' '}
              <ChakraLink
                isExternal
                href={`https://beta-programming-in-th.s3-ap-southeast-1.amazonaws.com/statements/${metadata?.id}.pdf`}
                rel="noopener noreferrer"
                target="_blank"
                color="teal.600"
              >
                download Statement
              </ChakraLink>
            </Text>
          </PDF>
        </Box>
      </Flex>

      <Flex mt={4} mx={[4, 0]} flex="2 1 20%" direction="column" pl={10}>
        <Box
          maxW="100%"
          overflow="scroll"
          boxShadow="var(--shadow-default)"
          maxHeight="400px"
        >
          <Table>
            <thead>
              <tr>
                <Th>SUBMISSION TIME</Th>
                <Th>POINTS</Th>
              </tr>
            </thead>
            <tbody>
              {user.user ? (
                submissions ? (
                  isArrayEmpty(submissions) ? (
                    <Tr>
                      <td colSpan={2}>
                        <Text textAlign={['start', 'center']} p={4}>
                          No recent submission
                        </Text>
                      </td>
                    </Tr>
                  ) : (
                    submissions.map((submission: ISubmissionList) => (
                      <Link
                        href={`/submissions/${submission.submissionID}`}
                        key={submission.submissionID}
                      >
                        <Tr>
                          <Td>{submission.humanTimestamp}</Td>
                          <Td>{submission.score}</Td>
                        </Tr>
                      </Link>
                    ))
                  )
                ) : (
                  <Tr>
                    <td colSpan={2}>
                      <Text textAlign={['start', 'center']} p={4}>
                        Loading...
                      </Text>
                    </td>
                  </Tr>
                )
              ) : (
                <Tr>
                  <td colSpan={2}>
                    <Text textAlign={['start', 'center']} p={4}>
                      No recent submission
                    </Text>
                  </td>
                </Tr>
              )}
            </tbody>
          </Table>
        </Box>

        {renderSubmit(metadata)}
      </Flex>
    </Flex>
  )
}
