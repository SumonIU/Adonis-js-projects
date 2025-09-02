import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class CreateTodoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    title: schema.string({ trim: true }, [
      rules.minLength(1),
      rules.maxLength(255),
    ]),
    desc: schema.string({ trim: true }, [
      rules.minLength(1),
      rules.maxLength(1000),
    ]),
    done: schema.boolean.optional(),
  })

  public messages: CustomMessages = {
    'title.required': 'Todo title is required',
    'title.minLength': 'Title must be at least 1 character long',
    'title.maxLength': 'Title must not exceed 255 characters',
    'desc.required': 'Todo description is required',
    'desc.minLength': 'Description must be at least 1 character long',
    'desc.maxLength': 'Description must not exceed 1000 characters',
    'done.boolean': 'Done status must be true or false',
  }
}

export class UpdateTodoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    title: schema.string.optional({ trim: true }, [
      rules.minLength(1),
      rules.maxLength(255),
    ]),
    desc: schema.string.optional({ trim: true }, [
      rules.minLength(1),
      rules.maxLength(1000),
    ]),
    done: schema.boolean.optional(),
  })

  public messages: CustomMessages = {
    'title.minLength': 'Title must be at least 1 character long',
    'title.maxLength': 'Title must not exceed 255 characters',
    'desc.minLength': 'Description must be at least 1 character long',
    'desc.maxLength': 'Description must not exceed 1000 characters',
    'done.boolean': 'Done status must be true or false',
  }
}

export class TodoStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    done: schema.boolean(),
  })

  public messages: CustomMessages = {
    'done.required': 'Done status is required',
    'done.boolean': 'Done status must be true or false',
  }
}

export class SearchTodoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    q: schema.string({ trim: true }, [
      rules.minLength(1),
      rules.maxLength(255),
    ]),
    status: schema.enum.optional(['all', 'completed', 'pending']),
  })

  public messages: CustomMessages = {
    'q.required': 'Search query is required',
    'q.minLength': 'Search query must be at least 1 character long',
    'q.maxLength': 'Search query must not exceed 255 characters',
    'status.enum': 'Status must be one of: all, completed, pending',
  }
}

export class TodoIdValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.number([
      rules.unsigned(),
    ]),
  })

  public messages: CustomMessages = {
    'id.required': 'Todo ID is required',
    'id.number': 'Todo ID must be a valid number',
    'id.unsigned': 'Todo ID must be a positive number',
  }
}
