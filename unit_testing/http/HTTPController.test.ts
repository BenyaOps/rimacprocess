import { HTTPController } from '../../src/interfaces/http/HTTPController';
import { RegisterAppointmentUseCase } from '../../src/application/usecases/RegisterAppointmentUseCase';
import { ConsultAppointmentUseCase } from '../../src/application/usecases/ConsultAppointmentUseCase';
import { IHttpEvent, ILambdaResponse } from '../../src/shared/types';
import { error } from 'console';

describe('HTTPController', () => {
  let controller: HTTPController;
  let mockRegisterUseCase: jest.Mocked<RegisterAppointmentUseCase>;
  let mockConsultUseCase: jest.Mocked<ConsultAppointmentUseCase>;

  beforeEach(() => {
    mockRegisterUseCase = {
      execute: jest.fn(),
    } as any;

    mockConsultUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new HTTPController(mockRegisterUseCase, mockConsultUseCase);
  });

  describe('registerAppointment', () => {
    it('should register a new appointment successfully', async () => {
      const mockEvent: IHttpEvent = {
        requestContext: {
          http: {
            method: 'POST',
            path: '/registrar',
          },
        },
        body: JSON.stringify({
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+56912345678',
          date: '2026-02-15T10:00:00Z',
          countryISO: 'PE',
        }),
        headers: {},
        pathParameters: {},
      };

      const mockResult: any = {
        statusCode: 200,
        body: JSON.stringify({
          id: '12345',
          name: 'Juan Pérez',
          date: '2026-02-15T10:00:00Z',
          countryISO: 'PE',
        }),
      };

      mockRegisterUseCase.execute.mockResolvedValueOnce(mockResult);

      const response: ILambdaResponse = await controller.registerAppointment(mockEvent);

      expect(response.statusCode).toBe(201);
      expect(mockRegisterUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid request body', async () => {
      const mockEvent: IHttpEvent = {
        requestContext: {
          http: {
            method: 'POST',
            path: '/registrar',
          },
        },
        body: 'invalid json',
        headers: {},
        pathParameters: {},
      };

      const response: ILambdaResponse = await controller.registerAppointment(mockEvent);

      expect(response.statusCode).toBe(400);
    });

    it('should handle use case errors gracefully', async () => {
      const mockEvent: IHttpEvent = {
        requestContext: {
          http: {
            method: 'POST',
            path: '/registrar',
          },
        },
        body: JSON.stringify({
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+56912345678',
          date: '2026-02-15T10:00:00Z',
          countryISO: 'PE',
        }),
        headers: {},
        pathParameters: {},
      };

      mockRegisterUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      );

      const response: ILambdaResponse = await controller.registerAppointment(mockEvent);

      expect(response.statusCode).toBe(500);
    });
  });

  describe('consultAppointment', () => {
    it('should retrieve appointment by ID', async () => {
      const mockEvent: IHttpEvent = {
        requestContext: {
          http: {
            method: 'GET',
            path: '/consultar/12345',
          },
        },
        body: '',
        headers: {},
        pathParameters: { insuredId: '12345' },
      };

      const mockResult: any = {
        message: 'Appointment found',
        data: {
          id: '12345',
          name: 'Juan Pérez',
          date: '2026-02-15T10:00:00Z',
          countryISO: 'PE',
        },
        error: '',
      };

      mockConsultUseCase.execute.mockResolvedValueOnce(mockResult);

      const response: ILambdaResponse = await controller.consultAppointment(mockEvent);

      expect(response.statusCode).toBe(200);
      expect(mockConsultUseCase.execute).toHaveBeenCalledWith({ id: '12345' });
    });

  });
});
