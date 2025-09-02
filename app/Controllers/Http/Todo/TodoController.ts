import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TodoService from './TodoService'
import { CreateTodoValidator, UpdateTodoValidator, SearchTodoValidator } from './TodoValidator'

export default class TodoController {
  constructor(private todoService: TodoService = new TodoService()) {}

  /**
   * Get all todos for authenticated user
   */
  public async index({ request, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const status = request.input('status') // Query param: ?status=completed|pending
      
      const result = await this.todoService.getUserTodos(userId, status)
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error fetching todos'
      })
    }
  }

  /**
   * Get specific todo by ID
   */
  public async show({ params, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const todoId = parseInt(params.id, 10)
      
      if (isNaN(todoId) || todoId <= 0) {
        return response.badRequest({ message: 'Invalid todo ID. Must be a positive number.' })
      }
      
      const result = await this.todoService.getTodoById(todoId, userId)
      return response.ok(result)
    } catch (error) {
      if (error.message.includes('not found')) {
        return response.notFound({ message: error.message })
      }
      if (error.message.includes('Access denied')) {
        return response.forbidden({ message: error.message })
      }
      return response.badRequest({ message: error.message || 'Error fetching todo' })
    }
  }

  /**
   * Create a new todo
   */
  public async store({ request, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      console.log('request---->',request);
      const payload = await request.validate(CreateTodoValidator)
      
      const result = await this.todoService.createTodo(payload, userId)
      return response.created(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error creating todo',
        errors: error.messages || null
      })
    }
  }

  /**
   * Update existing todo
   */
  public async update({ request, params, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const todoId = parseInt(params.id, 10)
      
      if (isNaN(todoId) || todoId <= 0) {
        return response.badRequest({ message: 'Invalid todo ID. Must be a positive number.' })
      }
      
      const payload = await request.validate(UpdateTodoValidator)
      const result = await this.todoService.updateTodo(todoId, payload, userId)
      return response.ok(result)
    } catch (error) {
      if (error.message.includes('not found')) {
        return response.notFound({ message: error.message })
      }
      if (error.message.includes('Access denied')) {
        return response.forbidden({ message: error.message })
      }
      return response.badRequest({
        message: error.message || 'Error updating todo',
        errors: error.messages || null
      })
    }
  }

  /**
   * Delete todo
   */
  public async destroy({ params, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const todoId = parseInt(params.id, 10)
      
      if (isNaN(todoId) || todoId <= 0) {
        return response.badRequest({ message: 'Invalid todo ID. Must be a positive number.' })
      }
      
      const result = await this.todoService.deleteTodo(todoId, userId)
      return response.ok(result)
    } catch (error) {
      if (error.message.includes('not found')) {
        return response.notFound({ message: error.message })
      }
      if (error.message.includes('Access denied')) {
        return response.forbidden({ message: error.message })
      }
      return response.badRequest({ message: error.message || 'Error deleting todo' })
    }
  }

  /**
   * Toggle todo status (completed/pending)
   */
  public async toggle({ params, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const todoId = parseInt(params.id, 10)
      
      if (isNaN(todoId) || todoId <= 0) {
        return response.badRequest({ message: 'Invalid todo ID. Must be a positive number.' })
      }
      
      const result = await this.todoService.toggleTodoStatus(todoId, userId)
      return response.ok(result)
    } catch (error) {
      if (error.message.includes('not found')) {
        return response.notFound({ message: error.message })
      }
      if (error.message.includes('Access denied')) {
        return response.forbidden({ message: error.message })
      }
      return response.badRequest({ message: error.message || 'Error toggling todo status' })
    }
  }

  /**
   * Search todos
   */
  public async search({ request, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const payload = await request.validate(SearchTodoValidator)
      
      const result = await this.todoService.searchTodos(payload.q, userId, payload.status)
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error searching todos',
        errors: error.messages || null
      })
    }
  }

  /**
   * Get todo statistics
   */
  public async stats({ response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      
      const result = await this.todoService.getTodoStats(userId)
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error fetching todo statistics'
      })
    }
  }

  /**
   * Get all todos (admin view)
   */
  public async adminIndex({ response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      // In real app, you'd check if user is admin here
      
      const result = await this.todoService.getAllTodos()
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error fetching all todos'
      })
    }
  }
}
