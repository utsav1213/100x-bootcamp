import { prisma } from '../db/db'
export const PurchaseCourse = async (userId: string, courseId: string) => {
    return prisma.$transaction(async (tx) => {
        const exists = await tx.purchase.findFirst({
            where:{userId,courseId}
        })
        if(exists) throw new Error('Already purchased')
        return tx.purchase.create({
            data: {
            userId,courseId
        }})
    })
}
export const getPurchases = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId },
      skip,
      take: limit,
      include: { course: true },
    }),
    prisma.purchase.count({ where: { userId } }),
  ]);

  return { data, total };
};
