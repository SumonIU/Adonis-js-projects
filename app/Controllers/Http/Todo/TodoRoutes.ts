import Route from '@ioc:Adonis/Core/Route'

// Todo API Routes - All routes require authentication
Route.group(() => {
  // Todo CRUD operations
  Route.get('/', 'TodoController.index')              // GET /api/todos (with optional ?status=completed|pending)
  Route.post('/', 'TodoController.store')             // POST /api/todos
  
  // Special routes (before parameterized routes)
  Route.get('/search', 'TodoController.search')       // GET /api/todos/search?q=term&status=all|completed|pending
  Route.get('/stats', 'TodoController.stats')         // GET /api/todos/stats
  Route.get('/admin/all', 'TodoController.adminIndex')// GET /api/todos/admin/all (admin view)
  
  // Parameterized routes (must come after specific routes)
  Route.get('/:id', 'TodoController.show')            // GET /api/todos/:id
  Route.put('/:id', 'TodoController.update')          // PUT /api/todos/:id
  Route.delete('/:id', 'TodoController.destroy')      // DELETE /api/todos/:id
  Route.patch('/:id/toggle', 'TodoController.toggle') // PATCH /api/todos/:id/toggle (toggle done status)
  
})
  .prefix('api/todos')
  .namespace('App/Controllers/Http/Todo')
  .middleware('auth:api')
