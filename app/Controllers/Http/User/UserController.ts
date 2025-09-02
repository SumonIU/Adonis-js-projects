import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from './UserService'
import { RegisterUserValidator, LoginUserValidator, UpdateUserValidator } from './UserValidator'

export default class UserController {
  constructor(private userService: UserService = new UserService()) {}

  /**
   * Register a new user
   */
  public async register({ request, response, auth }: HttpContextContract) {
    try {
      const payload = await request.validate(RegisterUserValidator)
      const result = await this.userService.register(payload, auth)
      return response.created(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error creating user account',
        errors: error.messages || null
      })
    }
  }

  /**
   * Login user
   */
  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const payload = await request.validate(LoginUserValidator)
      const result = await this.userService.login(payload, auth)
      return response.ok(result)
    } catch (error) {
      return response.unauthorized({
        message: error.message || 'Authentication failed',
        errors: error.messages || null
      })
    }
  }

  /**
   * Get current user profile
   */
  public async profile({ response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const result = await this.userService.getProfile(userId)
      return response.ok(result)
    } catch (error) {
      return response.unauthorized({
        message: error.message || 'Authentication required'
      })
    }
  }

  /**
   * Get current user profile with todos
   */
  public async profileWithTodos({ response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const result = await this.userService.getProfileWithTodos(userId)
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error fetching profile'
      })
    }
  }

  /**
   * Update user profile
   */
  public async updateProfile({ request, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const payload = await request.validate(UpdateUserValidator)
      const userId = auth.user!.id
      const result = await this.userService.updateProfile(userId, payload)
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error updating profile',
        errors: error.messages || null
      })
    }
  }

  /**
   * Logout user
   */
  public async logout({ response, auth }: HttpContextContract) {
    try {
      const result = await this.userService.logout(auth)
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error logging out'
      })
    }
  }

  /**
   * Delete user account
   */
  public async deleteAccount({ response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      const userId = auth.user!.id
      const result = await this.userService.deleteAccount(userId)
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error deleting account'
      })
    }
  }

  /**
   * Get all users (admin functionality)
   */
  public async index({ response, auth }: HttpContextContract) {
    try {
      await auth.authenticate()
      // In real app, you'd check if user is admin here
      const result = await this.userService.getAllUsers()
      return response.ok(result)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Error fetching users'
      })
    }
  }
}
