import Route from '@ioc:Adonis/Core/Route'

// User/Auth API Routes
Route.group(() => {
  // Public routes (no authentication required)
  Route.post('/register', 'UserController.register')     // POST /api/auth/register
  Route.post('/login', 'UserController.login')           // POST /api/auth/login

  // Protected routes (authentication required)
  Route.group(() => {
    Route.get('/profile', 'UserController.profile')                    // GET /api/auth/profile
    Route.get('/profile/todos', 'UserController.profileWithTodos')     // GET /api/auth/profile/todos
    Route.put('/profile', 'UserController.updateProfile')              // PUT /api/auth/profile
    Route.post('/logout', 'UserController.logout')                     // POST /api/auth/logout
    Route.delete('/account', 'UserController.deleteAccount')           // DELETE /api/auth/account
    
    // Admin routes (would need admin middleware in real app)
    Route.get('/users', 'UserController.index')                        // GET /api/auth/users
  }).middleware('auth:api')

})
  .prefix('api/auth')
  .namespace('App/Controllers/Http/User')
