import {
  Button,
  Container,
  Flex,
  Heading,
} from '@chakra-ui/react'
import TodoList from '../components/TodoList'
import NewTodoForm from '../components/NewTodoForm'
import EditTodoForm from '../components/EditTodoForm'
import { useSetRecoilState } from 'recoil'
import React, { useEffect, useState, } from 'react'
import { db } from '../lib/firebase'
import { collection, query, onSnapshot, setDoc, doc } from 'firebase/firestore'
import { todosState } from 'src/atoms/atom'
import { login, logout, useUser } from 'src/lib/auth'
import Link from 'next/link'

interface Todo {
  id: string
  title: string
  status: string
}

const App: React.FC = () => {
  /** Todoリスト */
  const setTodos = useSetRecoilState(todosState)
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const [editId, setEditId] = useState('')
  const [newTitle, setNewTitle] = useState<string>('')
  const todosRef = collection(db, 'todos')

  const handleEditFormChanges: React.ChangeEventHandler<HTMLInputElement> = (e): void => {
    setNewTitle(e.target.value)
  }

  /** 編集フォーム表示 */
  const handleOpenEditForm = ({ id, title }: Todo): void => {
    setIsEditable(true)
    setEditId(id)
    setNewTitle(title)
  }

  /** 編集フォームを閉じる */
  const handleCloseEditForm = (): void => {
    setIsEditable(false)
    setEditId('')
  }

  /** Todo編集 */
  const handleEditTodo = async (): Promise<void> => {
    await setDoc(doc(todosRef, editId),
      { title: newTitle, },
      { merge: true }
    )
    setNewTitle('')
    handleCloseEditForm()
    setEditId('')
  }

  useEffect(() => {

    const q = query(collection(db, 'todos'))

    const unsub = onSnapshot(q, (snapshot) => {
      const newTodos = snapshot.docs.map((doc) => ({
        id: doc.id, title: doc.data().title, status: doc.data().status
      }))
      setTodos(newTodos)
    })
    return () => unsub()

  }, [])


  // ログインサンプル追加
  const user = useUser()

  const handleLogout = (): void => {
    logout().catch((error) => console.error(error))
  }


  return (
    <>
      <Container mt="200px" border="1px solid" borderRadius="5px" p="20px">
        <Flex justify="space-between" align="center" pb="20px">
          <Heading>Next Todo</Heading>
          <Link href="/create" passHref>
            <Button bg="lightblue">
              <a>
                作成
              </a>
            </Button>
          </Link>
        </Flex>
        <TodoList />
      </Container>
      <div>
        <h1>Auth Example</h1>
        {user !== null ? (
          <h2>ログインしている</h2>
        ) : (
          <h2>ログインしていない</h2>
        )}
        <button onClick={handleLogout}>ログアウト</button>
      </div>
    </>
  )
}

export default App
