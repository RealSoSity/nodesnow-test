import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated user',
    description: 'Return user data after authenticated',
  })
  @ApiResponse({ status: 200, description: 'user data retrieved' })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired token',
    schema: {
      example: {
        message: 'Invalid Token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get('')
  findOne(@Request() req) {
    return this.userService.findOneWithoutPassword(req.user.sub);
  }
}
