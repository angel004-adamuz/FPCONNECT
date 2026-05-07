import { jest } from '@jest/globals';

const model = (methods = []) => Object.fromEntries(
  methods.map((method) => [method, jest.fn()])
);

const prisma = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $on: jest.fn(),
  $transaction: jest.fn(async (callback) => callback(prisma)),

  user: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'delete', 'count']),
  studentProfile: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'upsert']),
  enterpriseProfile: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'upsert']),
  centerProfile: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'upsert']),
  post: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'delete', 'count']),
  comment: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'delete', 'count']),
  like: model(['findUnique', 'findFirst', 'findMany', 'create', 'delete', 'count']),
  connection: model(['findUnique', 'findFirst', 'findMany', 'create', 'delete', 'deleteMany', 'upsert', 'count']),
  jobOffer: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'delete', 'count']),
  jobApplication: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'delete', 'count']),
  notification: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'updateMany', 'count']),
  conversation: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'count']),
  message: model(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'updateMany', 'count']),
};

export const resetPrismaMock = () => {
  Object.values(prisma).forEach((value) => {
    if (typeof value === 'function' && value.mockReset) {
      value.mockReset();
    }

    if (value && typeof value === 'object') {
      Object.values(value).forEach((method) => {
        if (typeof method === 'function' && method.mockReset) {
          method.mockReset();
        }
      });
    }
  });

  prisma.$connect.mockResolvedValue(undefined);
  prisma.$disconnect.mockResolvedValue(undefined);
  prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
};

export default prisma;
