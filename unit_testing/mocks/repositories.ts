import { IAppointmentRepository } from '../../src/domain/repositories/IAppointmentRepository';
import { IPublishRepository } from '../../src/domain/repositories/IPublishRepository';
import { Appointment } from '../../src/domain/entities/Appointment';

export const mockAppointmentRepository = (): jest.Mocked<IAppointmentRepository> => ({
  save: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
});

export const mockPublishRepository = (): jest.Mocked<IPublishRepository> => ({
  publish: jest.fn(),
});

export const mockAppointmentEntity = (): Appointment => {
  const appt = new Appointment(
    '12345',
    'Juan Pérez',
    '+56912345678',
    new Date('2026-02-15T10:00:00Z').toISOString(),
    'PE'
  );
  return appt;
};
