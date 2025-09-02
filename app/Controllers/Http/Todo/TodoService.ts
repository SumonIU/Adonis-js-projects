import TodoQuery from './TodoQuery'

interface CreateTodoPayload {
  title: string
  desc: string
  done?: boolean
}

interface UpdateTodoPayload {
  title?: string
  desc?: string
  done?: boolean
}

export default class TodoService {
  constructor(private todoQuery: TodoQuery = new TodoQuery()) {}

  /**
   * Create a new todo
   */
  public async createTodo(payload: CreateTodoPayload, userId: number) {
    // Business rule: Title and description are required and cannot be empty after trim
    if (!payload.title.trim()) {
      throw new Error('Todo title cannot be empty')
    }

    if (!payload.desc.trim()) {
      throw new Error('Todo description cannot be empty')
    }

    const todo = await this.todoQuery.createTodo({
      title: payload.title.trim(),
      desc: payload.desc.trim(),
      done: payload.done || false,
      userId: userId
    })

    return {
      message: 'Todo created successfully',
      todo: {
        id: todo.id,
        title: todo.title,
        desc: todo.desc,
        done: todo.done,
        userId: todo.userId,
        createdAt: todo.createdAt.toISO(),
        updatedAt: todo.updatedAt.toISO()
      }
    }
  }

  /**
   * Get todo by ID
   */
  public async getTodoById(todoId: number, userId: number) {
    const todo = await this.todoQuery.findTodoById(todoId)
    if (!todo) {
      throw new Error('Todo not found')
    }

    // Business rule: Users can only access their own todos
    if (todo.userId && todo.userId !== userId) {
      throw new Error('Access denied: This todo belongs to another user')
    }

    return {
      todo: {
        id: todo.id,
        title: todo.title,
        desc: todo.desc,
        done: todo.done,
        userId: todo.userId,
        createdAt: todo.createdAt.toISO(),
        updatedAt: todo.updatedAt.toISO()
      }
    }
  }

  /**
   * Get all todos for a user
   */
  public async getUserTodos(userId: number, status?: string) {
    let todos

    switch (status) {
      case 'completed':
        todos = await this.todoQuery.getCompletedTodos(userId)
        break
      case 'pending':
        todos = await this.todoQuery.getPendingTodos(userId)
        break
      default:
        todos = await this.todoQuery.getTodosByUserId(userId)
    }

    const stats = await this.todoQuery.countTodosByStatus(userId)

    return {
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        desc: todo.desc,
        done: todo.done,
        createdAt: todo.createdAt.toISO(),
        updatedAt: todo.updatedAt.toISO()
      })),
      stats
    }
  }

  /**
   * Get all todos (admin view)
   */
  public async getAllTodos() {
    const todos = await this.todoQuery.getAllTodos()
    const stats = await this.todoQuery.countTodosByStatus()

    return {
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        desc: todo.desc,
        done: todo.done,
        userId: todo.userId,
        createdAt: todo.createdAt.toISO(),
        updatedAt: todo.updatedAt.toISO()
      })),
      stats
    }
  }

  /**
   * Update todo
   */
  public async updateTodo(todoId: number, payload: UpdateTodoPayload, userId: number) {
    const todo = await this.todoQuery.findTodoById(todoId)
    if (!todo) {
      throw new Error('Todo not found')
    }

    // Business rule: Users can only update their own todos
    if (todo.userId && todo.userId !== userId) {
      throw new Error('Access denied: You can only update your own todos')
    }

    // Validate non-empty strings if provided
    if (payload.title && !payload.title.trim()) {
      throw new Error('Todo title cannot be empty')
    }

    if (payload.desc && !payload.desc.trim()) {
      throw new Error('Todo description cannot be empty')
    }

    // Prepare update data
    const updateData: UpdateTodoPayload = {}
    if (payload.title) updateData.title = payload.title.trim()
    if (payload.desc) updateData.desc = payload.desc.trim()
    if (payload.done !== undefined) updateData.done = payload.done

    const updatedTodo = await this.todoQuery.updateTodo(todoId, updateData)

    return {
      message: 'Todo updated successfully',
      todo: {
        id: updatedTodo.id,
        title: updatedTodo.title,
        desc: updatedTodo.desc,
        done: updatedTodo.done,
        userId: updatedTodo.userId,
        updatedAt: updatedTodo.updatedAt.toISO()
      }
    }
  }

  /**
   * Delete todo
   */
  public async deleteTodo(todoId: number, userId: number) {
    const todo = await this.todoQuery.findTodoById(todoId)
    if (!todo) {
      throw new Error('Todo not found')
    }

    // Business rule: Users can only delete their own todos
    if (todo.userId && todo.userId !== userId) {
      throw new Error('Access denied: You can only delete your own todos')
    }

    await this.todoQuery.deleteTodo(todoId)

    return {
      message: 'Todo deleted successfully',
      deletedTodo: {
        id: todo.id,
        title: todo.title,
        desc: todo.desc,
        done: todo.done
      }
    }
  }

  /**
   * Toggle todo status
   */
  public async toggleTodoStatus(todoId: number, userId: number) {
    const todo = await this.todoQuery.findTodoById(todoId)
    if (!todo) {
      throw new Error('Todo not found')
    }

    // Business rule: Users can only toggle their own todos
    if (todo.userId && todo.userId !== userId) {
      throw new Error('Access denied: You can only modify your own todos')
    }

    const updatedTodo = todo.done 
      ? await this.todoQuery.markAsPending(todoId)
      : await this.todoQuery.markAsCompleted(todoId)

    return {
      message: `Todo marked as ${updatedTodo.done ? 'completed' : 'pending'}`,
      todo: {
        id: updatedTodo.id,
        title: updatedTodo.title,
        desc: updatedTodo.desc,
        done: updatedTodo.done,
        updatedAt: updatedTodo.updatedAt.toISO()
      }
    }
  }

  /**
   * Search todos
   */
  public async searchTodos(searchTerm: string, userId: number, status?: string) {
    if (!searchTerm.trim()) {
      throw new Error('Search term cannot be empty')
    }

    let todos = await this.todoQuery.searchTodos(searchTerm.trim(), userId)

    // Filter by status if provided
    if (status === 'completed') {
      todos = todos.filter(todo => todo.done)
    } else if (status === 'pending') {
      todos = todos.filter(todo => !todo.done)
    }

    return {
      searchTerm: searchTerm.trim(),
      status: status || 'all',
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        desc: todo.desc,
        done: todo.done,
        createdAt: todo.createdAt.toISO(),
        updatedAt: todo.updatedAt.toISO()
      })),
      count: todos.length
    }
  }

  /**
   * Get todo statistics for user
   */
  public async getTodoStats(userId: number) {
    const stats = await this.todoQuery.countTodosByStatus(userId)
    
    return {
      stats: {
        ...stats,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }
    }
  }
}
