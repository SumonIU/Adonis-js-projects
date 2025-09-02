import Hash from '@ioc:Adonis/Core/Hash'
import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import UserQuery from './UserQuery'

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
}

export default class UserService {
  constructor(private userQuery: UserQuery = new UserQuery()) {}

  /**
   * Register a new user
   */
  public async register(payload: RegisterPayload, auth: AuthContract) {
    // Check if email already exists (additional check beyond validation)
    const existingUser = await this.userQuery.findUserByEmail(payload.email)
    if (existingUser) {
      throw new Error('Email address is already registered')
    }

    // Create user (password will be hashed by User model beforeSave hook)
    const user = await this.userQuery.createUser({
      name: payload.name,
      email: payload.email,
      password: payload.password
    })

    // Generate authentication token
    const token = await auth.use('api').login(user, {
      expiresIn: '10 days'
    })

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISO(),
        updatedAt: user.updatedAt.toISO()
      },
      token: token.toJSON()
    }
  }

  /**
   * Login user
   */
  public async login(payload: LoginPayload, auth: AuthContract) {
    try {
      // Attempt to authenticate user
      const token = await auth.use('api').attempt(payload.email, payload.password, {
        expiresIn: '10 days'
      })

      // Get user details
      const user = await this.userQuery.findUserByEmail(payload.email)

      return {
        message: 'Login successful',
        user: {
          id: user!.id,
          name: user!.name,
          email: user!.email
        },
        token: token.toJSON()
      }
    } catch (error) {
      throw new Error('Invalid email or password')
    }
  }

  /**
   * Get user profile
   */
  public async getProfile(userId: number) {
    const user = await this.userQuery.findUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISO(),
        updatedAt: user.updatedAt.toISO()
      }
    }
  }

  /**
   * Get user profile with todos
   */
  public async getProfileWithTodos(userId: number) {
    const user = await this.userQuery.getUserWithTodos(userId)
    if (!user) {
      throw new Error('User not found')
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISO(),
        updatedAt: user.updatedAt.toISO(),
        todos: user.todos.map(todo => ({
          id: todo.id,
          title: todo.title,
          desc: todo.desc,
          done: todo.done,
          createdAt: todo.createdAt.toISO(),
          updatedAt: todo.updatedAt.toISO()
        }))
      }
    }
  }

  /**
   * Update user profile
   */
  public async updateProfile(userId: number, payload: UpdateUserPayload) {
    const user = await this.userQuery.findUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // If email is being updated, check if new email already exists
    if (payload.email && payload.email !== user.email) {
      const emailExists = await this.userQuery.emailExists(payload.email, userId)
      if (emailExists) {
        throw new Error('Email address is already taken')
      }
    }

    // Update user
    const updatedUser = await this.userQuery.updateUser(userId, payload)

    return {
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt.toISO()
      }
    }
  }

  /**
   * Get all users (admin only)
   */
  public async getAllUsers() {
    const users = await this.userQuery.getAllUsers()

    return {
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISO(),
        updatedAt: user.updatedAt.toISO()
      }))
    }
  }

  /**
   * Delete user account
   */
  public async deleteAccount(userId: number) {
    const user = await this.userQuery.findUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    await this.userQuery.deleteUser(userId)

    return {
      message: 'Account deleted successfully'
    }
  }

  /**
   * Logout user (revoke token)
   */
  public async logout(auth: AuthContract) {
    await auth.use('api').revoke()
    
    return {
      message: 'Logged out successfully'
    }
  }
}
