import React, { useEffect, useState } from 'react'

function test () {
  const [todos, setToDos] = useState(() => {
    return JSON.parse(localStorage.getItem('todos'))
  })

  const [newToDo, setNewToDo] = useState('')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addToDo = () => {
    if (newToDo.trim() != '') {
      setToDos([...todos, { id: Date.now(), text: newToDo, completed: false }])
      setNewToDo('')
    }
  }

  const deleteToDo = id => {
    setToDos(todos.filter(todo => todo.id != id))
  }

  const toggleComplete = id => {
    setToDos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  return (
    <div>
      <input
        value={newToDo}
        onChange={e => setNewToDo(e.target.value)}
        placeholder='todos'
      />
      <button onClick={addToDo}>اضافه کردن</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}
              onClick={() => toggleComplete(todo.id)}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteToDo(todo.id)}>حذف </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default test
