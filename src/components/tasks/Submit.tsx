import React, { useState } from 'react'
import Link from 'next/link'
import { Row, Icon, Result, Button, Select } from 'antd'
import styled from 'styled-components'

import firebase from '../../lib/firebase'

import { Upload } from '../upload'

import { Code } from '../CodeEditor'
import { useUser } from '../UserContext'
import { media } from '../../design/Responsive'

const OptionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  ${media('TABLET')} {
    flex-direction: column;
  }
`

const SubOptionWrapper = styled.div`
  margin-left: 10px;

  :first-child {
    margin-left: 0px;
  }

  ${media('TABLET')} {
    margin-left: 0px;
    margin-top: 10px;
  }
`

const { Option } = Select

const languageData = [
  ['text/x-csrc', 'C / C++'],
  ['python', 'Python']
]

type TPlot = {
  [key: string]: string
}

const mapLanguage: TPlot = {
  'text/x-csrc': 'cpp',
  python: 'python'
}

const themeData = [
  ['material', 'Material'],
  ['monokai', 'Monokai'],
  ['solarized', 'Solarized Light']
]

interface ISubmitProps {
  problem_id: string
  canSubmit: boolean
}

interface ISubmitSetting {
  language: string
  theme: string
  hideCode: boolean
}

export const Submit: React.FunctionComponent<ISubmitProps> = (
  props: ISubmitProps
) => {
  const [setting, setSetting] = useState<ISubmitSetting>({
    language: 'text/x-csrc',
    theme: 'material',
    hideCode: false
  })

  const [codeValue, setCode] = useState<string>('')
  const [codeFromUpload, setCodeFromUpload] = useState<string>('')
  const [responseState, setResponse] = useState({
    data: undefined,
    status: 0
  })

  const submitCode = async (
    uid: string,
    problem_id: string,
    code: string,
    language: string,
    hideCode: boolean
  ) => {
    if (!user) return

    const params = {
      uid,
      problem_id,
      code,
      language,
      hideCode
    }

    setResponse({
      ...responseState,
      status: -1
    })

    const response = await firebase
      .app()
      .functions('asia-east2')
      .httpsCallable('makeSubmission')(params)

    setResponse({
      data: response.data,
      status: 200
    })
  }

  const { user } = useUser()

  const changeLanguage = (value: string) => {
    setSetting({ ...setting, language: value })
  }

  const changeEditor = (
    editor: CodeMirror.Editor,
    value: CodeMirror.EditorChange,
    code: string
  ) => {
    updateCode(code)
  }

  const getCodeFromUpload = (code: string) => {
    setCodeFromUpload(code)
  }

  const updateCode = (code: string) => {
    setCode(code)
  }

  const changeTheme = (value: string) => {
    setSetting({ ...setting, theme: value })
  }

  return (
    <React.Fragment>
      {responseState.status === -1 ? (
        <Result
          status="success"
          icon={<Icon type="loading" />}
          title="Submiting"
        />
      ) : responseState.status === 200 ? (
        <Result
          title="Submission Successful"
          status="success"
          extra={[
            <Link href={'/submissions/' + responseState.data}>
              <Button type="primary">View Submission</Button>
            </Link>,
            <Button
              onClick={() => {
                submitCode(
                  user.uid,
                  props.problem_id,
                  codeValue,
                  mapLanguage[setting.language],
                  setting.hideCode
                )
              }}
            >
              Resubmit
            </Button>
          ]}
        />
      ) : responseState.status !== 0 ? (
        <Result
          status="error"
          title="Submission Failed"
          extra={[
            <Button
              onClick={() => {
                submitCode(
                  user.uid,
                  props.problem_id,
                  codeValue,
                  mapLanguage[setting.language],
                  setting.hideCode
                )
              }}
            >
              Resubmit
            </Button>
          ]}
        />
      ) : (
        <React.Fragment>
          <h1>Submit</h1>
          <OptionsWrapper>
            <SubOptionWrapper>
              <Select
                defaultValue={languageData[0][0]}
                style={{ width: 120 }}
                onChange={changeLanguage}
              >
                {languageData.map((data: any) => (
                  <Option key={data[0]}>{data[1]}</Option>
                ))}
              </Select>
            </SubOptionWrapper>
            <SubOptionWrapper>
              <Select
                defaultValue={themeData[0][0]}
                style={{ width: 120 }}
                onChange={changeTheme}
              >
                {themeData.map((data: any) => (
                  <Option key={data[0]}>{data[1]}</Option>
                ))}
              </Select>
            </SubOptionWrapper>
            <SubOptionWrapper>
              <Upload getCodeFromUpload={getCodeFromUpload}></Upload>
            </SubOptionWrapper>
          </OptionsWrapper>
          <Row>
            <Code
              options={{
                mode: `${setting.language}`,
                theme: `${setting.theme}`,
                lineNumbers: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                lineWrapping: true
              }}
              onChange={changeEditor}
              value={codeFromUpload}
            />
            <Button
              type="primary"
              onClick={() => {
                submitCode(
                  user.uid,
                  props.problem_id,
                  codeValue,
                  mapLanguage[setting.language],
                  setting.hideCode
                )
              }}
              disabled={!props.canSubmit}
            >
              Submit
            </Button>
          </Row>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
