import { useState, useEffect } from 'react'

export default function App() {
  // NFR9 [Reliability]: Persistence robustness 
  // Using lazy initialization to read from localStorage, wrapped in a try-catch to prevent corrupt data from crashing the app.
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos')
      return saved ? JSON.parse(saved) : [
        { id: 1, text: 'Read a book', done: false, dueDate: '' },
        { id: 2, text: 'Go for a walk', done: true, dueDate: '' },
        { id: 3, text: 'Write some code', done: false, dueDate: '' },
      ]
    } catch {
      return [] // Fallback to empty list
    }
  })

  // Creation states
  const [input, setInput] = useState('')
  const [inputDate, setInputDate] = useState('')
  const [filter, setFilter] = useState('all')

  // Edit states (Supports FR2 editing logic)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editDate, setEditDate] = useState('')

  // NFR9 [Reliability]: Listen for todos changes and write to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // Create Todo (Includes Due Date)
  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: Date.now(), text, done: false, dueDate: inputDate }])
    setInput('')
    setInputDate('')
  }

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const deleteTodo = (id) => setTodos(todos.filter((t) => t.id !== id))

  // Trigger Edit Mode
  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
    setEditDate(todo.dueDate || '')
  }

  // NFR4 [Usability]: Save or cancel Edit
  const saveEdit = () => {
    if (!editText.trim()) return
    setTodos(
      todos.map((t) =>
        t.id === editingId ? { ...t, text: editText.trim(), dueDate: editDate } : t
      )
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
    setEditDate('')
  }

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.done : filter === 'completed' ? t.done : true,
  )

  const remaining = todos.filter((t) => !t.done).length

  const tabClass = (name) =>
    `px-3 py-1 rounded-md text-sm font-medium transition ${filter === name
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-200'
    }`

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
      {/* Slightly widened the container (max-w-2xl) to accommodate the new date input */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo List</h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs doing?"
            aria-label="New todo text"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* FR2: New Due Date input */}
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            aria-label="Due date for new todo"
            className="w-36 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {/* NFR3: Added aria-pressed to expose the selected state to Screen-readers */}
          <button
            onClick={() => setFilter('all')}
            className={tabClass('all')}
            aria-pressed={filter === 'all'}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={tabClass('active')}
            aria-pressed={filter === 'active'}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={tabClass('completed')}
            aria-pressed={filter === 'completed'}
          >
            Completed
          </button>
        </div>

        <ul className="space-y-2">
          {visible.map((todo) => (
            // NFR5: Stable row layout - 'group' combined with 'min-h' ensures stable height
            <li
              key={todo.id}
              className="group flex items-center gap-3 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 min-h-[3rem]"
            >
              {editingId === todo.id ? (
                // Edit Mode UI
                <div className="flex-1 flex gap-2 w-full">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    // NFR4: Keyboard shortcuts
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    autoFocus
                    aria-label="Edit todo text"
                    className="flex-1 px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    aria-label="Edit due date"
                    className="w-36 px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600"
                  />
                  <button
                    onClick={saveEdit}
                    aria-label="Save edit"
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    aria-label="Cancel edit"
                    className="px-2 py-1 bg-slate-300 text-slate-700 rounded text-sm hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                // Read Mode UI
                <>
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-1 text-left flex items-center gap-2 ${todo.done ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    aria-label={todo.done ? `Mark "${todo.text}" as incomplete` : `Mark "${todo.text}" as complete`}
                  >
                    <span>{todo.text}</span>
                    {/* US-A2 / FR2: Display Due Date */}
                    {todo.dueDate && (
                      <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-medium">
                        {todo.dueDate}
                      </span>
                    )}
                  </button>

                  {/* NFR5: Controlled via opacity-0 instead of display: none. This ensures the element still occupies DOM space, preventing layout shifts on hover. */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(todo)}
                      className="text-slate-400 hover:text-indigo-500 text-sm font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={`Edit ${todo.text}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-slate-400 hover:text-red-500 text-lg font-bold px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete ${todo.text}`}
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
          {visible.length === 0 && (
            <li className="text-center text-slate-400 py-4 text-sm">
              Nothing here.
            </li>
          )}
        </ul>

        <div className="mt-4 text-sm text-slate-500">
          {remaining} {remaining === 1 ? 'item' : 'items'} left
        </div>
      </div>
    </div>
  )
}