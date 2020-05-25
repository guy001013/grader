import React, { useContext, useReducer, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { fetchFromFirebase } from 'utils/fetcher'
import firebase from 'lib/firebase'
import { isObjectEmpty } from 'utils/isEmpty'
import { onetap } from './auth/onetap'

type User = firebase.User | null
interface UserData {
  user: User | undefined
  username: string
  admin: boolean
}

interface UserState {
  user: UserData
  loading: boolean
}

type UserAction =
  | {
      type: 'RECEIVE_USER'
      payload: User
    }
  | {
      type: 'RECEIVE_CONTEXT'
      payload: UserData
    }
  | {
      type: 'LOADING_DONE'
    }
  | {
      type: 'LOADING_START'
    }

type userContext = UserState & { userDispatch: React.Dispatch<UserAction> }

const initialState: UserState = {
  user: {
    user: undefined,
    username: '',
    admin: false,
  },
  loading: true,
}

const reducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'RECEIVE_USER':
      return Object.assign({}, state, {
        user: Object.assign({}, state.user, {
          user: action.payload,
        }),
      })
    case 'RECEIVE_CONTEXT':
      return Object.assign({}, state, {
        user: Object.assign({}, state.user, {
          username: action.payload.username,
          admin: action.payload.admin,
        }),
      })
    case 'LOADING_DONE':
      return Object.assign({}, state, {
        loading: false,
      })
    case 'LOADING_START':
      return Object.assign({}, state, {
        loading: true,
      })
    default:
      return state
  }
}

const UserStateContext = React.createContext<userContext>({
  ...initialState,
  userDispatch: null,
})

export const useUser = () => useContext(UserStateContext)

const userContextComp = ({ children }) => {
  const [userState, userDispatch] = useReducer<
    React.Reducer<UserState, UserAction>
  >(reducer, initialState)

  const { data: userContext } = useSWR('getUserContext', fetchFromFirebase, {
    refreshInterval: 1000 * 60,
  })

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user === null || user.emailVerified) {
        userDispatch({
          type: 'RECEIVE_USER',
          payload: user,
        })

        mutate('getUserContext')
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (userContext === undefined || isObjectEmpty(userContext)) {
      userDispatch({
        type: 'RECEIVE_CONTEXT',
        payload: initialState.user,
      })
    } else {
      userDispatch({
        type: 'RECEIVE_CONTEXT',
        payload: userContext,
      })
      userDispatch({
        type: 'LOADING_DONE',
      })
    }
  }, [userContext])

  useEffect(() => {
    if (userState.user.user === null) {
      onetap()
    }
  }, [userState.user.user])

  return (
    <UserStateContext.Provider value={{ ...userState, userDispatch }}>
      {children}
    </UserStateContext.Provider>
  )
}

export default userContextComp
