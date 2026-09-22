import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
describe('AllExceptionsFilter', () => {
  const host = (response: any) => ({ switchToHttp: () => ({ getResponse: () => response }) }) as any;
  it('retourne le statut et payload d une HttpException', () => { const response = { status: jest.fn().mockReturnThis(), json: jest.fn() }; new AllExceptionsFilter().catch(new HttpException({ message: 'bad' }, 400), host(response)); expect(response.status).toHaveBeenCalledWith(400); expect(response.json).toHaveBeenCalledWith({ message: 'bad' }); });
  it('retourne 500 pour une erreur inconnue', () => { const response = { status: jest.fn().mockReturnThis(), json: jest.fn() }; new AllExceptionsFilter().catch(new Error('boom'), host(response)); expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR); expect(response.json).toHaveBeenCalledWith({ message: 'boom' }); });
});
