import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR, { useSWRPages, mutate } from 'swr'
import { Box, Flex, Button, Input, Text } from '@chakra-ui/core'

import { SWRfetch } from 'lib/fetch'
import { config } from 'config'

import { ISubmissionList } from '../../@types/submission'

import { Td, Table, Th, Tr, TdHide } from 'components/submissions/ListTable'

import { arrToObj } from 'utils/arrToObj'
import { insertQueryString } from 'utils/insertQueryString'
import { isObjectEmpty } from 'utils/isEmpty'
import { getTimestamp } from 'utils/getTimestamp'

const TdLink = ({ children, href, as }) => {
  return (
    <Td>
      <Link href={href} as={as}>
        <a>
          <Box h="100%" w="100%" padding="8px 16px">
            {children}
          </Box>
        </a>
      </Link>
    </Td>
  )
}

export const SubmissionsList = ({ id: taskFrom }) => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [task, setTask] = useState('')

  useEffect(() => {
    setUsername((router.query.username as string) || '')
    if (taskFrom === undefined) {
      setTask((router.query.task as string) || '')
    }
  }, [router.query])

  useEffect(() => {
    if (taskFrom) {
      setTask(taskFrom)
    }
  }, [])

  const Submissions = useCallback(() => {
    const { pages, isLoadingMore, isReachingEnd, loadMore } = useSWRPages(
      `submission-${username}-${task}`,
      ({ offset, withSWR }) => {
        const { data: submissions } = withSWR(
          useSWR(
            `${config.baseURL}/getSubmissions?offset=${
              offset || 0
            }&username=${username}&taskID=${task}`,
            SWRfetch
          )
        )

        if (!submissions) {
          return (
            <Tr>
              <td colSpan={7}>
                <Text textAlign={['start', 'center']} p={4}>
                  Loading...
                </Text>
              </td>
            </Tr>
          )
        }

        const { results } = submissions

        return results.map((submission: ISubmissionList) => {
          return (
            <React.Fragment key={submission.submissionID}>
              {isObjectEmpty(submission) ? (
                <Tr>
                  <TdHide colSpan={7} />
                </Tr>
              ) : (
                <Tr>
                  <TdLink
                    href="/submissions/[id]"
                    as={`/submissions/${submission.submissionID}`}
                  >
                    {getTimestamp(submission.timestamp)}
                  </TdLink>
                  <TdLink
                    href="/submissions/[id]"
                    as={`/submissions/${submission.submissionID}`}
                  >
                    {submission.username}
                  </TdLink>
                  <TdLink
                    href="/submissions/[id]"
                    as={`/submissions/${submission.submissionID}`}
                  >
                    {submission.taskID}
                  </TdLink>
                  <TdLink
                    href="/submissions/[id]"
                    as={`/submissions/${submission.submissionID}`}
                  >
                    {submission.score}
                  </TdLink>
                  <TdLink
                    href="/submissions/[id]"
                    as={`/submissions/${submission.submissionID}`}
                  >
                    {arrToObj(config.languageData)[submission.language]}
                  </TdLink>
                  <TdLink
                    href="/submissions/[id]"
                    as={`/submissions/${submission.submissionID}`}
                  >
                    {submission.time}
                  </TdLink>
                  <TdLink
                    href="/submissions/[id]"
                    as={`/submissions/${submission.submissionID}`}
                  >
                    {submission.memory}
                  </TdLink>
                </Tr>
              )}
            </React.Fragment>
          )
        })
      },
      ({ data: submissions }) => {
        if (submissions.next) {
          const key = `${config.baseURL}/getSubmissions?offset=${submissions.next}&username=${username}&taskID=${task}`
          mutate(key, SWRfetch(key))
        }
        return submissions.next
      },
      []
    )

    return (
      <React.Fragment>
        <Box
          mt={4}
          boxShadow="var(--shadow-default)"
          borderRadius={4}
          width="1000px"
          maxW="100%"
          overflowX="auto"
          borderBottom="1px solid #E2E8F0"
        >
          <Table>
            <thead>
              <tr>
                <Th>SUBMISSION TIME</Th>
                <Th>USERNAME</Th>
                <Th>TASK</Th>
                <Th>POINTS</Th>
                <Th>LANGUAGE</Th>
                <Th>TIME</Th>
                <Th>MEMORY</Th>
              </tr>
            </thead>

            <tbody>{pages}</tbody>
          </Table>
        </Box>
        <Button
          onClick={loadMore}
          isLoading={isLoadingMore}
          isDisabled={isReachingEnd || isLoadingMore}
          mt={4}
          width="100%"
        >
          {isReachingEnd ? 'No more submission' : 'Load more'}
        </Button>
      </React.Fragment>
    )
  }, [username, task])

  return (
    <Flex px={4} mt={4} direction="column">
      <Flex maxW="100%" direction={['column', 'row']}>
        <Input
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setUsername(event.target.value)
            insertQueryString('username', event.target.value)
          }}
          value={username}
          placeholder="Username"
          width="200px"
        />
        {taskFrom === undefined && (
          <Input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setTask(event.target.value)
              insertQueryString('task', event.target.value)
            }}
            value={task}
            placeholder="Task"
            width="200px"
            ml={[0, 4]}
            mt={[4, 0]}
          />
        )}
      </Flex>
      <Submissions />
    </Flex>
  )
}
