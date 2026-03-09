import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login JWT-based Authentication' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login success',
    schema: {
      type: 'object',
      properties: { access_token: { type: 'string', example: 'eyJhb...' } },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'invalid credentials',
    schema: {
      example: {
        message: 'Invalid Credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() logInDto: LoginDto) {
    return this.authService.login(logInDto);
  }

  @ApiOperation({ summary: 'Register new User' })
  @ApiConflictResponse({ description: 'User with this email already exist.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Register success',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '4d8f29cc-75a5-4930-b646-b0893b1463cc' },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
