import { SQSHandler } from '../../src/interfaces/sqs/SQSHandler';
import { ProcessAppointmentUseCase } from '../../src/application/usecases/ProcessAppointmentUseCase';
import { ISQSEvent, ISQSRecord } from '../../src/shared/types';

describe('SQSHandler', () => {
  let handler: SQSHandler;
  let mockProcessUseCase: jest.Mocked<ProcessAppointmentUseCase>;

  beforeEach(() => {
    mockProcessUseCase = {
      execute: jest.fn(),
    } as any;

    handler = new SQSHandler(mockProcessUseCase);
  });

  describe('handleSQSEvent', () => {
    it('should process SQS messages successfully', async () => {
      const mockRecord: ISQSRecord = {
        messageId: 'msg-1',
        receiptHandle: 'handle-1',
        body: JSON.stringify({
          id: '12345',
          name: 'Juan Pérez',
          phone: '+56912345678',
          date: '2026-02-15T10:00:00Z',
          countryISO: 'PE',
        }),
        attributes: {},
        messageAttributes: {}
      };

      const mockEvent: ISQSEvent = {
        Records: [mockRecord],
      };

      mockProcessUseCase.execute.mockResolvedValueOnce({
        message: 'Processed'
      });

      const response = await handler.handleSQSEvent(mockEvent);

      expect(response.statusCode).toBe(200);
      expect(mockProcessUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple SQS records', async () => {
      const mockRecords: ISQSRecord[] = [
        {
          messageId: 'msg-1',
          receiptHandle: 'handle-1',
          body: JSON.stringify({
            id: '1',
            name: 'Juan',
            date: '2026-02-15T10:00:00Z',
            countryISO: 'PE',
          }),
          attributes: {},
          messageAttributes: {}
        },
        {
          messageId: 'msg-2',
          receiptHandle: 'handle-2',
          body: JSON.stringify({
            id: '2',
            name: 'María',
            date: '2026-02-16T11:00:00Z',
            countryISO: 'CL',
          }),
          attributes: {},
          messageAttributes: {}
        },
      ];

      const mockEvent: ISQSEvent = {
        Records: mockRecords,
      };

      mockProcessUseCase.execute.mockResolvedValue({
        message: 'Processed'
      });

      const response = await handler.handleSQSEvent(mockEvent);

      expect(response.statusCode).toBe(200);
      expect(mockProcessUseCase.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle processing errors gracefully', async () => {
      const mockRecord: ISQSRecord = {
        messageId: 'msg-1',
        receiptHandle: 'handle-1',
        body: JSON.stringify({
          id: '12345',
          name: 'Juan Pérez',
          date: '2026-02-15T10:00:00Z',
          countryISO: 'PE',
        }),
        attributes: {},
        messageAttributes: {}
      };

      const mockEvent: ISQSEvent = {
        Records: [mockRecord],
      };

      mockProcessUseCase.execute.mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await handler.handleSQSEvent(mockEvent);

      expect(response.statusCode).toBe(500);
    });

    it('should return error for invalid message body', async () => {
      const mockRecord: ISQSRecord = {
        messageId: 'msg-1',
        receiptHandle: 'handle-1',
        body: 'invalid json',
        attributes: {},
        messageAttributes: {}
      };

      const mockEvent: ISQSEvent = {
        Records: [mockRecord],
      };

      const response = await handler.handleSQSEvent(mockEvent);

      expect(response.statusCode).toBe(400);
    });
  });
});
