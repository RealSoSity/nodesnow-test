import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const mockJwtService = {
  verifyAsync: jest.fn(),
};

const createMockExecutionContext = (
  headers: Record<string, string>,
): ExecutionContext => {
  const mockRequest = {
    headers: { ...headers },
    user: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as unknown as ExecutionContext;
};

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, { provide: JwtService, useValue: mockJwtService }],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(new AuthGuard()).toBeDefined();
  });

  describe('Guard routes', () => {
    it('should allow to access when valid token', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer headers.payload.signature',
      });
      const payload = { sub: 'user-uuid-1234', email: 'example@gmail.com' };
      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
      const expectedUser = context.switchToHttp().getRequest();
      expect(expectedUser.user).toEqual(payload);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer invalid.token.here',
      });

      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid Token'));

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when no authorization header', async () => {
      const context = createMockExecutionContext({});

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when Bearer prefix is invalid', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearor headers.payload.signature',
      });

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is empty', async () => {
      const context = createMockExecutionContext({ authorization: 'Bearer ' });

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });
});
