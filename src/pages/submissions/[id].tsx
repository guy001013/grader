import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'

import useSWR, { mutate } from 'swr'

import {
  Skeleton,
  Box,
  Flex,
  Heading,
  Link as ChakraLink,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionIcon,
  AccordionPanel,
  Button,
} from '@chakra-ui/core'

import { PageLayout } from 'components/Layout'
import { Table, Th, Td, Tr } from 'components/submissions/VerdictTable'
import { Code } from 'components/Code'

import firebase from 'lib/firebase'

import { fetchFromFirebase } from 'utils/fetcher'

import { IGroup } from '../../@types/group'
import { IStatus } from '../../@types/status'
import { ISubmission } from '../../@types/submission'
import { calculate } from 'utils/calculate'
import { isObjectEmpty } from 'utils/isEmpty'

type TPlot = {
  [key: string]: 'c' | 'cpp' | 'python'
}

const mapLanguage: TPlot = {
  'c++': 'cpp',
  c: 'c',
  python: 'python',
}

const SubmissionDetail: NextPage = () => {
  const id =
    typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : ''

  const { data: submission } = useSWR<ISubmission>(
    ['getSubmission', id],
    (type, id) => fetchFromFirebase(type, { submissionID: id })
  )

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .doc(`submissions/${id}`)
      .onSnapshot((doc) => {
        const data = doc.data()
        mutate(['getSubmission', id], async (oldSubmission: ISubmission) => {
          return { ...oldSubmission, ...data }
        })
      })
    return () => {
      unsubscribe()
    }
  }, [])

  const [currentCodeIndex, setCurrentCodeIndex] = useState<number>(0)

  const { score, fullScore, time, memory } = calculate(submission?.groups)

  if (isObjectEmpty(submission)) {
    return (
      <PageLayout>
        <Flex
          align="center"
          justify="center"
          width="100%"
          p={[4, 8]}
          flexGrow={1}
        >
          <Heading>Submission doesn't exist</Heading>
        </Flex>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Flex align="top" justify="center" width="100%" p={[4, 8]} flexGrow={1}>
        <Box
          borderRadius={6}
          width="1000px"
          maxWidth="100%"
          boxShadow="var(--shadow-md)"
          p={4}
        >
          {submission && submission.task ? (
            <Box>
              <Box>
                <React.Fragment>
                  <Heading fontSize="2xl">
                    [{submission.task.id}] {submission.task.title}
                  </Heading>
                  <Link
                    href="/tasks/[...id]"
                    as={`/tasks/${submission.task.id}`}
                  >
                    <ChakraLink href={`/tasks/${submission.task.id}`}>
                      Statement
                    </ChakraLink>
                  </Link>
                </React.Fragment>

                <Box mt={2}>
                  <p>Score: {score}</p>
                  <p>Time: {time}</p>
                  <p>Memory: {memory} KB</p>
                  <p>Submission time: {submission.humanTimestamp}</p>
                  <p>User: {submission.username}</p>
                </Box>
              </Box>

              <Box mt={4}>
                {submission.task.type !== 'normal' &&
                  submission.task.fileName.map((name, index) => (
                    <Button
                      key={name}
                      onClick={() => setCurrentCodeIndex(index)}
                      ml={index > 0 ? 4 : 0}
                      size="sm"
                    >
                      {name}
                    </Button>
                  ))}
              </Box>

              <Box mt={4}>
                <Code
                  code={submission.code[currentCodeIndex]}
                  language={mapLanguage[submission.language]}
                />
              </Box>

              {submission.groups && (
                <Accordion defaultIndex={[]} allowMultiple>
                  {submission.groups.map((group: IGroup, index) => {
                    return (
                      <AccordionItem key={index}>
                        <AccordionHeader>
                          <Box flex="1" textAlign="left">
                            Subtasks #{index + 1} [{group.score}/
                            {group.fullScore}]
                          </Box>
                          <AccordionIcon />
                        </AccordionHeader>
                        <AccordionPanel pb={4} overflow="scroll">
                          <Table>
                            <thead>
                              <tr>
                                <Th>#</Th>
                                <Th>Verdict</Th>
                                <Th>Time</Th>
                                <Th>Memory</Th>
                                <Th>Message</Th>
                              </tr>
                            </thead>

                            <tbody>
                              {group.status.map((status: IStatus, index) => (
                                <Tr
                                  correct={status.verdict === 'Correct'}
                                  key={index}
                                >
                                  <Td>{index + 1}</Td>
                                  <Td>{status.verdict}</Td>
                                  <Td>{status.time} ms</Td>
                                  <Td>{status.memory} kB</Td>
                                  <Td>{status.message}</Td>
                                </Tr>
                              ))}
                            </tbody>
                          </Table>
                        </AccordionPanel>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </Box>
          ) : (
            <Box>
              <Skeleton height="25px" width="40%" />
              <Skeleton height="14px" width="10%" mt="10px" />
              <Skeleton height="14px" width="10%" mt="20px" />
              <Skeleton height="14px" width="10%" mt="10px" />
              <Skeleton height="14px" width="20%" mt="10px" />
              <Skeleton height="14px" width="40%" mt="10px" />
              <Skeleton height="14px" width="15%" mt="10px" />
              <Skeleton height="600px" mt="20px" />
            </Box>
          )}
        </Box>
      </Flex>
    </PageLayout>
  )
}

export default SubmissionDetail
