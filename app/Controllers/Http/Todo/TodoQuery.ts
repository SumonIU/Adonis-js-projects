import Todo from 'App/Models/Todo'

interface TodoCreatePayload {
  title: string
  desc: string
  done?: boolean
  userId?: number
}

interface TodoUpdatePayload {
  title?: string
  desc?: string
  done?: boolean
}

export default class TodoQuery {
  /**
   * Create a new todo
   */
  public async createTodo(payload: TodoCreatePayload): Promise<Todo> {
    return await Todo.create(payload)
  }

  /**
   * Find todo by ID
   */
  public async findTodoById(id: number): Promise<Todo | null> {
    return await Todo.find(id)
  }

  /**
   * Get all todos
   */
  public async getAllTodos(): Promise<Todo[]> {
    return await Todo.query().orderBy('createdAt', 'desc')
  }

  /**
   * Get todos by user ID
   */
  public async getTodosByUserId(userId: number): Promise<Todo[]> {
    return await Todo.query()
      .where('userId', userId)
      .orderBy('createdAt', 'desc')
  }

  /**
   * Get completed todos
   */
  public async getCompletedTodos(userId?: number): Promise<Todo[]> {
    const query = Todo.query().where('done', true)
    
    if (userId) {
      query.where('userId', userId)
    }
    
    return await query.orderBy('updatedAt', 'desc')
  }

  /**
   * Get pending todos
   */
  public async getPendingTodos(userId?: number): Promise<Todo[]> {
    const query = Todo.query().where('done', false)
    
    if (userId) {
      query.where('userId', userId)
    }
    
    return await query.orderBy('createdAt', 'desc')
  }

  /**
   * Update todo
   */
  public async updateTodo(todoId: number, updates: TodoUpdatePayload): Promise<Todo> {
    const todo = await Todo.findOrFail(todoId)
    todo.merge(updates)
    await todo.save()
    return todo
  }

  /**
   * Delete todo
   */
  public async deleteTodo(todoId: number): Promise<void> {
    const todo = await Todo.findOrFail(todoId)
    await todo.delete()
  }

  /**
   * Mark todo as completed
   */
  public async markAsCompleted(todoId: number): Promise<Todo> {
    const todo = await Todo.findOrFail(todoId)
    todo.done = true
    await todo.save()
    return todo
  }

  /**
   * Mark todo as pending
   */
  public async markAsPending(todoId: number): Promise<Todo> {
    const todo = await Todo.findOrFail(todoId)
    todo.done = false
    await todo.save()
    return todo
  }

  /**
   * Count todos by status
   */
  public async countTodosByStatus(userId?: number): Promise<{
    total: number
    completed: number
    pending: number
  }> {
    const baseQuery = userId ? Todo.query().where('userId', userId) : Todo.query()

    const total = await baseQuery.clone().count('* as total')
    const completed = await baseQuery.clone().where('done', true).count('* as completed')
    const pending = await baseQuery.clone().where('done', false).count('* as pending')

    return {
      total: Number(total[0].$extras.total),
      completed: Number(completed[0].$extras.completed),
      pending: Number(pending[0].$extras.pending)
    }
  }

  /**
   * Search todos by title or description
   */
  public async searchTodos(searchTerm: string, userId?: number): Promise<Todo[]> {
    const query = Todo.query()
      .where('title', 'LIKE', `%${searchTerm}%`)
      .orWhere('desc', 'LIKE', `%${searchTerm}%`)

    if (userId) {
      query.where('userId', userId)
    }

    return await query.orderBy('createdAt', 'desc')
  }

  /**
   * Get todo with user information
   */
  public async getTodoWithUser(todoId: number): Promise<Todo | null> {
    return await Todo.query()
      .where('id', todoId)
      .preload('user')
      .first()
  }

  /**
   * Check if user owns todo
   */
  public async userOwnsTodo(todoId: number, userId: number): Promise<boolean> {
    const todo = await Todo.query()
      .where('id', todoId)
      .where('userId', userId)
      .first()
    
    return !!todo
  }
}
