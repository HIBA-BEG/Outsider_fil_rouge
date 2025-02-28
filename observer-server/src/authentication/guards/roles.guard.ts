import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    // console.log('Required roles:', requiredRoles);

    const { user } = context.switchToHttp().getRequest();
    // console.log('User from request:', user);

    if (!requiredRoles) {
      return true;
    }

    const hasRole = requiredRoles.some(
      (role) => user?.role?.toLowerCase() === role.toLowerCase(),
    );
    // console.log('Has required role:', hasRole);

    return hasRole;
  }
}
