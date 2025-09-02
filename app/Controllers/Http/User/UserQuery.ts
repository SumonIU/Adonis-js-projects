import User from 'App/Models/User'

interface UserCreatePayload {
  name: string
  email: string
  password: string
}

interface UserUpdatePayload {
  name?: string
  email?: string
  password?: string
}

export default class UserQuery {
  /**
   * Create a new user
   */
  public async createUser(payload: UserCreatePayload): Promise<User> {
    return await User.create(payload)
  }

  /**
   * Find user by ID
   */
  public async findUserById(id: number): Promise<User | null> {
    return await User.find(id)
  }

  /**
   * Find user by email
   */
  public async findUserByEmail(email: string): Promise<User | null> {
    return await User.query()
      .where('email', email)
      .first()
  }

  /**
   * Get all users
   */
  public async getAllUsers(): Promise<User[]> {
    return await User.query().orderBy('createdAt', 'desc')
  }

  /**
   * Update user
   */
  public async updateUser(userId: number, updates: UserUpdatePayload): Promise<User> {
    const user = await User.findOrFail(userId)
    user.merge(updates)
    await user.save()
    return user
  }

  /**
   * Delete user
   */
  public async deleteUser(userId: number): Promise<void> {
    const user = await User.findOrFail(userId)
    await user.delete()
  }

  /**
   * Check if email exists
   */
  public async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const query = User.query().where('email', email)
    
    if (excludeUserId) {
      query.where('id', '!=', excludeUserId)
    }
    
    const user = await query.first()
    return !!user
  }

  /**
   * Get user with todos
   */
  public async getUserWithTodos(userId: number): Promise<User | null> {
    return await User.query()
      .where('id', userId)
      .preload('todos')
      .first()
  }

  /**
   * Count users
   */
  public async countUsers(): Promise<number> {
    const result = await User.query().count('* as total')
    return Number(result[0].$extras.total)
  }
}
