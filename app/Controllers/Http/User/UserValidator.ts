import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class RegisterUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.minLength(2),
      rules.maxLength(100),
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.maxLength(255),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    password: schema.string({}, [
      rules.minLength(6),
      rules.maxLength(128),
      rules.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/), // At least one lowercase, uppercase, and digit
    ]),
  })

  public messages: CustomMessages = {
    'name.required': 'Name is required',
    'name.minLength': 'Name must be at least 2 characters long',
    'name.maxLength': 'Name must not exceed 100 characters',
    'email.required': 'Email address is required',
    'email.email': 'Please provide a valid email address',
    'email.maxLength': 'Email must not exceed 255 characters',
    'email.unique': 'Email address is already registered',
    'password.required': 'Password is required',
    'password.minLength': 'Password must be at least 6 characters long',
    'password.maxLength': 'Password must not exceed 128 characters',
    'password.regex': 'Password must contain at least one lowercase letter, one uppercase letter, and one digit',
  }
}

export class LoginUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email(),
    ]),
    password: schema.string({}),
  })

  public messages: CustomMessages = {
    'email.required': 'Email address is required',
    'email.email': 'Please provide a valid email address',
    'password.required': 'Password is required',
  }
}

export class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.optional({ trim: true }, [
      rules.minLength(2),
      rules.maxLength(100),
    ]),
    email: schema.string.optional({ trim: true }, [
      rules.email(),
      rules.maxLength(255),
      rules.unique({ 
        table: 'users', 
        column: 'email',
        whereNot: { id: this.ctx.auth.user?.id }
      })
    ]),
    password: schema.string.optional({}, [
      rules.minLength(6),
      rules.maxLength(128),
      rules.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    ]),
  })

  public messages: CustomMessages = {
    'name.minLength': 'Name must be at least 2 characters long',
    'name.maxLength': 'Name must not exceed 100 characters',
    'email.email': 'Please provide a valid email address',
    'email.maxLength': 'Email must not exceed 255 characters',
    'email.unique': 'Email address is already taken',
    'password.minLength': 'Password must be at least 6 characters long',
    'password.maxLength': 'Password must not exceed 128 characters',
    'password.regex': 'Password must contain at least one lowercase letter, one uppercase letter, and one digit',
  }
}
